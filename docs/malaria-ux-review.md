# 瘧疾工具手機流程審閱

更新：2026-11-26。所有臨床規則仍為 pending 醫師審閱；「約 60 秒」是第一階段設計目標，尚未進行民眾計時研究。

## 修改前後

| 流程 | 修改前 | 修改後 |
| --- | --- | --- |
| 第一畫面 | 共用旅遊長表單，含疫苗／黃熱病轉機及完整藥物健康欄位 | 國家搜尋、地區、抵達／離開日期、年齡、簡短健康複選；新增行程才展開下一段 |
| 地區限制 | 通用欄位一起展示 | 只有規則需要時詢問市區範圍／海拔；季節由日期自動核對 |
| 低風險健康成人 | 仍會看到多種藥物及各自的待核對項目 | 第一階段即結束，顯示一般不需用藥及防蚊／發燒提醒 |
| 明列用藥地區 | 地區結論與每種藥物待核對事項交錯 | 先明確呈現「建議服用瘧疾預防藥物」，個人適用性另外篩檢 |
| 安全問答 | 各藥物重複列出未知條件 | 只對地區及準備時間仍可行的藥物，合併一次三態問答 |
| 完成篩檢 | 多張待核對卡片 | 優先討論、其他替代、所選候選的劑量／日期／數量；排除原因收合 |
| 專業資訊 | 比較、規則、覆蓋率占據主流程 | 預設收合；官方地圖每段行程保留一個入口 |

## 手機實測案例（390 × 844 viewport）

使用虛構資料，不代表個人處方。

1. 印尼峇里等明列低風險區、32 歲、2026-11-27 至 11-29、未勾選特殊狀況：第一步顯示「一般不需要預防藥物，但須防蚊」，沒有藥物安全表單或藥物卡片。
2. 同日期改為巴布亞：先顯示「建議服用瘧疾預防藥物」。開啟第二步後只問懷孕、哺乳、肝病、過敏、交互作用及腎功能六項，另可填體重。Mefloquine 準備期不足，不再問它專屬的精神疾病、癲癇及心臟問題。
3. 體重 65 kg、六項均明確回答否：顯示 AP 優先討論、Doxycycline 替代；AP 參考時程 11-26 至 12-06，共 11 個服藥日／11 錠。離開日仍視為暴露日，因此不套用示意圖以 11-28 為最後暴露日的 10 錠數字。
4. 將腎功能改為不確定：AP 不再列為通過篩檢的候選，Doxycycline 仍可依已完成的相關答案呈現。未知不會被當成陰性。

截圖存於專案外 `../family-medicine-backups/`：`malaria-ux-before-form.jpg`、`malaria-ux-before-result.jpg`、`malaria-ux-after-low-risk.jpg`、`malaria-ux-after-safety.jpg`、`malaria-ux-after-candidates.jpg`、`malaria-ux-after-plan.jpg`。資料僅為上述測試輸入。

## 決策與時程界線

- 沿用 NaTHNaC 既有國別／地區規則，未查核範圍仍未知。全球目錄 235 筆，110 筆有結構化規則，125 筆保留未知；本次沒有改寫國別資料或宣稱增加查核覆蓋。
- 地區用藥適應症、個人安全及準備期分開判斷。多國採共同候選交集，無交集時交由門診分段安排，不強行混合指引。
- 每日藥物逐日計算實際需要預防的暴露區段，包含跨季節。短間隔覆蓋合併；長間隔重新計算各段準備期與療程，不重複計量。
- 每週藥物保持固定星期，最後暴露後安排四次每週劑量。測試包含七種離開日相位、短間隔續用及長間隔重新開始。
- 標準起始日已過時不提供自行補服／加載方案。兒童、孕婦、哺乳、無脾臟、免疫抑制及複雜共病不自動產生成人劑量方案。
- 過敏可指定成分／藥物群。其餘候選需明確確認已由醫師／藥師核對成分，不能因未勾選就視為安全。
- G6PD 缺乏不是本工具四種藥物的一律禁忌；Primaquine／Tafenoquine 不納入自動候選。

## 劑量、商品名與來源查核

查核日 2026-11-26；不是台灣即時庫存或價格資料。

- [UKMEAG 2026 Chemoprophylaxis](https://www.gov.uk/government/publications/malaria-prevention-guidelines-for-travellers-from-the-uk-2026/chemoprophylaxis)：成人參考劑量、體重門檻、開始／結束時程。
- [UKMEAG Special risk groups](https://www.gov.uk/government/publications/malaria-prevention-guidelines-for-travellers-from-the-uk-2026/special-risk-groups)：孕哺、兒童、腎功能與其他特殊情況。
- [新竹臺大分院旅遊瘧疾衛教](https://www.hch.gov.tw/?aid=626&iid=1690&page_name=detail&pid=81)：Malarone、多喜黴素腸溶膠囊、安保克瘧的台灣院所列名。Chloroquine 台灣商品名尚未查核，不捏造品牌。
- [Lariam UK SmPC](https://www.medicines.org.uk/emc/product/13896/smpc)：英國每錠 250 mg mefloquine base，相當於 274.09 mg hydrochloride。不得將英國 base 與台灣資料的鹽類含量直接等錠互換。
- [台灣疾管署藥物資料](https://www.cdc.gov.tw/Category/ListContent/mtLMDNb29h9iyKcJdj7uYA?uaid=ZSgu_4NoQ7NTp0zZ-HC8rg)：保留獨立比較。Chloroquine 使用英國 155 mg base 參考錠計算，不能以 Hydroxychloroquine 等錠替換。

排序是返程療程、服藥頻率與旅客偏好的介面排序，不是官方第一線排名。所有數量均為明列參考製劑；實際台灣製劑與處方仍須核對。

## 驗證

新增 18 項決策、禁忌、未知、年齡／體重邊界、每日／每週、跨季節及多國時程測試。既有全球風險、抗藥性、旅遊疫苗、高山症及其他工具測試保留。執行 `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build`、`pnpm test:export`。

計算與輸入留在分頁記憶體，沒有資料庫、分析事件、網路傳輸或自動儲存。疫苗工具繼續使用原共用行程與疫苗欄位。
