# 實證衛教文章維護

沿用 Next.js 靜態輸出、gray-matter 與 react-markdown。正文使用 Markdown + GFM，不執行 MDX／原始 HTML；不需為每篇文章修改路由。

## 新增文章

1. 新增 `content/articles/<slug>.md`，可從 `hyperuricemia.md` 複製結構。
2. Frontmatter 必填：title、description、category、published、updated、status、author、keywords、summary、warnings、faq、references。日期必須是引號包住的 YYYY-MM-DD。
3. 正式衛教草稿設定 `kind: education`，臨床審閱尚未完成時維持 `status: pending-review`。`kind` 未提供時保留舊示範文章相容性。
4. 高尿酸稿以 `numberedSections: true` 搭配正文 1–14 節，模板接續 15 就醫時機、16 FAQ、17 References。其他文章可不設此值，使用一般章節標題。
5. 正文用 `##`／`###` 標題，自動產生桌面與手機目錄。GFM 表格可左右捲動；`>` 引言顯示為重點提示。
6. `summary` 是純文字；正文、warnings 與 FAQ answer 可用 `[來源:stable-id]`。stable-id 必須存在於 references。畫面依文獻陣列次序產生 Vancouver 編號與錨點；**請依第一次引用順序排列 references**。

## 參考文獻

新衛教文章的每筆 reference 必填 `id`、`title`、`publisher`、`url`（HTTPS）、`accessed` 與 `vancouver`（完整 Vancouver 書目字串）。`doi` 放 DOI 識別字、不加 URL；`pubmed` 使用引號包住的數字字串。沒有查證的欄位不填，不從題目猜測作者、頁碼、DOI 或發表日期。沒有 DOI 的官方指引可使用其正式 HTTPS 連結。

驗證器會拒絕未登錄的引文、無效日期、錯誤識別字及缺少書目的新衛教文章；它能檢查格式，**不能自動證明醫學內容或文獻真實性**。變更數據或治療文字仍須實際查核來源並重新醫療審閱。

## 圖表與 SVG 圖示

- 每張圖放在 `content/figures/<id>.json`，於文章 frontmatter `figures` 列出 ID，正文用 `![替代文字](/article-figures/<id>)` 引用。這是受控元件標記，並非靜態圖片路徑。
- 所有圖必填 id、type、title、alt、sources（本篇文獻 ID）、note。沒有來源或替代文字會使 build 失敗。
- 統計圖 `type: bar` 使用 Recharts。另填 unit、population、series 與 data；每列 data 使用 label 與 values，values 的 key 必須對應 series.key。必須保留調查年代、疾病定義、母群體及限制，不混合不同定義或母群體的數列。元件自動提供可讀資料表與圖說，不依賴 tooltip 取得數據。
- 機轉圖 `type: mechanism`、流程圖 `type: decision` 使用同一個原生 SVG 元件。另填 width、height、nodes、edges；節點包含 id、title、lines、x、y、width、height，連線包含 from、to 及可選 label。每行文字須控制長度，節點高度必須容納所有行。條件分流要有清楚的分支，不把互斥條件畫成每人必經的直線流程。
- SVG 有 title、desc、鍵盤可捲動區域、100–200% 縮放及完整文字／連線版本。統計圖及 SVG 都會顯示來源文獻錨點；手機可橫向捲動圖內區域，不應撐寬整頁。
- 加新資料只新增 Markdown／JSON，無須寫 JSX。新增新型態圖表時，擴充 `src/lib/article-figures.ts` 驗證器及 `src/components/articles/` 元件。

## 高尿酸血症匯入紀錄

來源是使用者提供的 `fmdoc-hyperuricemia.zip`。保留原有臨床主張，調整章節順序、引用及呈現方式；原來的順序式處置 SVG 改成有／無症狀與病史分支。兩組數據分別核對台灣心臟學會 2024 指引 2.6 節，以及 Kuo 等人的 2010 年健保研究結果。高尿酸圖是指引轉引調查，本站未重分析原始調查。

保留 2018 台灣共識、ACR 2020、NICE NG219、KDIGO 2024 等文獻的年份及適用範圍，沒有宣稱已完成系統性文獻更新。KDIGO 正在進行的更新草案不當作正式建議。本文並未完成醫師審閱、逐藥台灣仿單核對或個別治療適用性確認；不能改標為 reviewed。

## 驗證與上架

執行 `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm test:export`。以 `pnpm preview` 查看靜態輸出，檢查手機與桌面的目錄、表格、數據圖、SVG 分支、縮放、FAQ、文獻錨點和首頁搜尋。

發布日期與更新日期會寫入 Article JSON-LD、Open Graph、sitemap 及文章頁。未審閱文章保留 noindex，並顯示醫療免責聲明；不能因程式測試通過就改成已審閱。僅在有真實醫師署名及實際審閱紀錄後使用現有 reviewed 流程。
