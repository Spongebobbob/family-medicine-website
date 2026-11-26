"use client";
import { useId, useState } from "react";
import { MalariaPlannerForm } from "./malaria-planner-form";
import { assessTravelVaccines, vaccineNames, type VaccineId, type VaccineRecord } from "@/lib/travel-vaccines";
import { TRAVEL_CHECKED } from "@/lib/travel-data";
import { FormField, ResultPanel } from "./assessment-form";
import { TravelPlanFields, travelChoices } from "./travel-plan-fields";
import { useTravelPlan } from "./travel-plan-provider";
import { useClientReady } from "./use-client-ready";
type VaccineResult=Exclude<ReturnType<typeof assessTravelVaccines>,{error:string}>;
function VaccineResults({result:r}:{result:VaccineResult}){
  return <section className="travel-results" aria-live="polite"><ResultPanel result={{value:"旅遊疫苗計畫",label:r.unknown?"有未查核國家／過期資料，僅列已確認建議與通用準備事項":"依紀錄、行程與健康狀況整理",message:`建議行前約 4 週諮詢，參考日期 ${r.clinicBy}。${r.leadDays!==null&&r.leadDays<28?"距出發已不足四週，仍應儘快就診，不自行放棄或趕打。":""}此為門診討論清單，不能視為接種處方或入境許可。`,visual:{tone:r.yfSafety.blocked?"caution":"neutral"}}}/>
    <h2>入境要求與黃皮書</h2><div className="travel-result-cards">{r.entry.map((e,i)=><article className="travel-result-card" key={i}><h3>{i+1}. {e.country?.name??"未查核目的地"}</h3><strong>{e.status==="required"?"有黃熱病證明要求條件":e.status==="unknown"?"入境條件尚待確認":e.status==="below-age"?"未達已列證明年齡門檻":"已填路線未列黃熱病證明要求"}</strong><p>{e.reason}</p>{(e.status==="required"||e.status==="unknown")&&<p>{e.certificate}</p>}{e.country&&<a className="text-link" href={e.country.source} target="_blank" rel="noopener noreferrer">查閱此目的地規定 ↗</a>}</article>)}</div>
    <h2>依暴露風險討論的疫苗</h2><div className="travel-result-cards">{r.items.filter(i=>i.group==="risk").map((item)=><article className="travel-result-card" key={item.id}><h3>{item.name}</h3><strong>{item.status}</strong><p>{item.reason}</p><p>{item.timing}</p><a className="text-link" href={item.source} target="_blank" rel="noopener noreferrer">臨床來源 ↗</a></article>)}</div>
    {r.items.every(i=>i.group!=="risk")&&<p>目前沒有足夠的已查核目的地資料可產生特定旅遊疫苗建議，請攜行程至門診。</p>}
    <details className="travel-details"><summary>例行補種疫苗（{r.items.filter(i=>i.group==="routine").length} 項紀錄核對）</summary><div className="travel-result-cards">{r.items.filter(i=>i.group==="routine").map(item=><article className="travel-result-card" key={item.id}><h3>{item.name}</h3><strong>{item.status}</strong><p>{item.reason}</p><p>{item.timing}</p></article>)}</div><p>{r.liveSpacing}</p></details>
    <details className="travel-details"><summary>行前門診準備清單</summary><ul>{r.checklist.map(item=><li key={item}>{item}</li>)}</ul><p>本頁不涵蓋所有地區的流行性腦脊髓膜炎、小兒麻痺及其他即時入境規定，請同步查閱官方及航空公司最新資訊。</p><p>所有臨床規則仍待醫師審閱；資料查核 {TRAVEL_CHECKED}。</p></details>
  </section>;
}
export function TravelHealthForm({kind}:{kind:"malaria"|"vaccines"}){
  return kind==="malaria"?<MalariaPlannerForm/>:<TravelVaccineForm/>;
}
function TravelVaccineForm(){
  const ready=useClientReady(),id=useId();const {plan,health,records,setRecords,clear}=useTravelPlan();
  const [vaccines,setVaccines]=useState<VaccineResult|null>(null),[error,setError]=useState("");
  const changed=()=>{setVaccines(null);setError("");};
  return <>
    <form autoComplete="off" onSubmit={e=>{e.preventDefault();changed();const asOf=new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Taipei"});const r=assessTravelVaccines(plan,health,records,asOf);if("error"in r)setError(r.error??"請核對資料");else setVaccines(r);}}>
      <fieldset className="ready-fieldset" disabled={!ready} aria-label="旅遊疫苗行程輸入">
        <TravelPlanFields onChange={changed} kind="vaccines"/>
        {<details className="travel-details"><summary>疫苗紀錄（不填即保留未知）</summary><div className="assessment-fields">{(Object.entries(vaccineNames) as [VaccineId,string][]).map(([key,label])=><FormField key={key} prefix={id} field={{key,label,choices:[{value:"unknown",label:"不清楚／尚未查紀錄"},{value:"none",label:"未接種"},{value:"partial",label:"接種過，未完成或時效需確認"},{value:"complete",label:"已有完整／目前有效紀錄"}]}} value={records.vaccines[key]??"unknown"} onChange={value=>{setRecords(old=>({...old,vaccines:{...old.vaccines,[key]:value as VaccineRecord}}));changed();}}/>)}</div>
          <div className="assessment-fields"><div className="assessment-field"><label htmlFor={`${id}-yf-date`}>黃熱病接種日期（依黃皮書，選填）</label><input id={`${id}-yf-date`} type="date" value={records.yfDate} onChange={e=>{setRecords(old=>({...old,yfDate:e.target.value}));changed();}}/></div><FormField prefix={id} field={{key:"icvp",label:"持有有效國際預防接種證明書（黃皮書）？",choices:travelChoices}} value={records.icvp} onChange={value=>{setRecords(old=>({...old,icvp:value as typeof old.icvp}));changed();}}/></div>
        </details>}
        {error&&<p className="form-error" role="alert">{error}</p>}
        <div className="calculator-actions"><button type="submit" className="button">建立旅遊疫苗清單</button><button type="button" className="text-link" onClick={()=>{clear();changed();}}>清除共用行程與健康輸入</button></div>
      </fieldset>
    </form>
    {vaccines&&<VaccineResults result={vaccines}/>}
    {!vaccines&&<ResultPanel result={null}/>}
  </>;
}
