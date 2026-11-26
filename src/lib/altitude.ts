export const altitudeEvidence = {
  checked: "2026-11-26", version: "CDC Yellow Book 2026 Table 3.5.1；WMS 2024；LLS 2018",
  scope: "行程分層採 CDC 表：出發海拔 <1200m、尚未充分適應的成人；不將 WMS 2800/3500m 的分界混入 CDC 2750/3400m。",
  sources: ["https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html", "https://wms.org/magazine/1463/2024-Altitude-Summary", "https://doi.org/10.1016/j.wem.2023.05.013", "https://doi.org/10.1089/ham.2017.0164"],
  rights: "網站持有人於 2026-11-26 確認已有 LLS 2018 繁中網頁重製授權；本站介面仍待醫師審閱，不冒稱本站中文電子版已驗證。",
} as const;
export type TravelAnswer = "yes" | "no" | "unknown";
export type AltitudeHistory = "none-mild" | "moderate-severe" | "hape-hace" | "unknown";
export type AltitudeInput = { start: number; nights: number[]; priorNights: number; extraRest: TravelAnswer; history: AltitudeHistory; specialHealth: TravelAnswer };
const finiteAltitude = (n: number) => Number.isFinite(n) && n >= -500 && n <= 9000;
export function altitudeEmergency(hape: TravelAnswer | "", hace: TravelAnswer | "") { return hape === "yes" || hace === "yes"; }
export function assessAltitude(input: AltitudeInput) {
  const { start, nights, history, priorNights, extraRest, specialHealth } = input;
  if (!finiteAltitude(start) || !nights.length || nights.length > 30 || !Array.from(nights).every(finiteAltitude) || !Number.isInteger(priorNights) || priorNights < 0 || priorNights > 14 || !["none-mild", "moderate-severe", "hape-hace", "unknown"].includes(history) || !["yes","no","unknown"].includes(extraRest) || !["yes","no","unknown"].includes(specialHealth)) return null;
  const gains = nights.map((alt, i) => alt - (i === 0 ? start : nights[i - 1]));
  const rapidDays = nights.flatMap((alt,i) => i > 0 && alt > 3000 && gains[i] > 500 ? [i + 1] : []);
  // Count actual no-ascent nights separately; an assertion alone never overrides the itinerary.
  const restDays = nights.flatMap((alt,i) => i > 0 && alt >= 2450 && alt === nights[i - 1] ? [i + 1] : []);
  let gainSinceRest = 0, restMissing = false;
  for (let i = 1; i < nights.length; i++) {
    if (nights[i] <= nights[i-1]) { gainSinceRest = 0; continue; }
    if (nights[i] > 3000) {
      gainSinceRest += Math.max(0, nights[i] - Math.max(3000, nights[i-1]));
      if (gainSinceRest > 1000) restMissing = true;
    }
  }
  const firstLevel = nights[0] < 2750 ? 0 : nights[0] <= 3400 ? 1 : 2;
  const historyLevel = history === "hape-hace" ? 2 : history === "moderate-severe" ? 1 : 0;
  const ascentLevel = rapidDays.length ? restMissing || extraRest === "no" ? 2 : 1 : 0;
  const known = Math.max(firstLevel,historyLevel,ascentLevel);
  const applicable = start < 1200 && priorNights < 2;
  const uncertain = history === "unknown" || (rapidDays.length > 0 && extraRest === "unknown");
  const level = !applicable || (uncertain && known < 2) ? null : known;
  const reasons = [
    `第一晚 ${nights[0]}m：${["低風險條件","中風險條件","高風險條件"][firstLevel]}`,
    history === "unknown" ? "既往高山症病史尚不清楚" : history === "hape-hace" ? "曾有 HAPE／HACE，屬高風險條件" : history === "moderate-severe" ? "曾有中至重度 AMS" : "無病史或僅輕度 AMS",
    rapidDays.length ? `第 ${rapidDays.join("、")} 晚在 3000m 以上增加超過 500m${restMissing ? "，且有連續增加超過 1000m 未安排適應晚的區段" : ""}` : "後續沒有在 3000m 以上每日增加超過 500m",
  ];
  if (restMissing && !rapidDays.length) reasons.push("雖未超過每日 500m，仍有連續增加超過 1000m 而缺少適應晚的區段，請調整行程。");
  if (!applicable) reasons.push(start >= 1200 ? "出發海拔已達 1200m，超出 CDC 此表假設，需個別評估" : "近期已有至少兩晚高海拔暴露，不能直接套用未適應旅客分層，也不自動判為低風險");
  return { level, label: level === null ? "需個別評估" : ["低風險","中度風險","高風險"][level], gains, rapidDays, restDays, restMissing, reasons, specialReview: specialHealth !== "no", medication: level === null ? "請攜完整行程與醫師討論是否需要 Acetazolamide 預防。" : level === 0 ? "通常不需要例行使用 Acetazolamide 預防；仍需注意症狀與撤退計畫。" : level === 1 ? "可與旅遊醫學醫師討論 Acetazolamide 預防，優先調整過快的上升行程。" : "強烈建議行前與醫師討論 Acetazolamide 預防及緊急撤退計畫。", advice: "3000m 以上住宿海拔每天增加不超過 500m，每增加 1000m 安排額外適應晚。有症狀先停止上升，惡化就下降並求救；藥物不能取代下降。" };
}
export const lakeLouise2018 = [
  { label: "頭痛", choices: ["沒有頭痛", "輕微頭痛", "中度頭痛", "嚴重頭痛，無法正常活動"] },
  { label: "腸胃不適", choices: ["食慾正常，沒有不適", "食慾不佳或噁心", "中度噁心或嘔吐", "嚴重噁心或嘔吐，無法正常活動"] },
  { label: "疲倦或虛弱", choices: ["沒有疲倦或虛弱", "輕度疲倦或虛弱", "中度疲倦或虛弱", "嚴重疲倦或虛弱，無法正常活動"] },
  { label: "頭暈或頭昏", choices: ["沒有頭暈或頭昏", "輕微頭暈或頭昏", "中度頭暈或頭昏", "嚴重頭暈或頭昏，無法正常活動"] },
] as const;
export function scoreLakeLouise(items: readonly number[], recentGain: TravelAnswer, sixHours: TravelAnswer) {
  if (items.length !== 4 || !Array.from(items).every(n => Number.isInteger(n) && n >= 0 && n <= 3) || !["yes","no","unknown"].includes(recentGain) || !["yes","no","unknown"].includes(sixHours)) return null;
  const score = items.reduce((a,b) => a+b,0);
  const applicable = recentGain === "yes" && sixHours === "yes";
  const meetsResearchDefinition = applicable && items[0] >= 1 && score >= 3;
  return { score, applicable, meetsResearchDefinition, label: !applicable ? "目前不套用 LLS 研究判定" : meetsResearchDefinition ? "符合 LLS 2018 的 AMS 症狀組合" : "未符合 LLS 2018 的 AMS 症狀組合", advice: "此為症狀輔助工具，不能排除其他疾病、HAPE 或 HACE。有症狀不要繼續上升；持續或惡化請下降並就醫。" };
}
