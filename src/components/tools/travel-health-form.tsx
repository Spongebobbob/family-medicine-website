"use client";
import { useId, useState } from "react";
import { assessMalaria } from "@/lib/travel-malaria";
import { assessTravelVaccines, vaccineNames, type VaccineId, type VaccineRecord } from "@/lib/travel-vaccines";
import { TRAVEL_CHECKED, travelEvidence } from "@/lib/travel-data";
import { FormField, ResultPanel } from "./assessment-form";
import { TravelPlanFields, travelChoices } from "./travel-plan-fields";
import { useTravelPlan } from "./travel-plan-provider";
import { useClientReady } from "./use-client-ready";
type MalariaResult=Exclude<ReturnType<typeof assessMalaria>,{error:string}>;
type VaccineResult=Exclude<ReturnType<typeof assessTravelVaccines>,{error:string}>;
function MalariaResults({result:r}:{result:MalariaResult}){
  return <section className="travel-results" aria-live="polite">
    <ResultPanel result={{value:r.unknown?"部分地區待確認":r.needsMedication?"需討論預防用藥":"以防蚊為主",label:r.unknown?"仍有未知區段，不能判定全程不需用藥":r.needsMedication?"至少一段行程符合官方預防藥評估條件":"已查核區段未列例行瘧疾預防藥需求",message:"以下是行前討論清單，非自動處方。防蚊與藥物都無法保證完全不感染。",visual:{tone:r.unknown?"neutral":r.needsMedication?"caution":"positive"},rows:[{label:"行程跨度",value:`${r.days} 天`},{label:"候選藥物篩檢",value:"需依台灣可用製劑及醫師處方確認"}]}}/>
    <h2>各段地區判斷</h2><div className="travel-result-cards">{r.segments.map((s,i)=><article className="travel-result-card" key={i}><h3>{i+1}. {s.country?.name??"未查核國家"}・{s.region?.name??"未查核地區"}</h3><strong>{({none:"此區未列瘧疾傳播",mosquito:"以防蚊為主",medication:"防蚊並討論預防藥",unknown:"需要進一步查核"})[s.status]}</strong><p>{s.reason}</p><p className="field-hint">{s.stop.start} 至 {s.stop.end}・{s.days} 天；{s.season}</p><details><summary>抗藥性與資料來源</summary><p>{s.resistance}</p>{s.country&&<a href={s.country.source} target="_blank" rel="noopener noreferrer">CDC {s.country.name} 原始資料 ↗</a>}<p>{s.country?.version}・查核 {s.country?.checked??TRAVEL_CHECKED}</p></details></article>)}</div>
    <h2>四種預防藥比較</h2><p className="field-hint">只比較需求、限制及標準時程，不提供劑量或處方。未完成篩檢不等於可以使用。</p>
    <div className="travel-result-cards">{r.drugs.map(d=><article className="travel-result-card" data-status={d.status} key={d.id}><h3>{d.name}</h3><strong>{d.status==="excluded"?"不列為本行程候選":d.status==="review"?"需進一步核對":"可帶至門診討論"}</strong>
      <p>{d.frequency}・進疫區前{d.beforeMax===null?`至少 ${d.beforeMin} 天`:` ${d.beforeMin}–${d.beforeMax} 天`}開始，離開後持續 {d.after} 天。</p>
      {d.schedule&&<dl className="result-rows"><div><dt>標準開始日期</dt><dd>{d.schedule.earliestStart?`${d.schedule.earliestStart} 至 ${d.schedule.latestStart}`:`最晚 ${d.schedule.latestStart}（至少提前兩週）`}</dd></div><div><dt>離開疫區後涵蓋至</dt><dd>{d.schedule.continueThrough}</dd></div></dl>}
      {d.schedule&&<p className="field-hint">以首個至最後一個已確認疫區區段連續涵蓋；每週用藥的實際最後一劑由醫師依固定服藥日排定。換藥或未依標準時程開始者不適用。</p>}
      {d.blocked.length>0&&<ul>{d.blocked.map(reason=><li key={reason}>{reason}</li>)}</ul>}
      {d.review.length>0&&<details><summary>尚待核對（{d.review.length} 項）</summary><ul>{d.review.map(reason=><li key={reason}>{reason}</li>)}</ul></details>}
      <p className="field-hint">{d.note}</p>
    </article>)}</div>
    <details className="travel-details"><summary>防蚊與 G6PD 注意事項</summary><ul><li>依產品標示使用合適的 DEET 或 Picaridin 防蚊液。</li><li>穿長袖長褲，選有紗窗／空調的住宿，必要時使用處理過的蚊帳；防蚊要持續進行。</li><li>停留較長需備妥全程藥物與就醫計畫；乾季、都市或曾住過疫區都不代表有免疫力。</li><li>{r.g6pd}</li></ul><a href={travelEvidence.malaria.url} target="_blank" rel="noopener noreferrer">CDC Yellow Book 預防原則 ↗</a></details>
  </section>;
}
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
  const ready=useClientReady(),id=useId();const {plan,health,records,setRecords,clear}=useTravelPlan();
  const [malaria,setMalaria]=useState<MalariaResult|null>(null),[vaccines,setVaccines]=useState<VaccineResult|null>(null),[error,setError]=useState("");
  const changed=()=>{setMalaria(null);setVaccines(null);setError("");};
  return <>
    <form autoComplete="off" onSubmit={e=>{e.preventDefault();changed();const asOf=new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Taipei"});if(kind==="malaria"){const r=assessMalaria(plan,health,asOf);if("error"in r)setError(r.error??"請核對資料");else setMalaria(r);}else{const r=assessTravelVaccines(plan,health,records,asOf);if("error"in r)setError(r.error??"請核對資料");else setVaccines(r);}}}>
      <fieldset className="ready-fieldset" disabled={!ready} aria-label={kind==="malaria"?"瘧疾預防行程輸入":"旅遊疫苗行程輸入"}>
        <TravelPlanFields onChange={changed}/>
        {kind==="vaccines"&&<details className="travel-details"><summary>疫苗紀錄（不填即保留未知）</summary><div className="assessment-fields">{(Object.entries(vaccineNames) as [VaccineId,string][]).map(([key,label])=><FormField key={key} prefix={id} field={{key,label,choices:[{value:"unknown",label:"不清楚／尚未查紀錄"},{value:"none",label:"未接種"},{value:"partial",label:"接種過，未完成或時效需確認"},{value:"complete",label:"已有完整／目前有效紀錄"}]}} value={records.vaccines[key]??"unknown"} onChange={value=>{setRecords(old=>({...old,vaccines:{...old.vaccines,[key]:value as VaccineRecord}}));changed();}}/>)}</div>
          <div className="assessment-fields"><div className="assessment-field"><label htmlFor={`${id}-yf-date`}>黃熱病接種日期（依黃皮書，選填）</label><input id={`${id}-yf-date`} type="date" value={records.yfDate} onChange={e=>{setRecords(old=>({...old,yfDate:e.target.value}));changed();}}/></div><FormField prefix={id} field={{key:"icvp",label:"持有有效國際預防接種證明書（黃皮書）？",choices:travelChoices}} value={records.icvp} onChange={value=>{setRecords(old=>({...old,icvp:value as typeof old.icvp}));changed();}}/></div>
        </details>}
        {error&&<p className="form-error" role="alert">{error}</p>}
        <div className="calculator-actions"><button type="submit" className="button">{kind==="malaria"?"評估瘧疾預防與時程":"建立旅遊疫苗清單"}</button><button type="button" className="text-link" onClick={()=>{clear();changed();}}>清除共用行程與健康輸入</button></div>
      </fieldset>
    </form>
    {malaria&&<MalariaResults result={malaria}/>} {vaccines&&<VaccineResults result={vaccines}/>}
    {!malaria&&!vaccines&&<ResultPanel result={null}/>}
  </>;
}
