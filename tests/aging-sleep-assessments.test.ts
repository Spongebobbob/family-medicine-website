import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { interpretScale, evaluateMuscle, calculateSleepNight, summarizeSleep, sleepCsv, scoreToolSettings, type ScoreToolKind, type SleepEntry } from "../src/lib/aging-sleep-assessments";
import { AgingSleepAssessment } from "../src/components/tools/aging-sleep-form";
import { SleepDiary } from "../src/components/tools/sleep-diary";
const entry: SleepEntry = { date: "2026-11-26", bedtime: "23:00", riseTime: "07:00", latency: 30, awake: 30, finalAwake: 30, nap: 20 };
test("SARC-F, MNA-SF, FRAIL and ESS classify exact integer boundaries", () => {
  for (const [kind, points, bands] of [
    ["sarc-f", [0, 3, 4, 10], [0, 0, 1, 1]],
    ["mna-sf", [0, 7, 8, 11, 12, 14], [0, 0, 1, 1, 2, 2]],
    ["frail", [0, 1, 2, 3, 5], [0, 1, 1, 2, 2]],
    ["ess", [0, 10, 11, 12, 13, 15, 16, 24], [0, 0, 1, 1, 2, 2, 3, 3]],
  ] as const) points.forEach((total, index) => assert.equal(interpretScale(kind, 65, total)?.visual?.scale?.active, bands[index], `${kind} ${total}`));
});
test("score interpreters reject nonfinite, fractional, out-of-range totals and unsupported ages", () => {
  for (const kind of Object.keys(scoreToolSettings) as ScoreToolKind[]) {
    const settings = scoreToolSettings[kind];
    for (const total of [NaN, Infinity, -1, .5, settings.max + 1]) assert.equal(interpretScale(kind, 65, total), null);
    for (const age of [NaN, Infinity, settings.minAge - 1, 121, 65.5]) assert.equal(interpretScale(kind, age, 0), null);
    assert.ok(interpretScale(kind, settings.minAge, 0));
  }
  assert.equal(interpretScale("bad" as ScoreToolKind, 65, 0), null);
  assert.match(interpretScale("sarc-f", 65, 0)!.message, /不能排除/);
  assert.match(interpretScale("ess", 18, 0)!.message, /勿開車/);
});
test("muscle measurements use strict sex-specific boundaries without premature rounding", () => {
  for (const [sex, calf, grip] of [["male", 34, 28], ["female", 33, 18]] as const) {
    assert.equal(evaluateMuscle({ age: 65, sex, calf, grip })?.value, "0 / 2");
    assert.equal(evaluateMuscle({ age: 65, sex, calf: calf - .001, grip: grip - .001 })?.value, "2 / 2");
  }
  const incomplete = evaluateMuscle({ age: 65, sex: "male", calf: 34, grip: null })!;
  assert.equal(incomplete.value, "0 / 1");
  assert.match(incomplete.label, /未測/);
  assert.equal(incomplete.visual?.tone, "neutral");
  assert.equal(evaluateMuscle({ age: 65, sex: "female", calf: null, grip: 0 })?.value, "1 / 1");
});
test("muscle measurement rejects missing or invalid data and younger ages", () => {
  const v = { age: 65, sex: "male", calf: 34, grip: 28 };
  assert.equal(evaluateMuscle({ ...v, calf: null, grip: null }), null);
  for (const age of [64, 65.5, 121, NaN]) assert.equal(evaluateMuscle({ ...v, age }), null);
  for (const calf of [NaN, Infinity, 0, 101]) assert.equal(evaluateMuscle({ ...v, calf }), null);
  for (const grip of [NaN, Infinity, -1, 151]) assert.equal(evaluateMuscle({ ...v, grip }), null);
  assert.equal(evaluateMuscle({ ...v, sex: "unknown" }), null);
});
test("sleep diary handles midnight, subtracts all awake periods and keeps naps separate", () => {
  const n = calculateSleepNight(entry)!;
  assert.equal(n.inBed, 480); assert.equal(n.asleep, 390); assert.equal(n.efficiency, 81.25);
  assert.equal(calculateSleepNight({ ...entry, nap: 100 })?.asleep, 390);
  assert.equal(calculateSleepNight({ ...entry, bedtime: "09:00", riseTime: "15:00" })?.inBed, 360);
  assert.equal(calculateSleepNight({ ...entry, bedtime: "00:00", riseTime: "00:01", latency: 0, awake: 0, finalAwake: 0 })?.asleep, 1);
  assert.equal(calculateSleepNight({ ...entry, latency: 480, awake: 0, finalAwake: 0 })?.asleep, 0);
});
test("sleep diary rejects invalid dates, impossible awake totals, malformed times and missing values", () => {
  for (const date of ["", "2026-02-29", "2026-11-31", "2026-1-1", "=HYPERLINK(1)"]) assert.equal(calculateSleepNight({ ...entry, date }), null);
  assert.ok(calculateSleepNight({ ...entry, date: "2024-02-29" }));
  for (const bedtime of ["", "24:00", "12:60", "7:00", "07:00"]) assert.equal(calculateSleepNight({ ...entry, bedtime }), null);
  for (const latency of [-1, .5, NaN, Infinity, 421]) assert.equal(calculateSleepNight({ ...entry, latency }), null);
  assert.equal(calculateSleepNight({ ...entry, nap: 1441 }), null);
});
test("diary summaries recompute values and use weighted total efficiency, not mean percentages", () => {
  const first = calculateSleepNight({ ...entry, latency: 180, awake: 0, finalAwake: 0 })!;
  const second = calculateSleepNight({ ...entry, date: "2026-11-27", bedtime: "01:00", riseTime: "03:00", latency: 60, awake: 0, finalAwake: 0 })!;
  const summary = summarizeSleep([first, second])!;
  assert.equal(summary.averageSleep, 180); assert.equal(summary.averageInBed, 300); assert.equal(summary.efficiency, 60);
  assert.notEqual(summary.efficiency, (first.efficiency + second.efficiency) / 2);
  assert.equal(summarizeSleep([{ ...first, asleep: 99999 }])?.averageSleep, 300);
  assert.equal(summarizeSleep([]), null);
  assert.equal(summarizeSleep([first, first]), null);
  assert.equal(summarizeSleep(Array.from({ length: 15 }, (_, index) => ({ ...first, date: `2026-11-${String(index + 1).padStart(2, "0")}` }))), null);
});
test("CSV uses validated data with UTF-8 BOM, quoted fields and recomputed totals", () => {
  const night = calculateSleepNight(entry)!;
  const csv = sleepCsv([{ ...night, efficiency: -99 }])!;
  assert.ok(csv.startsWith("\uFEFF")); assert.ok(csv.includes('"81.3"')); assert.ok(csv.includes('"2026-11-26"')); assert.ok(!csv.includes("-99"));
  assert.equal(sleepCsv([]), null);
  assert.equal(sleepCsv([{ ...night, date: "+bad" }]), null);
});
test("muscle and diary forms hydrate safely", () => {
  for (const kind of ["sarcopenia"] as const) {
    const html = renderToStaticMarkup(createElement(AgingSleepAssessment, { kind }));
    assert.match(html, /<fieldset class="ready-fieldset" disabled=""/);
    assert.ok(!html.includes('type="radio"'));
  }
  const diary = renderToStaticMarkup(createElement(SleepDiary));
  assert.match(diary, /type="date"/); assert.match(diary, /type="time"/); assert.ok(diary.includes("加入這一天"));
  assert.match(diary, /<fieldset class="ready-fieldset" disabled=""/);
});
