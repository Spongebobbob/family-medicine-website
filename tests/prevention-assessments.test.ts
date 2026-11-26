import test from "node:test";
import assert from "node:assert/strict";
import { adultHealthCheck, adultVaccines, cancerScreening, preventionOverview, POLICY_YEAR, type PreventionValues } from "../src/lib/prevention-assessments";
const cancer: PreventionValues = { birthYear: "1981", sex: "female", indigenous: "no", colonFamily: "no", lungFamily: "no", betel: "no", smoking: "never" };
const check: PreventionValues = { birthYear: "1986", indigenous: "no", polio: "no", check: "never", hepatitis: "no" };
const vaccines: PreventionValues = { age: "65", indigenous: "no", pregnant: "no", immune: "no", ipd: "no", seasonRisk: "no", fluOnly: "no", flu: "no", covid: "no", pneumo: "none", zoster: "none", tetanus: "over10" };
const find = (r: ReturnType<typeof cancerScreening>, id: string) => r!.items.find(i => i.id === id)!;
const atAge = (base: PreventionValues, age: number) => ({ ...base, birthYear: String(POLICY_YEAR - age) });
test("1994 birth year with unknown history counts one eligible checkup, not zero", () => {
  const result = adultHealthCheck({ ...check, birthYear: "1994", check: "unknown" })!;
  assert.deepEqual(preventionOverview("adult-health-check", result), {
    count: 1, title: "項符合年齡／風險條件", detail: "需核對紀錄 1 項",
  });
  assert.equal(find(result, "check").action, false);
  assert.equal(find(result, "check").screenEligible, true);
  assert.match(find(result, "check").detail, /每 5 年/);
  assert.equal(find(result, "hepatitis").screenEligible, false);
});
test("overview keeps age eligibility separate from due dates and lifetime use", () => {
  for (const [history, detail] of [["never", "可洽院所安排 1 項"], ["2025", "其餘請看補助間隔與使用紀錄"]]) {
    const result = adultHealthCheck({ ...check, birthYear: "1994", check: history })!;
    assert.equal(preventionOverview("adult-health-check", result).count, 1);
    assert.equal(preventionOverview("adult-health-check", result).detail, detail);
  }
  const young = adultHealthCheck({ ...atAge(check, 29), check: "unknown" })!;
  assert.equal(preventionOverview("adult-health-check", young).count, 0);
  const cancerResult = cancerScreening(cancer)!;
  const overview = preventionOverview("taiwan-cancer-screening", cancerResult);
  assert.equal(overview.count, 5);
  assert.equal(overview.detail, "需核對紀錄 5 項");
});
test("vaccine overview continues to count actionable recommendations", () => {
  const result = adultVaccines(vaccines)!;
  assert.equal(preventionOverview("adult-vaccines", result).count, 5);
  assert.equal(preventionOverview("adult-vaccines", result).title, "項可洽院所安排／評估");
});
test("cancer programme age boundaries and family history are explicit", () => {
  for (const age of [39, 40, 74, 75]) assert.equal(find(cancerScreening({ ...atAge(cancer, age), breast: "never" }), "breast").action, age >= 40 && age <= 74);
  for (const age of [24, 25, 29, 30]) assert.equal(find(cancerScreening({ ...atAge(cancer, age), pap: "never" }), "pap").action, age >= 25);
  for (const age of [34, 35, 36, 45, 65, 66]) assert.equal(find(cancerScreening({ ...atAge(cancer, age), hpv: "never" }), "hpv").action, [35, 45, 65].includes(age));
  for (const age of [39, 40, 44, 45, 74, 75]) assert.equal(find(cancerScreening({ ...atAge(cancer, age), colonFamily: "yes", colon: "never" }), "colon").action, age >= 40 && age <= 74);
  assert.match(find(cancerScreening({ ...atAge(cancer, 40), colonFamily: "unknown" }), "colon").status, /需補充/);
  assert.equal(find(cancerScreening({ ...atAge(cancer, 40), colonFamily: "no", colon: "never" }), "colon").action, false);
});
test("unknown screen history never implies unused entitlement; calendar-year intervals", () => {
  assert.equal(find(cancerScreening(cancer), "breast").action, false);
  assert.match(find(cancerScreening(cancer), "breast").status, /核對紀錄/);
  assert.equal(find(cancerScreening({ ...cancer, breast: "2024" }), "breast").action, true);
  assert.equal(find(cancerScreening({ ...cancer, breast: "2025" }), "breast").action, false);
  assert.equal(find(cancerScreening({ ...cancer, stomach: "2024" }), "stomach").action, false);
  assert.match(find(cancerScreening({ ...cancer, stomach: "2024" }), "stomach").status, /終身一次/);
  assert.equal(find(cancerScreening({ ...atAge(cancer, 29), pap: "2024" }), "pap").action, false);
  assert.equal(find(cancerScreening({ ...atAge(cancer, 30), pap: "2025" }), "pap").action, true);
});
test("lung pack-years and strict quit-under-15 threshold; sex-specific family age", () => {
  const v = { ...atAge(cancer, 50), smoking: "quit", cigarettes: "20", smokingYears: "20", quitYears: "14.99", lung: "never" };
  assert.equal(find(cancerScreening(v), "lung").action, true);
  assert.equal(find(cancerScreening({ ...v, quitYears: "15" }), "lung").action, false);
  assert.equal(find(cancerScreening({ ...v, smokingYears: "19.999" }), "lung").action, false);
  assert.equal(find(cancerScreening({ ...atAge(cancer, 40), lungFamily: "yes", lung: "never" }), "lung").action, true);
  assert.equal(find(cancerScreening({ ...atAge(cancer, 44), sex: "male", lungFamily: "yes", lung: "never" }), "lung").action, false);
});
test("oral criteria include former betel use and young indigenous adults", () => {
  const v = { ...atAge(cancer, 18), indigenous: "yes", betel: "yes", oral: "never" };
  assert.equal(find(cancerScreening(v), "oral").action, true);
  assert.equal(find(cancerScreening({ ...v, indigenous: "no" }), "oral").action, false);
  assert.equal(find(cancerScreening({ ...atAge(v, 30), indigenous: "no" }), "oral").action, true);
});
test("adult checkup ages, annual exceptions and category changes", () => {
  for (const [age, interval] of [[29, 0], [30, 5], [39, 5], [40, 3], [64, 3], [65, 1], [120, 1]]) {
    const r = find(adultHealthCheck(atAge(check, age)), "check");
    assert.equal(r.action, interval > 0);
    if (interval) assert.ok(r.detail.includes(`每 ${interval} 年`));
  }
  assert.equal(find(adultHealthCheck({ ...atAge(check, 38), check: "2022" }), "check").action, false);
  assert.equal(find(adultHealthCheck({ ...atAge(check, 38), check: "2021" }), "check").action, true);
  assert.match(find(adultHealthCheck({ ...atAge(check, 40), check: "2025" }), "check").status, /跨入新/);
  assert.ok(find(adultHealthCheck({ ...atAge(check, 55), indigenous: "yes" }), "check").detail.includes("每 1 年"));
  assert.ok(find(adultHealthCheck({ ...atAge(check, 35), polio: "yes" }), "check").detail.includes("每 1 年"));
});
test("hepatitis uses 1986 inclusive birth cohort, upper age and lifetime record", () => {
  assert.equal(find(adultHealthCheck(check), "hepatitis").action, true);
  assert.equal(find(adultHealthCheck({ ...check, birthYear: "1987" }), "hepatitis").action, false);
  assert.equal(find(adultHealthCheck(atAge(check, 79)), "hepatitis").action, true);
  assert.equal(find(adultHealthCheck(atAge(check, 80)), "hepatitis").action, false);
  for (const history of ["yes", "unknown"]) assert.equal(find(adultHealthCheck({ ...check, hepatitis: history }), "hepatitis").action, false);
});
test("seasonal eligibility separates flu-only work and completed/unknown records", () => {
  assert.equal(find(adultVaccines({ ...vaccines, age: "49" }), "flu").action, false);
  assert.equal(find(adultVaccines({ ...vaccines, age: "50" }), "flu").action, true);
  const v = { ...vaccines, age: "25", fluOnly: "yes" };
  assert.equal(find(adultVaccines(v), "flu").action, true);
  assert.equal(find(adultVaccines(v), "covid").action, false);
  for (const history of ["yes", "unknown"]) assert.equal(find(adultVaccines({ ...vaccines, flu: history }), "flu").action, false);
});
test("pneumococcal current schedule handles public ages, old series and completed PCV20/21", () => {
  for (const [age, indigenous, ipd, expected] of [[64, "no", "no", false], [65, "no", "no", true], [54, "yes", "no", false], [55, "yes", "no", true], [18, "no", "yes", false], [19, "no", "yes", true]] as const) assert.equal(find(adultVaccines({ ...vaccines, age: String(age), indigenous, ipd }), "pneumo").action, expected);
  for (const history of ["unknown", "pcv20", "both", "ppv", "pcv13"]) assert.equal(find(adultVaccines({ ...vaccines, pneumo: history }), "pneumo").action, false);
  assert.match(find(adultVaccines({ ...vaccines, pneumo: "both" }), "pneumo").detail, /至少 5 年/);
});
test("zoster pregnancy and completed doses override age; Tdap every pregnancy", () => {
  assert.equal(find(adultVaccines({ ...vaccines, pregnant: "yes" }), "zoster").action, false);
  assert.equal(find(adultVaccines({ ...vaccines, zoster: "two" }), "zoster").action, false);
  assert.equal(find(adultVaccines({ ...vaccines, age: "18", immune: "yes" }), "zoster").action, true);
  assert.match(find(adultVaccines({ ...vaccines, pregnant: "yes", tetanus: "recent" }), "tetanus").detail, /28–36/);
});
test("reject invalid, future, contradictory and missing values", () => {
  for (const s of ["", "NaN", "Infinity", "2027", "1986.5", "1900"]) assert.equal(cancerScreening({ ...cancer, birthYear: s }), null);
  assert.equal(cancerScreening({ ...cancer, breast: "2027" }), null);
  assert.equal(cancerScreening({ ...cancer, breast: "1900" }), null);
  assert.equal(cancerScreening({ ...cancer, smoking: "quit", cigarettes: "20", smokingYears: "40", quitYears: "15" }), null);
  assert.equal(adultHealthCheck({ ...check, check: "1980" }), null);
  assert.equal(adultHealthCheck({ ...check, indigenous: "unknown" }), null);
  for (const age of ["", "NaN", "17", "18.5", "121"]) assert.equal(adultVaccines({ ...vaccines, age }), null);
  assert.equal(adultVaccines({ ...vaccines, flu: "" }), null);
});
