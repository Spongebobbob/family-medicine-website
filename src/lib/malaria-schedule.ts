import type { DrugId } from "./travel-data";
import { dateValue, shiftTravelDate } from "./travel-plan";

export type ExposureWindow={start:string;end:string};
export type MedicationCourse={start:string;lastExposure:string;lastDose:string;doseDates:string[];doses:number;tablets:number;calendarDays:number};
const day=86400000;
const iso=(n:number)=>new Date(n).toISOString().slice(0,10);
export function planMalariaSchedule(id:DrugId,windows:ExposureWindow[],asOf:string){
  if(dateValue(asOf)===null||!windows.length)return {error:"缺少有效日期或需用藥的暴露區段。"} as const;
  if(windows.some(w=>dateValue(w.start)===null||dateValue(w.end)===null||w.end<w.start))return {error:"暴露區段日期無效。"} as const;
  const weekly=id==="meflo"||id==="chloro",after=id==="ap"?7:28;
  const lead=id==="meflo"?14:id==="chloro"?7:1;
  const sorted=[...windows].sort((a,b)=>a.start.localeCompare(b.start));
  const courses:{start:string;lastExposure:string}[]=[];
  const weeklyEnd=(start:string,end:string)=>{
    // Four weekly doses strictly after the final exposure, always on the established weekday.
    const n=dateValue(start)!,exit=dateValue(end)!;
    return iso(n+(Math.floor((exit-n)/(7*day))+4)*7*day);
  };
  for(const w of sorted){
    const start=shiftTravelDate(w.start,-lead)!;
    if(dateValue(start)===null||dateValue(shiftTravelDate(w.end,after)!)===null)return {error:"服藥日期超出本工具支援範圍。"} as const;
    if(start<asOf)return {error:`${id==="meflo"?"Mefloquine 至少需提前 14 天":id==="chloro"?"Chloroquine 需提前 7 天":"每日預防藥至少需提前 1 天"}；本段準備時間不足，請立即洽旅遊醫學門診，不自動補服或改藥。`} as const;
    const prior=courses.at(-1);
    const priorEnd=prior?(weekly?weeklyEnd(prior.start,prior.lastExposure):shiftTravelDate(prior.lastExposure,after)!):null;
    // Merge overlapping/adjacent daily coverage; weekly coverage retains its original weekday.
    if(prior&&priorEnd&&dateValue(start)!<=dateValue(priorEnd)!+(weekly?7:1)*day){if(w.end>prior.lastExposure)prior.lastExposure=w.end;}
    else courses.push({start,lastExposure:w.end});
  }
  const result:MedicationCourse[]=courses.map(c=>{
    const lastDose=weekly?weeklyEnd(c.start,c.lastExposure):shiftTravelDate(c.lastExposure,after)!;
    const doseDates:string[]=[];
    for(let n=dateValue(c.start)!;n<=dateValue(lastDose)!;n+=(weekly?7:1)*day)doseDates.push(iso(n));
    return {...c,lastDose,doseDates,doses:doseDates.length,tablets:doseDates.length*(id==="chloro"?2:1),calendarDays:(dateValue(lastDose)!-dateValue(c.start)!)/day+1};
  });
  return {courses:result,weekly,totalDoses:result.reduce((n,c)=>n+c.doses,0),totalTablets:result.reduce((n,c)=>n+c.tablets,0),totalMedicationDays:result.reduce((n,c)=>n+c.doseDates.length,0),afterDays:after,leadDays:lead} as const;
}
