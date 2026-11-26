/** FRAX preparation and transcription only. No fracture probability algorithm is implemented. */
export const fraxOfficialUrl = "https://www.fraxplus.org/zh-Hant/calculation-tool/";
export const fraxRiskFactors = [
  { key: "fracture", label: "成年後曾有輕微外力造成的骨折", hint: "請準備發生時間、部位與受傷方式，供醫師及官方問項核對。" },
  { key: "parentHip", label: "父親或母親曾髖部骨折" },
  { key: "smoking", label: "目前吸菸" },
  { key: "steroids", label: "口服類固醇使用史", hint: "準備藥名、每日劑量與使用時間，依官方定義及醫師判斷填寫。吸入或外用製劑不要自行當作口服使用。" },
  { key: "arthritis", label: "醫師診斷類風濕性關節炎", hint: "與一般退化性關節炎不同，請核對診斷。" },
  { key: "secondary", label: "已知有造成次發性骨質疏鬆的疾病", hint: "不確定時帶病史與用藥清單請醫師確認。" },
  { key: "alcohol", label: "飲酒量可能達官方每日 3 單位以上", hint: "單位與杯子大小不同，請準備酒種、容量與酒精濃度，在官方頁核對。" },
] as const;
export type FraxValues = Record<string, string>;
export type FraxErrors = Record<string, string>;
const answerText: Record<string, string> = { yes: "有", no: "無", unknown: "未確認" };
export function prepareFrax(values: FraxValues): { errors: FraxErrors; summary?: string } {
  const errors: FraxErrors = {};
  const number = (key: string) => values[key]?.trim() ? Number(values[key]) : NaN;
  const age = number("age");
  if (!Number.isInteger(age) || age < 40 || age > 90) errors.age = "請填寫 40–90 歲的整數；本頁不自動改成年齡邊界值。";
  if (!["female", "male"].includes(values.sex)) errors.sex = "請選擇官方模型使用的性別參數。";
  for (const key of ["weight", "height"]) if (!Number.isFinite(number(key)) || number(key) <= 0) errors[key] = "請填寫大於 0 的有效數值，並核對單位。";
  for (const factor of fraxRiskFactors) if (!Object.hasOwn(answerText, values[factor.key])) errors[factor.key] = "請選擇有、無或未確認。";
  if (!["none", "report", "unknown"].includes(values.bmd)) errors.bmd = "請選擇骨密度報告狀態。";
  if (Object.keys(errors).length) return { errors };
  const bmd = { none: "未提供股骨頸骨密度", report: "有報告：請核對股骨頸 BMD、單位與測量機型", unknown: "部位或資料未確認，先核對報告" }[values.bmd];
  const unresolved = fraxRiskFactors.filter(f => values[f.key] === "unknown").length;
  return { errors, summary: [
    "FRAX 計算準備資料（非骨折風險結果）", "官方模型請選：亞洲 → Taiwan（台灣）",
    `年齡：${age} 歲`, `性別參數：${values.sex === "female" ? "女性" : "男性"}`,
    `體重：${number("weight")} kg`, `身高：${number("height")} cm`,
    ...fraxRiskFactors.map(f => `${f.label}：${answerText[values[f.key]]}`), `骨密度：${bmd}`,
    ...(unresolved ? [`有 ${unresolved} 項病史未確認；本頁保留未知，不當成「無」。`] : []),
    "請在官方頁依其問項定義重新核對；本資料不會自動傳送。",
  ].join("\n") };
}
export function recordFraxResult(values: FraxValues): { errors: FraxErrors; result?: { major: number; hip: number; bmd: string } } {
  const errors: FraxErrors = {};
  const parse = (key: string) => values[key]?.trim() ? Number(values[key]) : NaN;
  const major = parse("major"), hip = parse("hip");
  for (const [key, value] of [["major", major], ["hip", hip]] as const) if (!Number.isFinite(value) || value < 0 || value > 100) errors[key] = "請輸入官方顯示的 0–100% 機率；未填不會當成 0%。";
  if (Number.isFinite(major) && Number.isFinite(hip) && hip > major) errors.hip = "髖部骨折是主要骨鬆性骨折的一部分，請核對兩個欄位有沒有填反。";
  if (!["with", "without"].includes(values.bmd)) errors.bmd = "請核對這次官方計算是否使用股骨頸 BMD。";
  if (values.confirmed !== "yes") errors.confirmed = "請確認結果來自官方 FRAX，且模型選擇 Taiwan（台灣）。";
  return Object.keys(errors).length ? { errors } : { errors, result: { major, hip, bmd: values.bmd } };
}
