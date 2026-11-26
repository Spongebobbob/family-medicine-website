import { mkdirSync, writeFileSync } from "node:fs";
import { malariaCountries, malariaCoverage } from "../src/lib/malaria-guidance";

const mapped=malariaCountries.filter(c=>c.mapUrls.length);
const rules=malariaCountries.reduce((n,c)=>n+c.regions.length,0);
const rows=malariaCountries.map(c=>`| [${c.name}](${c.source}) | ${c.textStatus} | ${c.regions.length} | ${c.mapUrls.length} | ${c.mapConsistency} |`);
const report=`# 瘧疾資料查核與覆蓋率

查核日期：2026-11-26。臨床審閱：全數 pending。主要來源為 [NaTHNaC 國別目錄](https://travelhealthpro.org.uk/countries)及 [UKHSA／UKMEAG 2026](https://www.gov.uk/government/publications/malaria-prevention-guidelines-for-travellers-from-the-uk-2026)（2026-07-31 更新）。

- 官方目錄 262 個去重前入口，重新導向合併後為 ${malariaCoverage.inventory} 個國別／地區頁面；這是 NaTHNaC 目錄的覆蓋率，不等於所有世界行政區均有獨立頁面。
- 已逐頁搜尋 Risk areas，未取得此段落者再搜尋明確無風險文字：${malariaCoverage.textWithRiskAreas} 頁有 Risk areas，${malariaCoverage.explicitNoRisk} 頁有明確無風險文字。
- ${malariaCoverage.structured}/${malariaCoverage.inventory}（${(100*malariaCoverage.structured/malariaCoverage.inventory).toFixed(1)}%）頁已建 ${rules} 條次國家／全境規則；部分規則仍因最新事件、邊界或資料不確定而停止判斷。
- ${malariaCoverage.pending} 頁沒有足夠明確的可套用文字，保留 unknown。沒有 Malaria 段落、未列於 UKMEAG 表格，都不等於零風險。
- ${mapped.length} 個頁面已保存官方原圖網址。未取得原圖網址者使用官方國別 Malaria 入口，不猜測圖片路徑。
- 所有原圖重製／嵌入權限均未確認；本站沒有嵌入或另行託管官方地圖。mapVersion=null 表示尚未核對版本，不從檔名日期推定版本。
- 圖文核對狀態與醫師審閱分開；not_checked 不代表一致。conflict 會停止確定結論及個人化日期表。

## 規則與比較來源

柬埔寨為完整文字實作示範：金邊 none、吳哥窟／洞里薩湖（含暹粒）very_low、其他地區 low，另分西部泰國邊境的 Mefloquine 抗藥性。這不是把用藥建議轉成感染風險。

原先日本、泰國、越南、肯亞、巴西、海地的主結果均已改走英國規則。日本國別頁未取得明確瘧疾風險敘述，所以英國主結果保留 unknown；海地文字明列預防藥但未指定 high/low，保留 risk=unknown、prophylaxis=recommended。肯亞高於 2500m 為 very_low，不能沿用 CDC 舊判斷改成 none。

CDC 既有六國資料僅供獨立比較；新版地區與舊 CDC 區域未對齊時不猜測對應。另加入柬埔寨 CDC Yellow Book 2026 及台灣疾管署的獨立摘要。台灣其他國別對照仍標示未完成，只呈現通用官方原則，不能算成國別查核覆蓋。

低風險特殊族群須核對無脾臟／脾功能低下、免疫抑制、複雜共病、懷孕、幼兒及長期探親。NaTHNaC 高齡文字是 over 70；本站 70 歲提前提示門診核對，未滿 5 歲提示兒童評估，兩者均不是自行創造的用藥門檻。沒有資料不視為否。

## 維護方式

1. 開啟每國官方頁，閱讀 Malaria、Risk areas、Special risk groups、地圖及最新警訊，確認次國家範圍、季節、海拔及抗藥性；不可只看地圖。
2. 在 src/data/malaria-countries.json 更新來源、文字查核狀態、日期、地圖原始網址、版本與圖文一致性；未確定時保留未知。
3. 在 src/lib/malaria-country-rules.ts 維護明列規則。risk 與 prophylaxis 分開；特殊族群政策在 malaria-guidance.ts，用藥限制在 travel-malaria.ts。所有規則繼承國別來源、範圍及查核日期。
4. 若地圖、文字或最新事件不一致，設定 mapConsistency=conflict 或規則 requiresReview=true，填寫具體原因。完成實際複核後才能移除。
5. 不因測試通過就變更 physicianReview；必須另有實際醫師審閱。也不可只延長 checked 日期。
6. 執行 pnpm exec tsx scripts/malaria-coverage.ts、pnpm lint、pnpm test、pnpm build、pnpm test:export。

查核使用官方公開頁面；直接 HTTP 擷取曾遭網站防火牆拒絕，改由正常瀏覽器查看已知官方頁面的 DOM 連結，沒有繞過 CAPTCHA 或安全提示。研究暫存位於被 Git 排除的 .openai/malaria，未上傳原始文章、個人健康資料或登入資料。

## 逐國清單

| 國家／地區與官方來源 | 文字狀態 | 規則數 | 原圖網址數 | 圖文核對 |
| --- | --- | ---: | ---: | --- |
${rows.join("\n")}
`;
mkdirSync("docs",{recursive:true});
writeFileSync("docs/malaria-data-audit.md",report);
console.log({...malariaCoverage,rules,mappedCountries:mapped.length});
