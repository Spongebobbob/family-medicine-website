# 瘧疾資料查核與覆蓋率

查核日期：2026-11-26。臨床審閱：全數 pending。主要來源為 [NaTHNaC 國別目錄](https://travelhealthpro.org.uk/countries)及 [UKHSA／UKMEAG 2026](https://www.gov.uk/government/publications/malaria-prevention-guidelines-for-travellers-from-the-uk-2026)（2026-07-31 更新）。

- 官方目錄 262 個去重前入口，重新導向合併後為 235 個國別／地區頁面；這是 NaTHNaC 目錄的覆蓋率，不等於所有世界行政區均有獨立頁面。
- 已逐頁搜尋 Risk areas，未取得此段落者再搜尋明確無風險文字：91 頁有 Risk areas，19 頁有明確無風險文字。
- 110/235（46.8%）頁已建 180 條次國家／全境規則；部分規則仍因最新事件、邊界或資料不確定而停止判斷。
- 125 頁沒有足夠明確的可套用文字，保留 unknown。沒有 Malaria 段落、未列於 UKMEAG 表格，都不等於零風險。
- 89 個頁面已保存官方原圖網址。未取得原圖網址者使用官方國別 Malaria 入口，不猜測圖片路徑。
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
| [阿富汗](https://travelhealthpro.org.uk/countries/afghanistan) | risk_areas_found | 1 | 1 | not_checked |
| [阿爾巴尼亞](https://travelhealthpro.org.uk/countries/albania) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [阿爾及利亞](https://travelhealthpro.org.uk/countries/algeria) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [美屬薩摩亞、關島、北馬里亞納群島](https://travelhealthpro.org.uk/countries/american-samoa-guam-northern-mariana-islands) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [安達曼及尼科巴群島（印度）](https://travelhealthpro.org.uk/countries/andaman-and-nicobar-islands-india) | risk_areas_found | 1 | 0 | not_checked |
| [安道爾](https://travelhealthpro.org.uk/countries/andorra) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [安哥拉](https://travelhealthpro.org.uk/countries/angola) | risk_areas_found | 1 | 1 | not_checked |
| [安奎拉](https://travelhealthpro.org.uk/countries/anguilla) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [南極洲](https://travelhealthpro.org.uk/countries/antarctica) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [安地卡及巴布達](https://travelhealthpro.org.uk/countries/antigua-and-barbuda) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [阿根廷](https://travelhealthpro.org.uk/countries/argentina) | explicit_no_risk | 1 | 0 | not_checked |
| [亞美尼亞](https://travelhealthpro.org.uk/countries/armenia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [荷屬加勒比海群島](https://travelhealthpro.org.uk/countries/caribbean-islands-netherlands) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [阿森松、聖赫勒拿、特里斯坦達庫尼亞](https://travelhealthpro.org.uk/countries/ascension-st-helena-tristan-da-cunha) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [澳洲](https://travelhealthpro.org.uk/countries/australia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [聖誕島（澳洲）](https://travelhealthpro.org.uk/countries/christmas-island-australia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [奧地利](https://travelhealthpro.org.uk/countries/austria) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [亞塞拜然](https://travelhealthpro.org.uk/countries/azerbaijan) | explicit_no_risk | 1 | 0 | not_checked |
| [亞速群島（葡萄牙）](https://travelhealthpro.org.uk/countries/azores-portugal) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [巴哈馬](https://travelhealthpro.org.uk/countries/bahamas) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [西班牙](https://travelhealthpro.org.uk/countries/spain) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [印尼](https://travelhealthpro.org.uk/countries/indonesia) | risk_areas_found | 3 | 1 | not_checked |
| [孟加拉](https://travelhealthpro.org.uk/countries/bangladesh) | risk_areas_found | 2 | 1 | not_checked |
| [巴貝多](https://travelhealthpro.org.uk/countries/barbados) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [白俄羅斯](https://travelhealthpro.org.uk/countries/belarus) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [比利時](https://travelhealthpro.org.uk/countries/belgium) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [貝里斯](https://travelhealthpro.org.uk/countries/belize) | explicit_no_risk | 1 | 0 | not_checked |
| [貝南](https://travelhealthpro.org.uk/countries/benin) | risk_areas_found | 1 | 1 | not_checked |
| [百慕達](https://travelhealthpro.org.uk/countries/bermuda) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [不丹](https://travelhealthpro.org.uk/countries/bhutan) | risk_areas_found | 2 | 0 | not_checked |
| [玻利維亞](https://travelhealthpro.org.uk/countries/bolivia) | risk_areas_found | 3 | 1 | not_checked |
| [印尼婆羅洲](https://travelhealthpro.org.uk/countries/borneo-indonesia) | risk_areas_found | 1 | 1 | not_checked |
| [馬來西亞婆羅洲](https://travelhealthpro.org.uk/countries/borneo-malaysia) | risk_areas_found | 2 | 1 | not_checked |
| [波士尼亞與赫塞哥維納](https://travelhealthpro.org.uk/countries/bosnia-and-herzegovina) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [波札那](https://travelhealthpro.org.uk/countries/botswana) | risk_areas_found | 2 | 1 | not_checked |
| [巴西](https://travelhealthpro.org.uk/countries/brazil) | risk_areas_found | 3 | 1 | not_checked |
| [英屬維京群島](https://travelhealthpro.org.uk/countries/british-virgin-islands) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [汶萊](https://travelhealthpro.org.uk/countries/brunei) | risk_areas_found | 1 | 1 | not_checked |
| [布吉納法索](https://travelhealthpro.org.uk/countries/burkina-faso) | risk_areas_found | 1 | 1 | not_checked |
| [緬甸](https://travelhealthpro.org.uk/countries/myanmar-burma) | risk_areas_found | 3 | 1 | not_checked |
| [蒲隆地](https://travelhealthpro.org.uk/countries/burundi) | risk_areas_found | 1 | 1 | not_checked |
| [柬埔寨](https://travelhealthpro.org.uk/countries/cambodia) | risk_areas_found | 4 | 1 | consistent |
| [喀麥隆](https://travelhealthpro.org.uk/countries/cameroon) | risk_areas_found | 1 | 1 | not_checked |
| [加拿大](https://travelhealthpro.org.uk/countries/canada) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [維德角](https://travelhealthpro.org.uk/countries/cape-verde) | explicit_no_risk | 1 | 0 | not_checked |
| [法屬加勒比海群島](https://travelhealthpro.org.uk/countries/caribbean-islands-france) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [開曼群島](https://travelhealthpro.org.uk/countries/cayman-islands) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [中非共和國](https://travelhealthpro.org.uk/countries/central-african-republic) | risk_areas_found | 1 | 1 | not_checked |
| [查德](https://travelhealthpro.org.uk/countries/chad) | risk_areas_found | 1 | 1 | not_checked |
| [智利](https://travelhealthpro.org.uk/countries/chile) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [復活節島（智利）](https://travelhealthpro.org.uk/countries/easter-island-chile) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [中國](https://travelhealthpro.org.uk/countries/china) | explicit_no_risk | 1 | 0 | not_checked |
| [中國香港特別行政區](https://travelhealthpro.org.uk/countries/hong-kong-china) | explicit_no_risk | 1 | 0 | not_checked |
| [中國澳門特別行政區](https://travelhealthpro.org.uk/countries/macao-china) | explicit_no_risk | 1 | 0 | not_checked |
| [西藏](https://travelhealthpro.org.uk/countries/tibet-china) | explicit_no_risk | 1 | 0 | not_checked |
| [葛摩](https://travelhealthpro.org.uk/countries/comoros) | risk_areas_found | 1 | 1 | not_checked |
| [剛果（布拉薩）](https://travelhealthpro.org.uk/countries/congo) | risk_areas_found | 1 | 1 | not_checked |
| [庫克群島、紐埃、托克勞](https://travelhealthpro.org.uk/countries/cook-islands-niue-tokelau) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [法國](https://travelhealthpro.org.uk/countries/france) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [哥斯大黎加](https://travelhealthpro.org.uk/countries/costa-rica) | risk_areas_found | 2 | 1 | not_checked |
| [象牙海岸](https://travelhealthpro.org.uk/countries/cote-divoire) | risk_areas_found | 1 | 1 | not_checked |
| [克羅埃西亞](https://travelhealthpro.org.uk/countries/croatia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [古巴](https://travelhealthpro.org.uk/countries/cuba) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [賽普勒斯](https://travelhealthpro.org.uk/countries/cyprus) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [捷克](https://travelhealthpro.org.uk/countries/czechia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [剛果（金夏沙）](https://travelhealthpro.org.uk/countries/democratic-republic-of-the-congo) | risk_areas_found | 1 | 1 | not_checked |
| [丹麥](https://travelhealthpro.org.uk/countries/denmark) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [法羅群島（丹麥）](https://travelhealthpro.org.uk/countries/faroe-islands-denmark) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [吉布地](https://travelhealthpro.org.uk/countries/djibouti) | risk_areas_found | 1 | 1 | not_checked |
| [多米尼克](https://travelhealthpro.org.uk/countries/dominica) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [多明尼加共和國](https://travelhealthpro.org.uk/countries/dominican-republic) | risk_areas_found | 2 | 1 | not_checked |
| [東帝汶](https://travelhealthpro.org.uk/countries/timor-leste) | explicit_no_risk | 1 | 0 | not_checked |
| [厄瓜多](https://travelhealthpro.org.uk/countries/ecuador) | risk_areas_found | 3 | 1 | not_checked |
| [埃及](https://travelhealthpro.org.uk/countries/egypt) | explicit_no_risk | 1 | 0 | not_checked |
| [薩爾瓦多](https://travelhealthpro.org.uk/countries/el-salvador) | explicit_no_risk | 1 | 0 | not_checked |
| [赤道幾內亞](https://travelhealthpro.org.uk/countries/equatorial-guinea) | risk_areas_found | 1 | 1 | not_checked |
| [厄利垂亞](https://travelhealthpro.org.uk/countries/eritrea) | risk_areas_found | 3 | 1 | not_checked |
| [愛沙尼亞](https://travelhealthpro.org.uk/countries/estonia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [史瓦帝尼](https://travelhealthpro.org.uk/countries/eswatini) | risk_areas_found | 3 | 1 | not_checked |
| [衣索比亞](https://travelhealthpro.org.uk/countries/ethiopia) | risk_areas_found | 3 | 1 | not_checked |
| [福克蘭群島](https://travelhealthpro.org.uk/countries/falkland-islands) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [斐濟](https://travelhealthpro.org.uk/countries/fiji) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [芬蘭](https://travelhealthpro.org.uk/countries/finland) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [法屬圭亞那](https://travelhealthpro.org.uk/countries/french-guiana) | risk_areas_found | 3 | 1 | not_checked |
| [法屬玻里尼西亞](https://travelhealthpro.org.uk/countries/french-polynesia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [加彭](https://travelhealthpro.org.uk/countries/gabon) | risk_areas_found | 1 | 1 | not_checked |
| [甘比亞](https://travelhealthpro.org.uk/countries/the-gambia) | risk_areas_found | 1 | 1 | not_checked |
| [喬治亞](https://travelhealthpro.org.uk/countries/georgia) | explicit_no_risk | 1 | 0 | not_checked |
| [德國](https://travelhealthpro.org.uk/countries/germany) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [迦納](https://travelhealthpro.org.uk/countries/ghana) | risk_areas_found | 1 | 1 | not_checked |
| [馬爾他](https://travelhealthpro.org.uk/countries/malta) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [希臘](https://travelhealthpro.org.uk/countries/greece) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [格陵蘭](https://travelhealthpro.org.uk/countries/greenland) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [格瑞那達](https://travelhealthpro.org.uk/countries/grenada) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [瓜地馬拉](https://travelhealthpro.org.uk/countries/guatemala) | risk_areas_found | 3 | 1 | not_checked |
| [幾內亞](https://travelhealthpro.org.uk/countries/guinea) | risk_areas_found | 1 | 1 | not_checked |
| [幾內亞比索](https://travelhealthpro.org.uk/countries/guinea-bissau) | risk_areas_found | 1 | 1 | not_checked |
| [蓋亞那](https://travelhealthpro.org.uk/countries/guyana) | risk_areas_found | 2 | 1 | not_checked |
| [海地](https://travelhealthpro.org.uk/countries/haiti) | risk_areas_found | 1 | 1 | not_checked |
| [美國](https://travelhealthpro.org.uk/countries/usa) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [宏都拉斯](https://travelhealthpro.org.uk/countries/honduras) | risk_areas_found | 3 | 1 | not_checked |
| [匈牙利](https://travelhealthpro.org.uk/countries/hungary) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [冰島](https://travelhealthpro.org.uk/countries/iceland) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [印度](https://travelhealthpro.org.uk/countries/india) | risk_areas_found | 3 | 1 | not_checked |
| [伊朗](https://travelhealthpro.org.uk/countries/iran) | risk_areas_found | 2 | 1 | not_checked |
| [伊拉克](https://travelhealthpro.org.uk/countries/iraq) | risk_areas_found | 2 | 1 | not_checked |
| [愛爾蘭](https://travelhealthpro.org.uk/countries/ireland) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [以色列](https://travelhealthpro.org.uk/countries/israel) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [牙買加](https://travelhealthpro.org.uk/countries/jamaica) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [日本](https://travelhealthpro.org.uk/countries/japan) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [約旦](https://travelhealthpro.org.uk/countries/jordan) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [哈薩克](https://travelhealthpro.org.uk/countries/kazakhstan) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [肯亞](https://travelhealthpro.org.uk/countries/kenya) | risk_areas_found | 3 | 1 | not_checked |
| [吉里巴斯](https://travelhealthpro.org.uk/countries/kiribati) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [北韓](https://travelhealthpro.org.uk/countries/north-korea) | risk_areas_found | 1 | 1 | not_checked |
| [南韓](https://travelhealthpro.org.uk/countries/south-korea) | risk_areas_found | 1 | 1 | not_checked |
| [科索沃](https://travelhealthpro.org.uk/countries/kosovo) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [科威特](https://travelhealthpro.org.uk/countries/kuwait) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [吉爾吉斯](https://travelhealthpro.org.uk/countries/kyrgyzstan) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [寮國](https://travelhealthpro.org.uk/countries/laos) | risk_areas_found | 3 | 1 | not_checked |
| [拉脫維亞](https://travelhealthpro.org.uk/countries/latvia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [黎巴嫩](https://travelhealthpro.org.uk/countries/lebanon) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [賴索托](https://travelhealthpro.org.uk/countries/lesotho) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [賴比瑞亞](https://travelhealthpro.org.uk/countries/liberia) | risk_areas_found | 1 | 1 | not_checked |
| [利比亞](https://travelhealthpro.org.uk/countries/libya) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [立陶宛](https://travelhealthpro.org.uk/countries/lithuania) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [盧森堡](https://travelhealthpro.org.uk/countries/luxembourg) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [北馬其頓](https://travelhealthpro.org.uk/countries/north-macedonia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [馬達加斯加](https://travelhealthpro.org.uk/countries/madagascar) | risk_areas_found | 1 | 1 | not_checked |
| [馬德拉（葡萄牙）](https://travelhealthpro.org.uk/countries/madeira-portugal) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [馬拉威](https://travelhealthpro.org.uk/countries/malawi) | risk_areas_found | 1 | 1 | not_checked |
| [馬來西亞](https://travelhealthpro.org.uk/countries/malaysia) | risk_areas_found | 1 | 1 | not_checked |
| [馬爾地夫](https://travelhealthpro.org.uk/countries/maldives) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [馬利](https://travelhealthpro.org.uk/countries/mali) | risk_areas_found | 1 | 1 | not_checked |
| [委內瑞拉](https://travelhealthpro.org.uk/countries/venezuela) | risk_areas_found | 2 | 1 | not_checked |
| [馬紹爾群島](https://travelhealthpro.org.uk/countries/marshall-islands) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [馬丁尼克](https://travelhealthpro.org.uk/countries/martinique) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [茅利塔尼亞](https://travelhealthpro.org.uk/countries/mauritania) | risk_areas_found | 2 | 1 | not_checked |
| [模里西斯](https://travelhealthpro.org.uk/countries/mauritius) | explicit_no_risk | 1 | 0 | not_checked |
| [馬約特島](https://travelhealthpro.org.uk/countries/mayotte) | risk_areas_found | 1 | 1 | not_checked |
| [墨西哥](https://travelhealthpro.org.uk/countries/mexico) | risk_areas_found | 1 | 1 | not_checked |
| [密克羅尼西亞](https://travelhealthpro.org.uk/countries/micronesia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [摩納哥](https://travelhealthpro.org.uk/countries/monaco) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [蒙古](https://travelhealthpro.org.uk/countries/mongolia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [蒙特內哥羅](https://travelhealthpro.org.uk/countries/montenegro) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [蒙哲臘](https://travelhealthpro.org.uk/countries/montserrat) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [摩洛哥](https://travelhealthpro.org.uk/countries/morocco) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [莫三比克](https://travelhealthpro.org.uk/countries/mozambique) | risk_areas_found | 1 | 1 | not_checked |
| [納米比亞](https://travelhealthpro.org.uk/countries/namibia) | risk_areas_found | 3 | 1 | not_checked |
| [諾魯](https://travelhealthpro.org.uk/countries/nauru) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [尼泊爾](https://travelhealthpro.org.uk/countries/nepal) | risk_areas_found | 2 | 1 | not_checked |
| [荷蘭](https://travelhealthpro.org.uk/countries/netherlands) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [新喀里多尼亞](https://travelhealthpro.org.uk/countries/new-caledonia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [紐西蘭](https://travelhealthpro.org.uk/countries/new-zealand) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [尼加拉瓜](https://travelhealthpro.org.uk/countries/nicaragua) | risk_areas_found | 2 | 1 | not_checked |
| [尼日](https://travelhealthpro.org.uk/countries/niger) | risk_areas_found | 1 | 1 | not_checked |
| [奈及利亞](https://travelhealthpro.org.uk/countries/nigeria) | risk_areas_found | 1 | 1 | not_checked |
| [挪威](https://travelhealthpro.org.uk/countries/norway) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [挪威屬斯瓦巴及尖棉](https://travelhealthpro.org.uk/countries/svalbard-and-jan-mayen-norway) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [巴基斯坦](https://travelhealthpro.org.uk/countries/pakistan) | risk_areas_found | 2 | 1 | not_checked |
| [帛琉](https://travelhealthpro.org.uk/countries/palau) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [巴勒斯坦自治區](https://travelhealthpro.org.uk/countries/palestine) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [巴拿馬](https://travelhealthpro.org.uk/countries/panama) | risk_areas_found | 3 | 1 | not_checked |
| [巴布亞紐幾內亞](https://travelhealthpro.org.uk/countries/papua-new-guinea) | risk_areas_found | 2 | 1 | not_checked |
| [巴拉圭](https://travelhealthpro.org.uk/countries/paraguay) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [秘魯](https://travelhealthpro.org.uk/countries/peru) | risk_areas_found | 2 | 1 | not_checked |
| [菲律賓](https://travelhealthpro.org.uk/countries/philippines) | risk_areas_found | 3 | 1 | not_checked |
| [皮特肯群島](https://travelhealthpro.org.uk/countries/pitcairn-islands) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [波蘭](https://travelhealthpro.org.uk/countries/poland) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [葡萄牙](https://travelhealthpro.org.uk/countries/portugal) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [波多黎各](https://travelhealthpro.org.uk/countries/puerto-rico) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [卡達](https://travelhealthpro.org.uk/countries/qatar) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [留尼旺](https://travelhealthpro.org.uk/countries/reunion) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [羅馬尼亞](https://travelhealthpro.org.uk/countries/romania) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [俄羅斯](https://travelhealthpro.org.uk/countries/russia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [盧安達](https://travelhealthpro.org.uk/countries/rwanda) | risk_areas_found | 1 | 1 | not_checked |
| [薩摩亞](https://travelhealthpro.org.uk/countries/samoa) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [聖多美普林西比](https://travelhealthpro.org.uk/countries/sao-tome-and-principe) | risk_areas_found | 1 | 1 | not_checked |
| [義大利](https://travelhealthpro.org.uk/countries/italy) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [沙烏地阿拉伯](https://travelhealthpro.org.uk/countries/saudi-arabia) | risk_areas_found | 3 | 1 | not_checked |
| [塞內加爾](https://travelhealthpro.org.uk/countries/senegal) | risk_areas_found | 1 | 1 | not_checked |
| [塞爾維亞](https://travelhealthpro.org.uk/countries/serbia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [塞席爾](https://travelhealthpro.org.uk/countries/seychelles) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [獅子山](https://travelhealthpro.org.uk/countries/sierra-leone) | risk_areas_found | 1 | 1 | not_checked |
| [新加坡](https://travelhealthpro.org.uk/countries/singapore) | explicit_no_risk | 1 | 0 | not_checked |
| [斯洛伐克](https://travelhealthpro.org.uk/countries/slovakia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [斯洛維尼亞](https://travelhealthpro.org.uk/countries/slovenia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [索羅門群島](https://travelhealthpro.org.uk/countries/solomon-islands) | risk_areas_found | 1 | 1 | not_checked |
| [索馬利亞](https://travelhealthpro.org.uk/countries/somalia) | risk_areas_found | 1 | 1 | not_checked |
| [南非](https://travelhealthpro.org.uk/countries/south-africa) | risk_areas_found | 5 | 1 | not_checked |
| [南蘇丹](https://travelhealthpro.org.uk/countries/south-sudan) | risk_areas_found | 1 | 1 | not_checked |
| [聖克里斯多福及尼維斯](https://travelhealthpro.org.uk/countries/st-kitts-and-nevis) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [聖露西亞](https://travelhealthpro.org.uk/countries/st-lucia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [聖皮埃與密克隆](https://travelhealthpro.org.uk/countries/st-pierre-and-miquelon) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [聖文森及格瑞那丁](https://travelhealthpro.org.uk/countries/st-vincent-and-the-grenadines) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [蘇丹](https://travelhealthpro.org.uk/countries/sudan) | risk_areas_found | 1 | 1 | not_checked |
| [蘇利南](https://travelhealthpro.org.uk/countries/suriname) | explicit_no_risk | 1 | 0 | not_checked |
| [瑞典](https://travelhealthpro.org.uk/countries/sweden) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [瑞士](https://travelhealthpro.org.uk/countries/switzerland) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [敘利亞](https://travelhealthpro.org.uk/countries/syria) | risk_areas_found | 1 | 1 | not_checked |
| [台灣](https://travelhealthpro.org.uk/countries/taiwan) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [塔吉克](https://travelhealthpro.org.uk/countries/tajikistan) | explicit_no_risk | 1 | 0 | not_checked |
| [坦尚尼亞](https://travelhealthpro.org.uk/countries/tanzania) | risk_areas_found | 2 | 1 | not_checked |
| [泰國](https://travelhealthpro.org.uk/countries/thailand) | risk_areas_found | 3 | 1 | not_checked |
| [多哥](https://travelhealthpro.org.uk/countries/togo) | risk_areas_found | 1 | 1 | not_checked |
| [東加](https://travelhealthpro.org.uk/countries/tonga) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [突尼西亞](https://travelhealthpro.org.uk/countries/tunisia) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [土耳其](https://travelhealthpro.org.uk/countries/turkey) | risk_areas_found | 1 | 1 | not_checked |
| [土庫曼](https://travelhealthpro.org.uk/countries/turkmenistan) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [土克凱可群島](https://travelhealthpro.org.uk/countries/turks-and-caicos-islands) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [吐瓦魯](https://travelhealthpro.org.uk/countries/tuvalu) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [烏干達](https://travelhealthpro.org.uk/countries/uganda) | risk_areas_found | 1 | 1 | not_checked |
| [烏克蘭](https://travelhealthpro.org.uk/countries/ukraine) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [阿拉伯聯合大公國](https://travelhealthpro.org.uk/countries/united-arab-emirates) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [英國](https://travelhealthpro.org.uk/countries/united-kingdom) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [烏拉圭](https://travelhealthpro.org.uk/countries/uruguay) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [美屬維京群島](https://travelhealthpro.org.uk/countries/us-virgin-islands) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [烏茲別克](https://travelhealthpro.org.uk/countries/uzbekistan) | explicit_no_risk | 1 | 0 | not_checked |
| [萬那杜](https://travelhealthpro.org.uk/countries/vanuatu) | risk_areas_found | 1 | 1 | not_checked |
| [越南](https://travelhealthpro.org.uk/countries/vietnam) | risk_areas_found | 3 | 1 | not_checked |
| [威克島](https://travelhealthpro.org.uk/countries/wake-island) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [瓦利斯與富圖納](https://travelhealthpro.org.uk/countries/wallis-and-futuna) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [西撒哈拉](https://travelhealthpro.org.uk/countries/western-sahara) | explicit_no_risk | 1 | 0 | not_checked |
| [葉門](https://travelhealthpro.org.uk/countries/yemen) | risk_areas_found | 3 | 1 | not_checked |
| [辛巴威](https://travelhealthpro.org.uk/countries/zimbabwe) | risk_areas_found | 3 | 1 | not_checked |
| [巴林](https://travelhealthpro.org.uk/countries/bahrain) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [保加利亞](https://travelhealthpro.org.uk/countries/bulgaria) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [哥倫比亞](https://travelhealthpro.org.uk/countries/colombia) | risk_areas_found | 3 | 1 | not_checked |
| [加拉巴哥群島（厄瓜多）](https://travelhealthpro.org.uk/countries/galapagos-ecuador) | explicit_no_risk | 1 | 0 | not_checked |
| [列支敦斯登](https://travelhealthpro.org.uk/countries/liechtenstein) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [摩爾多瓦](https://travelhealthpro.org.uk/countries/moldova) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [阿曼](https://travelhealthpro.org.uk/countries/oman) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [聖馬利諾](https://travelhealthpro.org.uk/countries/san-marino) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [千里達及托巴哥](https://travelhealthpro.org.uk/countries/trinidad-and-tobago) | no_explicit_risk_statement | 0 | 0 | not_checked |
| [尚比亞](https://travelhealthpro.org.uk/countries/zambia) | risk_areas_found | 1 | 1 | not_checked |
