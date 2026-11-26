import { interpretScale } from "./aging-sleep-assessments";
export type GeriatricQuestionnaireKind = "sarc-f" | "frail";
// Chinese reading adaptation of the freely reusable RGA tools in Ruiz et al.,
// ICFSR 2020, Figure 1. Not presented as a validated Taiwan electronic version.
type Question = { text: string; hint?: string; choices: readonly string[] };
const difficulty = ["沒有困難", "有些困難", "很困難，或無法完成"];
const yesNo = ["否", "是"];
export const geriatricQuestionnaires: Record<GeriatricQuestionnaireKind, { intro: string; questions: readonly Question[] }> = {
  "sarc-f": {
    intro: "依平常的能力回答；跌倒次數請回想過去一年，不需要特地做動作測試。",
    questions: [
      { text: "提起並搬動約 4.5 公斤的東西，對你有多困難？", hint: "原題重量為 10 磅，約 4.5 公斤。", choices: difficulty },
      { text: "走過一個房間，對你有多困難？", choices: ["沒有困難", "有些困難", "很困難、需要輔具，或無法行走"] },
      { text: "從椅子或床上起身，對你有多困難？", choices: ["沒有困難", "有些困難", "很困難，或沒有人幫忙就無法起身"] },
      { text: "爬上 10 階樓梯，對你有多困難？", choices: difficulty },
      { text: "過去一年，你跌倒過幾次？", choices: ["沒有跌倒", "1–3 次", "4 次以上"] },
    ],
  },
  frail: {
    intro: "依平常情況回答 5 題；體重變化請回想過去 6 個月。",
    questions: [
      { text: "你是否感到疲倦？", choices: yesNo },
      { text: "你是否無法爬上一層樓的樓梯？", choices: yesNo },
      { text: "你是否無法走完一個街區的距離？", hint: "一個街區是從一個路口到下一個路口；依平常能力回答，不需現場測試。", choices: yesNo },
      { text: "你經醫師診斷的疾病，是否超過 5 種？", hint: "超過 5 種是指 6 種以上；疾病數目不等於吃藥的顆數，不清楚時請先與醫療人員確認。", choices: yesNo },
      { text: "過去 6 個月，你的體重是否下降超過 5%？", hint: "例如原本 60 公斤，降到低於 57 公斤；剛好下降 5% 不算「超過」。", choices: yesNo },
    ],
  },
};
export function scoreGeriatricQuestionnaire(kind: GeriatricQuestionnaireKind, age: number, answers: readonly number[]) {
  if (!Object.hasOwn(geriatricQuestionnaires, kind) || answers.length !== 5) return null;
  const max = kind === "sarc-f" ? 2 : 1;
  if (!Array.from(answers).every(n => Number.isInteger(n) && n >= 0 && n <= max)) return null;
  return interpretScale(kind, age, answers.reduce((total, n) => total + n, 0));
}
