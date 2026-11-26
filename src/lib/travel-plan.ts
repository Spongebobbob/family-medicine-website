import type { TravelAnswer } from "./altitude";
import { destinationById, TRAVEL_CHECKED, TRAVEL_VALID_DAYS, type TravelSetting } from "./travel-data";
export type TravelStop={country:string;region:string;start:string;end:string;setting:TravelSetting;minAltitude:number|null;fromRisk:TravelAnswer;transit:"none"|"risk"|"nonrisk"|"unknown";transitHours:number|null;leftAirport:TravelAnswer};
export type TravelPlan={stops:TravelStop[];animalContact:TravelAnswer;remoteCare:TravelAnswer;frequentTravel:TravelAnswer;outdoorNights:TravelAnswer};
export type TravelHealth={age:number;weight:number|null;pregnant:TravelAnswer;breastfeedingSmallInfant:TravelAnswer;renal:"normal"|"severe"|"unknown";crcl:number|null;psychiatric:TravelAnswer;seizures:TravelAnswer;conduction:TravelAnswer;psoriasis:TravelAnswer;drugAllergy:TravelAnswer;interactions:TravelAnswer;g6pd:"normal"|"deficient"|"unknown";immune:"normal"|"suppressed"|"unknown";thymus:TravelAnswer;vaccineAllergy:TravelAnswer;breastfeeding:TravelAnswer};
export const emptyHealth:TravelHealth={age:NaN,weight:null,pregnant:"unknown",breastfeedingSmallInfant:"unknown",renal:"unknown",crcl:null,psychiatric:"unknown",seizures:"unknown",conduction:"unknown",psoriasis:"unknown",drugAllergy:"unknown",interactions:"unknown",g6pd:"unknown",immune:"unknown",thymus:"unknown",vaccineAllergy:"unknown",breastfeeding:"unknown"};
export function newTravelStop():TravelStop{return {country:"",region:"",start:"",end:"",setting:"unknown",minAltitude:null,fromRisk:"unknown",transit:"unknown",transitHours:null,leftAirport:"unknown"};}
export function dateValue(value:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const n=Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(n)&&value>="1900-01-01"&&value<="2100-12-31"&&new Date(n).toISOString().slice(0,10)===value?n:null;
}
export function shiftTravelDate(value:string,days:number){const n=dateValue(value);return n===null||!Number.isInteger(days)?null:new Date(n+days*86400000).toISOString().slice(0,10);}
export function tripDays(stop:TravelStop){const a=dateValue(stop.start),b=dateValue(stop.end);return a===null||b===null||b<a?null:(b-a)/86400000+1;}
export function travelDataCurrent(asOf:string){const now=dateValue(asOf),checked=dateValue(TRAVEL_CHECKED)!;return now!==null&&now>=checked&&now-checked<=TRAVEL_VALID_DAYS*86400000;}
const answer=(a:string)=>["yes","no","unknown"].includes(a);
export function validateTravel(plan:TravelPlan,health:TravelHealth){
  if(!plan.stops.length||plan.stops.length>8)return "請填 1–8 段行程。";
  if(!Number.isFinite(health.age)||health.age<0||health.age>120)return "請填有效年齡（0–120 歲）。";
  if(health.weight!==null&&(!Number.isFinite(health.weight)||health.weight<=0||health.weight>500))return "請核對體重。";
  if(health.crcl!==null&&(!Number.isFinite(health.crcl)||health.crcl<0||health.crcl>500))return "請核對 CrCl 數值。";
  for(const key of ["pregnant","breastfeedingSmallInfant","psychiatric","seizures","conduction","psoriasis","drugAllergy","interactions","thymus","vaccineAllergy","breastfeeding"] as const)if(!answer(health[key]))return "請選擇有效健康狀況。";
  if(!["normal","severe","unknown"].includes(health.renal)||!["normal","deficient","unknown"].includes(health.g6pd)||!["normal","suppressed","unknown"].includes(health.immune))return "請核對健康選項。";
  if(health.crcl!==null&&((health.renal==="normal"&&health.crcl<30)||(health.renal==="severe"&&health.crcl>=30)))return "CrCl 與腎功能選項不一致，請核對。";
  for(const key of ["animalContact","remoteCare","frequentTravel","outdoorNights"] as const)if(!answer(plan[key]))return "請核對活動選項。";
  for(let i=0;i<plan.stops.length;i++){
    const s=plan.stops[i];const days=tripDays(s);
    if(!s.country||!s.region||days===null||days>1096)return `請完成第 ${i+1} 段的國家、地區及正確日期（每段最多 3 年）。`;
    if(i>0&&dateValue(s.start)!<dateValue(plan.stops[i-1].end)!)return "行程須依日期排序；同日轉往下一國可填相同日期。";
    if(!["urban","rural","forest","mixed","unknown"].includes(s.setting)||!answer(s.fromRisk)||!answer(s.leftAirport)||!["none","risk","nonrisk","unknown"].includes(s.transit))return "請核對行程選項。";
    if(s.minAltitude!==null&&(!Number.isFinite(s.minAltitude)||s.minAltitude< -500||s.minAltitude>9000))return "最低海拔範圍為 -500–9000m。";
    if(s.transitHours!==null&&(!Number.isFinite(s.transitHours)||s.transitHours<0||s.transitHours>720))return "轉機停留時間請填 0–720 小時。";
  }
  return null;
}
export function yellowArrivalRisk(stop:TravelStop,priorStops:TravelStop[]):TravelAnswer{
  // IHR country-of-arrival rules can apply even when the visited city has low YF exposure.
  if(stop.fromRisk==="yes"||priorStops.some(s=>["BR","KE"].includes(s.country)))return "yes";
  if(stop.fromRisk==="unknown"||priorStops.some(s=>!destinationById(s.country)))return "unknown";
  return "no";
}
