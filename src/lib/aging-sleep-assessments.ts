import type { AssessmentResult } from "@/components/tools/assessment-form";
import type { ResultBand } from "./result-visuals";
export type ScoreToolKind = "sarc-f" | "mna-sf" | "frail" | "ess";
export const scoreToolSettings: Record<ScoreToolKind, { name: string; max: number; minAge: number; formUrl: string; formLabel: string }> = {
  "sarc-f": { name: "SARC-F", max: 10, minAge: 65, formUrl: "https://www.slu.edu/medicine/internal-medicine/geriatric-medicine/aging-successfully/", formLabel: "SLU 原題本與高齡評估工具" },
  "mna-sf": { name: "MNA-SF", max: 14, minAge: 65, formUrl: "https://www.mna-elderly.com/mna-forms", formLabel: "MNA 官方題本（可選中文）" },
  frail: { name: "FRAIL", max: 5, minAge: 65, formUrl: "https://www.slu.edu/medicine/internal-medicine/geriatric-medicine/aging-successfully/", formLabel: "SLU 原題本與高齡評估工具" },
  ess: { name: "ESS", max: 24, minAge: 18, formUrl: "https://epworthsleepinessscale.com/about-the-ess/", formLabel: "ESS 官方量表與使用說明" },
};
const integer = (n: number, min: number, max: number) => Number.isInteger(n) && n >= min && n <= max;
/** Interpret an existing total only: copyrighted or unverified translated items are not reproduced. */
export function interpretScale(kind: ScoreToolKind, age: number, total: number): AssessmentResult | null {
  const settings = scoreToolSettings[kind];
  if (!settings || !integer(age, settings.minAge, 120) || !integer(total, 0, settings.max)) return null;
  let bands: ResultBand[], active: number, label: string, message: string;
  if (kind === "sarc-f") {
    bands = [{ label: "未達切點", range: "0–3 分", tone: "neutral" }, { label: "需進一步評估", range: "4–10 分", tone: "caution" }];
    active = total >= 4 ? 1 : 0;
    label = active ? "達到肌少症篩檢切點" : "未達 SARC-F 篩檢切點";
    message = active ? "可安排握力、身體功能及肌肉量評估；問卷分數本身不能確診肌少症。" : "低分仍不能排除肌少症；若走路變慢、反覆跌倒或肌力下降，仍建議量測與就醫。";
  } else if (kind === "mna-sf") {
    bands = [{ label: "營養不良區間", range: "0–7 分", tone: "danger" }, { label: "有營養風險", range: "8–11 分", tone: "caution" }, { label: "正常區間", range: "12–14 分", tone: "positive" }];
    active = total < 8 ? 0 : total < 12 ? 1 : 2;
    label = ["落在營養不良篩檢區間", "有營養不良風險", "落在營養正常篩檢區間"][active];
    message = active === 2 ? "持續留意食量與體重；若近期明顯變瘦、吃不下或吞嚥困難，仍應就醫。" : "建議由醫師或營養師進一步評估食量、體重變化與疾病因素，安排營養照護。";
  } else if (kind === "frail") {
    bands = [{ label: "未達衰弱", range: "0 分", tone: "neutral" }, { label: "衰弱前期", range: "1–2 分", tone: "caution" }, { label: "衰弱區間", range: "3–5 分", tone: "danger" }];
    active = total === 0 ? 0 : total < 3 ? 1 : 2;
    label = ["未達 FRAIL 衰弱篩檢切點", "落在衰弱前期區間", "落在衰弱篩檢區間"][active];
    message = active ? "可向家庭醫學科或老年醫學科討論營養、用藥、活動與跌倒風險，安排個別評估。" : "這不代表所有身體功能都正常；若近期活動能力下降，仍需評估原因。";
  } else {
    bands = [{ label: "未達嗜睡切點", range: "0–10 分", tone: "neutral" }, { label: "輕度偏高", range: "11–12 分", tone: "caution" }, { label: "中度偏高", range: "13–15 分", tone: "caution" }, { label: "重度偏高", range: "16–24 分", tone: "danger" }];
    active = total <= 10 ? 0 : total <= 12 ? 1 : total <= 15 ? 2 : 3;
    label = active ? "白天嗜睡分數偏高" : "未達 ESS 日間嗜睡切點";
    message = "若白天不由自主睡著、打呼或曾被發現呼吸暫停，建議睡眠門診評估；即使分數低也不能排除。想睡時請勿開車或操作危險機械。";
  }
  return { value: String(total), unit: `分／滿分 ${settings.max} 分`, label, message, visual: { tone: bands[active].tone, scale: { bands, active } } };
}
export function evaluateMuscle(input: { age: number; sex: string; calf: number | null; grip: number | null }): AssessmentResult | null {
  const { age, sex, calf, grip } = input;
  if (!integer(age, 65, 120) || !["male", "female"].includes(sex) || (calf === null && grip === null)) return null;
  if (calf !== null && (!Number.isFinite(calf) || calf < 10 || calf > 100)) return null;
  if (grip !== null && (!Number.isFinite(grip) || grip < 0 || grip > 150)) return null;
  const calfCut = sex === "male" ? 34 : 33, gripCut = sex === "male" ? 28 : 18;
  const lowCalf = calf === null ? null : calf < calfCut, lowGrip = grip === null ? null : grip < gripCut;
  const count = Number(lowCalf === true) + Number(lowGrip === true), tested = Number(calf !== null) + Number(grip !== null);
  return {
    value: `${count} / ${tested}`, unit: "已測指標偏低", label: lowGrip ? "握力偏低，建議進一步評估" : lowCalf ? "小腿圍偏低，建議進一步評估" : tested === 1 ? "已測項目未偏低，另有一項未測" : "兩項量測未低於參考切點",
    message: lowGrip ? "建議由醫療人員確認量測，必要時檢查肌肉量；不能只靠握力或小腿圍確診。" : lowCalf ? "小腿圍是初步篩檢指標，請再量握力並由醫療人員評估。" : "量測未偏低仍不能排除肌少症；若有跌倒、走路變慢或明顯無力，請就醫。",
    visual: { tone: count ? "caution" : "neutral" },
    rows: [
      { label: `小腿圍（低於 ${calfCut} 公分）`, value: calf === null ? "未測量" : `${calf} 公分・${lowCalf ? "偏低" : "未偏低"}`, tone: lowCalf ? "caution" : "neutral" },
      { label: `握力（低於 ${gripCut} 公斤）`, value: grip === null ? "未測量" : `${grip} 公斤・${lowGrip ? "偏低" : "未偏低"}`, tone: lowGrip ? "caution" : "neutral" },
    ],
  };
}
export type SleepEntry = { date: string; bedtime: string; riseTime: string; latency: number; awake: number; finalAwake: number; nap: number };
export type SleepNight = SleepEntry & { inBed: number; asleep: number; efficiency: number };
function clock(s: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) return null;
  const [h, m] = s.split(":").map(Number); return h * 60 + m;
}
export function calculateSleepNight(entry: SleepEntry): SleepNight | null {
  const bed = clock(entry.bedtime), rise = clock(entry.riseTime);
  const date = new Date(`${entry.date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== entry.date || bed === null || rise === null || bed === rise) return null;
  if (![entry.latency, entry.awake, entry.finalAwake, entry.nap].every(n => integer(n, 0, 1440))) return null;
  const inBed = (rise - bed + 1440) % 1440;
  const asleep = inBed - entry.latency - entry.awake - entry.finalAwake;
  if (asleep < 0) return null;
  return { ...entry, inBed, asleep, efficiency: asleep / inBed * 100 };
}
export function summarizeSleep(nights: SleepNight[]) {
  if (!nights.length || nights.length > 14 || new Set(nights.map(n => n.date)).size !== nights.length) return null;
  const checked = nights.map(n => calculateSleepNight(n));
  if (checked.some(n => !n)) return null;
  const totals = checked.reduce((a, n) => ({ inBed: a.inBed + n!.inBed, asleep: a.asleep + n!.asleep, nap: a.nap + n!.nap }), { inBed: 0, asleep: 0, nap: 0 });
  return { nights: nights.length, averageSleep: totals.asleep / nights.length, averageNap: totals.nap / nights.length, averageInBed: totals.inBed / nights.length, efficiency: totals.asleep / totals.inBed * 100 };
}
export function sleepCsv(nights: SleepNight[]): string | null {
  if (!summarizeSleep(nights)) return null;
  const rows = [["離床日期", "上床時間", "離床時間", "入睡前清醒分鐘", "夜間清醒分鐘", "最後醒來至離床分鐘", "小睡分鐘", "在床分鐘", "估計睡眠分鐘", "睡眠效率百分比"], ...nights.map(raw => {
    const n = calculateSleepNight(raw)!;
    return [n.date, n.bedtime, n.riseTime, n.latency, n.awake, n.finalAwake, n.nap, n.inBed, n.asleep, n.efficiency.toFixed(1)];
  })];
  return "\uFEFF" + rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
}
