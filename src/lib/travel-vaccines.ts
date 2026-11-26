import { destinationById, travelEvidence } from "./travel-data";
import { dateValue, shiftTravelDate, travelDataCurrent, tripDays, validateTravel, yellowArrivalRisk, type TravelHealth, type TravelPlan, type TravelStop } from "./travel-plan";
export const vaccineNames={mmr:"MMR（麻疹、腮腺炎、德國麻疹）",tdap:"Td／Tdap（破傷風、白喉、百日咳）",varicella:"水痘",polio:"小兒麻痺",flu:"流感",covid:"COVID-19",hepb:"B 型肝炎",hepa:"A 型肝炎",typhoid:"傷寒",rabies:"狂犬病",je:"日本腦炎",yf:"黃熱病"} as const;
export type VaccineId=keyof typeof vaccineNames;
export type VaccineRecord="complete"|"partial"|"none"|"unknown";
export type TravelRecords={vaccines:Partial<Record<VaccineId,VaccineRecord>>;yfDate:string;icvp:"yes"|"no"|"unknown"};
export type VaccineItem={id:VaccineId;name:string;group:"routine"|"risk"|"entry";status:string;reason:string;timing:string;source:string;blocked:boolean};
export function yellowFeverSafety(h:TravelHealth){
  const contraindications:string[]=[],precautions:string[]=[];
  if(h.age*12<6)contraindications.push("未滿 6 個月為接種禁忌");
  else if(h.age*12<9)precautions.push("6–8 個月須專家個別衡量");
  if(h.age>=60)precautions.push("60 歲以上初次接種須評估嚴重不良反應風險");
  if(h.immune==="suppressed")contraindications.push("免疫抑制：活性黃熱病疫苗可能禁忌，須專科確認");
  else if(h.immune==="unknown")precautions.push("免疫狀態未確認");
  if(h.thymus==="yes")contraindications.push("與免疫功能異常相關的胸腺疾病屬禁忌");
  else if(h.thymus==="unknown")precautions.push("需核對胸腺疾病史");
  if(h.vaccineAllergy==="yes")contraindications.push("曾對黃熱病疫苗或其成分（例如蛋）嚴重過敏，需專科評估");
  else if(h.vaccineAllergy==="unknown")precautions.push("需確認嚴重過敏史");
  if(h.pregnant!=="no")precautions.push("懷孕或懷孕狀態不明，須個別風險效益評估");
  if(h.breastfeeding!=="no")precautions.push("哺乳或哺乳狀態不明，須個別評估");
  return {contraindications,precautions,blocked:contraindications.length>0};
}
export function yellowEntryRequirement(stop:TravelStop,previous:TravelStop[],age:number,asOf:string){
  const country=destinationById(stop.country);
  if(!country||!travelDataCurrent(asOf))return {status:"unknown" as const,reason:"國別要求未查核或快照已過期，請向官方／航空公司確認。"};
  if(country.yfEntry==="none")return {status:"not-listed" as const,reason:"已查核目的地未列黃熱病入境接種要求；轉機或後續國家的規定仍須另查。"};
  if(age*12<country.yfMinAgeMonths)return {status:"below-age" as const,reason:`未達此目的地已列證明年齡門檻（${country.yfMinAgeMonths} 個月），不等於適合接種或旅行。`};
  const arrival=yellowArrivalRisk(stop,previous);
  if(arrival==="yes")return {status:"required" as const,reason:"有從黃熱病風險國家抵達的路線條件，需備妥合規證明並核對實際入境規定。"};
  if(stop.transit==="risk"){
    if(stop.leftAirport==="yes")return {status:"required" as const,reason:"曾離開風險國家機場入境，須按來自風險國家的路線核對證明。"};
    if(country.transitHours!==null&&stop.transitHours!==null&&stop.transitHours>country.transitHours)return {status:"required" as const,reason:`風險國家機場轉機超過 ${country.transitHours} 小時，符合已列證明條件。`};
    if(country.transitHours===null||stop.transitHours===null||stop.leftAirport==="unknown")return {status:"unknown" as const,reason:"此轉機路線的適用規定尚不能確認；不能當作免證明。"};
  }
  if(arrival==="unknown"||stop.transit==="unknown")return {status:"unknown" as const,reason:"出發／轉機路線未確認，不能判定免證明。"};
  return {status:"not-triggered" as const,reason:"依已填路線未觸發此目的地黃熱病證明條件，仍須於出發前核對。"};
}
export function yellowCertificate(records:TravelRecords,entry:string){
  if(records.vaccines.yf!=="complete")return "需由合約旅遊醫學院所評估接種及核發 ICVP（黃皮書）。";
  if(records.yfDate&&dateValue(records.yfDate)===null)return "接種日期無效，請核對黃皮書。";
  if(records.yfDate){const valid=shiftTravelDate(records.yfDate,10)!;if(dateValue(valid)!>dateValue(entry)!)return `初次接種證明自 ${valid} 生效，晚於本段入境日期，請儘速詢問院所與主管機關。`;}
  return records.icvp==="yes"?"請攜帶原本有效黃皮書；有效證明原則上終身有效，不因原註記 10 年期而自動失效。":"接種過不等於已持有效入境證明，請核對接種日期、身分與黃皮書。";
}
export function assessTravelVaccines(plan:TravelPlan,h:TravelHealth,records:TravelRecords,asOf:string){
  if(dateValue(asOf)===null)return {error:"查核日期無效。"} as const;
  const error=validateTravel(plan,h);if(error)return {error} as const;
  if(!["yes","no","unknown"].includes(records.icvp)||Object.values(records.vaccines).some(v=>!["complete","partial","none","unknown"].includes(v)))return {error:"請核對疫苗紀錄選項。"} as const;
  if(records.yfDate&&(dateValue(records.yfDate)===null||dateValue(records.yfDate)!>dateValue(asOf)!))return {error:"黃熱病接種日期須為有效且不晚於今天的日期。"} as const;
  const items:VaccineItem[]=[];
  const departure=plan.stops[0].start;
  const leadDays=dateValue(asOf)===null?null:(dateValue(departure)!-dateValue(asOf)!)/86400000;
  const liveUnsafe=h.pregnant==="yes"||h.immune==="suppressed";
  const add=(id:VaccineId,group:VaccineItem["group"],reason:string,timing:string,source:string,blocked=false)=>{
    const record=records.vaccines[id]??"unknown";
    items.push({id,name:vaccineNames[id],group,reason,timing,source,blocked,status:blocked?"先由醫師評估禁忌／替代方案":record==="complete"?"已填完成，攜紀錄核對":record==="partial"?"尚未完成，核對補種":record==="none"?"未接種，與醫師討論": "紀錄不明，先核對"});
  };
  for(const id of ["mmr","tdap","varicella","polio","flu","covid","hepb"] as const){
    const live=id==="mmr"||id==="varicella";
    add(id,"routine",live&&liveUnsafe?"活性疫苗在懷孕／免疫抑制時需先確認禁忌，不自動建議補打。":"依年齡、台灣接種史及最近一劑紀錄核對，不能只以記得打過當作完整保護。",id==="mmr"?`若成人需要兩劑，通常至少間隔 28 天，完成後留 14 天；請盡早於 ${shiftTravelDate(departure,-42)} 前討論。`:id==="flu"?`通常保留約兩週，目標行前 ${shiftTravelDate(departure,-14)} 前評估。`:"由門診依製劑、年齡與既有紀錄排程，不自動重啟整套疫苗。",travelEvidence.routine.url,live&&liveUnsafe);
  }
  const current=travelDataCurrent(asOf);
  const countries=plan.stops.map(s=>destinationById(s.country));
  const unknown=!current||countries.some(c=>!c);
  if(current&&countries.some(Boolean)){
    add("hepa","risk",`${countries.filter(Boolean).map(c=>c!.name).join("、")}：A 肝依飲食與免疫紀錄討論；日本採風險活動個別衡量。${h.age<1?"未滿一歲須兒科核對早期劑次與常規系列。":""}${leadDays!==null&&leadDays<14&&(h.age>40||h.immune!=="normal")?"距出發少於兩週且年齡／免疫條件需注意，請醫師評估是否另加免疫球蛋白。":""}`,`盡早評估第一劑；行前兩週參考日 ${shiftTravelDate(departure,-14)}，時間不足仍應就診。`,travelEvidence.routine.url);
    if(countries.some(c=>c?.typhoid))add("typhoid","risk","已列目的地多建議評估傷寒疫苗，探親、鄉村及飲食衛生不易控制時尤其需要；仍須飲食飲水防護。",h.age<2?"未滿 2 歲的注射型 Vi 疫苗限制需由兒科核對。":`注射型 Vi 通常至少行前 2 週，參考日 ${shiftTravelDate(departure,-14)}；其他製劑由門診排程。`,travelEvidence.typhoid.url);
    if(plan.animalContact!=="no"||plan.remoteCare!=="no")add("rabies","risk",plan.animalContact==="yes"||plan.remoteCare==="yes"?"可能接觸動物或不易取得及時暴露後治療，建議討論暴露前接種。":"動物接觸與醫療可近性不明，先確認是否需暴露前接種。",`常見暴露前系列為第 0、7 天；若今天開始，第二劑參考 ${shiftTravelDate(asOf,7)}。被咬後仍須立即清洗、就醫及暴露後處置。`,travelEvidence.rabies.url);
    if(countries.some(c=>c?.je)){
      const total=plan.stops.filter(s=>destinationById(s.country)?.je).reduce((n,s)=>n+(tripDays(s)??0),0);
      const increased=total>=30||plan.frequentTravel==="yes"||plan.outdoorNights==="yes"||plan.stops.some(s=>destinationById(s.country)?.je&&s.setting!=="urban");
      if(increased||plan.frequentTravel==="unknown"||plan.outdoorNights==="unknown")add("je","risk",total>=30||plan.frequentTravel==="yes"?"赴日本腦炎暴露地區停留約一個月以上或經常往返，建議討論接種。":"鄉村、露營、夜間戶外或行程不明時，短期也須個別評估；須核對季節，不以國名一律推薦。","台灣可用製劑與既往兒童接種史不同，門診核對劑次及間隔；不自動套用美國 IXIARO 時程。",travelEvidence.je.url);
    }
  }
  const yfSafety=yellowFeverSafety(h);
  const entry=plan.stops.map((s,i)=>({stop:s,country:destinationById(s.country),...yellowEntryRequirement(s,plan.stops.slice(0,i),h.age,asOf),certificate:yellowCertificate(records,s.start)}));
  const yfExposure=plan.stops.map(s=>{const region=destinationById(s.country)?.regions.find(r=>r.id===s.region);return !region||(region.urbanOnly&&s.setting!=="urban")?"unknown":region.yellowFever;});
  const exposure=yfExposure.includes("yes");
  const unknownYf=yfExposure.some((value,i)=>value==="unknown"&&Boolean(countries[i]));
  const entryRequired=entry.some(e=>e.status==="required");
  if(current&&(exposure||unknownYf||entry.some(e=>e.country&&(e.status==="required"||e.status==="unknown"))))add("yf","risk",`${exposure?"已列區域建議評估黃熱病疫苗。":entryRequired?"本段路線有黃熱病證明條件，即使目的地未列感染風險接種建議，仍須核對黃皮書或替代方案。":"地區／入境條件未確認，需查核黃熱病需求。"}${[...yfSafety.contraindications,...yfSafety.precautions].join("；")}`,`初次接種後第 10 天證明才生效；最晚參考日 ${shiftTravelDate(departure,-10)}。有禁忌時須由合約院所評估醫療豁免或改變行程，豁免不保證入境。`,travelEvidence.yf.url,yfSafety.blocked);
  return {items,entry,yfSafety,unknown,leadDays,clinicBy:shiftTravelDate(departure,-28),liveSpacing:"需要活性疫苗時，由醫師安排同日或至少間隔 28 天；懷孕與免疫抑制者先核對禁忌。",checklist:["完整國家、城市、鄉村、海拔與轉機路線","出發／返國日期、探親與夜間戶外活動","疫苗紀錄與黃皮書原本","藥物清單、過敏、懷孕及免疫治療資料","海外醫療、保險與緊急聯絡／撤退計畫"]} as const;
}
