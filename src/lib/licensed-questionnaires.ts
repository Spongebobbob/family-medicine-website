import { interpretScale } from "./aging-sleep-assessments";
export type LicensedQuestionnaireKind = "ess" | "mna-sf";
export type ScoredQuestion = { text: string; hint?: string; choices: readonly { label: string; score: number }[] };
const choices = (...labels: string[]) => labels.map((label, score) => ({ label, score }));
// Website holder confirmed public-web permission in this conversation on 2026-11-26.
// Preserve item meanings and scoring; this implementation does not imply electronic validation.
const essChoices = choices("不會打瞌睡", "稍微打瞌睡（大都能維持清醒）", "中度打瞌睡（可能維持清醒）", "高度打瞌睡（很少能維持清醒）");
export const licensedQuestionnaires: Record<LicensedQuestionnaireKind, { minAge: number; intro: string; questions: readonly ScoredQuestion[] }> = {
  ess: {
    minAge: 18,
    intro: "請根據您最近的生活常態，評量下列情況中可能會打瞌睡或睡著的機會。假設最近沒有經歷這些情況，請試著推想這些情況的精神狀態。",
    questions: [
      { text: "坐著閱讀書報時", choices: essChoices },
      { text: "觀看電視時", choices: essChoices },
      { text: "坐在不活動的公共場合時（例如：公園、百貨公司）", choices: essChoices },
      { text: "坐在連續開了一個小時的車子時（乘客）", choices: essChoices },
      { text: "下午躺下來休息時（環境許可）", choices: essChoices },
      { text: "坐著與別人交談時", choices: essChoices },
      { text: "午餐後安靜坐著時（沒有喝酒）", choices: essChoices },
      { text: "坐著的車子停頓幾分鐘時（例如：停紅燈）", choices: essChoices },
    ],
  },
  "mna-sf": {
    minAge: 65,
    intro: "請回答以下營養篩檢問題；第 6 題以 BMI 計算，無法取得身高體重時才改用小腿圍。",
    questions: [
      { text: "過去三個月內有沒有因為食慾不振、消化問題、咀嚼或吞嚥困難而減少食量？", choices: choices("食量嚴重減少", "食量中度減少", "食量沒有改變") },
      { text: "過去三個月內體重下降的情況", choices: choices("體重下降大於 3 公斤", "不知道", "體重下降 1–3 公斤", "體重沒有下降") },
      { text: "活動能力", choices: choices("需長期臥床或坐輪椅", "可以下床或離開輪椅，但不能外出", "可以外出") },
      { text: "過去三個月內有沒有受到心理創傷或患上急性疾病？", choices: [{ label: "有", score: 0 }, { label: "沒有", score: 2 }] },
      { text: "精神心理問題", hint: "題本的「痴呆」指失智、「抑鬱」指憂鬱；有疑問請由醫療人員協助。", choices: choices("嚴重痴呆或抑鬱", "輕度痴呆", "沒有精神心理問題") },
    ],
  },
};
function validAnswers(questions: readonly ScoredQuestion[], answers: readonly number[]) {
  return answers.length === questions.length && Array.from(answers).every((score, i) => Number.isInteger(score) && questions[i].choices.some(c => c.score === score));
}
export function scoreEss(age: number, answers: readonly number[]) {
  if (!validAnswers(licensedQuestionnaires.ess.questions, answers)) return null;
  return interpretScale("ess", age, answers.reduce((total, n) => total + n, 0));
}
export type MnaMeasurement = { method: "bmi"; height: number; weight: number } | { method: "calf"; calf: number };
export function mnaMeasurementScore(measurement: MnaMeasurement) {
  if (measurement.method === "bmi") {
    const { height, weight } = measurement;
    if (!Number.isFinite(height) || !Number.isFinite(weight) || height < 100 || height > 250 || weight < 20 || weight > 350) return null;
    const value = weight / (height / 100) ** 2;
    return { score: value < 19 ? 0 : value < 21 ? 1 : value < 23 ? 2 : 3, value, method: "bmi" as const };
  }
  if (measurement.method === "calf") {
    const value = measurement.calf;
    if (!Number.isFinite(value) || value < 10 || value > 100) return null;
    return { score: value < 31 ? 0 : 3, value, method: "calf" as const };
  }
  return null;
}
export function scoreMnaSf(age: number, answers: readonly number[], measurement: MnaMeasurement) {
  if (!validAnswers(licensedQuestionnaires["mna-sf"].questions, answers)) return null;
  const f = mnaMeasurementScore(measurement); if (!f) return null;
  const result = interpretScale("mna-sf", age, answers.reduce((total, n) => total + n, 0) + f.score);
  if (!result) return null;
  return { ...result, rows: [{ label: f.method === "bmi" ? "第 6 題：BMI" : "第 6 題：小腿圍", value: f.method === "bmi" ? f.value.toFixed(2) : `${f.value} 公分` }, { label: "第 6 題分數", value: `${f.score}／3 分（兩種方法擇一）` }] };
}
