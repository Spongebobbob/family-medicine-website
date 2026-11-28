# ALT／AST 衛教文章整合紀錄

原稿：使用者提供 `fmdoc-alt-ast.zip` 中的 `alt-ast.md`。路由 `/articles/alt-ast/`，分類「健檢報告解讀」，發布／更新日採匯入日 2026-11-28。原稿 SHA-256 及 34 個內容區塊雜湊保留於 `tests/fixtures/alt-ast-import-contract.json`，不另維護重複版本。

## 修改與閱讀結構

- `content/articles/alt-ast.md`：沿用現有 Markdown schema、renderer 與共用閱讀元件；5 點摘要、2 題 FAQ、5 筆文獻由既有模板呈現。摘要粗體、文獻預設收合，未新增單篇元件。
- 4 個 HTML details 轉為現有 DeepDive：健康參考上限、AST/ALT 與 R ratio、FIB-4 公式、2026 BSG 評估路徑。原始 HTML 不會被執行；所有進階內容仍輸出為靜態 HTML。
- 原稿 FIB-4 年齡／適用條件／急性肝損傷限制的整段內容移到核心「必要時評估肝臟纖維化」，只保留一處。進階區提供公式，核心與進階互補，沒有另外生成一份簡易版。
- 保留 4 張表格：GOT／GPT 名稱與來源、正常上限倍數範例、可能原因、檢查目的。沿用 ComparisonTable 的手機捲動／換行與鍵盤操作，不為相同內容另繪圖表。
- 警訊、處方藥／酒精戒斷／acetaminophen 安全、就醫分流與複檢例外均保留於核心。就醫時機採一般章節，沒有再複製到 warnings。
- 兩題 FAQ 增加抽血／超音波準備與孤立 AST／macro-AST 的個別評估資訊，均保留；沒有生成新 FAQ 或 FAQ structured data。摘要與正文的必要呼應保留，沒有發現需要直接刪除的完全重複醫學段落。
- 保留成人適用範圍、孕婦／兒童／已知肝硬化例外與網站醫療免責聲明。內部狀態依現有流程保留，不虛構已完成臨床審閱；公共頁面不增加待審閱標籤。
- `content/articles/masld.md`：只新增此文的延伸閱讀，與新文章雙向連結。新文章另連既有 FIB-4 工具；`src/app/page.tsx` 只將健檢紅字 ALT 入口改連此文章，快速工具入口保留。不改計算公式、其他文章結論或無關功能。
- 沿用自動 metadata、canonical、Article structured data、閱讀時間、核心目錄、分類、搜尋、sitemap。原稿文獻 1–5 對應 `alt-ast-ref1` 至 `alt-ast-ref5`，顯示編號仍為 1–5，引用次數與來源身分完整保留。第 3 筆的原始 PMC 全文入口另保留於進階區末尾。

## 來源查核

| 文獻 | 結果與取用限制 |
|---|---|
| 1 ACG 2017 | 原稿[官方指引](https://gi.org/guideline/evaluation-of-abnormal-liver-chemistries/) 直接讀取遭 402；官方搜尋索引能核對作者題名與倍數分類。另可查[官方摘要 PDF](https://acgcdn.gi.org/wp-content/uploads/2018/04/ACG-Abnormal-Liver-Chemistries-Guideline-Summary.pdf)。保留原有書目，不猜測額外識別字。分類不等於民眾分流表中的就醫時效，詳見人工確認。 |
| 2 AASLD 2025 教育文章 | [原始頁](https://www.aasld.org/liver-fellow-network/core-series/back-basics/how-approach-elevated-liver-enzymes) 可讀，作者 Dauris Rosario、日期 2025-01-17 與原稿相符。可核對細胞傷害與合成功能的區別、R-value、AST/ALT 比值須結合背景及逐步評估；這是官方臨床教育文章，不改標成正式指引。 |
| 3 EASL–EASD–EASO 2024 | [PubMed 38851997](https://pubmed.ncbi.nlm.nih.gov/38851997/) 可核對原稿期刊書目。[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC11299976/) 是共同發行的 Obesity Facts 版本，原文說明與 J Hepatol 版僅有編輯風格差異、任一引用均可用，未將兩者當成獨立研究。可核對 FIB-4 分層、年齡限制及生活介入。 |
| 4 BSG 2026 | [官方頁](https://www.bsg.org.uk/clinical-resource/bsg-guidelines-on-suspected-liver-disease) 標示 Published November 2026，可核對題名、系統性回顧／GRADE 方法、代謝與飲酒風險、非侵入性纖維化及基層照護路徑。保留原稿的證據限制，不聲稱所有檢查均有死亡率隨機試驗證據，也未捏造期刊卷頁／DOI。 |
| 5 國健署公告 | [官方頁](https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=5020&pid=20518) 首次可讀，後續工具抓取逾時；同一官方搜尋索引及衛福部公告列表可核對 115-11-27 日期、民國 75 年（含）以前出生／未滿 80 歲／未曾篩檢／終身一次等條件。文章保留公告日期與原有資格條件，不自行沿用較早的篩檢年齡。 |

## 人工確認項目

1. **肝指數表格的就醫時效：** ACG 的倍數分類不是「200–600 當日聯繫、>600 通常急診」的固定分流規則。原稿已明確標為保守分流示例並依症狀判讀，請醫師確認這項實務建議的適用性及是否補直接來源。正常上限 40 U/L 只是假設範例，不適用於所有檢驗室。
2. **FIB-4 的 65 歲界線：** 原稿為「65 歲以上」採 2.0；EASL 全文為 older than 65 years，本站既有 MASLD 文及工具採 >65。這會影響剛好 65 歲的判讀。本次依使用者要求保留原稿，沒有自行修正醫學門檻或工具；需醫師統一文字與來源後再調整。
3. **複檢與急症：** 2–4 週是個別化實務示例，非通用指引期限；急性上升、黃疸、神智改變、疑似過量等不能等候。原稿條件完整保留，請確認轉介／複檢安排及台灣實務。
4. **B／C 肝：** 原稿第 5 筆為篩檢政策公告，不能單獨支持所有 B／C 肝抗病毒治療適應症。請醫師確認治療段落所需的專門指引引用、台灣健保與現行治療條件；本次沒有新增病毒量門檻、劑量或給付結論。未符合篩檢資格仍可按病況診斷檢驗的說明保留。
5. **FAQ 與未直接標引的生活建議：** 抽血是否空腹、macro-AST、運動後複檢、酒精戒斷與補充品等請逐項確認最直接來源；不推測替原稿補文獻。處方藥不自行停用與疑似 acetaminophen 過量需就醫的安全文字保留。
6. **健康參考上限及比值：** 男性 29–33／女性 19–25 U/L、AST/ALT >2、R ratio 等不可單獨用來診斷或啟動用藥；原稿限制完整保留，請醫師核對實驗室與臨床情境。

## 驗證範圍

專屬測試保護 34 個原稿內容區塊、5 點摘要、2 題 FAQ、5 筆書目與各筆引用次數；另驗證 4 個預設收合進階區塊、4 張可鍵盤捲動表格、核心安全資訊與適用限制、首頁／MASLD／FIB-4 入口及搜尋。

沿用既有 RWD 樣式並驗證靜態 HTML；本次手機與桌面實際畫面未目視驗證，不能將靜態檢查視為實機驗收。

執行結果：`pnpm test` 189 項通過、`pnpm typecheck` 通過、`pnpm build` 64 個靜態頁成功、`pnpm test:export` 7 項通過；本次變更的 TS／TSX 檔案定向 ESLint 與 `git diff --check` 通過。另核對匯出文章 canonical、4 個 DeepDive、4 張表格、5 個文獻錨點、FAQ、折疊文獻及首頁／MASLD 文章入口，均符合預期。
