export const TRAVEL_CHECKED = "2026-11-26";
export const TRAVEL_VALID_DAYS = 90;
export const travelEvidence = {
  malaria: {version:"CDC Yellow Book 2026，Tables 4.10.2–3",checked:TRAVEL_CHECKED,scope:"瘧疾預防，不含治療、劑量處方、換藥或暴露後補救療程",url:"https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/malaria.html"},
  interactions: {version:"CDC Yellow Book 2026",checked:TRAVEL_CHECKED,scope:"旅遊用藥及疫苗交互作用篩檢，非完整藥物資料庫",url:"https://www.cdc.gov/yellow-book/hcp/preparing-international-travelers/medication-and-vaccine-interactions-in-travel-medicine.html"},
  yf: {version:"CDC Yellow Book 2026；ICVP／IHR",checked:TRAVEL_CHECKED,scope:"黃熱病風險、禁忌、國際證明；實際入境由目的地主管機關決定",url:"https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/yellow-fever.html"},
  taiwan: {version:"疾管署國際旅遊處方箋，查核時公開頁",checked:TRAVEL_CHECKED,scope:"台灣旅客行前門診與各國資料查詢",url:"https://www.cdc.gov.tw/InternationalTravel/Index"},
  routine: {version:"CDC Yellow Book 2026",checked:TRAVEL_CHECKED,scope:"國際旅客行前評估，非台灣公費資格判斷",url:"https://www.cdc.gov/yellow-book/hcp/preparing-international-travelers/the-pre-travel-consultation.html"},
  rabies: {version:"CDC Yellow Book 2026",checked:TRAVEL_CHECKED,scope:"暴露前 0、7 天；不能取代暴露後處置",url:"https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/rabies.html"},
  typhoid: {version:"CDC Yellow Book 2026",checked:TRAVEL_CHECKED,scope:"注射型 Vi 疫苗至少行前 2 週；不指定台灣疫苗廠牌",url:"https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/typhoid-and-paratyphoid-fever.html"},
  je: {version:"CDC Yellow Book 2026",checked:TRAVEL_CHECKED,scope:"日本腦炎暴露分層；台灣可用製劑／劑次由門診核對，不直接套用美國 IXIARO",url:"https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/japanese-encephalitis.html"},
} as const;
export type DrugId="ap"|"doxy"|"meflo"|"chloro";
export type MalariaStatus="none"|"mosquito"|"medication"|"unknown";
export type TravelSetting="urban"|"rural"|"forest"|"mixed"|"unknown";
export type RegionRule={id:string;name:string;malaria:MalariaStatus;drugs:DrugId[];urbanOnly?:boolean;altitudeRule?:boolean;yellowFever:"yes"|"no"|"unknown";note:string};
export type Destination={id:string;name:string;source:string;version:string;checked:string;scope:string;resistance:string;season:string;je:boolean;typhoid:boolean;yfEntry:"none"|"conditional";yfMinAgeMonths:number;transitHours:number|null;regions:RegionRule[];extraSources?:string[]};
const traveler=(country:string)=>`https://wwwnc.cdc.gov/travel/destinations/traveler/none/${country}`;
const rule=(id:string,name:string,malaria:MalariaStatus,drugs:DrugId[],yellowFever:RegionRule["yellowFever"],note:string,extra:Partial<RegionRule>={}):RegionRule=>({id,name,malaria,drugs,yellowFever,note,...extra});
const common={version:"CDC Yellow Book 2026／Traveler View，國別表 2025-04-23",checked:TRAVEL_CHECKED,scope:"僅限明列且與行程相符的地區；不涵蓋即時疫情、所有入境要求或未列地區",yfMinAgeMonths:0,transitHours:null};
export const destinations:Destination[]=[
  {...common,id:"JP",name:"日本",source:traveler("japan"),resistance:"不適用（已查核資料無瘧疾傳播）",season:"日本腦炎暴露須依農村活動及季節個別評估。",je:true,typhoid:false,yfEntry:"none",extraSources:["https://www.cdc.gov/malaria/travelers/country_table/j.html"],regions:[rule("all","日本境內行程","none",[],"no","CDC 國別表列無瘧疾；仍應防蚊預防其他感染。") ]},
  {...common,id:"TH",name:"泰國",source:traveler("thailand"),resistance:"Chloroquine、Mefloquine 抗藥性；已列高風險區比較 AP／Doxycycline。",season:"瘧疾全年可能傳播，雨季及 12 月可有高峰；不以乾季取消預防。",je:true,typhoid:true,yfEntry:"conditional",yfMinAgeMonths:9,transitHours:12,extraSources:["https://www.cdc.gov/yellow-book/hcp/asia/thailand.html"],regions:[
    rule("cities","僅曼谷、清邁市區或普吉島一般觀光","mosquito",[],"no","僅適用明列市區／島嶼觀光，不涵蓋清邁府森林或邊境。",{urbanOnly:true}),
    rule("border","緬甸／柬埔寨／馬來西亞邊境鄉村森林（不含 Buri Ram）","medication",["ap","doxy"],"no","明列邊境森林暴露需討論預防；其他省份與不確定位置不套用此規則。"),
    rule("other","其他／跨區／不確定","unknown",[],"no","請用官方地圖核對每個地區；不以國家名稱推測。"),
  ]},
  {...common,id:"VN",name:"越南",source:traveler("vietnam"),resistance:"部分省份有 Mefloquine 抗藥性；Chloroquine 不列入已查核地區候選。",season:"瘧疾不因旅行月份而直接排除；日本腦炎暴露與季節、農村活動及停留長度有關。",je:true,typhoid:true,yfEntry:"none",extraSources:["https://www.cdc.gov/yellow-book/hcp/asia/vietnam.html"],regions:[
    rule("cities","僅河內、胡志明市、峴港、海防、芽莊或歸仁市區","none",[],"no","僅限上述城市，近郊與跨區行程另評估。",{urbanOnly:true}),
    rule("deltas","僅湄公河三角洲／紅河三角洲","mosquito",[],"no","CDC 建議防蚊，不例行瘧疾預防藥。"),
    rule("resistant","抗藥性省份的鄉村地區（見下方範圍）","medication",["ap","doxy"],"no","Binh Duong、Binh Phuoc、Dak Lak、Dak Nong、Gia Lai、Khanh Hoa、Kon Tum、Lam Dong、Ninh Thuan、Tay Ninh；依來源舊省名核對新行政區，不自行套用未知區。"),
    rule("rural","其他已確認鄉村（不含兩大三角洲及抗藥性省份）","medication",["ap","doxy","meflo"],"no","需能確認排除上列地區；位置不清楚請選其他。"),
    rule("other","其他／不確定","unknown",[],"no","區域不清楚，無法判斷預防藥需求。"),
  ]},
  {...common,id:"KE",name:"肯亞",source:traveler("kenya"),resistance:"Chloroquine 抗藥性。",season:"停留越久暴露越多；不因乾季取消符合地區條件的預防。",je:false,typhoid:true,yfEntry:"conditional",yfMinAgeMonths:12,transitHours:null,regions:[
    rule("nairobi","僅奈洛比高度都市化的市中心","mosquito",[],"no","市中心以外、郊區、國家公園均不適用此例外。",{urbanOnly:true}),
    rule("coast","Mombasa 市區或 Kilifi／Kwale／Lamu／Tana River 郡","medication",["ap","doxy","meflo"],"no","不包含 Taita-Taveta；仍需核對最低海拔。",{altitudeRule:true}),
    rule("safari","其他已確認地區／國家公園，排除黃熱病低暴露例外區","medication",["ap","doxy","meflo"],"yes","不涵蓋原 North Eastern 及海岸例外區；<2500m 有瘧疾暴露。",{altitudeRule:true}),
    rule("other","其他／地區不確定","unknown",[],"unknown","請核對郡市、海拔及黃熱病地圖；不推測低風險。"),
  ]},
  {...common,id:"BR",name:"巴西",source:traveler("brazil"),resistance:"Chloroquine 抗藥性。",season:"不依季節取消已列瘧疾地區的預防；出發前另查疫情。",je:false,typhoid:true,yfEntry:"none",regions:[
    rule("cities","僅巴西利亞、里約熱內盧或聖保羅市區","none",[],"yes","無瘧疾不等於不需黃熱病疫苗；三處均屬黃熱病建議接種範圍。",{urbanOnly:true}),
    rule("falls","僅伊瓜蘇瀑布","none",[],"yes","無瘧疾傳播；仍屬黃熱病疫苗建議範圍。"),
    rule("amazon","Acre／Amapá／Amazonas／Rondônia／Roraima 州","medication",["ap","doxy","meflo"],"yes","包含州內城市及森林；其他亞馬遜地區不直接套用。"),
    rule("other","其他／不確定","unknown",[],"unknown","其他州、鄉村或跨州行程需再核對。"),
  ]},
  {...common,id:"HT",name:"海地",source:traveler("haiti"),resistance:"已查核資料未列抗藥性，可討論 Chloroquine；仍由醫師選藥。",season:"所有季節均需依官方地區建議評估。",je:false,typhoid:true,yfEntry:"conditional",yfMinAgeMonths:12,transitHours:null,regions:[rule("all","全境（包含 Labadee）","medication",["ap","doxy","meflo","chloro"],"no","瘧疾預防需求適用全境，仍需防蚊。") ]},
];
export function destinationById(id:string){return destinations.find(d=>d.id===id);}
export const transitCountries=[{value:"none",label:"沒有轉機"},{value:"risk",label:"已確認為黃熱病風險國家（請核對官方名單）"},{value:"nonrisk",label:"已確認不是黃熱病風險國家"},{value:"unknown",label:"未查核／不清楚"}];
