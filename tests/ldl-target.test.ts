import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { evaluateLdlTarget, ldlLevels, type LdlInput } from "../src/lib/ldl-target";
import { LdlTargetForm } from "../src/components/tools/ldl-target-form";
const base: LdlInput = { age: 30, sex: "male", ldl: 150, hdl: 60, total: 230, ascvd: "no", extremeCombination: "no", diabetes: "no", kidney: "none", severeLdl: "no", cac400: "no", hypertension: "no", familyHistory: "no", smoking: "no", metabolicSyndrome: "no", onTreatment: "no", lifestyle: "not-yet" };
test("all six NHI table-one targets and strict equality are represented", () => {
  const variants: LdlInput[] = [
    { ...base, ascvd: "yes", extremeCombination: "yes" },
    { ...base, ascvd: "yes" },
    { ...base, diabetes: "yes" },
    { ...base, hypertension: "yes", smoking: "yes" },
    { ...base, hypertension: "yes" }, base,
  ];
  variants.forEach((v, index) => {
    const target = ldlLevels[index].target;
    assert.equal(evaluateLdlTarget(v)?.target, target);
    assert.equal(evaluateLdlTarget({ ...v, ldl: target })?.atGoal, false);
    assert.equal(evaluateLdlTarget({ ...v, ldl: target - .001 })?.atGoal, true);
    assert.equal(evaluateLdlTarget({ ...v, ldl: target + .001 })?.atGoal, false);
  });
});
test("ASCVD is 70 unless an exact extreme combination is confirmed; diabetes alone does not make 55", () => {
  assert.equal(evaluateLdlTarget({ ...base, ascvd: "yes", diabetes: "yes" })?.target, 70);
  assert.equal(evaluateLdlTarget({ ...base, ascvd: "yes", extremeCombination: "yes", diabetes: "yes" })?.target, 55);
  assert.equal(evaluateLdlTarget({ ...base, ascvd: "yes", extremeCombination: "unknown" })?.target, null);
  assert.equal(evaluateLdlTarget({ ...base, ascvd: "unknown", extremeCombination: "yes" })?.target, 55);
});
test("diabetes, confirmed pre-dialysis CKD, historical LDL190 and CAC400 each produce 100", () => {
  for (const v of [{ ...base, diabetes: "yes" }, { ...base, kidney: "predialysis" }, { ...base, severeLdl: "yes", ldl: 80, onTreatment: "yes" }, { ...base, cac400: "yes" }] as LdlInput[]) assert.equal(evaluateLdlTarget(v)?.target, 100);
  assert.equal(evaluateLdlTarget({ ...base, ldl: 189.999, total: null })?.target, 160);
  assert.equal(evaluateLdlTarget({ ...base, ldl: 190, total: null })?.target, 100);
});
test("age and sex-specific HDL boundaries are inclusive/strict as defined in table one", () => {
  for (const [sex, age, hdl] of [["male", 45, 40], ["female", 55, 50]] as const) {
    assert.equal(evaluateLdlTarget({ ...base, sex, age: age - 1, hdl })?.riskMin, 0);
    assert.equal(evaluateLdlTarget({ ...base, sex, age, hdl })?.riskMin, 1);
    assert.equal(evaluateLdlTarget({ ...base, sex, age, hdl: hdl - .001 })?.riskMin, 2);
    assert.equal(evaluateLdlTarget({ ...base, sex, age, hdl: 80 })?.riskMin, 1); // No HDL>=60 subtraction.
  }
});
test("six factors are counted independently including overlapping metabolic syndrome components", () => {
  const r = evaluateLdlTarget({ ...base, age: 45, hdl: 39, hypertension: "yes", familyHistory: "yes", smoking: "yes", metabolicSyndrome: "yes" })!;
  assert.equal(r.riskMin, 6); assert.equal(r.target, 115);
});
test("unknowns do not become negative histories or reassuring targets", () => {
  const r = evaluateLdlTarget({ ...base, ascvd: "unknown", extremeCombination: "unknown" })!;
  assert.equal(r.certain, false); assert.equal(r.target, null); assert.equal(r.atGoal, null);
  assert.equal(r.knownLevelIndex, 5); assert.equal(r.possibleHigherIndex, 0);
  const nearBoundary = evaluateLdlTarget({ ...base, hypertension: "yes", hdl: null })!;
  assert.equal(nearBoundary.target, null); assert.equal(nearBoundary.riskMin, 1); assert.equal(nearBoundary.riskMax, 2);
  assert.equal(evaluateLdlTarget({ ...base, diabetes: "yes", hdl: null, hypertension: "unknown", smoking: "unknown" })?.target, 100);
  // Both possible counts are >=2, so classification remains certain despite missing HDL.
  assert.equal(evaluateLdlTarget({ ...base, hypertension: "yes", smoking: "yes", hdl: null })?.target, 115);
});
test("a low current treated LDL never denies original reimbursement or suggests stopping medication", () => {
  const r = evaluateLdlTarget({ ...base, severeLdl: "yes", onTreatment: "yes", ldl: 80 })!;
  assert.equal(r.target, 100); assert.equal(r.atGoal, true);
  assert.match(r.reimbursement, /不能.*否定原有給付/); assert.match(r.reimbursement, /不要自行停藥/);
});
test("primary prevention retains the 3–6 month lifestyle prerequisite while high risk does not use it", () => {
  assert.match(evaluateLdlTarget({ ...base, ldl: 170 })!.reimbursement, /需先有 3–6 個月/);
  assert.match(evaluateLdlTarget({ ...base, ldl: 170, lifestyle: "3to6" })!.reimbursement, /仍須由醫師核對/);
  assert.equal(evaluateLdlTarget({ ...base, ldl: 170, diabetes: "yes" })?.needsLifestyleFirst, false);
});
test("non-HDL is secondary and has no invented target for the zero-factor row", () => {
  const r = evaluateLdlTarget({ ...base, diabetes: "yes", total: 170, hdl: 40, ldl: 99 })!;
  assert.equal(r.nonHdl, 130); assert.equal(r.secondaryTarget, 130); assert.equal(r.secondaryAtGoal, false);
  assert.equal(evaluateLdlTarget(base)?.secondaryTarget, null);
  assert.equal(evaluateLdlTarget({ ...base, total: null })?.nonHdl, null);
});
test("dialysis never receives a direct personal target or LDL-goal success judgement", () => {
  const r = evaluateLdlTarget({ ...base, kidney: "dialysis" })!;
  assert.equal(r.dialysis, true); assert.equal(r.target, null); assert.equal(r.atGoal, null); assert.match(r.reimbursement, /個別評估/);
});
test("missing LDL still permits classification without claiming LDL control", () => {
  const r = evaluateLdlTarget({ ...base, ldl: null })!;
  assert.equal(r.target, 160); assert.equal(r.atGoal, null); assert.match(r.reimbursement, /尚未填/);
});
test("invalid numbers, impossible lipids and contradictory ASCVD answers are rejected", () => {
  for (const age of [17, 121, 45.5, NaN]) assert.equal(evaluateLdlTarget({ ...base, age }), null);
  for (const ldl of [NaN, Infinity, 0, 1001]) assert.equal(evaluateLdlTarget({ ...base, ldl }), null);
  assert.equal(evaluateLdlTarget({ ...base, total: 50 }), null);
  assert.equal(evaluateLdlTarget({ ...base, total: 60, hdl: 60 }), null);
  assert.equal(evaluateLdlTarget({ ...base, ascvd: "no", extremeCombination: "yes" }), null);
  assert.equal(evaluateLdlTarget({ ...base, hypertension: "" } as unknown as LdlInput), null);
});
test("form retains hydration guard, plain-language criteria and explicit table-one scope", () => {
  const html = renderToStaticMarkup(createElement(LdlTargetForm));
  assert.match(html, /<fieldset class="ready-fieldset" disabled=""/);
  assert.ok(html.includes("查看 LDL 目標")); assert.ok(html.includes("男性家屬")); assert.ok(html.includes("女性家屬"));
  assert.ok(html.includes("至少 3 個月")); assert.ok(html.includes("不清楚"));
});
