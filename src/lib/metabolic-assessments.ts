import type { EquationSex } from "./assessments";

const range = (n: number, min: number, max: number) => Number.isFinite(n) && n >= min && n <= max;
const sexValid = (sex: EquationSex) => sex === "male" || sex === "female";
export const activityFactors = [1.2, 1.375, 1.55, 1.725, 1.9] as const;

export function calculateTdee(input: { age: number; sex: EquationSex; height: number; weight: number; activity: number }) {
  const { age, sex, height, weight, activity } = input;
  if (!Number.isInteger(age) || !range(age, 19, 78) || !sexValid(sex) || !range(height, 100, 250) || !range(weight, 20, 350) || !activityFactors.some(a => a === activity)) return null;
  const resting = 10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161);
  if (resting <= 0) return null;
  return { resting, total: resting * activity, activity };
}

export function classifyWaistHeight(ratio: number): "below-reference" | "lower" | "increased" | "higher" | null {
  if (!range(ratio, 0, Number.MAX_VALUE)) return null;
  return ratio < 0.4 ? "below-reference" : ratio < 0.5 ? "lower" : ratio < 0.6 ? "increased" : "higher";
}

export function calculateWaistHeight(input: { height: number; waist: number; weight: number | null }) {
  const { height, waist, weight } = input;
  if (!range(height, 100, 250) || !range(waist, 30, 250) || (weight !== null && !range(weight, 20, 350))) return null;
  const ratio = waist / height;
  const bmi = weight === null ? null : weight / (height / 100) ** 2;
  return { ratio, bmi, halfHeight: height / 2, band: classifyWaistHeight(ratio)!, classificationApplicable: bmi !== null && bmi < 35 };
}

export type KnownBoolean = boolean | null;
export type MetabolicInput = {
  age: number; sex: EquationSex;
  waist: number | null; systolic: number | null; diastolic: number | null;
  glucose: number | null; triglycerides: number | null; hdl: number | null;
  bpMedication: KnownBoolean; glucoseMedication: KnownBoolean; triglycerideMedication: KnownBoolean;
};
const knownBoolean = (v: KnownBoolean) => v === true || v === false || v === null;
const nullableRange = (n: number | null, min: number, max: number) => n === null || range(n, min, max);
function anyCriterion(...values: KnownBoolean[]): KnownBoolean {
  return values.includes(true) ? true : values.includes(null) ? null : false;
}
export function evaluateMetabolicSyndrome(input: MetabolicInput) {
  const { age, sex, waist, systolic, diastolic, glucose, triglycerides, hdl, bpMedication, glucoseMedication, triglycerideMedication } = input;
  if (!Number.isInteger(age) || !range(age, 20, 120) || !sexValid(sex) || !nullableRange(waist, 30, 250) || !nullableRange(systolic, 50, 300) || !nullableRange(diastolic, 30, 200) || !nullableRange(glucose, 20, 1000) || !nullableRange(triglycerides, 10, 5000) || !nullableRange(hdl, 5, 200) || ![bpMedication, glucoseMedication, triglycerideMedication].every(knownBoolean) || (systolic !== null && diastolic !== null && systolic <= diastolic)) return null;
  const criteria = [
    { label: "腰圍", met: waist === null ? null : waist >= (sex === "male" ? 90 : 80) },
    { label: "血壓", met: anyCriterion(systolic === null ? null : systolic >= 130, diastolic === null ? null : diastolic >= 85, bpMedication) },
    { label: "空腹血糖", met: anyCriterion(glucose === null ? null : glucose >= 100, glucoseMedication) },
    { label: "三酸甘油酯", met: anyCriterion(triglycerides === null ? null : triglycerides >= 150, triglycerideMedication) },
    { label: "好的膽固醇（HDL）", met: hdl === null ? null : hdl < (sex === "male" ? 40 : 50) },
  ];
  const count = criteria.filter(c => c.met === true).length;
  const unknown = criteria.filter(c => c.met === null).length;
  return { criteria, count, unknown, status: count >= 3 ? "meets" : count + unknown < 3 ? "below" : "uncertain" };
}

export type CardiovascularInput = { age: number; sex: EquationSex; totalCholesterol: number; hdl: number; systolic: number; treated: boolean; smoker: boolean; diabetes: boolean; existingCvd: boolean };
/** Framingham 2008 general CVD lipid model; natural logs and full precision. */
export function calculateCardiovascularRisk(input: CardiovascularInput) {
  const { age, sex, totalCholesterol, hdl, systolic, treated, smoker, diabetes, existingCvd } = input;
  if (!Number.isInteger(age) || !range(age, 30, 74) || !sexValid(sex) || !range(totalCholesterol, 100, 405) || !range(hdl, 10, 100) || hdl >= totalCholesterol || !range(systolic, 90, 200) || ![treated, smoker, diabetes, existingCvd].every(v => typeof v === "boolean") || existingCvd) return null;
  const male = sex === "male";
  const sum = (male ? 3.06117 : 2.32888) * Math.log(age)
    + (male ? 1.12370 : 1.20904) * Math.log(totalCholesterol)
    + (male ? -0.93263 : -0.70833) * Math.log(hdl)
    + (male ? (treated ? 1.99881 : 1.93303) : (treated ? 2.82263 : 2.76157)) * Math.log(systolic)
    + (smoker ? (male ? 0.65451 : 0.52873) : 0)
    + (diabetes ? (male ? 0.57367 : 0.69154) : 0);
  const probability = -Math.expm1(Math.log(male ? 0.88936 : 0.95012) * Math.exp(sum - (male ? 23.9802 : 26.1931)));
  return { percent: probability * 100 };
}
