import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  calculateFib4,
  classifyFib4,
  calculateEgfr,
  gfrCategory,
  scoreIsi,
  scoreGad7,
  scorePhq9,
  scoreStopBang,
  phq9NeedsSafety,
} from "../src/lib/assessments";
import { healthTools, toolGroups } from "../src/lib/tool-catalog";
function items(total: number, count: number, max: number) {
  const result = Array(count).fill(0);
  for (let i = 0; i < count; i++) {
    result[i] = Math.min(total, max);
    total -= result[i];
  }
  return result;
}
test("FIB-4 uses square root ALT and platelets in 10^9/L", () => {
  assert.equal(
    calculateFib4({ age: 50, ast: 40, alt: 25, platelets: 200, stable: true })
      ?.value,
    2,
  );
  assert.equal(
    calculateFib4({ age: 50, ast: 40, alt: 100, platelets: 200, stable: true })
      ?.value,
    1,
  );
});
test("FIB-4 age limits and AASLD >65 boundary are explicit", () => {
  assert.equal(classifyFib4(1.5, 34)?.level, "unreliable");
  assert.equal(classifyFib4(1.5, 35)?.level, "indeterminate");
  assert.equal(classifyFib4(1.5, 65)?.lowerCutoff, 1.3);
  assert.equal(classifyFib4(1.5, 66)?.lowerCutoff, 2);
  assert.equal(classifyFib4(1.5, 66)?.level, "lower");
  assert.equal(classifyFib4(1.3 - 1e-8, 50)?.level, "lower");
  assert.equal(classifyFib4(1.3, 50)?.level, "indeterminate");
  assert.equal(classifyFib4(2, 66)?.level, "indeterminate");
  assert.equal(classifyFib4(2.67, 50)?.level, "indeterminate");
  assert.equal(classifyFib4(2.67001, 50)?.level, "higher");
});
test("FIB-4 rejects unsupported ages, zero denominators, nonfinite and acute context", () => {
  const valid = { age: 50, ast: 40, alt: 25, platelets: 200, stable: true };
  for (const bad of [
    { age: 17 },
    { age: 121 },
    { age: 50.5 },
    { alt: 0 },
    { platelets: 0 },
    { ast: 0 },
    { ast: Infinity },
    { alt: NaN },
    { platelets: -1 },
    { stable: false },
  ])
    assert.equal(calculateFib4({ ...valid, ...bad }), null);
});
test("2021 CKD-EPI reference points, both sexes, units, and creatinine knot", () => {
  const male = calculateEgfr({
    age: 50,
    creatinine: 1,
    sex: "male",
    unit: "mg/dL",
    stable: true,
  })!;
  const female = calculateEgfr({
    age: 50,
    creatinine: 1,
    sex: "female",
    unit: "mg/dL",
    stable: true,
  })!;
  assert.ok(Math.abs(male.value - 91.6915) < 0.01);
  assert.ok(Math.abs(female.value - 68.6335) < 0.01);
  assert.equal(
    calculateEgfr({
      age: 50,
      creatinine: 88.4,
      sex: "male",
      unit: "µmol/L",
      stable: true,
    })?.value,
    male.value,
  );
  for (const [sex, k] of [
    ["female", 0.7],
    ["male", 0.9],
  ] as const) {
    const center = calculateEgfr({
      age: 40,
      creatinine: k,
      sex,
      unit: "mg/dL",
      stable: true,
    })!;
    for (const scr of [k - 1e-9, k + 1e-9])
      assert.ok(
        Math.abs(
          calculateEgfr({
            age: 40,
            creatinine: scr,
            sex,
            unit: "mg/dL",
            stable: true,
          })!.value - center.value,
        ) < 1e-5,
      );
  }
});
test("eGFR G categories classify unrounded values at all KDIGO boundaries", () => {
  for (const [n, group] of [
    [90, "G1"],
    [89.999, "G2"],
    [60, "G2"],
    [59.999, "G3a"],
    [45, "G3a"],
    [44.999, "G3b"],
    [30, "G3b"],
    [29.999, "G4"],
    [15, "G4"],
    [14.999, "G5"],
  ] as const)
    assert.equal(gfrCategory(n), group);
  assert.equal(gfrCategory(NaN), null);
  assert.equal(gfrCategory(-1), null);
});
test("eGFR rejects invalid units, missing sex, nonadult and unstable function", () => {
  const valid = {
    age: 50,
    creatinine: 1,
    sex: "male" as const,
    unit: "mg/dL" as const,
    stable: true,
  };
  for (const bad of [
    { age: 17 },
    { age: 121 },
    { age: 50.5 },
    { creatinine: 0 },
    { creatinine: NaN },
    { creatinine: Infinity },
    { creatinine: 30.1 },
    { stable: false },
  ])
    assert.equal(calculateEgfr({ ...valid, ...bad }), null);
  // runtime validation protects values originating outside TypeScript.
  assert.equal(calculateEgfr({ ...valid, sex: "other" as "male" }), null);
  assert.equal(calculateEgfr({ ...valid, unit: "mmol/L" as "mg/dL" }), null);
});
test("ISI, GAD-7 and PHQ-9 severity transitions include maximum scores", () => {
  const isi = [0, 7, 8, 14, 15, 21, 22, 28].map(
    (n) => scoreIsi(items(n, 7, 4))!.label,
  );
  assert.equal(isi[0], isi[1]);
  assert.notEqual(isi[1], isi[2]);
  assert.equal(isi[2], isi[3]);
  assert.notEqual(isi[3], isi[4]);
  assert.notEqual(isi[5], isi[6]);
  assert.equal(isi[6], isi[7]);
  for (const [fn, count, max, bounds] of [
    [scoreGad7, 7, 3, [5, 10, 15]],
    [scorePhq9, 9, 3, [5, 10, 15, 20]],
  ] as const) {
    for (const n of bounds)
      assert.notEqual(
        fn(items(n - 1, count, max))!.label,
        fn(items(n, count, max))!.label,
      );
    assert.equal(fn(items(count * max, count, max))!.score, count * max);
  }
});
test("all scoring engines reject partial, fractional, negative or out-of-range answers", () => {
  for (const [fn, count, max] of [
    [scoreIsi, 7, 4],
    [scoreGad7, 7, 3],
    [scorePhq9, 9, 3],
    [scoreStopBang, 8, 1],
  ] as const) {
    assert.equal(fn(Array(count - 1).fill(0)), null);
    assert.equal(fn(Array(count)), null);
    for (const n of [-1, NaN, Infinity, 0.5, max + 1])
      assert.equal(fn([n, ...Array(count - 1).fill(0)]), null);
  }
});
test("PHQ-9 item 9 flags independently of total and with incomplete remaining answers", () => {
  for (const n of [1, 2, 3]) {
    assert.equal(phq9NeedsSafety(n), true);
    const r = scorePhq9([...Array(8).fill(0), n])!;
    assert.equal(r.needsSafety, true);
    assert.ok(r.score < 5);
  }
  assert.equal(scorePhq9([...Array(8).fill(3), 0])?.needsSafety, false);
  assert.equal(phq9NeedsSafety(0), false);
  assert.equal(phq9NeedsSafety(NaN), false);
  assert.equal(phq9NeedsSafety(4), false);
});
test("STOP-BANG handles both total score and alternative STOP combination", () => {
  assert.equal(scoreStopBang([1, 1, 0, 0, 0, 0, 0, 0])?.level, "lower");
  assert.equal(scoreStopBang([1, 1, 1, 0, 0, 0, 0, 0])?.level, "intermediate");
  assert.equal(scoreStopBang([1, 1, 1, 1, 0, 0, 0, 0])?.level, "intermediate");
  assert.equal(scoreStopBang([1, 1, 1, 1, 0, 1, 0, 0])?.level, "higher");
  for (const index of [4, 6, 7]) {
    const a = [1, 1, 0, 0, 0, 0, 0, 0];
    a[index] = 1;
    assert.equal(scoreStopBang(a)?.combinationHigh, true);
    assert.equal(scoreStopBang(a)?.level, "higher");
  }
  assert.equal(scoreStopBang([1, 1, 0, 0, 0, 1, 0, 0])?.level, "intermediate");
  assert.equal(scoreStopBang(Array(8).fill(1))?.score, 8);
});
test("twenty-four unique tools have independent URLs, verified source URLs and related destinations", () => {
  assert.equal(healthTools.length, 24);
  assert.equal(new Set(healthTools.map((t) => t.slug)).size, 24);
  assert.equal(toolGroups.length, 8);
  for (const t of healthTools) {
    assert.ok(toolGroups.some((g) => g.slug === t.group));
    assert.ok(t.sources.length);
    assert.ok(t.related.length);
    assert.ok(t.validation);
    assert.ok(t.rights);
    for (const s of t.sources) assert.equal(new URL(s.url).protocol, "https:");
  }
});
test("assessment modules contain no transmission, browser persistence or analytics calls", () => {
  for (const file of [
    "src/components/tools/assessment-form.tsx",
    "src/components/bmi-calculator.tsx",
    "src/components/tools/tool-directory.tsx",
    "src/lib/assessments.ts",
    "src/lib/altitude.ts",
    "src/lib/travel-data.ts",
    "src/lib/travel-plan.ts",
    "src/lib/travel-malaria.ts",
    "src/lib/malaria-guidance.ts",
    "src/lib/malaria-country-rules.ts",
    "src/components/tools/malaria-results.tsx",
    "src/lib/travel-vaccines.ts",
    "src/components/tools/altitude-form.tsx",
    "src/components/tools/travel-plan-provider.tsx",
    "src/components/tools/travel-plan-fields.tsx",
    "src/components/tools/country-picker.tsx",
    "src/lib/country-search.ts",
    "src/components/tools/travel-health-form.tsx",
    "src/lib/kidney-risk.ts",
    "src/components/tools/kidney-risk-matrix.tsx",
    "src/lib/ldl-target.ts",
    "src/components/tools/ldl-target-form.tsx",
    "src/lib/aging-sleep-assessments.ts",
    "src/lib/geriatric-questionnaires.ts",
    "src/lib/licensed-questionnaires.ts",
    "src/components/tools/licensed-questionnaire.tsx",
    "src/components/tools/geriatric-questionnaire.tsx",
    "src/components/tools/aging-sleep-form.tsx",
    "src/components/tools/sleep-diary.tsx",
    "src/lib/prevention-assessments.ts",
    "src/components/tools/prevention-form.tsx",
    "src/lib/metabolic-assessments.ts",
    "src/components/tools/metabolic-form.tsx",
  ]) {
    const code = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(
      code,
      /\b(?:fetch|sendBeacon|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|gtag|mixpanel|posthog)\b/,
      file,
    );
    assert.doesNotMatch(code, /console\.(?:log|info|warn|error)\s*\(/, file);
    assert.doesNotMatch(code, /document\.cookie|URLSearchParams/, file);
  }
});
