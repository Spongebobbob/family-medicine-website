export const LDL_POLICY = { effective: "2026-09-01", checked: "2026-11-26", scope: "健保降膽固醇藥物給付規定表一" } as const;
export type LdlAnswer = "yes" | "no" | "unknown";
export type LdlInput = {
  age: number; sex: "male" | "female"; ldl: number | null; hdl: number | null; total: number | null;
  ascvd: LdlAnswer; extremeCombination: LdlAnswer; diabetes: LdlAnswer;
  kidney: "none" | "predialysis" | "dialysis" | "unknown";
  severeLdl: LdlAnswer; cac400: LdlAnswer;
  hypertension: LdlAnswer; familyHistory: LdlAnswer; smoking: LdlAnswer; metabolicSyndrome: LdlAnswer;
  onTreatment: LdlAnswer; lifestyle: "not-yet" | "under3" | "3to6" | "over6" | "unknown";
};
export const ldlLevels = [
  { name: "極高風險", target: 55, secondary: 85 },
  { name: "非常高風險", target: 70, secondary: 100 },
  { name: "高風險", target: 100, secondary: 130 },
  { name: "中風險", target: 115, secondary: 145 },
  { name: "低風險", target: 130, secondary: 160 },
  { name: "0 項心血管風險因子", target: 160, secondary: null },
] as const;
const answer = (s: unknown): s is LdlAnswer => ["yes", "no", "unknown"].includes(String(s));
const lab = (n: number | null, min: number, max: number) => n === null || (Number.isFinite(n) && n >= min && n <= max);
export function evaluateLdlTarget(v: LdlInput) {
  if (!Number.isInteger(v.age) || v.age < 18 || v.age > 120 || !["male", "female"].includes(v.sex)) return null;
  if (![v.ascvd, v.extremeCombination, v.diabetes, v.severeLdl, v.cac400, v.hypertension, v.familyHistory, v.smoking, v.metabolicSyndrome, v.onTreatment].every(answer)) return null;
  if (!["none", "predialysis", "dialysis", "unknown"].includes(v.kidney) || !["not-yet", "under3", "3to6", "over6", "unknown"].includes(v.lifestyle)) return null;
  if (!lab(v.ldl, 1, 1000) || !lab(v.hdl, 1, 200) || !lab(v.total, 20, 1500)) return null;
  if (v.total !== null && ((v.hdl !== null && v.total <= v.hdl) || (v.ldl !== null && v.ldl > v.total))) return null;
  if (v.ascvd === "no" && v.extremeCombination !== "no") return null;
  const ageRisk = v.age >= (v.sex === "male" ? 45 : 55);
  const hdlRisk = v.hdl === null ? null : v.hdl < (v.sex === "male" ? 40 : 50);
  const factors = [
    { label: "高血壓", value: v.hypertension === "unknown" ? null : v.hypertension === "yes" },
    { label: "年齡（男性 ≥45、女性 ≥55 歲）", value: ageRisk },
    { label: "早發性冠心病家族史", value: v.familyHistory === "unknown" ? null : v.familyHistory === "yes" },
    { label: "HDL 偏低", value: hdlRisk },
    { label: "目前吸菸", value: v.smoking === "unknown" ? null : v.smoking === "yes" },
    { label: "代謝症候群", value: v.metabolicSyndrome === "unknown" ? null : v.metabolicSyndrome === "yes" },
  ];
  const riskMin = factors.filter(f => f.value === true).length, riskUnknown = factors.filter(f => f.value === null).length;
  const currentSevere = v.ldl !== null && v.ldl >= 190;
  function classify(unknownTrue: boolean) {
    const yes = (a: LdlAnswer) => a === "yes" || (a === "unknown" && unknownTrue);
    if (yes(v.extremeCombination)) return 0;
    if (yes(v.ascvd)) return 1;
    if (yes(v.diabetes) || v.kidney === "predialysis" || (v.kidney === "unknown" && unknownTrue) || yes(v.severeLdl) || currentSevere || yes(v.cac400)) return 2;
    const count = riskMin + (unknownTrue ? riskUnknown : 0);
    return count >= 2 ? 3 : count === 1 ? 4 : 5;
  }
  const best = classify(false), worst = classify(true), certain = best === worst;
  const level = ldlLevels[best];
  const reasons: string[] = [];
  if (best === 0) reasons.push("符合表一的極高風險疾病組合");
  else if (best === 1) reasons.push("有符合表一定義的動脈粥狀硬化心血管疾病／顯著斑塊");
  else if (best === 2) {
    if (v.diabetes === "yes") reasons.push("糖尿病");
    if (v.kidney === "predialysis") reasons.push("透析前慢性腎臟病");
    if (v.severeLdl === "yes" || currentSevere) reasons.push("已知 LDL-C ≥190 mg/dL");
    if (v.cac400 === "yes") reasons.push("冠狀動脈鈣化分數 CAC ≥400");
  } else reasons.push(`已確認 ${riskMin} 項心血管風險因子`);
  const nonHdl = v.total !== null && v.hdl !== null ? v.total - v.hdl : null;
  const dialysis = v.kidney === "dialysis";
  // The target is strict '<'; treatment initiation in table one is inclusive '≥'.
  const atGoal = certain && !dialysis && v.ldl !== null ? v.ldl < level.target : null;
  const secondaryAtGoal = certain && !dialysis && nonHdl !== null && level.secondary !== null ? nonHdl < level.secondary : null;
  let reimbursement: string;
  if (dialysis) reimbursement = "透析病人需由醫師個別評估；本頁不自動套用透析前腎臟病條件，也不判定藥品給付。";
  else if (!certain) reimbursement = "部分病史或風險資料不清楚，先確認分層，再由醫師判斷起始用藥與給付條件。";
  else if (v.onTreatment === "yes") reimbursement = "已在用藥：本次 LDL 只用來看控制情況，不能用目前數字否定原有給付，也不要自行停藥。";
  else if (v.onTreatment === "unknown") reimbursement = "請先核對目前用藥；起始給付需參考用藥前資料與實際藥品規定。";
  else if (v.ldl === null) reimbursement = "尚未填本次 LDL；先顯示表一參考目標，起始給付仍需檢驗及醫師確認。";
  else if (v.ldl < level.target) reimbursement = "本次 LDL 低於此層起始用藥門檻；是否仍需治療須依完整病史由醫師判斷。";
  else if (best >= 3) reimbursement = ["3to6", "over6"].includes(v.lifestyle) ? "已達表一血脂門檻，且已填生活型態調整至少 3 個月；仍須由醫師核對 3–6 個月治療與追蹤紀錄及實際藥品。" : "已達表一血脂門檻，但這一層起始用藥前需先有 3–6 個月生活型態調整；目前不能直接判定給付。";
  else reimbursement = "已達表一血脂門檻，可與醫師討論治療；仍須核對診斷、基線資料與實際藥品，不代表任何降血脂藥都可給付。";
  return { certain, levelIndex: certain ? best : null, knownLevelIndex: best, possibleHigherIndex: worst, target: certain && !dialysis ? level.target : null, secondaryTarget: certain && !dialysis ? level.secondary : null, atGoal, nonHdl, secondaryAtGoal, riskMin, riskMax: riskMin + riskUnknown, factors, reasons, reimbursement, dialysis, needsLifestyleFirst: best >= 3, ldl: v.ldl };
}
