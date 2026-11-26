import type { DrugId } from "./travel-data";
export const malariaDrugEvidence={
  uk:"https://www.gov.uk/government/publications/malaria-prevention-guidelines-for-travellers-from-the-uk-2026/chemoprophylaxis",
  special:"https://www.gov.uk/government/publications/malaria-prevention-guidelines-for-travellers-from-the-uk-2026/special-risk-groups",
  taiwan:"https://www.cdc.gov.tw/Category/ListContent/mtLMDNb29h9iyKcJdj7uYA?uaid=ZSgu_4NoQ7NTp0zZ-HC8rg",
  brands:"https://www.hch.gov.tw/?aid=626&iid=1690&page_name=detail&pid=81",
  mefloSmPC:"https://www.medicines.org.uk/emc/product/13896/smpc",
  checked:"2026-11-26",version:"UKMEAG 2026；台灣商品名參照新竹臺大分院 115 年 4 月衛教",
};
export const malariaDrugInfo:Record<DrugId,{name:string;brand:string;dose:string;tablet:string;frequency:string;note:string;minimumWeight:number|null;brandVerified:boolean}>={
  ap:{name:"Atovaquone-proguanil",brand:"Malarone®（台灣院所資料列名）",dose:"Atovaquone 250mg＋Proguanil HCl 100mg，每日 1 次、每次 1 錠",tablet:"250mg／100mg 成人錠",frequency:"每日",note:"隨餐或牛奶服用；若服後一小時內嘔吐，立即依處方／藥師指示處理。",minimumWeight:40,brandVerified:true},
  doxy:{name:"Doxycycline",brand:"多喜黴素腸溶膠囊（台灣院所資料列名）",dose:"100mg，每日 1 次",tablet:"100mg／錠或膠囊",frequency:"每日",note:"配足量水；服後至少 30 分鐘不躺下，注意防曬。鐵、鈣、鎂、制酸劑及口服活性疫苗須由藥師安排間隔。",minimumWeight:null,brandVerified:true},
  meflo:{name:"Mefloquine",brand:"安保克瘧錠（台灣院所資料列名）",dose:"依 UKMEAG 成人參考：250mg mefloquine base，每週 1 次（英國參考規格 1 錠）",tablet:"英國每錠含 250mg base（相當於 274.09mg hydrochloride）；台灣商品不可直接以同數字等錠替換",frequency:"每週固定同一天",note:"行前至少 2 週開始（通常 2–3 週）；發生情緒、睡眠、平衡或神經症狀須立即就醫評估換藥，不自行停藥後繼續暴露。",minimumWeight:45,brandVerified:true},
  chloro:{name:"Chloroquine",brand:"台灣商品名尚未完成查核",dose:"英國參考：Chloroquine base 310mg，每週 1 次",tablet:"以英國 155mg base／錠估算，每次 2 錠；不是 Hydroxychloroquine",frequency:"每週固定同一天",note:"僅適用指引明列敏感地區；須核對鹽基／鹽類含量，不能以羥氯奎寧直接等錠數替換。",minimumWeight:null,brandVerified:false},
};
