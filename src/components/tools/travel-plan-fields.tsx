"use client";
import { useId } from "react";
import { destinations, destinationById, transitCountries, type TravelSetting } from "@/lib/travel-data";
import { malariaCountries, malariaCountryById } from "@/lib/malaria-guidance";
import { newTravelStop, type TravelHealth, type TravelStop } from "@/lib/travel-plan";
import { CountryPicker } from "./country-picker";
import { FormField, type Field } from "./assessment-form";
import { useTravelPlan } from "./travel-plan-provider";
export const travelChoices=[{value:"unknown",label:"不清楚／尚未確認"},{value:"yes",label:"是"},{value:"no",label:"否／不適用"}];
export function TravelPlanFields({onChange,kind="vaccines"}:{onChange:()=>void;kind?:"malaria"|"vaccines"}){
  const id=useId(),{plan,setPlan,health,setHealth}=useTravelPlan();
  const updateStop=(i:number,patch:Partial<TravelStop>)=>{setPlan(old=>({...old,stops:old.stops.map((s,j)=>i===j?{...s,...patch}:s)}));onChange();};
  const healthField=(f:Field)=>{const current=health[f.key as keyof TravelHealth];return <FormField key={f.key} prefix={id} field={f} value={current===null||(typeof current==="number"&&!Number.isFinite(current))?"":String(current)} onChange={value=>{setHealth(old=>({...old,[f.key]:f.choices?value:value.trim()?Number(value):f.key==="age"?NaN:null}));onChange();}}/>;};
  return <>
    <h2>我的旅遊行程</h2>
    {plan.stops.map((s,i)=>{const country=kind==="malaria"?malariaCountryById(s.country):destinationById(s.country);return <fieldset className="travel-stop" key={i}><legend>第 {i+1} 段行程</legend><div className="assessment-fields">
      <CountryPicker choices={[...(kind==="malaria"?malariaCountries:destinations).map(d=>({value:d.id,label:d.name,searchText:malariaCountryById(d.id)?.slug.replaceAll("-"," ")??d.id})),...(kind==="vaccines"&&!destinationById(s.country)&&malariaCountryById(s.country)?[{value:s.country,label:malariaCountryById(s.country)!.name+"（疫苗資料待核對）",searchText:malariaCountryById(s.country)!.slug.replaceAll("-"," ")}]:[]),{value:"OTHER",label:"其他／尚未查核國家",searchText:"other unknown"}]} value={s.country} onChange={value=>updateStop(i,{country:value,region:""})}/>
      <FormField prefix={`${id}-${i}`} field={{key:"region",label:"實際到訪地區",choices:[...(country?.regions.map(r=>({value:r.id,label:r.name}))??[]),...(s.region&&s.region!=="unverified"&&!country?.regions.some(r=>r.id===s.region)?[{value:s.region,label:"原行程地區（本工具規則尚未核對）"}]:[]),{value:"unverified",label:"跨區／不確定／未完成地區規則核對"}]}} value={s.region} onChange={value=>updateStop(i,{region:value})}/>
      <div className="assessment-field"><label htmlFor={`${id}-start-${i}`}>抵達本段地區日期</label><input id={`${id}-start-${i}`} type="date" required value={s.start} onChange={e=>updateStop(i,{start:e.target.value})}/></div>
      <div className="assessment-field"><label htmlFor={`${id}-end-${i}`}>離開本段地區日期</label><input id={`${id}-end-${i}`} type="date" required value={s.end} onChange={e=>updateStop(i,{end:e.target.value})}/></div>
      <FormField prefix={`${id}-${i}`} field={{key:"setting",label:"活動及住宿型態",choices:[{value:"unknown",label:"尚未確定"},{value:"urban",label:"僅市區／一般觀光"},{value:"rural",label:"鄉村／探親"},{value:"forest",label:"森林／露營／野外"},{value:"mixed",label:"多種或跨區活動"}]}} value={s.setting} onChange={value=>updateStop(i,{setting:value as TravelSetting})}/>
      <FormField prefix={`${id}-${i}`} field={{key:"altitude",label:"所有到訪地點的最低海拔（選填）",unit:"m",min:-500,max:9000,optional:true,hint:"有海拔條件的地區需要；請填全程最低到訪海拔。"}} value={s.minAltitude===null?"":String(s.minAltitude)} onChange={value=>updateStop(i,{minAltitude:value.trim()?Number(value):null})}/>
    </div>
    {country?.regions.find(r=>r.id===s.region)?.note&&<p className="field-hint">{country.regions.find(r=>r.id===s.region)!.note}</p>}
    {kind==="malaria"&&malariaCountryById(s.country)&&<div><p><a className="text-link" href={malariaCountryById(s.country)!.source+"#Malaria"} target="_blank" rel="noopener noreferrer">官方風險文字與地圖入口 ↗</a></p>{malariaCountryById(s.country)!.mapUrls.map(url=><p key={url}><a className="text-link" href={url} target="_blank" rel="noopener noreferrer">查看官方原圖 ↗</a></p>)}</div>}
    <details className="travel-details"><summary>本段入境前路線與轉機（黃熱病）</summary><div className="assessment-fields">
      <FormField prefix={`${id}-${i}`} field={{key:"fromRisk",label:"本段入境前曾到訪黃熱病風險國家？",choices:travelChoices,hint:"從台灣直達且未到訪其他國家可選否；風險名單請由官方資料核對。"}} value={s.fromRisk} onChange={value=>updateStop(i,{fromRisk:value as TravelStop["fromRisk"]})}/>
      <FormField prefix={`${id}-${i}`} field={{key:"transit",label:"本段入境前的機場轉機",choices:transitCountries}} value={s.transit} onChange={value=>updateStop(i,{transit:value as TravelStop["transit"],transitHours:null,leftAirport:"unknown"})}/>
      {s.transit==="risk"&&<><FormField prefix={`${id}-${i}`} field={{key:"transitHours",label:"在風險國家轉機／停留時間（選填）",unit:"小時",min:0,max:720,optional:true}} value={s.transitHours===null?"":String(s.transitHours)} onChange={value=>updateStop(i,{transitHours:value.trim()?Number(value):null})}/><FormField prefix={`${id}-${i}`} field={{key:"leftAirport",label:"是否離開機場並入境該風險國家？",choices:travelChoices}} value={s.leftAirport} onChange={value=>updateStop(i,{leftAirport:value as TravelStop["leftAirport"]})}/></>}
    </div><a className="text-link" href="https://www.cdc.gov/yellow-book/hcp/travel-associated-infections-diseases/yellow-fever.html" target="_blank" rel="noopener noreferrer">查閱官方黃熱病風險國家名單 ↗</a></details>
    {i>0&&<button type="button" className="text-link" onClick={()=>{setPlan(old=>({...old,stops:old.stops.filter((_,j)=>j!==i)}));onChange();}}>刪除第 {i+1} 段</button>}
    </fieldset>;})}
    <button type="button" className="text-link" disabled={plan.stops.length>=8} onClick={()=>{setPlan(old=>({...old,stops:[...old.stops,newTravelStop()]}));onChange();}}>＋ 新增行程（最多 8 段）</button>
    <details className="travel-details"><summary>活動及醫療可近性</summary><div className="assessment-fields">{[{key:"animalContact",label:"可能接觸犬、貓、蝙蝠等動物？"},{key:"remoteCare",label:"發生動物咬傷時，是否難以及時取得醫療？"},{key:"frequentTravel",label:"是否經常往返此地或準備長期居住？"},{key:"outdoorNights",label:"是否有夜間戶外、露營或無紗窗住宿？"}].map(f=><FormField key={f.key} prefix={id} field={{...f,choices:travelChoices}} value={plan[f.key as "animalContact"]} onChange={value=>{setPlan(old=>({...old,[f.key]:value}));onChange();}}/>)}</div></details>
    <h2>個人健康狀況</h2><div className="assessment-fields">
      {healthField({key:"age",label:"年齡",unit:"歲",min:0,max:120,hint:"未滿 1 歲可填小數，例如 6 個月為 0.5 歲。"})}
      {healthField({key:"weight",label:"體重（選填）",unit:"kg",min:.1,max:500,optional:true})}
      {healthField({key:"pregnant",label:"目前懷孕或可能懷孕？",choices:travelChoices})}
      {healthField({key:"immune",label:"免疫功能／免疫抑制治療",choices:[{value:"unknown",label:"尚未確認"},{value:"normal",label:"已確認無免疫抑制狀況"},{value:"suppressed",label:"有免疫抑制、化療、移植或相關治療"}]})}
    </div>
    {kind==="malaria"&&<details className="travel-details" open><summary>瘧疾特殊族群</summary><div className="assessment-fields">{[{key:"spleen",label:"曾切除脾臟，或醫師說脾功能低下？"},{key:"complexConditions",label:"有多種或複雜慢性疾病，需要個別醫療評估？"},{key:"longTermVfr",label:"本次為長期探親訪友？"}].map(f=>healthField({...f,choices:travelChoices}))}</div><p className="field-hint">年齡、懷孕與免疫狀況會一起納入；低風險不等於特殊族群一律不需預防藥。</p></details>}
    <details className="travel-details"><summary>用藥與疫苗限制（不清楚者保留未知）</summary><div className="assessment-fields">
      {healthField({key:"renal",label:"醫師確認的腎功能／CrCl 狀況",choices:[{value:"unknown",label:"未確認"},{value:"normal",label:"已確認沒有 CrCl <30 的重度腎功能不全"},{value:"severe",label:"CrCl <30 mL/min 或重度腎功能不全"}]})}
      {healthField({key:"crcl",label:"醫師確認的 CrCl（選填）",unit:"mL/min",min:0,max:500,optional:true,hint:"不是 eGFR（mL/min/1.73m²），不會在此自動換算。"})}
      {healthField({key:"psychiatric",label:"憂鬱症（含過去病史）、廣泛性焦慮、精神病或其他重大精神疾病？",choices:travelChoices})}
      {healthField({key:"seizures",label:"癲癇或抽搐病史？",choices:travelChoices})}
      {healthField({key:"conduction",label:"心臟傳導異常、QT 延長或相關心律問題？",choices:travelChoices})}
      {healthField({key:"psoriasis",label:"有乾癬嗎？",choices:travelChoices})}
      {healthField({key:"drugAllergy",label:"曾對抗瘧藥、四環黴素或相關藥物過敏？",choices:travelChoices})}
      {healthField({key:"interactions",label:"有其他用藥、保健品或近期口服活性疫苗，尚待核對交互作用？",choices:travelChoices,hint:"例如 Warfarin、Rifampin、Cimetidine、抗癲癇或延長 QT 藥物、鐵劑、制酸劑、口服傷寒疫苗。選否前請備妥完整藥單由醫師／藥師核對。"})}
      {healthField({key:"g6pd",label:"G6PD（蠶豆症）定量檢驗",choices:[{value:"unknown",label:"未驗／不清楚"},{value:"normal",label:"定量檢驗確認正常"},{value:"deficient",label:"G6PD 缺乏"}]})}
      {healthField({key:"breastfeeding",label:"目前正在哺乳？",choices:travelChoices})}
      {healthField({key:"breastfeedingSmallInfant",label:"正在哺乳且嬰兒體重未滿 5kg？",choices:travelChoices})}
      {healthField({key:"thymus",label:"有合併免疫異常的胸腺疾病（例如胸腺瘤／重症肌無力相關）？",choices:travelChoices})}
      {healthField({key:"vaccineAllergy",label:"曾對黃熱病疫苗或其成分（如蛋）有嚴重過敏？",choices:travelChoices})}
    </div></details>
  </>;
}
