import { gfrCategory } from "./assessments";

// KDIGO 2024 Table 3 and CKD nomenclature grid (S126–S137).
// Follow Table 3: A2 includes 300; A3 is strictly greater than 300 mg/g.
export const albuminCategories = [
  { category: "A1", range: "<30", label: "正常至輕度增加" },
  { category: "A2", range: "30–300", label: "中度增加" },
  { category: "A3", range: ">300", label: "重度增加" },
] as const;
export const kidneyGCategories = [
  { category: "G1", range: "≥90" }, { category: "G2", range: "60–<90" },
  { category: "G3a", range: "45–<60" }, { category: "G3b", range: "30–<45" },
  { category: "G4", range: "15–<30" }, { category: "G5", range: "<15" },
] as const;
export const kidneyRiskLevels = [
  { label: "低風險", tone: "positive" },
  { label: "中度增加風險", tone: "caution" },
  { label: "高風險", tone: "caution" },
  { label: "極高風險", tone: "danger" },
] as const;
export const kidneyRiskGrid = [
  [0, 1, 2], [0, 1, 2], [1, 2, 3], [2, 3, 3], [3, 3, 3], [3, 3, 3],
] as const;
export const kidneyCauses = [
  { value: "unknown", label: "尚未確認／不清楚" },
  { value: "diabetic", label: "糖尿病腎病" },
  { value: "hypertensive", label: "高血壓相關腎病" },
  { value: "glomerular", label: "腎絲球疾病" },
  { value: "hereditary", label: "多囊腎或其他遺傳性腎病" },
  { value: "other", label: "醫師確認的其他腎病原因" },
] as const;
export type KidneyCause = typeof kidneyCauses[number]["value"];
export function albuminCategory(uacr: number) {
  if (!Number.isFinite(uacr) || uacr < 0 || uacr > 100000) return null;
  return uacr < 30 ? "A1" : uacr <= 300 ? "A2" : "A3";
}
export function assessKidneyRisk(input: { egfr: number; uacr: number | null; cause: KidneyCause }) {
  const g = gfrCategory(input.egfr);
  const cause = kidneyCauses.find(c => c.value === input.cause);
  const a = input.uacr === null ? null : albuminCategory(input.uacr);
  if (!g || !cause || (input.uacr !== null && !a)) return null;
  const row = kidneyGCategories.findIndex(c => c.category === g);
  const column = a === null ? null : albuminCategories.findIndex(c => c.category === a);
  const riskIndex = column === null ? null : kidneyRiskGrid[row][column];
  return { g, a, row, column, riskIndex, risk: riskIndex === null ? null : kidneyRiskLevels[riskIndex], uacr: input.uacr, cause: cause.label, causeKnown: cause.value !== "unknown" };
}
export type KidneyRisk = NonNullable<ReturnType<typeof assessKidneyRisk>>;
