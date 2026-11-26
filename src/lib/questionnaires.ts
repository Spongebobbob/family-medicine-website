export type QuestionnaireKind = "isi" | "stop-bang" | "phq-9" | "gad-7";
type Question = { text: string; choices: readonly string[]; hint?: string };
const frequency = ["完全沒有", "有幾天", "超過一半的天數", "幾乎每天"];
const severity = ["沒有", "輕微", "中等", "嚴重", "非常嚴重"];
const degree = ["完全沒有", "有一點", "中等程度", "很明顯", "非常明顯"];
const yesNo = ["否", "是"];
/** 依來源的構念及計分順序提供中文閱讀版，未宣稱為已驗證的電子中文版。 */
export const questionnaires: Record<QuestionnaireKind, { intro: string; questions: Question[] }> = {
  "stop-bang": {
    intro: "依照平常的情況，回答以下 8 題。",
    questions: [
      { text: "你打呼的聲音很大嗎？", hint: "例如關上房門仍聽得到，或會吵到枕邊人。", choices: yesNo },
      { text: "你白天經常覺得疲倦或想睡覺嗎？", choices: yesNo },
      { text: "有人看過你睡覺時停止呼吸、嗆到或喘氣嗎？", choices: yesNo },
      { text: "你有高血壓，或正在接受高血壓治療嗎？", choices: yesNo },
      { text: "你的 BMI（身體質量指數）超過 35 嗎？", hint: "不確定時，可先使用下方的 BMI 計算器。", choices: yesNo },
      { text: "你的年齡超過 50 歲嗎？", hint: "剛滿 50 歲請選「否」。", choices: yesNo },
      { text: "你的頸圍達到男性 43 公分、女性 41 公分嗎？", hint: "用皮尺沿喉結的位置量一圈。", choices: yesNo },
      { text: "你的生理性別是男性嗎？", choices: yesNo },
    ],
  },
  isi: {
    intro: "回想過去兩週的睡眠，選出最符合的答案。",
    questions: [
      { text: "你有多難入睡？", choices: severity },
      { text: "你半夜醒來、難以繼續睡的問題有多嚴重？", choices: severity },
      { text: "你太早醒來的問題有多嚴重？", choices: severity },
      { text: "你對目前的睡眠狀況滿意嗎？", choices: ["非常滿意", "滿意", "普通", "不滿意", "非常不滿意"] },
      { text: "你覺得別人有多容易看出，睡不好影響了你的生活？", choices: degree },
      { text: "你對睡不好感到多擔心或困擾？", choices: ["完全不擔心", "有一點", "中等程度", "很擔心", "非常擔心"] },
      { text: "睡不好對你白天的生活影響有多大？", hint: "例如精神、心情、工作、家務、專注力或記憶力。", choices: ["完全沒影響", "有一點", "中等程度", "影響很大", "影響非常大"] },
    ],
  },
  "phq-9": {
    intro: "過去兩週，你有多常受到以下情況困擾？",
    questions: [
      { text: "做事情提不起興趣，或感受不到樂趣。", choices: frequency },
      { text: "心情低落、沮喪或覺得沒有希望。", choices: frequency },
      { text: "難以入睡、睡到一半醒來，或睡得太多。", choices: frequency },
      { text: "覺得疲倦或沒有精神。", choices: frequency },
      { text: "吃不下，或吃得太多。", choices: frequency },
      { text: "覺得自己很差、很失敗，或讓自己及家人失望。", choices: frequency },
      { text: "很難專心，例如看報紙或看電視時。", choices: frequency },
      { text: "動作或說話慢到別人注意到；或相反地，比平常更坐立不安、停不下來。", choices: frequency },
      { text: "覺得自己死了比較好，或想傷害自己。", choices: frequency },
    ],
  },
  "gad-7": {
    intro: "過去兩週，你有多常受到以下情況困擾？",
    questions: [
      { text: "覺得緊張、焦慮或心情不安。", choices: frequency },
      { text: "無法停止或控制擔心。", choices: frequency },
      { text: "對許多不同的事情擔心太多。", choices: frequency },
      { text: "很難放鬆。", choices: frequency },
      { text: "坐立不安，很難安靜坐著。", choices: frequency },
      { text: "容易心煩或發脾氣。", choices: frequency },
      { text: "感到害怕，好像有可怕的事情要發生。", choices: frequency },
    ],
  },
};
