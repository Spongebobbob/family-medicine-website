# 尿液潛血衛教文章整合紀錄

來源：使用者提供 `fmdoc-urine-occult-blood.zip`，內含 `urine-occult-blood.md`。路由 `/articles/urine-occult-blood/`，分類「健檢報告解讀」。發布／更新日期採匯入日 2026-11-27；原稿雜湊及 34 個內容區塊雜湊保留於 `tests/fixtures/urine-occult-blood-import-contract.json`。

## 本次修改

- `content/articles/urine-occult-blood.md`：沿用 Markdown、現有 schema 及共用元件，不新增文章專屬元件。5 點重點由 summary 管理，2 題 FAQ、4 筆 Vancouver 文獻由模板呈現，參考文獻預設折疊。
- 原稿的一個大型 advanced 標記改為 3 個既有 DeepDive：2025 AUA/SUFU 風險分層、CTU 檢出效益、尿液腫瘤標記。均預設收合，完整內容隨靜態 HTML 輸出；目錄只列核心 H2。
- 保留所有 7 張表格：檢驗項目、常見原因、基本評估、風險對應檢查、影像／膀胱鏡比較、複驗時程、進階風險條件。使用可鍵盤操作的共用捲動表格，不另繪內容重複的統計圖。
- 原稿導言留於正文，拆成兩段；重要粗體與急診／門診層級保留。就醫時機維持一般核心章節，不另複製到 warnings 或框成特殊卡片。
- FAQ 的抗凝血藥及檢驗不一致兩題補充正文未詳述的藥物安全、稀尿紅血球破裂、CK／溶血檢查的個別適用性，均保留。沒有新增重複 FAQ 或 FAQ structured data。
- 核心檢查分層和進階細節互補，沒有發現應直接刪除的完全相同段落。摘要的必要重點呼應保留；不因版型移除風險條件、限制、就醫時機或研究解讀。
- 新文章與既有 `/articles/egfr-ckd/` 雙向延伸閱讀，並連到 `/tools/egfr/`。沿用現有自動 metadata、canonical、Article structured data、分類／搜尋／sitemap，不改工具計算或其他功能。
- 原稿的成人及美國指引適用限制保留在核心「適用範圍」。內部審閱狀態依既有流程保留，未虛構臨床審閱，公共頁面不增加審閱狀態標籤。

## 文獻與查核

原稿 1–4 對應 `urine-ob-ref1` 至 `urine-ob-ref4`，畫面編號仍為 1–4。所有引用次數及原有來源身分保留。官方流程圖是第 1 筆文獻的補充入口，連結放於進階實證末尾，沒有冒充本站新繪圖表。

| 原稿來源 | 核對結果與限制 |
|---|---|
| AUA/SUFU 2025 全文及流程 | 原稿完整 PDF、流程 PDF 與官網指引頁直接抓取均遭 403，保留原始官方網址，沒有把拒絕自動存取誤當作失效網址。官方索引的同年 FINAL／FINAL3-1 版本能核對 ≥3 RBC/HPF、試紙不單獨診斷、低風險六個月複驗、腎臟科評估仍需按風險進行泌尿科檢查、標記策略後十二個月複驗。未宣稱已逐頁取得原稿 FINAL4。 |
| Barocas 2025 | 原稿保留 PMID 40013563、DOI 10.1097/JU.0000000000004490 與書目。此次 PubMed 頁面只回傳空白外殼；AUA 官方年會文章可核對相同題名、作者及 J Urol. 2025;213(5):547–557 引用。完整期刊記錄及修訂版本仍可由醫師進一步確認，不新增未核對作者或其他識別字。 |
| Azari／Salmasi 2026 AFP | 原始發行頁可核對作者、題名及 114(2):200–204；頁面明示於 2026-08-10 更正，風險表入口標記 corrected。公開內容可讀但表格全文須另行存取。保留原稿引文，不以此二手整理取代 AUA 原始指引核對。 |
| Waisbrod 2021 | PubMed 33970257 可核對題名、JAMA Netw Open. 2021;4(5):e218409、DOI 10.1001/jamanetworkopen.2021.8409，以及觀察性研究統合分析與 CTU 檢出效益的原稿解讀。未新增原稿沒有的樣本數、效應量或信賴區間，不將診斷效益推論成死亡率改善。 |

查核入口：

- [原稿 AUA 全文](https://www.auanet.org/documents/Guidelines/PDF/2025%20Guidelines/MH%20Unabridged%2002.2025FINAL4.pdf)
- [同年官方索引版本](https://www.auanet.org/documents/Guidelines/PDF/2025%20Guidelines/MH%20Unabridged%2002.2025FINAL.pdf)
- [同年官方索引 FINAL3-1](https://www.auanet.org/documents/Guidelines/PDF/2025%20Guidelines/MH%20Unabridged%2002.2025FINAL3-1.pdf)
- [AUA 官方年會解讀與表格](https://www.auanews.net/issues/articles/2025/july/august-2025/aua2025-plenary-recap-microscopic-hematuria-guideline-amendment-refined-risk-stratification-and-introduction-of-urinary-biomarkers)
- [AFP 原始發行頁](https://www.aafp.org/afp/2026/0800/practice-guidelines-microhematuria)
- [Waisbrod 原始論文紀錄](https://pubmed.ncbi.nlm.nih.gov/33970257/)

## 人工確認項目

1. **修訂版一致性：** 請醫師取得原稿 FINAL4／官方流程及 AFP 2026-08-10 更正表，逐項對照門檻與適用條件。特別是女性不以年齡單獨列高度、低風險須全數條件成立、持續 3–25 RBC/HPF 的重新分層。原稿內容未自行更動。
2. **風險百分比的母群體：** AUA 官方年會表格註解指出這些驗證研究風險比例使用 2020 年的風險分層定義；2025 女性年齡條件已調整。請醫師確認原稿 0–0.4%、0.2–3.1%、1.3–6.3% 旁是否應明列這項差異。本次保留數字及非個人終生風險／未必適用台灣的限制，不將其畫成可直接比較的個人風險圖。
3. **複驗時程：** 三週至三個月是 AUA 討論段落在良性原因解除後的建議範圍，並非已由試驗確定的固定間隔。原稿已保留指引討論及急症例外，請醫師確認台灣實務安排；不將其套用於未排除急症的患者。
4. **腫瘤標記與檢查選擇：** 中度風險避免膀胱鏡的策略有充分告知、驗證標記、超音波與十二個月追蹤前提；高風險不能以陰性標記替代。請確認台灣可取得檢驗、顯影劑禁忌及院所資源，不自行新增檢驗名稱、給付規則或替代處方。
5. **未附直接引文的臨床段落：** 原稿警訊、部分採檢與症狀說明未直接標引。保留原文，不推測新增來源；請編輯／醫師確認是否補上直接支持的急症及採檢來源。嚴重肌痛／深色尿需立即就醫、抗凝血藥不可自行停用等安全資訊完整保留。

## 驗證範圍

專屬測試驗證 34 個原稿內容區塊、5 點摘要、2 題 FAQ、4 筆書目與每筆引用次數，另檢查 3 個預設收合進階區塊、7 張可鍵盤捲動表格、核心就醫建議、分層限制及雙向站內連結。沿用全站 build／型別／匯出檢查，驗證路由、錨點、metadata 與 JSON-LD。

瀏覽器連線先前及上一輪 inventory 均回報 `Local browser access is unavailable for this chat`；本次未宣稱已完成手機或桌面實際畫面目視驗證。沿用現有 RWD 樣式與靜態渲染驗證，不能取代實機驗收。

執行結果：`pnpm test` 186 項通過、`pnpm typecheck` 通過、`pnpm build` 63 個靜態頁成功、`pnpm test:export` 7 項通過；新增測試檔定向 ESLint 與 `git diff --check` 通過。另直接檢查匯出頁 canonical、3 個 DeepDive、7 張表、4 個文獻錨點、FAQ、折疊文獻及 eGFR 文章入口，均符合預期。
