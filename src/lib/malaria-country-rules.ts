import type { DrugId } from "./travel-data";

export type MalariaRisk = "high" | "low" | "very_low" | "none" | "unknown";
export type Prophylaxis = "recommended" | "conditional" | "bite_avoidance" | "unknown";
export type MalariaRegion = {
  id: string; name: string; risk: MalariaRisk; prophylaxis: Prophylaxis; drugs: DrugId[];
  urbanOnly?: boolean; below?: number; above?: number; months?: number[];
  otherSeason?: { risk: MalariaRisk; prophylaxis: Prophylaxis };
  note?: string; requiresReview?: boolean;
};
const apd: DrugId[] = ["ap", "doxy"], apdm: DrugId[] = [...apd, "meflo"];
const r = (id:string,name:string,risk:MalariaRisk,drugs:DrugId[]=[],extra:Partial<MalariaRegion>={}):MalariaRegion =>
  ({id,name,risk,prophylaxis:risk==="high"?"recommended":risk==="low"?"conditional":risk==="unknown"?"unknown":"bite_avoidance",drugs,...extra});
const high=(name="全境")=>[r("all",name,"high",apdm)];
// These are authored summaries of the checked national text, not inferred from map colours.
// A source that says only 'risk' retains risk=unknown independently of its explicit drug advice.
const advised=(id:string,name:string,extra:Partial<MalariaRegion>={})=>r(id,name,"unknown",apdm,{prophylaxis:"recommended",note:"官方文字未指定 high／low 等級，但明列應評估預防藥。",...extra});
const summer=[5,6,7,8,9,10,11];
export const malariaCountryRules: Record<string,MalariaRegion[]> = {
  cambodia:[
    r("phnom-penh","金邊市（Phnom Penh）","none",[],{urbanOnly:true}),
    r("angkor-tonle-sap","吳哥窟寺廟群、洞里薩湖周邊及暹粒","very_low"),
    r("western-border","西部與泰國接壤省份（排除上述極低／無風險區）","low",apd,{note:"西部泰柬邊境有 Mefloquine 抗藥性；特殊族群討論 AP 或 Doxycycline。"}),
    r("other-low","其他已確認地點（排除金邊、吳哥窟／洞里薩湖及西部邊境）","low",apdm),
  ],
  thailand:[r("cities","曼谷、清邁市、清萊市、帕岸島、蘇梅島、芭達雅","none",[],{urbanOnly:true}),r("border","與柬埔寨、寮國、緬甸接壤的鄉村森林邊境","low",apd,{note:"NaTHNaC 列 Mefloquine 抗藥性；低風險特殊族群候選為 AP 或 Doxycycline。"}),r("remaining","其餘地區（含北碧；排除上述區域）","very_low")],
  vietnam:[r("cities","河內、胡志明市等大城市（只到市區）","none",[],{urbanOnly:true}),r("no-risk","紅河三角洲、芽莊以北沿海、富國島","none"),r("rural","其他鄉村及指南明列南部省份","low",apd,{note:"包含 Tay Ninh、Lam Dong、Dak Lak、Gia Lai、Kon Tum；省界變更或跨區行程需確認實際位置。"})],
  kenya:[r("nairobi","奈洛比市（不含郊外／跨區）","very_low",[],{urbanOnly:true}),r("highlands","所有到訪地點均高於 2500m 的高地","very_low",[],{above:2500}),r("other","其他地區（排除奈洛比市及高於 2500m 高地）","high",apdm,{note:"不能套用舊 CDC 的奈洛比分類或將 2500m 直接當成無風險。"})],
  brazil:[r("amazon","亞馬遜流域（包含瑪瑙斯市）","low",apdm),r("falls","伊瓜蘇瀑布","none"),r("rest","其餘巴西（排除亞馬遜流域及伊瓜蘇瀑布）","very_low")],
  haiti:[advised("all","全境",{drugs:[...apdm,"chloro"]})],
  afghanistan:[r("below","低於 2000m 地區","low",apdm,{below:2000,months:summer,otherSeason:{risk:"very_low",prophylaxis:"bite_avoidance"}})],
  "andaman-and-nicobar-islands-india":[r("all","安達曼及尼科巴群島","low",apdm)],
  angola:high(),benin:high(),"burkina-faso":high(),burundi:high(),cameroon:high(),"central-african-republic":high(),chad:high(),comoros:high(),congo:high(),"cote-divoire":high(),"democratic-republic-of-the-congo":high(),djibouti:high(),"equatorial-guinea":high(),gabon:high(),"the-gambia":high(),ghana:high(),guinea:high(),"guinea-bissau":high(),liberia:high(),madagascar:high(),malawi:high(),mali:high(),mozambique:high(),niger:high(),nigeria:high(),rwanda:high(),"sao-tome-and-principe":high(),senegal:high(),"sierra-leone":high(),"solomon-islands":high(),somalia:high(),"south-sudan":high(),togo:high(),uganda:high(),zambia:high(),
  indonesia:[r("papua","伊里安查亞／巴布亞地區","high",apdm),r("islands","峇里、龍目、爪哇、蘇門答臘（排除雅加達市）","low",[],{note:"此國別段落未列低風險特殊族群的具體候選藥物；須另行核對。"}),r("jakarta","雅加達市","none",[],{urbanOnly:true})],
  bangladesh:[r("hill-tracts","吉大港丘陵地區（Chittagong Hill Tracts）","high",apdm),r("rest","其餘地區（含吉大港市，排除丘陵地區）","very_low")],
  bhutan:[r("south","南部印度邊境：Chukha、Geyleg-phug、Samchi、Samdrup Jonkhar、Shemgang","low",apdm),r("rest","其餘不丹（排除上述地區）","none")],
  bolivia:[r("amazon","亞馬遜流域","low",apdm),r("rural","其他低於 2500m 鄉村","low",apdm,{below:2500}),r("above","所有到訪地點均高於 2500m","none",[],{above:2500})],
  "borneo-indonesia":[r("all","印尼婆羅洲","low",apdm)],
  "borneo-malaysia":[r("inland","沙巴內陸、砂拉越內陸森林","low",apdm),r("rest","其餘馬來西亞婆羅洲（含沙巴、砂拉越沿海）","very_low")],
  botswana:[r("north","北半部（含奧卡萬戈三角洲）","high",apdm,{months:[10,11,12,1,2,3,4,5],otherSeason:{risk:"low",prophylaxis:"conditional"}}),r("south","南半部","very_low")],
  brunei:[r("all","全境","very_low")],
  "myanmar-burma":[r("below","低於 1000m 地區","unknown",apd,{below:1000,prophylaxis:"recommended",note:"官方表示風險難以評估，應考慮 AP／Doxycycline；並未指定 high 等級。"}),r("above","所有到訪地點均高於 1000m","low",[],{above:1000})],
  "costa-rica":[r("limon","利蒙省（不含利蒙市／Puerto Limon）","low",["chloro"]),r("rest","其餘地區（包括利蒙市）","very_low")],
  "dominican-republic":[r("cities","Santiago、Santo Domingo 市區","none",[],{urbanOnly:true}),r("other","其餘地區（海地邊界暴露可能更高）","low",apdm)],
  ecuador:[r("mainland","本土低於 1500m（排除瓜亞基爾市）","low",apdm,{below:1500}),r("guayaquil","瓜亞基爾市","none",[],{urbanOnly:true}),r("galapagos","加拉巴哥群島","none")],
  eritrea:[r("below","低於 2200m（不含阿斯馬拉市）","high",apdm,{below:2200}),r("asmara","阿斯馬拉市","none",[],{urbanOnly:true}),r("above","所有到訪地點均高於 2200m","none",[],{above:2200})],
  eswatini:[advised("north-east","北、東部邊境：Lubombo 全區及 Hhohho、Manzini、Shiselweni 東半部",{months:[11,12,1,2,3,4,5],otherSeason:{risk:"low",prophylaxis:"conditional"}}),r("mbabane","墨巴本","none"),r("rest","其餘地區","very_low")],
  ethiopia:[r("below","低於 2000m（不含阿迪斯阿貝巴）","high",apdm,{below:2000}),r("addis","阿迪斯阿貝巴市","none",[],{urbanOnly:true}),r("above","所有到訪地點均高於 2000m","none",[],{above:2000})],
  "french-guiana":[advised("rivers","主要河流及 Saül、Maripasoula、Camopi、Régina 明列地區",{note:"須對照官方地圖；地區邊界尚待複核。",requiresReview:true}),r("cayenne","開雲市、魔鬼島","none"),r("other","其他地區（低或極低，待核對地圖）","unknown")],
  guatemala:[r("below","低於 1500m（排除瓜地馬拉市、安地瓜及阿蒂特蘭湖）","low",[],{below:1500}),r("cities","瓜地馬拉市、安地瓜、阿蒂特蘭湖","none"),r("above","所有到訪地點均高於 1500m","none",[],{above:1500})],
  guyana:[advised("interior","內陸地區"),r("coast","喬治城及沿海地區","very_low")],
  honduras:[r("low","低於 1000m（排除兩大城市），或羅阿坦及其他海灣群島","low"),r("cities","San Pedro Sula、Tegucigalpa","none",[],{urbanOnly:true}),r("above","所有到訪地點均高於 1000m","none",[],{above:1000})],
  india:[advised("states","Mizoram、Odisha、Tripura 邦"),r("rest","其他印度地區（含果阿、安達曼／尼科巴；排除拉克沙群島）","low",apdm),r("lakshadweep","拉克沙群島","none")],
  iran:[r("seasonal","東南鄉村、Ardabil 的亞塞拜然邊境、North Khorasan 的土庫曼邊境","low",apdm,{months:[3,4,5,6,7,8,9,10,11]}),r("rest","其餘伊朗","very_low")],
  iraq:[r("north","北部鄉村低於 1500m，5–11 月","very_low",[],{below:1500,months:summer}),r("rest","其餘已確認地區","none")],
  "north-korea":[r("south","南部官方明列地區","very_low")],
  "south-korea":[r("dmz","北部江原、京畿、仁川非軍事區附近明列地區","very_low",[],{note:"包含江華、坡州、金浦、一山西／東、德陽、鐵原、漣川；其他地區不自行推測。"})],
  laos:[r("vientiane","永珍市","very_low",[],{urbanOnly:true}),r("border","Bokeo、Louang Namtha 的寮緬邊境及 Champasak、Saravan 的寮泰邊境","low",apd),r("rest","其餘地區（排除永珍及上述邊境）","low",apdm)],
  malaysia:[r("mainland","馬來半島（不含婆羅洲）","low",apdm)],
  venezuela:[advised("other","其他地區（尤其 Amazonas、Bolívar、Delta Amacuro、Sucre）"),r("caracas","卡拉卡斯市、瑪格麗塔島","none")],
  mauritania:[r("south","南部省份","high",apdm),r("north","北部省份","high",apdm,{months:[7,8,9,10],otherSeason:{risk:"low",prophylaxis:"conditional"}})],
  mayotte:[r("all","全境","low",apdm)],mexico:[r("all","全境","very_low")],
  namibia:[r("year","Kavango East、Kavango West、Zambezi（含 Caprivi）","high",apdm),r("season","Kunene、Omusati、Oshana、Ohangwena、Oshikoto、Omaheke、Otjozondjupa","high",apdm,{months:[12,1,2,3,4],otherSeason:{risk:"low",prophylaxis:"conditional"}}),r("rest","其餘納米比亞","very_low")],
  nepal:[r("below","低於 1500m（特別是德賴；不含加德滿都）","low",apdm,{below:1500}),r("kathmandu","加德滿都市","none",[],{urbanOnly:true})],
  nicaragua:[r("managua","馬拿瓜","very_low"),r("rest","其餘地區","low")],
  pakistan:[r("below","低於 2000m","low",apdm,{below:2000}),r("above","所有到訪地點均高於 2000m","very_low",[],{above:2000})],
  panama:[r("east","運河以東","low",apdm,{requiresReview:true,note:"2026 年 11 月官方另列全國瘧疾警報；舊分區與最新事件需複核，暫停確定判斷。"}),r("west","運河以西","very_low",[],{requiresReview:true}),r("city-canal","巴拿馬市／運河區","none",[],{requiresReview:true})],
  "papua-new-guinea":[r("below","低於 1800m","high",apdm,{below:1800}),r("above","所有到訪地點均高於 1800m","very_low",[],{above:1800})],
  peru:[r("rural","低於 2000m 鄉村及巴西／玻利維亞邊界亞馬遜流域（含 Loreto）","low",apdm,{below:2000}),r("lima","利馬市、Chiclayo 以南沿海","none")],
  philippines:[r("low","低於 600m 鄉村及呂宋、民答那峨、民多羅、巴拉望（排除無風險市區）","low",apdm),r("cities","只到城市（不含鄉村）","none",[],{urbanOnly:true}),r("islands","長灘、薄荷、Catanduanes、宿霧、雷伊泰島","none")],
  "saudi-arabia":[r("south-west","葉門邊境西南省份，包括 Asir 低於 2000m 地區","very_low"),r("cities","吉達、麥加、麥地那、利雅德、塔伊夫","none",[],{urbanOnly:true}),r("asir-above","Asir 所有到訪地點均高於 2000m","none",[],{above:2000})],
  "south-africa":[
    advised("kruger","克魯格國家公園／Mpumalanga、Limpopo 明列低海拔邊境（官方地圖紅區）",{months:[9,10,11,12,1,2,3,4,5],otherSeason:{risk:"very_low",prophylaxis:"bite_avoidance"},note:"限克魯格國家公園及鄰莫三比克、史瓦帝尼、辛巴威的明列低海拔區，不代表兩省全境。9 月至翌年 5 月建議預防藥；6–8 月為極低風險，以防蚊為主。"}),
    r("seasonal-low","KwaZulu-Natal 最東北部及 Mpumalanga、Limpopo 指定低風險區（官方地圖橘區）","low",apdm,{months:[9,10,11,12,1,2,3,4,5],note:"限官方地圖指定橘區，排除克魯格及紅區。9 月至翌年 5 月以防蚊為主；特殊族群須個別評估。"}),
    r("seasonal-very-low","KwaZulu-Natal 東北部指定極低風險區（官方地圖淡橘區）","very_low",[],{months:[9,10,11,12,1,2,3,4,5],note:"限官方地圖指定淡橘區，9 月至翌年 5 月以防蚊及症狀警覺為主。"}),
    r("no-risk","南非其餘無風險區（官方地圖淡黃區；含開普敦、約翰尼斯堡）","none",[],{note:"限所有到訪地點均在官方淡黃區；若前往克魯格或東北部其他風險區，請另加行程。"}),
    r("other","尚未確認所屬地圖分區／跨區未拆分","unknown",[],{note:"尚未確認實際地點所屬風險區，請對照官方地圖選擇分區；跨區行程請分段填寫。"}),
  ],
  sudan:[advised("all","全境（含喀土穆）")],
  syria:[r("hasaka","El Hasaka 偏遠疫點","very_low",[],{requiresReview:true,note:"官方表示缺乏最新資料，不能排除其他病例；需另行確認。"})],
  tanzania:[r("below","低於 1800m（含桑給巴爾）","high",apdm,{below:1800}),r("above","所有到訪地點均高於 1800m","none",[],{above:1800})],
  turkey:[r("all","全境","very_low")],vanuatu:[advised("all","全境")],
  yemen:[advised("below","低於 2000m（不含索科特拉）",{below:2000}),r("socotra","索科特拉島","very_low"),r("above","所有到訪地點均高於 2000m（含沙那）","none",[],{above:2000})],
  zimbabwe:[advised("zambezi","贊比西河谷"),r("below","低於 1200m（排除贊比西河谷及哈拉雷／布拉瓦約）","high",apdm,{below:1200,months:[11,12,1,2,3,4,5,6],otherSeason:{risk:"low",prophylaxis:"conditional"}}),r("cities","哈拉雷、布拉瓦約","very_low",[],{urbanOnly:true})],
  colombia:[r("below","低於 1600m 鄉村（不含卡塔赫納）","low",apdm,{below:1600}),r("cartagena","卡塔赫納","very_low"),r("above","所有到訪地點均高於 1600m","very_low",[],{above:1600})],
};
