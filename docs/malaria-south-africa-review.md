# 南非季節分區修正

查核：2026-11-26。臨床審閱仍為 pending。

來源：[NaTHNaC 南非國別頁 Risk areas](https://travelhealthpro.org.uk/country/201/south-africa#Malaria)及[官方季節地圖](https://travelhealthpro.org.uk/media_lib/mlib-uploads/full/south-africa-malaria-risk-07-26.png)。

原本 kruger 規則的 requiresReview=true 會在日期判斷前停止評估，故即使地區及日期完整，仍顯示資料不足。官方國別文字已明列克魯格及指定低海拔邊境區 9 月至翌年 5 月建議 AP、Doxycycline 或 Mefloquine；6–8 月極低風險。此次依明列文字移除此區的待複核阻擋，保留 risk=unknown 與 prophylaxis=recommended 的區別，不將建議用藥誤作 high 等級。

新增指定低風險區、極低風險區及其餘無風險區，選項以地圖顏色輔助辨識。其他／尚未確認分區仍保留未知。低及極低風險區的 6–8 月未在文字明列分區對應，保留未知，不從「傳播通常在 9–5 月」自行推論無風險。既有 other id 維持未知，避免舊資料被重新解讀為無風險。

同時修正用藥需求本身為 unknown 卻未標成 unresolved 的情況；主結果直接列出各段無法判定的原因。

回歸案例涵蓋截圖日期 2026-12-24 至 12-31、五月／六月及八月／九月邊界、跨季節暴露日、指定風險分區、特殊族群、未知及混合行程，以及安全問答前不得產生個人化服藥表。
