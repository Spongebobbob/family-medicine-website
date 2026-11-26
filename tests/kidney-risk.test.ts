import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { albuminCategory, assessKidneyRisk, type KidneyCause } from "../src/lib/kidney-risk";
import { KidneyRiskMatrix } from "../src/components/tools/kidney-risk-matrix";
import { LabAssessment } from "../src/components/tools/assessment-form";

test("UACR follows KDIGO Table 3 raw-value boundaries including 300 in A2", () => {
  for (const [value, expected] of [[0,"A1"],[29.999,"A1"],[30,"A2"],[299.999,"A2"],[300,"A2"],[300.001,"A3"],[100000,"A3"]] as const) assert.equal(albuminCategory(value),expected);
  for (const value of [-1, NaN, Infinity, -Infinity, 100000.001]) assert.equal(albuminCategory(value),null);
});
test("all 18 KDIGO G/A cells match the prognosis grid", () => {
  const expected = [[0,1,2],[0,1,2],[1,2,3],[2,3,3],[3,3,3],[3,3,3]];
  for (const [i,egfr] of [90,60,45,30,15,14.999].entries()) for (const [j,uacr] of [29.999,300,300.001].entries()) {
    const result=assessKidneyRisk({egfr,uacr,cause:"unknown"})!;
    assert.equal(result.row,i); assert.equal(result.column,j); assert.equal(result.riskIndex,expected[i][j]);
  }
});
test("G categories use raw eGFR values rather than rounded display", () => {
  for (const [egfr,expected] of [[89.999,"G2"],[59.999,"G3a"],[44.999,"G3b"],[29.999,"G4"],[14.999,"G5"]]) assert.equal(assessKidneyRisk({egfr:Number(egfr),uacr:10,cause:"unknown"})!.g,expected);
});
test("missing UACR remains unknown, while genuine zero is A1", () => {
  const result=assessKidneyRisk({egfr:100,uacr:null,cause:"unknown"})!;
  assert.equal(result.a,null); assert.equal(result.risk,null); assert.equal(result.column,null); assert.equal(result.causeKnown,false);
  assert.equal(assessKidneyRisk({egfr:100,uacr:0,cause:"unknown"})!.a,"A1");
});
test("C is recorded only from an explicit selection, never inferred from G/A", () => {
  assert.equal(assessKidneyRisk({egfr:10,uacr:500,cause:"unknown"})!.causeKnown,false);
  const result=assessKidneyRisk({egfr:10,uacr:500,cause:"diabetic"})!;
  assert.equal(result.cause,"糖尿病腎病"); assert.equal(result.causeKnown,true);
  assert.equal(assessKidneyRisk({egfr:10,uacr:500,cause:"unsupported" as KidneyCause}),null);
});
test("invalid kidney inputs are rejected", () => {
  for (const egfr of [-1,NaN,Infinity]) assert.equal(assessKidneyRisk({egfr,uacr:30,cause:"unknown"}),null);
  for (const uacr of [-1,NaN,Infinity,100001]) assert.equal(assessKidneyRisk({egfr:90,uacr,cause:"unknown"}),null);
});
test("matrix has exactly one text-labelled current cell, or none without UACR", () => {
  const html=renderToStaticMarkup(createElement(KidneyRiskMatrix,{result:assessKidneyRisk({egfr:45,uacr:301,cause:"unknown"})!}));
  assert.equal((html.match(/aria-current="true"/g)||[]).length,1);
  assert.match(html,/G3a／A3：極高風險，你的位置/);
  assert.match(html,/scope="row"/); assert.match(html,/scope="col"/);
  const missing=renderToStaticMarkup(createElement(KidneyRiskMatrix,{result:assessKidneyRisk({egfr:90,uacr:null,cause:"unknown"})!}));
  assert.doesNotMatch(missing,/aria-current="true"/); assert.match(missing,/尚無法判定/);
});
test("eGFR form keeps UACR and cause optional and does not expose them on FIB-4", () => {
  const html=renderToStaticMarkup(createElement(LabAssessment,{kind:"egfr"}));
  assert.match(html,/UACR，選填/); assert.match(html,/mg\/g/);
  assert.match(html,/<input[^>]*id="[^"]*-uacr"[^>]*min="0"[^>]*max="100000"/);
  const input=html.match(/<input[^>]*id="[^"]*-uacr"[^>]*>/)![0]; assert.doesNotMatch(input,/required/);
  assert.doesNotMatch(renderToStaticMarkup(createElement(LabAssessment,{kind:"fib-4"})),/UACR/);
});
