# LDL 衛教文章整合紀錄

來源：使用者提供 `fmdoc-ldl-cholesterol-2026-revised.zip` 內的 `ldl-cholesterol.md`；原稿 SHA-256 保存在 `tests/fixtures/ldl-import-contract.json`。公開路由為 `/articles/ldl-cholesterol/`，分類「三高與慢性疾病」。發布／更新日期採匯入日 2026-11-27，沿用共用作者署名、metadata、canonical、Article structured data 與內部審閱狀態規則。

## 閱讀結構與去重

- 4 點「30 秒看懂重點」移入 frontmatter summary，正文不重複維護同一清單。
- 6 個原始 HTML details 全部轉為既有 DeepDive 標記，預設收合；沒有建立單篇專屬元件。
- 原稿核心衛教全部保留；長段落僅增加段落分隔，不重寫醫學結論。
- 急症與藥物警訊原句移入共用就醫時機區塊，正文只維護一份；免責聲明使用全站模板，不再重複原稿文末的同義聲明。
- 4 題 FAQ 分別補充 HDL、停藥、紅麴／魚油、脂肪肝資訊，與核心正文沒有相同問答段落，全部保留，沒有生成額外 FAQ。
- 保留 9 張資訊表，包括 LDL 解讀、決策、目標、生活調整、追蹤、教學風險試算、指引比較及健保表一／二。全部沿用 ComparisonTable；不另製相同內容的統計圖。20% 相對風險下降表仍明確標示「假設教學試算」，不當作研究數據或個人預測。
- 補入 LDL 目標工具、TSH 與高尿酸文章連結；首頁 LDL 檢驗入口及 LDL 工具延伸閱讀連回新文章。

## 引用編號對照

穩定 ID 保留原稿來源身分；依新文章首次引用次序產生畫面 Vancouver 編號。所有原引用（包括範圍引用 [8–10]）均對應相同原文獻，沒有刪除來源。

| 原稿編號 | 穩定 ID | 網站編號 |
|---|---|---|
| 1 | ldl-ref1 | 4 |
| 2 | ldl-ref2 | 1 |
| 3 | ldl-ref3 | 2 |
| 4 | ldl-ref4 | 8 |
| 5 | ldl-ref5 | 9 |
| 6 | ldl-ref6 | 10 |
| 7 | ldl-ref7 | 3 |
| 8 | ldl-ref8 | 5 |
| 9 | ldl-ref9 | 6 |
| 10 | ldl-ref10 | 7 |

文獻 4 的卷期／頁碼核對 PubMed 勘誤紀錄所列的原論文書目，文獻 6 的卷期／頁碼核對期刊原始目錄後補入；沒有推測未取得的作者名單、章節更新日或新增 DOI。

## 來源查核與人工確認

本次核對原稿重要數據與來源，但不是完整醫學審查，未改動臨床結論。

| 位置 | 核對情況及待確認事項 |
|---|---|
| 台灣 2025 共識 | 台灣心臟學會期刊目錄與成大研究典藏可對上作者、題名、卷頁及 DOI。低／中風險與無其他危險因子的適用範圍須由醫師確認，不將五級目標表當作全民正常值。 |
| ACC/AHA 2026 與 CKD／糖尿病 | ACC 官方資料可核對 PREVENT 年齡、LDL 範圍、風險級別及 LDL 目標。原稿核心表格對「40–75 歲糖尿病或第 3–4 期 CKD」的年齡修飾範圍，以及透析、衰弱等例外，請醫師再確認；本次未自行改寫。 |
| CTT 2012／2022／2024 | 原始論文摘要或作者所屬 Oxford 典藏可對上 RR 0.79、95% CI、每千人約少 11 事件、肌肉症狀每千人年約增 11、糖尿病相對增加 10%／36%。RR、風險差及 NNT 的時間與母群體限制完整保留。2022 肌肉症狀論文另有勘誤紀錄，請人工確認其對引用資料的影響。 |
| 停藥 FAQ | 原稿沒有附直接引文；答案原句保留，請醫師／編輯確認是否需補上最直接的原始來源。沒有自行替它新增文獻。 |
| Endotext（原稿 7） | 官方索引可見 2026 指引內容；原始 Bookshelf 直接讀取遇到 CAPTCHA。原稿未提供完整章節作者／確切更新日，不推測填寫，請人工核對後補齊書目。 |
| 健保 2026/9/1 及 12/1 | 三份健保署 PDF 可讀，12/1 生效日及 inclisiran 的事前審查與先後用藥條件可核對。原稿 8 的綜合 PDF 是可更新連結，目前也已出現 12/1 修訂內容，正式引用應再確認版本；本文仍將未生效條件獨立放在未來修訂小節。 |
| 12/1 後維護 | 本文保留「11 月 30 日以前依當時有效條文」原句；2026/12/1 後請重新核對品項、給付表與日期說明。沒有自動把原稿篩選規則改成新制。 |
| 外部取用限制 | 部分 DOI／PMC 直接請求遇 403 或 CAPTCHA；以官方期刊／學會索引及原始摘要交叉核對，不將讀取受限當作來源失效，也不繞過驗證。 |

查核入口：

- 台灣心臟學會原始目錄：<https://www.tsoc.org.tw/index_en.php?action=journal&cid=1&do=list&id=345>
- ACC 官方 2026 指引發布說明：<https://www.acc.org/About-ACC/Press-Releases/2026/03/13/18/01/ACCAHA-Issue-Updated-Guideline-for-Managing-Lipids-Cholesterol>
- CTT 2012：<https://pubmed.ncbi.nlm.nih.gov/22607822/>
- CTT 2022：<https://pubmed.ncbi.nlm.nih.gov/36049498/>；勘誤紀錄：<https://pubmed.ncbi.nlm.nih.gov/36216002/>
- CTT 2024 作者典藏：<https://ora.ox.ac.uk/objects/uuid%3Ae87d2b18-fedd-4982-89d0-da8d36acc0a6/files/snc580p641>
- ESC 2025 期刊目錄：<https://academic.oup.com/eurheartj/issue/46/42?browseBy=volume>

## 測試

原稿保護測試用 52 個原始區塊的雜湊檢查所有原句、數值及資料表仍存在；另比較每個穩定來源 ID 的引用次數、文獻 URL、DOI／PubMed 與 FAQ。允許只為手機閱讀分段，不維護第二份文章內容。靜態匯出測試檢查全站路由、連結、錨點、canonical 及 structured data。
