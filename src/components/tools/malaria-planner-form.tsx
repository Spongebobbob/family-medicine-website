"use client";
import { useEffect, useId, useRef, useState } from "react";
import { malariaCountries, malariaCountryById, malariaCoverage, malariaRiskLabels, cdcMalariaComparison, taiwanMalariaComparison } from "@/lib/malaria-guidance";
import { assessMalariaNeed, defaultMalariaSafety, emptyMalariaSafety, evaluateMalariaCandidates, neededMalariaSafety, malariaSafetyLabels, type DrugPreference, type MalariaNeedResult, type MalariaSafety, type SafetyKey } from "@/lib/malaria-planner";
import { malariaDrugInfo, malariaDrugEvidence } from "@/lib/malaria-drug-info";
import { newTravelStop, type TravelHealth, type TravelStop } from "@/lib/travel-plan";
import type { DrugId } from "@/lib/travel-data";
import { CountryPicker } from "./country-picker";
import { FormField } from "./assessment-form";
import { useTravelPlan } from "./travel-plan-provider";
import { useClientReady } from "./use-client-ready";

const healthOptions=[{key:"pregnant",label:"懷孕或可能懷孕"},{key:"immune",label:"免疫抑制或相關治療"},{key:"spleen",label:"無脾臟或脾功能低下"},{key:"complexConditions",label:"多種或複雜慢性疾病"},{key:"longTermVfr",label:"長期探親訪友"}] as const;
const answers=[{value:"no",label:"否"},{value:"yes",label:"是"},{value:"unknown",label:"不確定"}];
function ProfessionalInfo({decision}:{decision:MalariaNeedResult}){
  return <details className="travel-details malaria-professional"><summary>專業資訊：判斷規則、來源與差異</summary>
    {decision.segments.map((s,i)=>{const cdc=cdcMalariaComparison(s.stop),tw=taiwanMalariaComparison(s.stop.country);return <article key={i}><h3>{i+1}. {s.country?.name??"未查核國家"}・{s.region?.name??"未查核地區"}</h3><p>{malariaRiskLabels[s.status]}；{s.reason}</p><p>{s.season}</p><p>{s.country?.version}；查核 {s.country?.checked??"尚未查核"}。{s.country?.mapConsistency==="consistent"?"已核對圖文範圍。":"尚未完成逐區圖文比對，僅依明列文字。"}</p><h4>CDC（獨立比較）</h4><p>{cdc.risk}</p><p>{cdc.recommendation}</p><a href={cdc.source} target="_blank" rel="noopener noreferrer">CDC 原文 ↗</a><h4>台灣疾管署（獨立比較）</h4><p>{tw.risk}</p><p>{tw.recommendation}</p><a href={tw.source} target="_blank" rel="noopener noreferrer">台灣疾管署原文 ↗</a></article>;})}
    <p>全球目錄 {malariaCoverage.inventory} 頁；{malariaCoverage.structured} 頁有結構化規則，{malariaCoverage.pending} 頁保留未知。全部 pending 醫師審閱。原圖未確認重製／嵌入授權，僅外連。</p>
    <p>商品名查核 {malariaDrugEvidence.checked}，來源為台灣院所公開衛教；不代表目前供應或價格。成人劑量依 UKMEAG；台灣製劑仍須核對每錠含量與鹽基標示。G6PD 缺乏不是這四種藥物的一律禁忌；Primaquine／Tafenoquine 不納入自動候選。</p>
    <ul><li><a href={malariaDrugEvidence.uk} target="_blank" rel="noopener noreferrer">UKMEAG 2026 預防藥物與成人參考劑量 ↗</a></li><li><a href={malariaDrugEvidence.special} target="_blank" rel="noopener noreferrer">UKMEAG 特殊族群 ↗</a></li><li><a href={malariaDrugEvidence.brands} target="_blank" rel="noopener noreferrer">新竹臺大分院：台灣院所商品名來源 ↗</a></li><li><a href={malariaDrugEvidence.taiwan} target="_blank" rel="noopener noreferrer">台灣疾管署：預防藥物 ↗</a></li></ul>
  </details>;
}
export function MalariaPlannerForm(){
  const decisionRef=useRef<HTMLElement>(null),screenRef=useRef<HTMLFormElement>(null),optionsRef=useRef<HTMLElement>(null);
  const id=useId(),ready=useClientReady();const {plan,setPlan,health,setHealth,clear}=useTravelPlan();
  const [decision,setDecision]=useState<MalariaNeedResult|null>(null),[asOf,setAsOf]=useState("");
  const [screening,setScreening]=useState(false),[screened,setScreened]=useState(false),[safety,setSafety]=useState<MalariaSafety>(emptyMalariaSafety),[preference,setPreference]=useState<DrugPreference>("shorter"),[selected,setSelected]=useState<DrugId|null>(null),[error,setError]=useState("");
  useEffect(()=>{if(decision){decisionRef.current?.focus({preventScroll:true});decisionRef.current?.scrollIntoView({block:"start",behavior:"smooth"});}},[decision]);
  useEffect(()=>{if(screening)screenRef.current?.scrollIntoView({block:"start",behavior:"smooth"});},[screening]);
  useEffect(()=>{if(screened){optionsRef.current?.focus({preventScroll:true});optionsRef.current?.scrollIntoView({block:"start",behavior:"smooth"});}},[screened]);
  const invalidate=()=>{setDecision(null);setScreening(false);setScreened(false);setSelected(null);setError("");setSafety(emptyMalariaSafety());};
  const updateStop=(index:number,patch:Partial<TravelStop>)=>{setPlan(old=>({...old,stops:old.stops.map((s,i)=>i===index?{...s,...patch}:s)}));invalidate();};
  const updateHealth=(patch:Partial<TravelHealth>)=>{setHealth(old=>({...old,...patch}));invalidate();};
  const evaluation=decision?evaluateMalariaCandidates(plan,health,safety,asOf,preference):null;
  const evaluated=evaluation&&!("error"in evaluation)?evaluation:null;
  const required=evaluated?neededMalariaSafety(evaluated,safety):{keys:[],weight:false};
  const chosen=screened&&evaluated?evaluated.ready.find(c=>c.id===selected)??evaluated.ready[0]:null;
  const chosenSchedule=chosen?.schedule&&!("error"in chosen.schedule)?chosen.schedule:null;
  const changeSafety=(key:SafetyKey,value:MalariaSafety[SafetyKey])=>{setSafety(old=>{const next={...old,[key]:value};const result=evaluateMalariaCandidates(plan,health,next,asOf,preference);if(!("error"in result))for(const added of neededMalariaSafety(result,next).keys)if(!required.keys.includes(added)&&next[added]==="unknown")next[added]="no";return next;});setScreened(false);setSelected(null);};
  return <div className="malaria-planner">
    <form autoComplete="off" onSubmit={e=>{e.preventDefault();const date=new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Taipei"});const result=assessMalariaNeed(plan,health,date);setAsOf(date);setScreening(false);setScreened(false);setSelected(null);if("error"in result){setError(result.error??"請核對行程。");setDecision(null);}else{setError("");setDecision(result);}}}>
      <fieldset className="ready-fieldset" disabled={!ready} aria-label="瘧疾預防行程輸入">
        <h2 className="malaria-step">1．你要去哪裡？</h2>
        {plan.stops.map((stop,index)=>{const country=malariaCountryById(stop.country),region=country?.regions.find(r=>r.id===stop.region);return <fieldset className="malaria-stop" key={index}><legend>{plan.stops.length>1?`第 ${index+1} 段行程`:"旅遊行程"}</legend><div className="assessment-fields">
          <CountryPicker choices={[...malariaCountries.map(c=>({value:c.id,label:c.name,searchText:c.slug.replaceAll("-"," ")})),{value:"OTHER",label:"其他／尚未查核國家",searchText:"other unknown"}]} value={stop.country} onChange={value=>updateStop(index,{country:value,region:"",setting:"unknown",minAltitude:null})}/>
          <FormField prefix={`${id}-${index}`} field={{key:"region",label:"實際到訪地區",choices:[...(country?.regions.map(r=>({value:r.id,label:r.name}))??[]),{value:"unverified",label:"其他地區／不確定"}]}} value={stop.region} onChange={value=>updateStop(index,{region:value,setting:"unknown",minAltitude:null})}/>
          <div className="assessment-field"><label htmlFor={`${id}-arrive-${index}`}>抵達日期</label><input id={`${id}-arrive-${index}`} type="date" required value={stop.start} onChange={e=>updateStop(index,{start:e.target.value})}/></div>
          <div className="assessment-field"><label htmlFor={`${id}-leave-${index}`}>離開日期</label><input id={`${id}-leave-${index}`} type="date" required value={stop.end} onChange={e=>updateStop(index,{end:e.target.value})}/></div>
          {region?.urbanOnly&&<FormField prefix={`${id}-${index}`} field={{key:"urban",label:"這段行程是否只在上述市區／明列區域內？",choices:[{value:"urban",label:"是，只在上述範圍"},{value:"mixed",label:"否，會前往郊外或跨區"},{value:"unknown",label:"不確定"}]}} value={stop.setting} onChange={value=>updateStop(index,{setting:value as TravelStop["setting"]})}/>}
          {(region?.above!==undefined||region?.below!==undefined)&&<FormField prefix={`${id}-${index}`} field={{key:"altitude",label:"所有到訪地點的最低海拔",unit:"m",min:-500,max:9000,hint:"這個地區的瘧疾規則會受海拔影響。"}} value={stop.minAltitude===null?"":String(stop.minAltitude)} onChange={value=>updateStop(index,{minAltitude:value.trim()?Number(value):null})}/>}
        </div>{country&&<p className="malaria-map-link"><a className="text-link" href={country.mapUrls[0]??country.source+"#Malaria"} target="_blank" rel="noopener noreferrer">查看官方 NaTHNaC 瘧疾風險地圖 ↗</a></p>}{region?.months&&<p className="field-hint">會依抵達與離開日期自動核對傳播季節。</p>}{index>0&&<button className="text-link" type="button" onClick={()=>{setPlan(old=>({...old,stops:old.stops.filter((_,i)=>i!==index)}));invalidate();}}>刪除此段行程</button>}</fieldset>;})}
        <button className="text-link" type="button" disabled={plan.stops.length>=8} onClick={()=>{setPlan(old=>({...old,stops:[...old.stops,newTravelStop()]}));invalidate();}}>＋ 新增行程</button>
        <div className="assessment-fields malaria-basic-age"><FormField prefix={id} field={{key:"age",label:"年齡",unit:"歲",min:0,max:120}} value={Number.isFinite(health.age)?String(health.age):""} onChange={value=>updateHealth({age:value.trim()?Number(value):NaN})}/></div>
        <fieldset className="travel-health-checks"><legend>健康情況（可複選）</legend><p className="field-hint">未勾選表示否。</p>{healthOptions.map(({key,label})=><label className="travel-health-check" key={key}><input type="checkbox" checked={key==="immune"?health.immune==="suppressed":health[key]==="yes"} onChange={e=>updateHealth({[key]:key==="immune"?(e.target.checked?"suppressed":"normal"):(e.target.checked?"yes":"no")})}/><span>{label}{health[key]==="unknown"?"（尚未確認）":""}</span></label>)}<label className="travel-health-check"><input type="checkbox" checked={healthOptions.some(({key})=>health[key]==="unknown")} onChange={e=>{const uncertain=e.target.checked;updateHealth(Object.fromEntries(healthOptions.map(({key})=>[key,uncertain?(health[key]==="yes"||health[key]==="suppressed"?health[key]:"unknown"):(health[key]==="unknown"?(key==="immune"?"normal":"no"):health[key])])));}}/><span>健康狀況不清楚／尚未確認</span></label></fieldset>
        {error&&<p className="form-error" role="alert">{error}</p>}<div className="calculator-actions"><button className="button" type="submit">查看是否需要預防藥</button><button type="button" className="text-link" onClick={()=>{clear();invalidate();}}>清除輸入</button></div>
      </fieldset>
    </form>
    {decision&&<section ref={decisionRef} tabIndex={-1} className="malaria-decision" data-need={decision.need} aria-live="polite"><p className="malaria-kicker">地區指引結論</p><h2>{decision.label}</h2><p>{decision.need==="recommended"?"NaTHNaC 對至少一段行程建議使用預防藥；個人適用性尚待安全篩檢。":decision.need==="none"?"已確認的明列區域無瘧疾風險；仍須防範其他蚊媒疾病。":decision.need==="bite"?"一般旅客在這些明列區域不例行使用預防藥，做好防蚊並留意發燒。":decision.need==="individual"?"你的族群或健康條件需要旅遊醫學門診評估，不自動決定是否服藥。":decision.recommended?"已有一段行程建議用藥，但其他區段仍未知，不能制定完整方案。":"請先確認地區、必要海拔或官方最新資料；未知不代表無風險。"}</p><p className="field-hint">NaTHNaC／UKMEAG 2026・待醫師審閱</p>
      {decision.unresolved&&<ul>{decision.segments.map((s,i)=>s.unresolved&&<li key={i}>第 {i+1} 段・{s.country?.name??"未確認國家"}：{s.reason}</li>)}</ul>}
      {decision.canScreen&&!screening&&<button type="button" className="button" onClick={()=>{setSafety(defaultMalariaSafety(plan,health,asOf));setScreening(true);setScreened(false);}}>繼續：一次完成用藥安全問答</button>}
      {(decision.need==="recommended"||decision.need==="individual")&&!decision.canScreen&&<p>目前沒有可確認涵蓋全程的共同候選藥物，請帶完整行程至門診分段評估。</p>}
    </section>}
    {screening&&evaluated&&<form ref={screenRef} className="malaria-screening" autoComplete="off" onSubmit={e=>{e.preventDefault();setScreened(true);setSelected(evaluated.ready[0]?.id??null);}}><fieldset className="ready-fieldset" disabled={!ready}><h2 className="malaria-step">2．用藥安全問答</h2><p className="field-hint">預設為「否」，請依實際情況修改。</p>
      {required.weight&&<FormField prefix={`${id}-safety`} field={{key:"weight",label:"體重（不清楚可留白）",unit:"kg",min:.1,max:500,optional:true}} value={safety.weight===null?"":String(safety.weight)} onChange={value=>{setSafety(old=>({...old,weight:value.trim()?Number(value):null}));setScreened(false);setSelected(null);}}/>}
      <div className="malaria-safety-questions">{required.keys.map(key=><fieldset className="malaria-answer" key={key}><legend>{malariaSafetyLabels[key]}</legend><div>{answers.map(answer=><label key={answer.value}><input type="radio" name={`${id}-${key}`} checked={safety[key]===answer.value} onChange={()=>changeSafety(key,answer.value as MalariaSafety[SafetyKey])}/><span>{answer.label}</span></label>)}</div>{key==="allergy"&&safety.allergy==="yes"&&<div className="malaria-allergy-list">{decision?.allowed.map(drug=><label key={drug}><input type="checkbox" checked={safety.allergyDrugs.includes(drug)} onChange={e=>{setSafety(old=>({...old,allergyDrugs:e.target.checked?[...old.allergyDrugs,drug]:old.allergyDrugs.filter(d=>d!==drug)}));setScreened(false);setSelected(null);}}/><span>{malariaDrugInfo[drug].name}{drug==="doxy"?"／四環黴素類":drug==="meflo"?"／Quinine／Quinidine":"／相關成分"}</span></label>)}</div>}</fieldset>)}</div>
      <FormField prefix={`${id}-safety`} field={{key:"preference",label:"服藥偏好",choices:[{value:"shorter",label:"優先比較返程療程較短的選項"},{value:"daily",label:"偏好每日服用"},{value:"weekly",label:"偏好每週服用"}]}} value={preference} onChange={value=>{setPreference(value as DrugPreference);setSelected(null);}}/>
      <button className="button" type="submit">查看候選藥物與時程</button>
    </fieldset></form>}
    {screened&&evaluated&&<section ref={optionsRef} tabIndex={-1} className="malaria-options" aria-live="polite"><h2>可優先與醫師討論的候選藥物</h2><p className="field-hint">{evaluated.rankingNote}</p>
      {evaluated.ready.length===0&&<div className="malaria-review"><h3>目前沒有通過本頁全部篩檢的候選</h3><p>{evaluated.candidates.some(c=>c.status==="review")?"請完成下方列出的必要確認，或帶資料至旅遊醫學門診個別評估。":"目前候選均受禁忌或準備時間限制，請立即向旅遊醫學門診確認替代方案。"}</p><ul>{[...new Set(evaluated.candidates.filter(c=>c.status==="review").flatMap(c=>c.reasons))].map(reason=><li key={reason}>{reason}</li>)}</ul></div>}
      {evaluated.ready.length>0&&<div className="malaria-candidate-list">{evaluated.ready.map((candidate,index)=><button type="button" key={candidate.id} className="malaria-candidate" aria-pressed={chosen?.id===candidate.id} onClick={()=>setSelected(candidate.id)}><span className="malaria-kicker">{index===0?"優先討論":"其他合適替代"}</span><strong>{malariaDrugInfo[candidate.id].name}</strong><span>{candidate.rankReasons.join(" ")}</span><span>{chosen?.id===candidate.id?"已選擇此候選":"查看此候選的服藥計畫"}</span></button>)}</div>}
      {chosen&&chosenSchedule&&<article className="malaria-medication-plan"><h2>{malariaDrugInfo[chosen.id].name} 服藥計畫</h2><p>{malariaDrugInfo[chosen.id].brand}</p><p><strong>成人標準參考：{malariaDrugInfo[chosen.id].dose}</strong></p><p className="field-hint">{malariaDrugInfo[chosen.id].tablet}。商品與目前供應須由院所確認。</p><div className="malaria-quantity"><div><strong>{chosenSchedule.totalDoses}</strong><span>{chosenSchedule.weekly?"次服藥":"個服藥日"}</span></div><div><strong>{chosenSchedule.totalTablets}</strong><span>預估錠／膠囊數</span></div></div>
        {chosenSchedule.courses.map((course,index)=><section className="malaria-course" key={course.start}><h3>{chosenSchedule.courses.length>1?`第 ${index+1} 段療程`:"服藥時程"}</h3><ol><li><strong>{course.start}</strong><span>開始服藥（{malariaDrugInfo[chosen.id].frequency}）</span></li><li><strong>{course.lastExposure}</strong><span>最後暴露日</span></li><li><strong>{course.lastDose}</strong><span>最後服藥日</span></li></ol>{chosenSchedule.weekly&&<details><summary>每週固定服藥日期（{course.doses} 次）</summary><p>{course.doseDates.join("、")}</p><p>最後暴露後接續四次每週劑量，維持原本星期；不是每天服用。</p></details>}</section>)}
        <p>{malariaDrugInfo[chosen.id].note}</p><p className="field-hint">離開日仍計入暴露；預估數量以本頁參考規格計算。此為待醫師確認的預防計畫，非處方，不能用於治療發燒、補服或自行換藥。</p>
      </article>}
      {evaluated.candidates.some(c=>c.status!=="candidate")&&<details className="travel-details"><summary>未列入候選的藥物</summary>{evaluated.candidates.filter(c=>c.status!=="candidate").map(candidate=><div key={candidate.id}><h3>{malariaDrugInfo[candidate.id].name}・{candidate.status==="too_late"?"準備時間不足":candidate.status==="excluded"?"不適用於此方案":"關鍵條件待確認"}</h3><p>{candidate.reasons[0]}</p>{candidate.reasons.length>1&&<details><summary>詳細原因</summary><ul>{candidate.reasons.slice(1).map(reason=><li key={reason}>{reason}</li>)}</ul></details>}</div>)}</details>}
    </section>}
    {decision&&<ProfessionalInfo decision={decision}/>}
  </div>;
}
