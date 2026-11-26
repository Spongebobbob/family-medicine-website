import { destinationById, type DrugId, type MalariaStatus } from "./travel-data";
import { dateValue, shiftTravelDate, travelDataCurrent, tripDays, validateTravel, type TravelHealth, type TravelPlan, type TravelStop } from "./travel-plan";
export function assessMalariaStop(stop:TravelStop,asOf:string){
  const country=destinationById(stop.country),region=country?.regions.find(r=>r.id===stop.region);
  let status:MalariaStatus=region?.malaria??"unknown";
  let reason=region?.note??"尚未查證此國家／地區，不產生地區用藥建議。";
  if(!travelDataCurrent(asOf)){status="unknown";reason="資料快照已超過查核期限，需重新確認當地最新規定。";}
  else if(region?.urbanOnly&&stop.setting!=="urban"){status="unknown";reason="所選地區規則僅限市區觀光，與目前活動／跨區情況不符。";}
  else if(region?.altitudeRule){if(stop.minAltitude===null){status="unknown";reason="需要最低到訪海拔，不能以住宿或最高海拔代替。";}else if(stop.minAltitude>=2500){status="none";reason="本段所有到訪地點均在 2500m 以上；若會下降到較低地區需重新評估。";}}
  const firstMonth=Number(stop.start.slice(5,7)),lastMonth=Number(stop.end.slice(5,7));
  const months=firstMonth>=1&&firstMonth<=12&&lastMonth>=1&&lastMonth<=12?`本段 ${firstMonth}–${lastMonth} 月；`:"";
  return {stop,country,region,status,reason,days:tripDays(stop),drugs:status==="medication"?region!.drugs:[],season:months+(country?.season??"未查核，不能推測季節風險。"),resistance:country?.resistance??"未查核"};
}
export const malariaDrugs=[
  {id:"ap",name:"Atovaquone-proguanil",beforeMin:1,beforeMax:2,after:7,frequency:"每日",note:"隨食物服用；短程旅行返程後持續 7 天。"},
  {id:"doxy",name:"Doxycycline",beforeMin:1,beforeMax:2,after:28,frequency:"每日",note:"注意日曬、腸胃與食道刺激；鐵劑、制酸劑需由藥師安排間隔。"},
  {id:"meflo",name:"Mefloquine",beforeMin:14,beforeMax:null,after:28,frequency:"每週",note:"至少提前 2 週；精神疾病、癲癇或心臟傳導異常需特別核對。"},
  {id:"chloro",name:"Chloroquine",beforeMin:7,beforeMax:14,after:28,frequency:"每週",note:"僅限敏感地區；可加重乾癬，需核對心律與交互作用。"},
] as const;
export function malariaSchedule(drug:DrugId,entry:string,exit:string){
  const d=malariaDrugs.find(x=>x.id===drug);if(!d||dateValue(entry)===null||dateValue(exit)===null||dateValue(exit)!<dateValue(entry)!)return null;
  return {latestStart:shiftTravelDate(entry,-d.beforeMin)!,earliestStart:d.beforeMax===null?null:shiftTravelDate(entry,-d.beforeMax)!,continueThrough:shiftTravelDate(exit,d.after)!,frequency:d.frequency,afterDays:d.after};
}
export function compareMalariaDrug(id:DrugId,health:TravelHealth,allowed:DrugId[],geographyUnknown:boolean){
  const blocked:string[]=[],review:string[]=[];
  if(geographyUnknown)review.push("仍有未查證行程，不能確認全程適用");
  if(!allowed.includes(id)) {if(geographyUnknown)review.push("國家／地區或抗藥性仍待查證");else blocked.push("不在這份已確認行程的適用候選中");}
  if(health.pregnant==="yes"&&(id==="ap"||id==="doxy"))blocked.push(id==="doxy"?"懷孕期間不使用 Doxycycline 預防":"懷孕期間不建議 AP 預防");
  if(health.pregnant==="unknown")review.push("需確認懷孕可能性");
  if(id==="ap"){
    if(health.weight!==null&&health.weight<5)blocked.push("體重未滿 5kg 不建議 AP 預防");
    if(health.weight===null)review.push("需確認體重");else if(health.weight<11)review.push("5–<11kg 涉及美國標示外預防用途，需兒童專科核對台灣製劑");
    if(health.renal==="severe"||(health.crcl!==null&&health.crcl<30))blocked.push("CrCl <30 mL/min，AP 預防禁忌");
    else if(health.renal==="unknown"&&health.crcl===null)review.push("需確認腎功能／CrCl，不以 eGFR 直接代替");
    if(health.breastfeedingSmallInfant==="yes")blocked.push("哺乳且嬰兒 <5kg 不建議 AP 預防");
    else if(health.breastfeedingSmallInfant==="unknown")review.push("需核對哺乳與嬰兒體重");
  }
  if(id==="doxy"){
    if(health.age<8)blocked.push("未滿 8 歲不使用 Doxycycline 預防");
    if(health.breastfeeding!=="no")review.push("哺乳狀態或哺乳期使用須由醫師核對");
  }
  if(id==="meflo")for(const [key,label] of [["psychiatric","憂鬱症、廣泛性焦慮、精神病或其他重大精神疾病"],["seizures","癲癇／抽搐病史"],["conduction","心臟傳導異常"]] as const){
    if(health[key]==="yes")blocked.push(`${label}：Mefloquine 不適用／不建議`);else if(health[key]==="unknown")review.push(`需確認${label}`);
  }
  if(id==="chloro"){
    if(health.psoriasis!=="no")review.push("乾癬可能惡化或紀錄不明");
    if(health.conduction!=="no")review.push("需確認心律、QT 或傳導異常");
  }
  if(health.drugAllergy!=="no")review.push("需核對具體藥物過敏，不自行判定可用");
  if(health.interactions!=="no")review.push("需藥師核對現用藥、保健品及口服活性疫苗交互作用");
  if(health.age<18)review.push("兒童須依體重及可用製劑由醫師評估，本頁不給劑量");
  if(health.weight===null&&(id==="meflo"||id==="chloro"))review.push("需確認體重與劑型");
  return {id,status:blocked.length?"excluded" as const:review.length?"review" as const:"discuss" as const,blocked,review};
}
export function assessMalaria(plan:TravelPlan,health:TravelHealth,asOf:string){
  if(dateValue(asOf)===null)return {error:"查核日期無效。"} as const;
  const error=validateTravel(plan,health);if(error)return {error} as const;
  const segments=plan.stops.map(s=>assessMalariaStop(s,asOf));
  const unknown=segments.some(s=>s.status==="unknown"),risk=segments.filter(s=>s.status==="medication");
  const allowed=malariaDrugs.map(d=>d.id).filter(id=>risk.length>0&&risk.every(r=>r.drugs.includes(id)));
  const entry=risk[0]?.stop.start,exit=risk.at(-1)?.stop.end;
  return {segments,unknown,needsMedication:risk.length>0,days:(dateValue(plan.stops.at(-1)!.end)!-dateValue(plan.stops[0].start)!)/86400000+1,drugs:malariaDrugs.map(d=>{
    const comparison=compareMalariaDrug(d.id,health,allowed,unknown);
    let schedule=!unknown&&entry&&exit&&comparison.status!=="excluded"?malariaSchedule(d.id,entry,exit):null;
    if(schedule&&dateValue(schedule.latestStart)!<dateValue(asOf)!){comparison.review.push("已錯過標準起始日期，須由醫師處理；不適用自行延後開始或更換藥物");comparison.status="review";schedule=null;}
    return {...d,...comparison,schedule};
  }),g6pd:health.g6pd==="normal"?"Primaquine／Tafenoquine 仍須核對定量檢驗、適用族群與台灣可用性，本頁不自動推薦。":"G6PD 缺乏或未確認：不得自行使用 Primaquine／Tafenoquine；須先有定量 G6PD 檢驗。這不是將上述四種藥一律列為禁忌。"} as const;
}
export function malariaFeverAlert(fever:"yes"|"no"|"unknown"|""){return fever==="yes";}
