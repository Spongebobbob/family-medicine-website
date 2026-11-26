import { assessUkMalariaStop } from "./malaria-guidance";
import { malariaDrugInfo } from "./malaria-drug-info";
import { planMalariaSchedule, type ExposureWindow } from "./malaria-schedule";
import { dateValue, shiftTravelDate, validateTravel, type TravelHealth, type TravelPlan } from "./travel-plan";
import type { TravelAnswer } from "./altitude";
import type { DrugId } from "./travel-data";

export const malariaNeedLabels={none:"不需要瘧疾預防藥物",bite:"一般不需要預防藥物，但須防蚊",individual:"特殊族群需個別評估",recommended:"建議服用瘧疾預防藥物",unknown:"資料不足，無法判定"} as const;
export type MalariaNeed=keyof typeof malariaNeedLabels;
export function assessMalariaNeed(plan:TravelPlan,health:TravelHealth,asOf:string){
  const error=validateTravel(plan,health);if(error||dateValue(asOf)===null)return {error:error??"評估日期無效。"} as const;
  const segments=plan.stops.map(s=>assessUkMalariaStop(s,health,plan,asOf));
  const unresolved=segments.some(s=>s.unresolved);
  const recommended=segments.some(s=>s.prophylaxis==="recommended");
  const individual=segments.some(s=>s.prophylaxis==="conditional"||((health.pregnant==="yes"||health.spleen==="yes"||health.immune==="suppressed")&&s.status!=="none"));
  const need:MalariaNeed=unresolved?"unknown":recommended?"recommended":individual?"individual":segments.every(s=>s.status==="none")?"none":"bite";
  const relevant=segments.filter(s=>s.prophylaxis==="recommended"||s.prophylaxis==="conditional");
  const allowed:DrugId[]=(["ap","doxy","meflo","chloro"] as DrugId[]).filter(id=>relevant.length>0&&relevant.every(s=>s.drugs.includes(id)));
  return {need,label:malariaNeedLabels[need],segments,allowed,unresolved,recommended,individual,canScreen:!unresolved&&relevant.length>0&&allowed.length>0} as const;
}
export type MalariaNeedResult=Exclude<ReturnType<typeof assessMalariaNeed>,{error:string}>;

// Inspect the actual dates in each stop: a seasonal highest-risk summary is not a medication window.
export function malariaExposureWindows(plan:TravelPlan,health:TravelHealth,asOf:string):ExposureWindow[]{
  if(validateTravel(plan,health)||dateValue(asOf)===null)return [];
  const windows:ExposureWindow[]=[];
  for(const stop of plan.stops){let current:ExposureWindow|null=null;
    for(let date=stop.start;date<=stop.end;date=shiftTravelDate(date,1)!){
      const s=assessUkMalariaStop({...stop,start:date,end:date},health,plan,asOf);
      if(!s.unresolved&&s.prophylaxis==="recommended"){if(current)current.end=date;else current={start:date,end:date};}
      else if(current){windows.push(current);current=null;}
    }
    if(current)windows.push(current);
  }
  return windows;
}

export type SafetyKey="pregnant"|"breastfeeding"|"renal"|"severeRenal"|"hepatic"|"psychiatric"|"seizures"|"cardiac"|"allergy"|"interactions"|"psoriasis"|"otherAllergyClear";
export type MalariaSafety=Record<SafetyKey,TravelAnswer>&{weight:number|null;allergyDrugs:DrugId[]};
export const emptyMalariaSafety=():MalariaSafety=>({pregnant:"unknown",breastfeeding:"unknown",renal:"unknown",severeRenal:"unknown",hepatic:"unknown",psychiatric:"unknown",seizures:"unknown",cardiac:"unknown",allergy:"unknown",interactions:"unknown",psoriasis:"unknown",otherAllergyClear:"unknown",allergyDrugs:[],weight:null});
export const malariaSafetyLabels:Record<SafetyKey,string>={
  pregnant:"目前懷孕、可能懷孕或正在計畫懷孕？",breastfeeding:"目前正在哺乳？",renal:"有腎臟病、透析或腎功能異常？",severeRenal:"醫師是否確認 CrCl <30 mL/min，或正在透析？",hepatic:"有肝臟疾病或肝功能異常？",psychiatric:"有憂鬱症、焦慮症、思覺失調或其他重大精神疾病病史？",seizures:"曾有癲癇或抽搐？",cardiac:"有心律不整、QT 延長、心臟傳導異常或其他心臟疾病？",allergy:"曾對抗瘧藥、四環黴素或相關藥物成分過敏？",interactions:"有其他用藥、保健品或近期口服活性疫苗，尚未由藥師核對交互作用？",psoriasis:"有乾癬病史？",otherAllergyClear:"已由醫師／藥師確認，其餘候選藥物沒有相關成分過敏？",
};
export type DrugPreference="shorter"|"daily"|"weekly";
export type PlannerCandidate={id:DrugId;status:"candidate"|"review"|"excluded"|"too_late";reasons:string[];rankReasons:string[];doseReady:boolean;schedule:ReturnType<typeof planMalariaSchedule>|null};

export function evaluateMalariaCandidates(plan:TravelPlan,health:TravelHealth,safety:MalariaSafety,asOf:string,preference:DrugPreference="shorter"){
  if(!Array.isArray(safety.allergyDrugs)||safety.allergyDrugs.some(id=>!["ap","doxy","meflo","chloro"].includes(id))||Object.keys(malariaSafetyLabels).some(key=>!["yes","no","unknown"].includes(safety[key as SafetyKey]))||(safety.weight!==null&&(!Number.isFinite(safety.weight)||safety.weight<=0||safety.weight>500))||!["shorter","daily","weekly"].includes(preference))return {error:"安全問答或體重無效，請重新核對。"} as const;
  const decision=assessMalariaNeed(plan,health,asOf);if("error"in decision)return {error:decision.error??"請核對行程。"} as const;
  const windows=malariaExposureWindows(plan,health,asOf);
  const generalSpecial=health.age<18||health.age>=70||health.spleen!=="no"||health.complexConditions!=="no"||health.immune!=="normal"||health.renal==="severe"||(health.crcl!==null&&health.crcl<30);
  const candidates:PlannerCandidate[]=(["ap","doxy","meflo","chloro"] as DrugId[]).map(id=>{
    const reasons:string[]=[],blocked:string[]=[];
    if(!decision.allowed.includes(id))return {id,status:"excluded",reasons:["NaTHNaC 未列為本行程共同候選；需分段用藥者由門診安排。"],rankReasons:[],doseReady:false,schedule:null};
    if(decision.need==="unknown"||decision.need==="none"||decision.need==="bite")return {id,status:"review",reasons:["尚未建立可用的地區用藥適應症。"],rankReasons:[],doseReady:false,schedule:null};
    const schedule=windows.length?planMalariaSchedule(id,windows,asOf):null;
    if(schedule&&"error"in schedule)return {id,status:"too_late",reasons:[schedule.error??"日期無效。"],rankReasons:[],doseReady:false,schedule:null};
    const ask=(key:SafetyKey,positive:string,contra=false)=>{if(safety[key]==="unknown")reasons.push(`尚未確認：${malariaSafetyLabels[key]}`);else if(safety[key]==="yes")(contra?blocked:reasons).push(positive);};
    const pregnant=health.pregnant==="yes"||safety.pregnant==="yes";
    if(pregnant){if(id==="doxy")blocked.push("懷孕／可能懷孕，不使用 Doxycycline 預防。");else reasons.push("懷孕者應避免前往瘧疾區；可能／計畫懷孕須專科評估，不自動套用成人方案。");}
    else if(safety.pregnant==="unknown")reasons.push("尚未確認懷孕／計畫懷孕狀態。");
    ask("breastfeeding","哺乳須核對母嬰狀況與替代選項，不自動建立成人方案。");
    ask("hepatic","肝病須核對嚴重度與藥物適用性。");
    if(safety.allergy==="unknown")reasons.push("尚未確認抗瘧藥或相關成分過敏史。");
    if(safety.allergy==="yes"){
      if(safety.allergyDrugs.includes(id))blocked.push("已選擇對此藥或相關成分過敏，不列為候選。");
      else if(!safety.allergyDrugs.length||safety.otherAllergyClear!=="yes")reasons.push("請確認過敏成分，並由醫師／藥師確認其餘候選的成分安全。");
    }
    ask("interactions","請攜完整藥單由醫師／藥師核對交互作用。");
    if((health.breastfeeding==="yes"||health.breastfeedingSmallInfant==="yes")&&safety.breastfeeding!=="yes")reasons.push("共用健康紀錄列哺乳中，請先確認紀錄與本次答案。");
    if((id==="meflo"||id==="chloro")&&health.conduction==="yes")reasons.push("共用健康紀錄有心臟傳導問題，須個別評估。");
    if(id==="chloro"&&health.psoriasis==="yes")reasons.push("共用健康紀錄有乾癬，須個別評估。");
    if(id==="meflo"&&health.psychiatric==="yes")blocked.push("共用健康紀錄列重大精神疾病病史：Mefloquine 不適用。");
    if((id==="meflo"||id==="chloro")&&health.seizures==="yes")blocked.push("共用健康紀錄列癲癇／抽搐病史，此藥不適用。");
    if(health.drugAllergy==="yes"&&safety.allergy!=="yes")reasons.push("共用健康紀錄有藥物過敏，須核對成分。");
    if(health.interactions==="yes"&&safety.interactions!=="yes")reasons.push("共用健康紀錄有尚待核對交互作用的用藥。");
    if(id==="ap"||id==="chloro"){
      ask("renal","腎功能異常須個別核對 CrCl、劑量及製劑。");
      if(id==="ap"&&((safety.renal==="yes"&&safety.severeRenal==="yes")||health.renal==="severe"||(health.crcl!==null&&health.crcl<30)))blocked.push("CrCl <30 或透析：AP 預防禁忌。");
      if(safety.renal==="yes"&&safety.severeRenal==="unknown")reasons.push("腎功能嚴重度尚未確認。");
    }
    if(id==="doxy"&&health.age<12)blocked.push("英國指引未滿 12 歲不使用 Doxycycline 預防。");
    if(id==="meflo"){
      ask("psychiatric","精神疾病病史：Mefloquine 不適用。",true);
      ask("seizures","癲癇／抽搐病史：Mefloquine 不適用。",true);
      ask("cardiac","心臟病／傳導問題：須改由門診評估 Mefloquine 適用性。");
    }
    if(id==="chloro"){
      ask("seizures","癲癇病史：Chloroquine 不適用。",true);
      ask("cardiac","心臟問題須核對 QT 與傳導安全。");ask("psoriasis","乾癬須個別評估，避免病情惡化。");
    }
    if((id==="ap"||id==="meflo")&&(safety.weight===null||!Number.isFinite(safety.weight)||safety.weight<=0||safety.weight>500))reasons.push("請填有效體重（kg）。");
    if(id==="ap"&&safety.weight!==null&&safety.weight<5)blocked.push("未滿 5kg 不使用 AP 預防。");
    const minimum=malariaDrugInfo[id].minimumWeight;
    if(minimum!==null&&safety.weight!==null&&safety.weight<minimum)reasons.push(`未達本頁成人參考規格的 ${minimum}kg 門檻，須個別計量。`);
    if(generalSpecial)reasons.push("兒童、高齡、無脾臟、免疫抑制或複雜共病須個別評估，不自動套用成人劑量。");
    if(decision.need==="individual"||decision.individual)reasons.push("特殊族群須先由門診決定用藥及劑量。");
    const status=blocked.length?"excluded":reasons.length?"review":"candidate";
    const rankReasons=id==="ap"?["離開疫區後持續 7 天，返程療程較短。"]:id==="doxy"?["每日服用；離開疫區後持續 28 天。"]:["每週固定同一天服用；需較長行前準備。"];
    if(preference==="weekly"&&(id==="meflo"||id==="chloro"))rankReasons.unshift("符合偏好：每週服用。");
    if(preference==="daily"&&(id==="ap"||id==="doxy"))rankReasons.unshift("符合偏好：每日服用。");
    if(status==="candidate")rankReasons.push(schedule&&!("error"in schedule)&&schedule.courses[0].start===asOf?"標準起始日就是今天，需即日就診確認處方。":"準備時間符合本頁標準起始條件。");
    return {id,status,reasons:blocked.length?blocked:reasons,rankReasons,doseReady:status==="candidate"&&!!schedule,schedule:status==="candidate"?schedule:null};
  });
  const order:DrugId[]=preference==="weekly"?["meflo","chloro","ap","doxy"]:preference==="daily"?["ap","doxy","meflo","chloro"]:["ap","doxy","meflo","chloro"];
  const ready=candidates.filter(c=>c.status==="candidate").sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
  return {decision,candidates,ready,windows,preference,rankingNote:"排序僅依返程療程、服藥頻率與你選擇的偏好；不是官方第一線藥物排名，也不代表台灣即時供應。"} as const;
}
export type PlannerEvaluation=Exclude<ReturnType<typeof evaluateMalariaCandidates>,{error:string}>;
export function neededMalariaSafety(evaluation:PlannerEvaluation,safety:MalariaSafety){
  const usable=evaluation.candidates.filter(c=>c.status!=="excluded"&&c.status!=="too_late").map(c=>c.id);
  const keys:SafetyKey[]=usable.length?["pregnant","breastfeeding","hepatic","allergy","interactions"]:[];
  if(usable.some(id=>id==="ap"||id==="chloro"))keys.push("renal");
  if(safety.allergy==="yes")keys.push("otherAllergyClear");
  if(keys.includes("renal")&&safety.renal==="yes")keys.push("severeRenal");
  if(usable.includes("meflo"))keys.push("psychiatric","seizures","cardiac");
  if(usable.includes("chloro"))keys.push("seizures","cardiac","psoriasis");
  // Keep answered questions editable even when their answer excluded a drug.
  for(const key of Object.keys(malariaSafetyLabels) as SafetyKey[])if(safety[key]!=="unknown")keys.push(key);
  return {keys:[...new Set(keys)],weight:usable.includes("ap")||usable.includes("meflo")||safety.weight!==null};
}
