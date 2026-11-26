import type { HealthTool } from "./tool-catalog";
import { fraxOfficialUrl } from "./frax";

export const fraxTool: HealthTool = {
  slug: "frax", kind: "guide", name: "FRAX 十年骨折風險評估", shortName: "FRAX", group: "older-adults", icon: "shield",
  description: "整理骨折風險資料、前往官方 FRAX 台灣模型計算，再記錄主要骨鬆性骨折與髖部骨折的十年機率。",
  audience: "準備接受骨折風險評估的成人；本頁資料準備以 40–90 歲為範圍。",
  limitations: [
    "本頁不是 FRAX 計算引擎；十年機率由官方 FRAX 產生。本站提供資料準備及手動結果整理，不仿算、加總分數或產生替代風險值。",
    "官方模型請選擇適合個人的國家／地區；本頁以 Taiwan（台灣）為整理範圍。移居或跨族群情況請與醫師討論，不自動代選。",
    "FRAX 可使用有或無股骨頸 BMD 的方式。若輸入骨密度，須核對測量部位、機型與單位；不能直接用腰椎或全髖數值取代。",
    "FRAX 的結果不能單獨決定是否用藥，也不適合作為治療成效監測或治療目標。近期或多次骨折、類固醇劑量及跌倒等因素仍需臨床判斷。",
    "未確認的病史在本站保留未知，整理清單不會自行改填為無；請在官方頁依其定義及醫師判斷核對。",
    "本頁不套用單一用藥或健保給付門檻；請攜帶官方完整結果、骨密度報告及用藥史與醫師討論。",
  ],
  advice: "有骨折病史、疑似骨質疏鬆或正在使用骨鬆藥物者，請安排門診評估；勿依本頁結果自行停藥或調整治療。",
  sources: [
    { title: "FRAXplus 官方計算工具", url: fraxOfficialUrl, detail: "有／無股骨頸 BMD 的十年骨折機率；使用時選擇適當國家模型。查閱 2026-11-27。" },
    { title: "FRAXplus 官方 FAQ", url: "https://www.fraxplus.org/en/faq/", detail: "年齡、國家模型、骨密度部位、主要骨鬆性骨折定義及臨床限制。查閱 2026-11-27。" },
    { title: "臺北榮總：FRAX 骨折風險評估", url: "https://wd.vghtpe.gov.tw/manage/upload/cabfile/f_20241227114537847.pdf", detail: "台灣院所的 FRAX 資料準備及風險因子說明。查閱 2026-11-27。" },
    { title: "FRAXplus 官方整合文件", url: "https://fraxplus.org/en/documentation", detail: "API 與自架計算器需有效訂閱；本站目前僅連結官方計算頁，未串接 API。查閱 2026-11-27。" },
  ],
  rights: "本站自行撰寫資料準備與結果紀錄介面，僅連結官方計算頁；不重製 FRAX 演算法、官方介面或商標圖示。FRAX®／FRAXplus® 商標屬其權利人。",
  rightsConfirmed: true,
  validation: "驗證資料完整性、40–90 歲範圍及手動機率欄位；不宣稱完成 FRAX 演算法驗證。",
  review: { status: "pending", physician: "", reviewedAt: "" },
  related: [{ href: "/tools/sarc-f/", label: "SARC-F 肌少症風險篩檢" }, { href: "/tools/adult-health-check/", label: "成人健檢資格" }],
};
