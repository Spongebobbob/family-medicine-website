# 實證衛教文章維護

沿用 Next.js 靜態輸出、gray-matter 與 react-markdown。正文使用 Markdown + GFM，不執行 MDX／原始 HTML；不需為每篇文章修改路由。

## 新增文章

1. 新增 `content/articles/<slug>.md`，可從 `hyperuricemia.md` 複製結構。
2. Frontmatter 必填：title、description、category、published、updated、status、author、keywords、references。summary、warnings、faq 可省略或使用空陣列，省略時不生成內容。日期必須是引號包住的 YYYY-MM-DD。
3. 正式衛教草稿設定 `kind: education`，臨床審閱尚未完成時維持 `status: pending-review`。`kind` 未提供時保留舊示範文章相容性。
4. 高尿酸稿以 `numberedSections: true` 搭配正文 1–14 節，模板接續 15 就醫時機、16 FAQ、17 References。其他文章可不設此值，使用一般章節標題。
5. 正文用 `##`／`###` 標題，自動產生錨點；核心目錄僅收錄進階區塊之外的 H2。GFM 比較表自動使用手機適應樣式；一般 `>` 引言仍顯示為重點提示。
6. `summary`、正文、warnings 與 FAQ answer 可用 `[來源:stable-id]`。stable-id 必須存在於 references。畫面依文獻陣列次序產生 Vancouver 編號與錨點；**請依第一次引用順序排列 references**。

## 雙層閱讀格式

原有 Markdown 無須改寫也能繼續使用。新增閱讀區塊使用 GFM 引言內的獨立標記行；標記、空白行及內容都須帶 `>`。標題必填，不支援任意 JSX、HTML 或腳本。範例文字僅示範格式，不是醫學內容：

```md
## 核心章節

核心衛教內容只在這裡維護。

> [!DEEPDIVE] 研究方法與限制
>
> ### 研究設計
>
> 已查證的進階內容及其原有引用。
>
> > [!EVIDENCE] 如何解讀這項研究
> >
> > 研究適用族群、結果與限制。

> [!ACTION] 可以採取的健康行動
>
> - 已完成醫療審閱的行動建議。
```

可選標記對應共用元件：`DEEPDIVE` → DeepDive、`EVIDENCE` → EvidenceCard、`ACTION` → ClinicalAction、`RED-FLAGS` → RedFlags、`TAKEAWAYS` → KeyTakeaways。一般文章優先以 frontmatter `summary`、`warnings` 管理頁首重點與文末警訊，**同一內容不要再放入正文標記**。未提供的區塊不自動生成。醫療免責聲明仍由模板保留。

DeepDive 使用原生 details／summary，預設收合，Enter／Space 可操作，不需 JavaScript 才能閱讀；所有內容隨靜態頁輸出。小型 client 元件僅處理舊錨點、站內連結與返回歷史時自動展開祖先 details。不要將急症處置、適用條件、重要禁忌或用藥安全資訊單獨藏在進階內容。

目錄只列核心 H2；H3、進階 H2／H3 仍有穩定錨點。調整文章時保留既有標題文字及順序，以維持重複標題的編號。核心時間估算正文核心文字＋summary＋warnings；完整時間另加進階與 FAQ，不含文獻、實際閱讀圖表所花時間。均以每分鐘約 450 個非空白文字字元粗估，不是精準計時。

兩欄 ComparisonTable 在手機上自動換行，三欄以上保留原生表格與可鍵盤操作的橫向捲動區。不要複製成另一份手機卡片資料。統計圖的精確資料表與文字替代版預設收合，來源和限制仍顯示。

文獻的 `references` 陣列是顯示編號的唯一來源。既有文章改排版**不可重新排序或重新編號**；新增文章才依第一次引用順序安排。對完全相同的重複段落保留一處並使用 `[相關章節](#章節錨點)`；語意近似但適用條件不同者先列人工審閱，不自動合併。人工審閱位置見 [改版審閱清單](article-reading-review.md)。

## 文獻格式

新衛教文章的每筆 reference 必填 `id`、`title`、`publisher`、`url`（HTTPS）、`accessed` 與 `vancouver`（完整 Vancouver 書目字串）。`doi` 放 DOI 識別字、不加 URL；`pubmed` 使用引號包住的數字字串。沒有查證的欄位不填，不從題目猜測作者、頁碼、DOI 或發表日期。沒有 DOI 的官方指引可使用其正式 HTTPS 連結。

驗證器會拒絕未登錄的引文、無效日期、錯誤識別字及缺少書目的新衛教文章；它能檢查格式，**不能自動證明醫學內容或文獻真實性**。變更數據或治療文字仍須實際查核來源並重新醫療審閱。

## 圖表與 SVG 圖示

- 每張圖放在 `content/figures/<id>.json`，於文章 frontmatter `figures` 列出 ID，正文用 `![替代文字](/article-figures/<id>)` 引用。這是受控元件標記，並非靜態圖片路徑。
- 所有圖必填 id、type、title、alt、sources（本篇文獻 ID）、note。沒有來源或替代文字會使 build 失敗。
- 統計圖 `type: bar` 使用 Recharts。另填 unit、population、series 與 data；每列 data 使用 label 與 values，values 的 key 必須對應 series.key。必須保留調查年代、疾病定義、母群體及限制，不混合不同定義或母群體的數列。元件自動提供可讀資料表與圖說，不依賴 tooltip 取得數據。
- 含效應值及 95% CI 的資料使用 `type: forest`。指定 measure（HR 或 SMD）、nullValue（HR 必須為 1、SMD 必須為 0）、population、axisLabel、rows；各列含 label、estimate、lower、upper，以及可選的分析人數 n。Recharts 森林圖提供橫向誤差線，並保留可讀資料表；負 SMD 不得被長條圖的非負驗證規則裁掉。不自行計算缺漏的區間或把總樣本數填到每列。
- 機轉圖 `type: mechanism`、流程圖 `type: decision` 使用同一個原生 SVG 元件。另填 width、height、nodes、edges；節點包含 id、title、lines、x、y、width、height，連線包含 from、to 及可選 label。每行文字須控制長度，節點高度必須容納所有行。條件分流要有清楚的分支，不把互斥條件畫成每人必經的直線流程。
- 負回饋等非向下連線可指定 fromSide、toSide（top/bottom/left/right）、via（轉折座標）及 labelPosition；effect: inhibition 用棕色 T 形終點及文字標明抑制。未指定的連線維持原本的向下箭頭，既有文章無須變更。
- SVG 有 title、desc、鍵盤可捲動區域、100–200% 縮放及完整文字／連線版本。統計圖及 SVG 都會顯示來源文獻錨點；手機可橫向捲動圖內區域，不應撐寬整頁。
- 加新資料只新增 Markdown／JSON，無須寫 JSX。新增新型態圖表時，擴充 `src/lib/article-figures.ts` 驗證器及 `src/components/articles/` 元件。

## 高尿酸血症匯入紀錄

來源是使用者提供的 `fmdoc-hyperuricemia.zip`。保留原有臨床主張，調整章節順序、引用及呈現方式；原來的順序式處置 SVG 改成有／無症狀與病史分支。兩組數據分別核對台灣心臟學會 2024 指引 2.6 節，以及 Kuo 等人的 2010 年健保研究結果。高尿酸圖是指引轉引調查，本站未重分析原始調查。

保留 2018 台灣共識、ACR 2020、NICE NG219、KDIGO 2024 等文獻的年份及適用範圍，沒有宣稱已完成系統性文獻更新。KDIGO 正在進行的更新草案不當作正式建議。本文並未完成醫師審閱、逐藥台灣仿單核對或個別治療適用性確認；不能改標為 reviewed。

## 驗證與上架

### TSH 匯入紀錄

使用者提供 `fmdoc-tsh.zip`，匯入為 `content/articles/tsh.md`。TSH 是檢驗指標，文章主要適用非懷孕成人，沒有將單次紅字當作診斷或自動用藥條件。正文整理為 1–14 節，模板接續 15–17 節；首次引用次序重新編號。

台灣老年健檢比例核對 Lai 等人的 2011 年論文摘要（北醫研究典藏），並非今日全國盛行率。HR 數據核對 Rodondi 2010 年研究的冠心病事件、年齡性別調整結果，不能誤作死亡結果。SMD 與各結果的分析人數核對 Feller 2018 年 JAMA 原文；2192 為全部試驗總人數，不是每個結果的人數。沒有混用觀察性關聯與治療試驗。

ATA 2026 妊娠指引的題名、年份與 DOI 已核對 PubMed；本文不加入未提供的孕期數值門檻。台灣妊娠專文保留為二手轉述，PDF 檔名日期不當作已核實的出版日期。提供稿的第 14 項健保會議 PDF 未取得可核對內容，沒有列為臨床依據；一般 TSH 判讀引用 NICE／ATA。治療目標依 NICE NG145 1.4.1 補充，避免為填章節而發明數值。仍須醫師審閱及確認台灣實務適用性。

執行 `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm test:export`。以 `pnpm preview` 查看靜態輸出，檢查手機與桌面的目錄、表格、數據圖、SVG 分支、縮放、FAQ、文獻錨點和首頁搜尋。

發布日期與更新日期會寫入 Article JSON-LD、Open Graph、sitemap 及文章頁。未審閱文章保留 noindex，並顯示醫療免責聲明；不能因程式測試通過就改成已審閱。僅在有真實醫師署名及實際審閱紀錄後使用現有 reviewed 流程。
