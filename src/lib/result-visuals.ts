import { classifyFib4, gfrCategory, scoreIsi, scoreGad7, scorePhq9, scoreStopBang } from "./assessments";
import type { QuestionnaireKind } from "./questionnaires";

export type ResultTone = "neutral" | "positive" | "caution" | "danger";
export type ResultBand = { label: string; range: string; tone: ResultTone };
export type ResultVisual = { tone: ResultTone; scale?: { bands: ResultBand[]; active: number } };
function visual(bands: ResultBand[], active: number): ResultVisual {
  return { tone: bands[active].tone, scale: { bands, active } };
}
export function fib4Visual(value: number, age: number): ResultVisual {
  const result = classifyFib4(value, age);
  if (!result || result.level === "unreliable") return { tone: "neutral" };
  const lower = result.lowerCutoff;
  return visual([
    { label: "較低", range: `< ${lower}`, tone: "positive" },
    { label: "中間", range: `${lower}–2.67`, tone: "caution" },
    { label: "較高", range: "> 2.67", tone: "danger" },
  ], result.level === "lower" ? 0 : result.level === "indeterminate" ? 1 : 2);
}
export function egfrVisual(value: number): ResultVisual {
  const category = gfrCategory(value);
  if (!category) return { tone: "neutral" };
  const bands: ResultBand[] = [
    { label: "G1", range: "≥ 90", tone: "positive" },
    { label: "G2", range: "60–<90", tone: "positive" },
    { label: "G3a", range: "45–<60", tone: "caution" },
    { label: "G3b", range: "30–<45", tone: "caution" },
    { label: "G4", range: "15–<30", tone: "danger" },
    { label: "G5", range: "< 15", tone: "danger" },
  ];
  return visual(bands, bands.findIndex(b => b.label === category));
}
export function questionnaireVisual(kind: QuestionnaireKind, items: number[]): ResultVisual {
  if (kind === "stop-bang") {
    const r = scoreStopBang(items);
    if (!r) return { tone: "neutral" };
    return visual([
      { label: "較低", range: "0–2 分，無高風險組合", tone: "positive" },
      { label: "中間", range: "3–4 分，無高風險組合", tone: "caution" },
      { label: "較高", range: "5–8 分，或符合組合條件", tone: "danger" },
    ], r.level === "lower" ? 0 : r.level === "intermediate" ? 1 : 2);
  }
  if (kind === "phq-9") {
    const r = scorePhq9(items);
    if (!r) return { tone: "neutral" };
    // 第九題的安全訊號優先，不用低總分的綠色分級抵銷提醒。
    if (r.needsSafety) return { tone: "danger" };
    return visual([
      { label: "極輕", range: "0–4 分", tone: "positive" },
      { label: "輕度", range: "5–9 分", tone: "caution" },
      { label: "中度", range: "10–14 分", tone: "caution" },
      { label: "中重", range: "15–19 分", tone: "danger" },
      { label: "重度", range: "20–27 分", tone: "danger" },
    ], r.score < 5 ? 0 : r.score < 10 ? 1 : r.score < 15 ? 2 : r.score < 20 ? 3 : 4);
  }
  const r = kind === "isi" ? scoreIsi(items) : scoreGad7(items);
  if (!r) return { tone: "neutral" };
  const isi = kind === "isi";
  return visual([
    { label: isi ? "未明顯" : "極輕", range: isi ? "0–7 分" : "0–4 分", tone: "positive" },
    { label: "較輕", range: isi ? "8–14 分" : "5–9 分", tone: "caution" },
    { label: "中度", range: isi ? "15–21 分" : "10–14 分", tone: "caution" },
    { label: "重度", range: isi ? "22–28 分" : "15–21 分", tone: "danger" },
  ], r.score < (isi ? 8 : 5) ? 0 : r.score < (isi ? 15 : 10) ? 1 : r.score < (isi ? 22 : 15) ? 2 : 3);
}
export function bmiVisual(value: number): ResultVisual {
  return visual([
    { label: "過輕", range: "< 18.5", tone: "caution" },
    { label: "健康體位", range: "18.5–<24", tone: "positive" },
    { label: "過重", range: "24–<27", tone: "caution" },
    { label: "肥胖", range: "≥ 27", tone: "danger" },
  ], value < 18.5 ? 0 : value < 24 ? 1 : value < 27 ? 2 : 3);
}
export function waistHeightVisual(band: string, applicable: boolean): ResultVisual {
  if (!applicable) return { tone: "neutral" };
  const index = ["below-reference", "lower", "increased", "higher"].indexOf(band);
  if (index < 0) return { tone: "neutral" };
  return visual([
    { label: "先核對", range: "< 0.4", tone: "neutral" },
    { label: "參考區間", range: "0.4–<0.5", tone: "positive" },
    { label: "增加", range: "0.5–<0.6", tone: "caution" },
    { label: "較高", range: "≥ 0.6", tone: "danger" },
  ], index);
}
