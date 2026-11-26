import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LicensedQuestionnaire } from "../src/components/tools/licensed-questionnaire";
import { licensedQuestionnaires, mnaMeasurementScore, scoreEss, scoreMnaSf } from "../src/lib/licensed-questionnaires";
import { getHealthTool } from "../src/lib/tool-catalog";
test("ESS complete answers retain the 0–24 total and official severity boundaries", () => {
  for (let code = 0; code < 4 ** 8; code++) {
    const answers = Array.from({ length: 8 }, (_, i) => Math.floor(code / 4 ** i) % 4);
    const total = answers.reduce((sum, score) => sum + score, 0);
    const result = scoreEss(18, answers)!;
    assert.equal(result.value, String(total));
    assert.equal(result.visual?.scale?.active, total <= 10 ? 0 : total <= 12 ? 1 : total <= 15 ? 2 : 3);
  }
});
test("ESS rejects missing, sparse, fractional and invalid answers rather than inferring zeros", () => {
  for (const a of [[], Array(8), Array(7).fill(0), Array(9).fill(0), [NaN, ...Array(7).fill(0)], [.5, ...Array(7).fill(0)], [-1, ...Array(7).fill(0)], [4, ...Array(7).fill(0)]]) assert.equal(scoreEss(18, a), null);
  for (const age of [17, 121, NaN, 18.5]) assert.equal(scoreEss(age, Array(8).fill(0)), null);
});
test("MNA D question is 0 or 2, and explicit unknown weight loss is 1", () => {
  const measure = { method: "calf", calf: 31 } as const;
  assert.equal(scoreMnaSf(65, [2, 3, 2, 2, 2], measure)?.value, "14");
  assert.equal(scoreMnaSf(65, [0, 0, 0, 0, 0], { method: "calf", calf: 30 })?.value, "0");
  assert.equal(scoreMnaSf(65, [2, 3, 2, 0, 2], measure)?.value, "12");
  assert.equal(scoreMnaSf(65, [2, 1, 2, 2, 2], measure)?.value, "12");
  assert.equal(scoreMnaSf(65, [2, 3, 2, 1, 2], measure), null);
});
test("MNA BMI uses 19, 21, 23 with raw values, and calf uses 31 independently of AWGS", () => {
  for (const [bmi, score] of [[18.9999, 0], [19, 1], [20.9999, 1], [21, 2], [22.9999, 2], [23, 3]]) assert.equal(mnaMeasurementScore({ method: "bmi", height: 200, weight: bmi * 4 })?.score, score);
  assert.equal(mnaMeasurementScore({ method: "calf", calf: 30.9999 })?.score, 0);
  assert.equal(mnaMeasurementScore({ method: "calf", calf: 31 })?.score, 3);
  // Extra inactive measurements do not get added a second time.
  const both = { method: "bmi", height: 200, weight: 76, calf: 40 } as const;
  assert.equal(scoreMnaSf(65, [2, 3, 2, 2, 2], both)?.value, "12");
});
test("all MNA valid first-five combinations and F alternatives preserve weighted totals", () => {
  const questions = licensedQuestionnaires["mna-sf"].questions;
  for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++) for (let c = 0; c < 3; c++) for (const d of [0, 2]) for (let e = 0; e < 3; e++) {
    const answers = [a, b, c, d, e];
    for (const [bmi, f] of [[18, 0], [19, 1], [21, 2], [23, 3]]) assert.equal(scoreMnaSf(65, answers, { method: "bmi", height: 200, weight: bmi * 4 })?.value, String(a + b + c + d + e + f));
    assert.ok(answers.every((n, index) => questions[index].choices.some(choice => choice.score === n)));
  }
});
test("MNA rejects missing answers, invalid age and impossible or missing measurements", () => {
  for (const a of [[], Array(5), [0, 0, 0, 0], [0, 0, 0, 0, NaN], [0, 0, 0, 0, 3], [0, 0, 0, 0, .5]]) assert.equal(scoreMnaSf(65, a, { method: "calf", calf: 31 }), null);
  for (const age of [64, 121, NaN, 65.5]) assert.equal(scoreMnaSf(age, [2, 3, 2, 2, 2], { method: "calf", calf: 31 }), null);
  for (const height of [0, 99, 251, NaN, Infinity]) assert.equal(mnaMeasurementScore({ method: "bmi", height, weight: 60 }), null);
  for (const weight of [0, 19, 351, NaN, Infinity]) assert.equal(mnaMeasurementScore({ method: "bmi", height: 160, weight }), null);
  for (const calf of [0, 9, 101, NaN, Infinity]) assert.equal(mnaMeasurementScore({ method: "calf", calf }), null);
});
test("ESS wording retains passenger, no-alcohol and stationary-car distinctions", () => {
  const q = licensedQuestionnaires.ess.questions;
  assert.equal(q.length, 8);
  assert.match(q[3].text, /一個小時.*乘客/);
  assert.match(q[6].text, /午餐.*沒有喝酒/);
  assert.match(q[7].text, /停頓幾分鐘/);
});
test("licensed pages publish complete Chinese questions with hydration protection, not total entry", () => {
  for (const kind of ["ess", "mna-sf"] as const) {
    const html = renderToStaticMarkup(createElement(LicensedQuestionnaire, { kind }));
    assert.match(html, /<fieldset class="ready-fieldset" disabled=""/);
    assert.equal([...html.matchAll(/class="question-card"/g)].length, kind === "ess" ? 8 : 6);
    assert.equal([...html.matchAll(/type="radio"/g)].length, kind === "ess" ? 32 : 15);
    assert.ok(!html.includes("原題本總分")); assert.ok(!html.includes("待網頁重製"));
    assert.ok(html.includes("查看評估結果"));
    const tool = getHealthTool(kind)!;
    assert.equal(tool.kind, "questionnaire"); assert.equal(tool.rightsConfirmed, true); assert.equal(tool.review.status, "pending");
  }
});
