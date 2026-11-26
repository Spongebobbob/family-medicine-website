# 日常・家醫 — 台灣家庭醫學衛教網站

腎臟工具 `/tools/egfr/` 已加入選填 UACR（mg/g）、醫師確認病因（C）及 KDIGO G／A 風險矩陣。UACR 未填時保留未知；分層不代表單次檢驗即可確診 CKD，也不是個人洗腎機率。公式、18 格風險及未四捨五入的分類邊界均有測試。

## 健康自我評估中心（已公開部署）

公開網址：https://fmdoc.vercel.app/tools/ 。依使用者要求已開放實用介面，不再以準備頁封鎖工具。

- BMI、FIB-4、2021 CKD-EPI eGFR：直接輸入、計算、清除與結果解釋。
- ISI、STOP-BANG、PHQ-9、GAD-7：依使用者後續要求，直接顯示本站中文閱讀版問題及文字選項，自動計分，不再外連題本或搬分數。未宣稱已驗證或官方授權，版本與來源在可展開說明中列出。STOP-BANG 採官方台灣 2015 版指標（男性頸圍 ≥43 公分、女性 ≥41 公分），不混用英文網站的 40 公分切點。
- 所有臨床內容均待醫師審閱，不冒稱已核准。PHQ-9 第九項非零立即顯示安全提醒，不等待其他題完成。
- 本站輸入只留在分頁記憶體，不儲存、傳送或追蹤。外部連結不帶任何分數，開啟後適用來源網站政策。

詳細來源見 [查證紀錄](docs/health-tools-review.md)。

本專案為可在本機運作的 MVP，使用 Next.js App Router + TypeScript + Tailwind CSS 4，以 Markdown 檔案管理文章，輸出純靜態網站。無付費 API、資料庫、會員、廣告或追蹤分析。內容仍保留待審閱與 noindex 設定；本機開發版本與既有公開版本分開管理。

## 本機執行

需要 Node.js 22 以上（本次驗證使用 24）、pnpm 11。

```sh
pnpm install
pnpm dev
```

開啟終端顯示的 `http://127.0.0.1:3000`。若未安裝 pnpm，可依 [pnpm 官方安裝說明](https://pnpm.io/installation) 安裝。依賴版本由 `pnpm-lock.yaml` 固定；`pnpm-workspace.yaml` 僅允許必要的 esbuild 安裝腳本。

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:export
pnpm preview
```

`pnpm build` 產出 `out/`，`pnpm preview` 在本機 3000 埠預覽靜態產物。若 dev 仍執行中，請先停止再啟動 preview。本專案不使用 `next start`，因為已設定 `output: "export"`。

## 頁面與功能

- `/` 首頁，`/about/` 醫師介紹，`/articles/` 衛教百科。
- `/categories/` 九大健康分類；`/categories/[slug]/` 個別分類與空狀態。
- `/articles/[slug]/` 共用文章模板：麵包屑、作者、日期、摘要、自動目錄、正文、警示症狀、FAQ、文獻與相關文章。
- `/search/` 瀏覽器端全文搜尋，含標題、分類、關鍵字與 Markdown 內文；支援多詞交集查詢、清除與無結果狀態。
- `/tools/` 健康自我評估中心；`/tools/categories/[slug]/` 八大工具分類；`/tools/[slug]/` 獨立工具與來源。提供公開計算器、中文問題及自動計分解讀；保留待醫師審閱標示。
- `/references/` 文獻總覽；`/policy/` 醫療免責、編輯、更正、隱私與利益揭露政策。
- `/sitemap.xml`、`/robots.txt`、每頁 canonical/OG、文章 JSON-LD 與作者連結、自訂 404。

## 新增文章：不需修改核心程式

在 `content/articles/` 複製一篇 `.md`，用英文小寫與連字號命名，例如 `healthy-walking.md`，檔名就是網址 slug。內容為 YAML frontmatter 加 Markdown（MVP 選擇 Markdown，不執行 MDX/HTML）。日期務必加引號。

```yaml
---
title: "文章標題"
description: "簡短說明，同時用於文章摘要及 SEO。"
category: prevention
published: "2026-11-25"
updated: "2026-11-25"
status: pending-review
author: "本站示範內容（尚未醫師署名）"
keywords: [預防, 健康]
summary:
  - "重點摘要。"
warnings:
  - "需要及時就醫的情況，請由醫師確認。"
faq:
  - question: "常見問題？"
    answer: "回答。"
references:
  - id: verified-source
    title: "真實資料標題"
    publisher: "真實發布機構"
    url: "https://官方來源的實際網址"
    accessed: "2026-11-25"
---
## 第一個段落標題

在這裡撰寫正文。[來源:verified-source]
```

內文使用 `##` 與 `###` 標題，自動產生含中文且不重複的錨點與目錄。`[來源:id]` 自動轉為文末文獻連結。目錄會自動避開與模板區塊相同的 ID。正文不支援 Markdown 表格擴充語法；可使用標準清單。原始 HTML 會被忽略，連結由 react-markdown 預設安全規則處理。

必填欄位、分類、日期順序、文獻 HTTPS 連結與 ID、正文來源標記皆在 build 時驗證，錯誤會中止建置。新增檔案後重新 build，文章列表、分類、搜尋與相關文章會一起更新；不需手動更新索引。

分類 slug：

| slug                | 分類           |
| ------------------- | -------------- |
| sleep-mental-health | 睡眠與身心健康 |
| chronic-disease     | 三高與慢性疾病 |
| health-check        | 健檢報告解讀   |
| weight-management   | 體重管理       |
| musculoskeletal     | 肌肉骨骼疼痛   |
| travel-medicine     | 旅遊醫學       |
| prevention          | 預防醫學       |
| older-adults        | 高齡健康       |
| medication          | 用藥知識       |

## 醫師資料與審閱

在 `src/lib/site.ts` 的 `site.physician` 填入本人提供且確認的 `name`、`biography`、`credentials`。目前全部留空，沒有虛構姓名、學經歷或專科資格，也沒有虛構醫師照片。

三篇示範文章均為 `pending-review`，模板、列表、搜尋均標示待審閱。完成真實醫師審閱後，將該篇 `author` 改為設定中的醫師姓名、`status` 改為 `reviewed`、更新 `updated`。若沒有真實醫師姓名或作者不一致，build 會拒絕已審閱狀態。修改臨床內容後需重新審閱。

參考資料採用已查閱的 NHLBI、美國心臟協會、台大醫院與國健署公開來源；未填寫未確認的文獻作者、期刊、DOI 或發布日期。英語來源仍需由醫師確認台灣適用性。正文屬示範草稿，來源連結不代表文章已完成醫學審閱。

## SEO 與發布前設定

複製 `.env.example` 為 `.env.local`，設定真實的 `NEXT_PUBLIC_SITE_URL`（含 `https://`，不含子路徑），重新 build。未設定時使用既有 Vercel 公開網址。`.env.example` 內的 `https://example.org` 僅為範例，複製後必須替換。

預設全站 `noindex, follow`，sitemap 為空；只在同時具備真實網站網址、醫師姓名與 `INDEX_SITE=true` 時，才允許一般頁面索引。待審閱文章永遠 `noindex` 且不列入 sitemap。`robots.txt` 允許抓取，使搜尋引擎能讀取 noindex；noindex 並非存取控制，不適合保密資料。

正式發布前由醫師確認文章、健康工具、個人資料、編輯政策與更正聯絡方式；調整全站預覽橫幅及首頁示範文案。政策頁目前明確說明尚無公開聯絡方式，未建立無法收信的表單。Open Graph 圖片在 `public/`，可替換為自己的素材。

## Cloudflare Pages 靜態部署（文件說明，尚未執行）

依 [Cloudflare 靜態 Next.js 官方指南](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) 與 [Next.js 靜態輸出指南](https://nextjs.org/docs/app/guides/static-exports)：

1. 將專案放入你自己的 GitHub 儲存庫。此工作目錄目前沒有設定遠端，不會自動推送。
2. 在 Cloudflare Pages 連接該儲存庫；選擇 **Next.js (Static HTML Export)**。
3. Build command：`pnpm build`；Build output directory：`out`；Root directory：專案根目錄。
4. 建置環境使用 Node.js 24 與 pnpm 11（可設定 `NODE_VERSION=24`、`PNPM_VERSION=11.25.0`），讓平台依 lockfile 安裝依賴。
5. 設定 `NEXT_PUBLIC_SITE_URL` 為實際網域。尚未通過審閱時保留 `INDEX_SITE=false`。這些是建置時變數，變更後必須重新 build。
6. 確認頁面、文獻、canonical、404 與手機顯示後，再自行決定是否部署及開放索引。靜態輸出不需要 Workers adapter、資料庫、API key 或付費服務。

Cloudflare Pages 可能在沒有頂層 `404.html` 時把網站視為 SPA；本專案有 Next.js 產生的 `out/404.html`，不應加入將所有路徑重寫到首頁的 SPA 規則。所有頁面使用尾斜線，靜態路徑對應 `index.html`。

## 專案結構與限制

`src/app`：頁面與靜態路由；`src/components`：版型、卡片、文章渲染、搜尋與共用健康工具；`src/lib`：內容驗證、SEO、公式、計分及發布防護；`content/articles`：文章；`docs/health-tools-review.md`：臨床與授權查證紀錄；`tests`：公式與切點、量表計分、PHQ-9 安全分支、輸入載入保護、發布防護、資料品質、目錄、搜尋及 SEO 靜態輸出檢查。

系統字型不依賴外部字型服務，插畫為本站 SVG，適配手機／平板／桌機，提供跳至內容、鍵盤焦點、語意標籤、可展開 FAQ、減少動態與列印樣式。搜尋會下載全部文章文字，適合小型 MVP；大量文章時再評估索引拆分。每次文章更新需要重新建置，沒有後台編輯器或即時發布功能。

警語呈現：各頁最多保留一塊醫療提醒，移除全站重複橫幅、頁尾、卡片及結果區警語。PHQ-9 的安全提示動態取代一般提醒；版本與權限保留在可展開的說明中。靜態輸出測試會檢查所有頁面的提醒數量。

## 新增四項工具（2026-11-25）

沿用目前精簡版面，不新增橫幅、成年勾選或重複隱私段落。

- `/tools/cardiovascular-risk/`：Framingham 2008 十年一般心血管疾病血脂模型，30–74 歲且無既有心血管疾病；不冒稱台灣校準或 ASCVD 專用模型。
- `/tools/metabolic-syndrome/`：台灣 20 歲以上成人五項標準；處方治療計入對應血壓、血糖、三酸甘油酯指標；缺值與不清楚的用藥保留未知狀態。
- `/tools/tdee/`：Mifflin–St Jeor 靜息熱量 × 五級活動係數，19–78 歲一般成人；只提供維持體重估算，不開立減重熱量處方。
- `/tools/waist-height-ratio/`：腰圍÷身高；體重選填，用來確認 NICE 分層的 BMI<35 條件。缺體重或 BMI≥35 時僅呈現比值與比例參考。

公式、界限與真實來源在 `src/lib/tool-catalog.ts`；純計算在 `src/lib/metabolic-assessments.ts`，共用輸入介面在 `src/components/tools/metabolic-form.tsx`。結果只存在 React 分頁記憶體。測試涵蓋男女公式、年齡範圍、切點等號、用藥、資料缺失、BMI 分層適用性、非法值及靜態輸出。所有新內容仍標記為待醫師審閱（可展開區塊）。


## 預防保健工具（2026-11-26）

- `/tools/taiwan-cancer-screening/`：公費癌篩逐項比對，包含 HPV 與幽門螺旋桿菌；紀錄選填，不明不當作未使用。
- `/tools/adult-health-check/`：成人預防保健年度間隔、特殊身分與 B／C 肝終身一次補助；跨級距由院所核對。
- `/tools/adult-vaccines/`：流感、新冠、肺炎鏈球菌、重組帶狀疱疹及 Td／Tdap 五項常見成人疫苗，區分公費族群、既往劑次與需查紀錄。

公開政策來源收錄在 `src/lib/tool-catalog.ts`，規則與固定政策年度在 `src/lib/prevention-assessments.ts`，共用表單在 `src/components/tools/prevention-form.tsx`。2026-11-26 核對；跨年度須重新查核政策，不可只更新年份。所有輸入僅在分頁記憶體中處理。新工具沿用精簡頁面，來源與限制收在折疊段落；審閱狀態仍保留於目錄資料及 SEO，未冒稱醫師核准。

驗證：`pnpm lint`、`pnpm test`、`pnpm build`、完成建置後 `pnpm test:export`。預防工具測試包含年齡／年次邊界、公費間隔、吸菸包年與戒菸 15 年切點、未知紀錄、終身一次、疫苗舊制銜接與懷孕分支。


## 高齡與睡眠新增工具（2026-11-26）

- `/tools/sarc-f/`、`/tools/mna-sf/`、`/tools/frail/`、`/tools/ess/`：既有總分輸入、分級圖與建議；完整繁中題目未確認網頁重製權限，故不展示或自行改寫。官方題本與研究均列在來源區。
- `/tools/sarcopenia/`：65 歲以上小腿圍／握力量測，缺值不視為正常，結果不直接診斷肌少症。
- `/tools/sleep-diary/`：本站自製日誌，最多 14 天、跨午夜、編輯刪除、加權睡眠效率、CSV 下載與列印；不是原版或翻譯版 Consensus Sleep Diary。無自動儲存，離開或重新整理後不保留；只有使用者自行點選下載才產生本機 CSV。

純計算與檢核在 `src/lib/aging-sleep-assessments.ts`，共用分數／肌力量測表單在 `src/components/tools/aging-sleep-form.tsx`，日誌在 `src/components/tools/sleep-diary.tsx`。尚未取得醫師確認，目錄審閱狀態仍為 pending。完整題目上線前，需確認實際繁中版本、驗證適用族群、網頁展示與電子重製授權；不可把第三方研究授權或免費下載當成本站授權。


### SARC-F／FRAIL 題目補齊

SARC-F、FRAIL 已改為 5 題繁中閱讀問卷，直接選答案自動計分。依 ICFSR 2020 圖 1 的自由使用 RGA 原題轉寫，來源及改寫聲明放於折疊說明與研究來源。FRAIL 固定為 6 個月體重與疾病超過 5 種的 RGA 版本。本站轉寫未宣稱已完成台灣電子版驗證。ESS、MNA-SF 仍僅解讀已有總分，尚未取得公開網頁題目授權。


### ESS／MNA-SF 題目補齊

網站持有人於對話確認已有公開網頁使用授權，ESS 與 MNA-SF 已改為完整繁中問卷。ESS 八題直接作答；MNA-SF 五項問題加第六項 BMI／小腿圍量測，六題共14分。BMI自動由身高體重計算，無法取得BMI才改用小腿圍；切換方法清除舊輸入，避免重複加分。授權確認取代先前僅總分模式，審閱狀態仍pending，不宣稱電子介面已驗證。計分在 `src/lib/licensed-questionnaires.ts`，表單在 `src/components/tools/licensed-questionnaire.tsx`。


## 台灣健保 LDL 目標工具（2026-11-26）

`/tools/ldl-target/` 依健保 2.6.1 表一（2026-09-01 生效）提供六層 LDL 目標與本次達標判斷、起始用藥血脂門檻及 non-HDL 次要目標。不是特定藥品給付核准器；表二及個別藥品條文另行查核。

規則在 `src/lib/ldl-target.ts`，共用表單／結果卡沿用現有樣式，介面在 `src/components/tools/ldl-target-form.tsx`。可選不清楚或留白檢驗值，只有在未知資料不影響層級時才指定單一目標；已知高風險時隱藏不必要的初級預防問題。未用藥與已用藥分別解釋，避免用治療後數值否定原給付。透析者不直接指定個人目標；不以一次腎功能異常自動診斷CKD。

截至2026-11-26已查核2026-10-29後續公告，該品項異動2026-12-01才生效，未提前套用。之後維護須重新檢查官方規定，不可只更改查核日期。公式與風險判定仍待醫師審閱，無資料傳送或自動儲存。
