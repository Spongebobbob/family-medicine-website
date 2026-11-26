import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { activityFactors, calculateTdee, calculateWaistHeight, classifyWaistHeight, evaluateMetabolicSyndrome, calculateCardiovascularRisk, type MetabolicInput } from "../src/lib/metabolic-assessments";
import { MetabolicAssessment } from "../src/components/tools/metabolic-form";

const healthy: MetabolicInput = { age: 40, sex: "male", waist: 89, systolic: 129, diastolic: 84, glucose: 99, triglycerides: 149, hdl: 40, bpMedication: false, glucoseMedication: false, triglycerideMedication: false };
const cardiac = { age: 55, sex: "male" as const, totalCholesterol: 213, hdl: 50, systolic: 140, treated: false, smoker: false, diabetes: false, existingCvd: false };
test("Framingham 2008 matches direct substitution reference vectors for both sexes", () => {
  assert.ok(Math.abs(calculateCardiovascularRisk(cardiac)!.percent - 13.534025563815144) < 1e-10);
  assert.ok(Math.abs(calculateCardiovascularRisk({ ...cardiac, sex: "female" })!.percent - 8.068318155070243) < 1e-10);
  for (const sex of ["male", "female"] as const) {
    const base = calculateCardiovascularRisk({ ...cardiac, sex })!.percent;
    for (const flag of ["smoker", "diabetes", "treated"] as const) {
      const n = calculateCardiovascularRisk({ ...cardiac, sex, [flag]: true })!.percent;
      assert.ok(n > base && n < 100);
    }
    for (const age of [30, 74]) assert.ok(calculateCardiovascularRisk({ ...cardiac, sex, age }));
  }
});
test("cardiovascular model rejects prior CVD, wrong population, impossible lipids and nonfinite inputs", () => {
  for (const age of [29, 75, 55.5, NaN]) assert.equal(calculateCardiovascularRisk({ ...cardiac, age }), null);
  assert.equal(calculateCardiovascularRisk({ ...cardiac, existingCvd: true }), null);
  assert.equal(calculateCardiovascularRisk({ ...cardiac, totalCholesterol: 100, hdl: 100 }), null);
  for (const value of [NaN, Infinity, 0, -10]) {
    assert.equal(calculateCardiovascularRisk({ ...cardiac, totalCholesterol: value }), null);
    assert.equal(calculateCardiovascularRisk({ ...cardiac, systolic: value }), null);
  }
});
test("Taiwan metabolic criteria use inclusive upper thresholds and strict low-HDL thresholds", () => {
  assert.equal(evaluateMetabolicSyndrome(healthy)!.count, 0);
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, waist: 90, systolic: 130, glucose: 100, triglycerides: 150, hdl: 39.99 })!.count, 5);
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, diastolic: 85 })!.count, 1);
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, systolic: 130, diastolic: 85 })!.count, 1);
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, sex: "female", waist: 79.99, hdl: 50 })!.count, 0);
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, sex: "female", waist: 80, hdl: 49.99 })!.count, 2);
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, waist: 90, glucose: 100, triglycerides: 150 })!.status, "meets");
  for (const age of [20, 120]) assert.ok(evaluateMetabolicSyndrome({ ...healthy, age }));
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, age: 19 }), null);
});
test("medication counts when controlled; missing values are unknown rather than negative", () => {
  const r = evaluateMetabolicSyndrome({ ...healthy, bpMedication: true, glucoseMedication: true, triglycerideMedication: true })!;
  assert.equal(r.count, 3);
  assert.equal(r.status, "meets");
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, bpMedication: null })!.unknown, 1);
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, systolic: 130, diastolic: null, bpMedication: null })!.criteria[1].met, true);
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, glucose: null, glucoseMedication: true })!.criteria[2].met, true);
  const missing = evaluateMetabolicSyndrome({ ...healthy, waist: null, systolic: null, diastolic: null, glucose: null, triglycerides: null, hdl: null })!;
  assert.equal(missing.count, 0);
  assert.equal(missing.unknown, 5);
  assert.equal(missing.status, "uncertain");
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, glucose: null })!.status, "below");
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, glucose: NaN }), null);
  assert.equal(evaluateMetabolicSyndrome({ ...healthy, diastolic: 130 }), null);
});
test("Mifflin REE and all activity factors produce maintenance energy without diet prescriptions", () => {
  const input = { age: 30, sex: "male" as const, height: 175, weight: 70, activity: 1.2 };
  assert.equal(calculateTdee(input)!.resting, 1648.75);
  assert.equal(calculateTdee(input)!.total, 1978.5);
  assert.equal(calculateTdee({ ...input, sex: "female" })!.resting, 1482.75);
  for (const activity of activityFactors) assert.equal(calculateTdee({ ...input, activity })!.total, 1648.75 * activity);
  for (const age of [19, 78]) assert.ok(calculateTdee({ ...input, age }));
  for (const age of [18, 79, 30.5]) assert.equal(calculateTdee({ ...input, age }), null);
  assert.equal(calculateTdee({ ...input, activity: 1.6 }), null);
  assert.equal(calculateTdee({ ...input, weight: NaN }), null);
});
test("waist-height cutoffs and BMI eligibility classify unrounded values", () => {
  assert.equal(classifyWaistHeight(0.39999), "below-reference");
  assert.equal(classifyWaistHeight(0.4), "lower");
  assert.equal(classifyWaistHeight(0.49999), "lower");
  assert.equal(classifyWaistHeight(0.5), "increased");
  assert.equal(classifyWaistHeight(0.59999), "increased");
  assert.equal(classifyWaistHeight(0.6), "higher");
  assert.equal(classifyWaistHeight(NaN), null);
  const r = calculateWaistHeight({ height: 200, waist: 100, weight: 140 })!;
  assert.equal(r.ratio, 0.5);
  assert.equal(r.bmi, 35);
  assert.equal(r.classificationApplicable, false);
  assert.equal(calculateWaistHeight({ height: 200, waist: 100, weight: 139.99 })!.classificationApplicable, true);
  assert.equal(calculateWaistHeight({ height: 200, waist: 100, weight: null })!.classificationApplicable, false);
  assert.equal(calculateWaistHeight({ height: 0, waist: 100, weight: null }), null);
});
test("new forms preserve hydration protection, descriptive units and the simplified layout", () => {
  for (const kind of ["cardiovascular-risk", "metabolic-syndrome", "tdee", "waist-height-ratio"] as const) {
    const html = renderToStaticMarkup(createElement(MetabolicAssessment, { kind }));
    assert.match(html, /<fieldset class="ready-fieldset" disabled=""/);
    assert.match(html, /autoComplete="off"/);
    assert.ok(!html.includes('class="review-notice"'));
    assert.ok(!html.includes('class="privacy-note"'));
    assert.ok(html.includes("清除所有輸入"));
  }
});
