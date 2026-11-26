// Public programme rules checked against HPA / Taiwan CDC on 2026-11-26.
// No patient data leaves the calling component. Unknown history is never “never”.
export const POLICY_YEAR = 2026;
export type Answer = "yes" | "no" | "unknown";
export type PreventionKind = "taiwan-cancer-screening" | "adult-health-check" | "adult-vaccines";
export type PreventionValues = Record<string, string>;
export type Recommendation = { id: string; title: string; status: string; detail: string; action: boolean; screenEligible?: boolean; needsRecordCheck?: boolean };
export type PreventionResult = { items: Recommendation[]; summary: string };
export function preventionOverview(kind: PreventionKind, result: PreventionResult) {
  const available = result.items.filter(i => i.action).length;
  if (kind === "adult-vaccines") return { count: available, title: "項可洽院所安排／評估", detail: "其他項目請看下方紀錄與條件" };
  const eligible = result.items.filter(i => i.screenEligible);
  const pending = eligible.filter(i => i.needsRecordCheck).length;
  const parts = [available ? `可洽院所安排 ${available} 項` : "", pending ? `需核對紀錄 ${pending} 項` : "", eligible.length - available - pending > 0 ? "其餘請看補助間隔與使用紀錄" : ""].filter(Boolean);
  return { count: eligible.length, title: "項符合年齡／風險條件", detail: parts.join("・") || "請看下方各項條件" };
}
const item = (id: string, title: string, status: string, detail: string, action = false): Recommendation => ({ id, title, status, detail, action });
const within = (n: number, low: number, high: number) => Number.isFinite(n) && n >= low && n <= high;
const answer = (s: string | undefined): s is Answer => ["yes", "no", "unknown"].includes(s ?? "");
export function validBirthYear(v: string) {
  const n = Number(v);
  return v.trim() !== "" && Number.isInteger(n) && within(n, POLICY_YEAR - 120, POLICY_YEAR - 18);
}
export function validHistory(v: string | undefined): boolean {
  if (!v || v === "unknown" || v === "never") return true;
  return /^\d{4}$/.test(v) && within(Number(v), 1900, POLICY_YEAR);
}
function screen(id: string, title: string, eligible: boolean | null, interval: number | null, history: string | undefined, detail: string): Recommendation {
  const make = (...args: Parameters<typeof item>): Recommendation => ({ ...item(...args), screenEligible: eligible === true });
  if (eligible === false) return make(id, title, "未符合本項公費條件", detail);
  if (eligible === null) return make(id, title, "需補充風險資料", detail);
  if (history === "never") return make(id, title, "可洽院所安排", detail, true);
  if (!history || history === "unknown") return { ...make(id, title, "符合基本條件，請核對紀錄", detail), needsRecordCheck: true };
  if (interval === null) return make(id, title, "已使用終身一次補助", "曾接受此公費檢查；後續追蹤由醫師依結果安排。");
  const due = Number(history) + interval;
  return due <= POLICY_YEAR ? make(id, title, "可洽院所安排", detail, true) : make(id, title, `${due} 年再核對資格`, `依前次 ${history} 年及目前補助間隔估算；異常結果不應等到例行篩檢。`);
}
export function cancerScreening(v: PreventionValues): PreventionResult | null {
  if (!validBirthYear(v.birthYear ?? "") || !["male", "female"].includes(v.sex) || ![v.indigenous, v.colonFamily, v.lungFamily, v.betel].every(answer) || !["never", "current", "quit"].includes(v.smoking)) return null;
  const ids = ["breast", "pap", "hpv", "colon", "oral", "lung", "stomach"];
  if (ids.some(id => !validHistory(v[id]) || (/^\d{4}$/.test(v[id] ?? "") && Number(v[id]) < Number(v.birthYear)))) return null;
  const age = POLICY_YEAR - Number(v.birthYear), female = v.sex === "female";
  let smokingRisk = false;
  if (v.smoking !== "never") {
    if (!v.cigarettes?.trim() || !v.smokingYears?.trim() || !within(Number(v.cigarettes), 0.1, 200) || !within(Number(v.smokingYears), 0.1, age)) return null;
    if (v.smoking === "quit" && (!v.quitYears?.trim() || !within(Number(v.quitYears), 0, age) || Number(v.smokingYears) + Number(v.quitYears) > age)) return null;
    smokingRisk = Number(v.cigarettes) / 20 * Number(v.smokingYears) >= 20 && (v.smoking === "current" || Number(v.quitYears) < 15);
  }
  const colon = within(age, 45, 74) || (within(age, 40, 44) && v.colonFamily === "yes") ? true : within(age, 40, 44) && v.colonFamily === "unknown" ? null : false;
  const lungFamilyAge = within(age, female ? 40 : 45, 74);
  const lung = (lungFamilyAge && v.lungFamily === "yes") || (within(age, 50, 74) && smokingRisk) ? true : lungFamilyAge && v.lungFamily === "unknown" ? null : false;
  const oral = age >= 30 ? v.betel === "yes" || v.smoking === "current" ? true : v.betel === "unknown" ? null : false : v.indigenous === "no" || v.betel === "no" ? false : v.indigenous === "yes" && v.betel === "yes" ? true : null;
  const items = [
    screen("breast", "乳癌｜乳房 X 光攝影", female && within(age, 40, 74), 2, v.breast, "女性 40–74 歲，每 2 年一次。"),
    screen("pap", "子宮頸癌｜子宮頸抹片", female && age >= 25, age < 30 ? 3 : 1, v.pap, age < 30 ? "女性 25–29 歲，每 3 年補助一次。" : "女性 30 歲以上每年可補助一次；一般建議至少每 3 年篩檢，實際頻率依醫師評估。"),
    screen("hpv", "子宮頸 HPV 檢測", female && [35, 45, 65].includes(age), null, v.hpv, "女性在 35、45、65 歲當年各補助一次；這是病毒檢測，不是疫苗。此處填本次年齡階段的使用紀錄。"),
    screen("colon", "大腸癌｜糞便潛血檢查", colon, 2, v.colon, "45–74 歲，或 40–44 歲且父母、兄弟姊妹或子女有大腸癌，每 2 年一次。"),
    screen("oral", "口腔癌｜口腔黏膜檢查", oral, 2, v.oral, "30 歲以上吸菸或曾嚼檳榔者；18–29 歲原住民且曾嚼檳榔者，每 2 年一次。"),
    screen("lung", "肺癌｜低劑量胸部電腦斷層", lung, 2, v.lung, "男性 45–74 歲／女性 40–74 歲有一等親肺癌史；或 50–74 歲吸菸達 20 包年且仍吸菸或戒菸未滿 15 年，每 2 年一次。仍吸菸者需配合戒菸服務。"),
    screen("stomach", "胃癌預防｜幽門螺旋桿菌檢測", within(age, 45, 74), null, v.stomach, "45–74 歲終身一次糞便抗原檢測。曾參加原鄉公費碳 13 吹氣或 113–114 年試辦者，須由院所查核是否已使用補助。"),
  ];
  // Public-facing “to 74” and programme claim-year upper bounds may differ.
  // Do not deny an entitlement based on year of birth alone at this boundary.
  if (age === 75) for (const r of items) {
    if (["breast", "colon", "lung", "stomach"].includes(r.id) && (r.id !== "breast" || female)) {
      r.status = "年齡上限年度，請院所核對";
      r.detail = "年度申報上限與宣導年齡可能不同；請讓院所查核出生年、風險條件及補助紀錄。";
      r.action = false;
      r.screenEligible = undefined;
    }
  }
  return { items, summary: "公費條件初步比對；需具健保資格，最終由院所查核。這不是癌症風險或診斷結果。" };
}
function checkGroup(age: number, indigenous: string, polio: string): { key: string; interval: number } | null {
  if (age >= 65 || (age >= 55 && indigenous === "yes") || (age >= 35 && polio === "yes")) return { key: "annual", interval: 1 };
  if (age >= 40) return { key: "three", interval: 3 };
  if (age >= 30) return { key: "five", interval: 5 };
  return null;
}
export function adultHealthCheck(v: PreventionValues): PreventionResult | null {
  if (!validBirthYear(v.birthYear ?? "") || !["yes", "no"].includes(v.indigenous) || !["yes", "no"].includes(v.polio) || !validHistory(v.check) || !answer(v.hepatitis)) return null;
  const born = Number(v.birthYear), age = POLICY_YEAR - born;
  if (/^\d{4}$/.test(v.check ?? "") && Number(v.check) < born + 30) return null;
  const group = checkGroup(age, v.indigenous, v.polio);
  let main: Recommendation;
  if (!group) main = item("check", "成人預防保健", "尚未達補助年齡", "一般成人從 30 歲起納入補助；有症狀請直接就醫。");
  else {
    main = screen("check", "成人預防保健", true, group.interval, v.check, `目前補助頻率：每 ${group.interval} 年一次。包含身體檢查、血液與尿液檢驗及健康諮詢。`);
    const previous = Number(v.check);
    if (Number.isInteger(previous) && checkGroup(previous - born, v.indigenous, v.polio)?.key !== group.key) main = { ...item("check", "成人預防保健", "跨入新補助級距，請核對紀錄", `目前為每 ${group.interval} 年一次；跨級距及兩階段檢查紀錄由院所核定，不直接沿用舊級距間隔。`), screenEligible: true, needsRecordCheck: true };
  }
  const hepEligible = born <= 1986 && age <= 79;
  const hep = screen("hepatitis", "B、C 型肝炎篩檢", hepEligible, null, v.hepatitis === "yes" ? String(POLICY_YEAR) : v.hepatitis === "no" ? "never" : "unknown", "民國 75 年次（西元 1986）含以前出生，且未超過 79 歲，終身補助一次；由院所確認既往公費紀錄及安排方式。");
  return { items: [main, hep], summary: "補助年齡與間隔以年度計算；一般 30–39 歲每 5 年、40–64 歲每 3 年、65 歲以上每年一次。55 歲以上原住民及 35 歲以上小兒麻痺患者每年一次。" };
}
export function adultVaccines(v: PreventionValues): PreventionResult | null {
  const age = Number(v.age);
  if (!v.age?.trim() || !Number.isInteger(age) || !within(age, 18, 120) || ![v.indigenous, v.pregnant, v.immune, v.ipd, v.seasonRisk, v.fluOnly].every(answer)) return null;
  if (!["yes", "no", "unknown"].includes(v.flu) || !["yes", "no", "unknown"].includes(v.covid) || !["none", "ppv", "pcv13", "both", "pcv20", "unknown"].includes(v.pneumo) || !["none", "one", "two", "unknown"].includes(v.zoster) || !["recent", "over10", "incomplete", "unknown"].includes(v.tetanus)) return null;
  const publicSeason = age >= 50 || v.pregnant === "yes" || v.seasonRisk === "yes";
  const seasonal = (id: string, title: string, history: string, extra = false) => history === "yes" ? item(id, title, "本季已接種", "保留接種紀錄；若有特殊免疫狀況，再由醫師評估額外劑次。") : history === "unknown" ? item(id, title, "先確認本季接種紀錄", "本季指 2026 年 10 月起的接種計畫，不能以去年的紀錄代替。") : publicSeason || extra ? item(id, title, "符合本季公費族群", "可洽合約院所評估接種；仍須確認前劑間隔、供應及身分證明。", true) : item(id, title, "可討論接種與補助身分", "本工具未確認你符合所列公費族群；另有特殊身分與地方補助，可請院所核對。");
  const publicPneumo = age >= 65 || (age >= 55 && v.indigenous === "yes") || (age >= 19 && v.ipd === "yes");
  let pneumo = item("pneumo", "肺炎鏈球菌疫苗", publicPneumo ? "符合公費族群，先查接種紀錄" : "依病史評估接種與補助", "公費對象為 65 歲以上、55–64 歲原住民或 19–64 歲侵襲性肺炎鏈球菌感染高風險者；一般慢性病不直接等同此高風險身分。");
  if (v.pneumo === "pcv20") pneumo = item("pneumo", "肺炎鏈球菌疫苗", "已接種 PCV20／PCV21", "一般不需再接種；特殊病況請讓醫師確認紀錄。");
  else if (v.pneumo === "both") pneumo = item("pneumo", "肺炎鏈球菌疫苗", "已完成舊制兩種疫苗", "通常不再追加；曾於 65 歲前因高風險完成 PCV13／15 加 PPV23 者，滿 65 歲且距前劑至少 5 年可再評估一劑 PCV20／21。");
  else if (v.pneumo === "none") pneumo = item("pneumo", "肺炎鏈球菌疫苗", publicPneumo ? "可評估公費 PCV20／PCV21" : "與醫師討論是否需自費接種", "從未接種者可依適應症評估一劑 PCV20 或 PCV21；實際接種及公費身分由院所確認。", publicPneumo);
  else if (v.pneumo !== "unknown") pneumo = item("pneumo", "肺炎鏈球菌疫苗", "帶紀錄評估追加 PCV20／PCV21", `僅接種${v.pneumo === "ppv" ? " PPV23" : " PCV13／15"}者通常需間隔至少 1 年；${v.pneumo === "pcv13" ? "特定高風險者可採至少 8 週，" : ""}此處未輸入日期，不判定今天已到期。${publicPneumo ? "符合公費族群條件。" : "公費資格另由院所確認。"}`);
  const zosterEligible = age >= 50 || v.immune === "yes";
  const zoster = v.pregnant === "yes" || v.pregnant === "unknown" ? item("zoster", "帶狀疱疹疫苗", "先確認懷孕狀況與接種時機", "懷孕期間應避免接種；可於產後與醫師討論。") : v.zoster === "two" ? item("zoster", "帶狀疱疹疫苗", "已完成兩劑重組疫苗", "一般不需再次接種。") : v.zoster === "one" ? item("zoster", "帶狀疱疹疫苗", "核對第二劑日期", "一般兩劑間隔 2–6 個月；免疫低下者可能調整，請帶第一劑日期回院確認。") : item("zoster", "帶狀疱疹疫苗", zosterEligible ? "可討論自費接種" : v.immune === "unknown" ? "先確認免疫狀況" : "目前未達一般建議族群", "適用 50 歲以上，或 18 歲以上免疫不全者；使用兩劑重組帶狀疱疹疫苗。" + (v.zoster === "unknown" ? "請先確認是否已完成。" : ""), zosterEligible && v.zoster === "none");
  const tetanus = v.pregnant === "yes" ? item("tetanus", "百日咳／破傷風／白喉", "每次懷孕評估一劑 Tdap", "建議懷孕 28–36 週接種；由產檢醫師安排，通常需自費。", true) : v.tetanus === "recent" ? item("tetanus", "百日咳／破傷風／白喉", "基本接種完整且前劑未滿 10 年", "一般每 10 年追加 Td 或 Tdap；若有傷口，處置與間隔另依傷口及接種史判斷。") : item("tetanus", "百日咳／破傷風／白喉", v.tetanus === "over10" ? "可評估追加一劑" : "先核對或補齊基本接種", "成人通常每 10 年追加 Td 或 Tdap；基本接種不完整者需由院所安排完整時程。一般為自費。", v.tetanus === "over10");
  return { items: [seasonal("flu", "流感疫苗", v.flu, v.fluOnly === "yes"), seasonal("covid", "新冠疫苗", v.covid), pneumo, zoster, tetanus], summary: "先檢查五項常見成人疫苗；公費族群不代表今天一定可打。其他疫苗（如 HPV、B 肝、MMR、RSV）需另依年齡、免疫與暴露風險評估。" };
}
