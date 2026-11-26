# FRAX 工具

路由：`/tools/frax/`，列於高齡健康工具目錄並納入站內搜尋與 sitemap。

目前沒有 FRAXplus API 授權金鑰，因此採官方計算流程：

1. 使用者可先整理年齡、性別參數、身高體重、病史及股骨頸報告狀態。
2. 前往官方 `https://www.fraxplus.org/zh-Hant/calculation-tool/`，選擇亞洲／Taiwan 並依官方問項核對。
3. 回到本站手動記錄官方主要骨鬆性骨折與髖部骨折機率；本頁不重新計算，也不套用治療或給付門檻。

`src/lib/frax.ts` 只驗證與整理資料，沒有 FRAX 演算法。準備資料限制為 40–90 歲整數，不靜默改成邊界年齡；未知病史保留未知，不當成無。BMD 原始數值與機型由使用者在官方核對，不自行換算腰椎、全髖或 T-score。

結果錄入接受 0–100%（包含真正的 0），拒絕空白、非有限值、髖部機率大於主要骨折機率，以及沒有確認官方台灣模型的輸入。此驗證只能發現錄入格式問題，不能證明手動輸入等同官方結果。

輸入僅保存在 React 記憶體；沒有 localStorage、cookie、病史上傳、URL 參數或背景 API。複製清單只在使用者點擊按鈕後寫入剪貼簿。外部連結不攜帶病史；官方頁面由使用者自行填寫。

核對來源（2026-11-27）：

- 官方計算頁：`https://www.fraxplus.org/zh-Hant/calculation-tool/`
- 官方 FAQ：`https://www.fraxplus.org/en/faq/`，含國家模型、年齡、BMD 部位、主要骨折定義、治療與臨床限制。
- 臺北榮總公開說明：`https://wd.vghtpe.gov.tw/manage/upload/cabfile/f_20241227114537847.pdf`
- 官方整合文件：`https://fraxplus.org/en/documentation`。API 與本機部署均需有效訂閱。未取得授權前不逆向或模擬模型；日後合法串接時須另確認伺服器端金鑰、資料傳送同意、官方台灣模型 ID 與整合驗證，不能將金鑰加入前端環境變數。
