"use client";
import { useId, useState } from "react";
import { assessAltitude, altitudeEmergency, lakeLouise2018, scoreLakeLouise, type AltitudeHistory, type TravelAnswer } from "@/lib/altitude";
import { FormField, ResultPanel, type AssessmentResult, type Field } from "./assessment-form";
import { useClientReady } from "./use-client-ready";

const yesNo = [{value:"yes",label:"是"},{value:"no",label:"否"},{value:"unknown",label:"不清楚"}];
export function AltitudeForm() {
  const ready=useClientReady(), id=useId();
  const [v,setV]=useState<Record<string,string>>({});
  const [nights,setNights]=useState<string[]>([""]);
  const [result,setResult]=useState<AssessmentResult|null>(null);
  const [error,setError]=useState("");
  const [items,setItems]=useState<string[]>(["","","",""]);
  const [lls,setLls]=useState<AssessmentResult|null>(null);
  const change=(key:string,value:string)=>{setV(old=>({...old,[key]:value}));setResult(null);setLls(null);setError("");};
  const danger=altitudeEmergency(v.hape as TravelAnswer,v.hace as TravelAnswer);
  const fields:Field[]=[
    {key:"start",label:"出發地／平時居住海拔",unit:"m",min:-500,max:9000},
    {key:"priorNights",label:"出發前 14 天內，曾在 2750m 以上住幾晚？",unit:"晚",min:0,max:14,integer:true},
    {key:"history",label:"過去高山症病史",choices:[{value:"none-mild",label:"沒有或僅輕微急性高山症（AMS）"},{value:"moderate-severe",label:"曾有中至重度 AMS"},{value:"hape-hace",label:"曾有高山肺水腫（HAPE）或腦水腫（HACE）"},{value:"unknown",label:"不清楚"}]},
    {key:"extraRest",label:"每增加 1000m，是否安排額外一晚適應？",choices:yesNo,hint:"停留同一住宿海拔的適應晚也要填入下方行程。"},
    {key:"special",label:"是否懷孕，或有心肺疾病、睡眠呼吸中止、貧血、鐮刀型血球疾病等情況？",choices:yesNo},
  ];
  const field=(f:Field)=><FormField key={f.key} field={f} prefix={id} value={v[f.key]??""} onChange={value=>change(f.key,value)}/>;
  const heights=[Number(v.start),...nights.map(Number)];
  const chartReady=v.start?.trim() && nights.every(n=>n.trim() && Number.isFinite(Number(n)) && Number(n)>=-500 && Number(n)<=9000);
  const max=Math.max(3500,...heights.filter(Number.isFinite))+300;
  return <>
    <section className="travel-symptoms"><h2>現在有危險症狀嗎？</h2>
      <fieldset className="ready-fieldset" disabled={!ready} aria-label="高山危險症狀"><div className="assessment-fields">
        {field({key:"hape",label:"在休息時也喘、咳嗽加劇或咳出粉紅泡沫痰？",choices:yesNo})}
        {field({key:"hace",label:"走路不穩、意識混亂、異常嗜睡或無法自行行走？",choices:yesNo})}
      </div></fieldset>
      {danger && <div className="medical-notice travel-emergency" role="alert"><strong>疑似 HAPE／HACE：立即停止上升、求救並安排下降</strong><p>不要獨處或等待總分；儘量減少活動，由同伴協助撤離。有氧氣時使用，立即聯絡當地救援；在台灣可撥 119。不可為等候藥效而延誤下降。</p></div>}
      {!danger && (v.hape==="unknown"||v.hace==="unknown") && <p>不確定但人已不舒服時，先停止上升並請同伴與救援人員協助判斷。</p>}
    </section>
    <div className="assessment-workspace"><form autoComplete="off" onSubmit={e=>{
      e.preventDefault();setResult(null);
      if(fields.some(f=>!(v[f.key]??"").trim()) || nights.some(n=>!n.trim())){setError("請完成行程欄位；不清楚的病史請選「不清楚」。");return;}
      const r=assessAltitude({start:Number(v.start),nights:nights.map(Number),priorNights:Number(v.priorNights),history:v.history as AltitudeHistory,extraRest:v.extraRest as TravelAnswer,specialHealth:v.special as TravelAnswer});
      if(!r){setError("請核對海拔、適應晚數及選項。");return;}
      setError("");setResult({value:r.label,unit:"行程相關 AMS 風險",label:r.medication,message:r.advice,visual:{tone:danger?"danger":r.level===null?"neutral":r.level===0?"positive":r.level===1?"caution":"danger",...(r.level!==null?{scale:{active:r.level,bands:[{label:"低",range:"CDC 低風險條件",tone:"positive"},{label:"中",range:"CDC 中風險條件",tone:"caution"},{label:"高",range:"CDC 高風險條件",tone:"danger"}] as const}}:{})},rows:[...r.reasons.map((reason,i)=>({label:`分類依據 ${i+1}`,value:reason})),{label:"行程中的同海拔適應晚",value:`${r.restDays.length} 晚`},...(r.specialReview?[{label:"特殊健康狀況",value:"請另外安排個別醫療評估；不以 AMS 分層抵銷此提醒。"}]:[])]});
    }}><fieldset disabled={!ready} className="ready-fieldset" aria-label="高山行程輸入">
      <h2>住宿海拔行程</h2><div className="assessment-fields">{fields.map(field)}</div>
      {(v.special==="yes"||v.special==="unknown")&&<p>特殊健康狀況需獨立由醫師評估；即使行程屬低風險，也不能取代這項評估。</p>}
      <div className="altitude-nights">{nights.map((night,i)=><div key={i} className="altitude-night"><FormField prefix={id} field={{key:`night-${i}`,label:i===0?"第一晚住宿海拔":`第 ${i+1} 晚住宿海拔`,unit:"m",min:-500,max:9000}} value={night} onChange={value=>{setNights(old=>old.map((n,j)=>j===i?value:n));setResult(null);setError("");}}/>{i>0&&<button type="button" className="text-link" aria-label={`刪除第 ${i+1} 晚`} onClick={()=>{setNights(old=>old.filter((_,j)=>j!==i));setResult(null);}}>刪除</button>}</div>)}</div>
      <button type="button" className="text-link" disabled={nights.length>=30} onClick={()=>{setNights(old=>[...old,""]);setResult(null);}}>＋ 新增一晚（最多 30 晚）</button>
      {chartReady && <figure className="altitude-chart"><figcaption>住宿海拔變化</figcaption><svg viewBox="0 0 360 210" role="img" aria-label={`出發 ${heights[0]}m；${nights.map((n,i)=>`第${i+1}晚${n}m`).join("；")}`}>
        {[0,1500,3000,4500,6000,7500].filter(h=>h<max).map(h=><g key={h}><line x1="42" x2="345" y1={175-(h+500)/(max+500)*150} y2={175-(h+500)/(max+500)*150} stroke="#d5dfd1" strokeDasharray="4 4"/><text x="0" y={179-(h+500)/(max+500)*150}>{h}</text></g>)}
        <polyline points={heights.map((h,i)=>`${50+i/(heights.length-1)*280},${175-(h+500)/(max+500)*150}`).join(" ")} fill="none" stroke="#315e49" strokeWidth="3"/>
        {heights.map((h,i)=><g key={i}><circle cx={50+i/(heights.length-1)*280} cy={175-(h+500)/(max+500)*150} r="4" fill="#315e49"/>{(heights.length<=5||i===0||i===heights.length-1)&&<text textAnchor="middle" x={50+i/(heights.length-1)*280} y={198}>{i===0?"出發":`第${i}晚`}</text>}</g>)}
      </svg></figure>}
      {error&&<p role="alert" className="form-error">{error}</p>}
      <div className="calculator-actions"><button type="submit" className="button">評估行程風險</button><button type="button" className="text-link" onClick={()=>{setV({});setNights([""]);setItems(["","","",""]);setResult(null);setLls(null);setError("");}}>清除所有輸入</button></div>
    </fieldset></form><ResultPanel result={result}/></div>
    <section className="travel-lls"><h2>Lake Louise Score 2018 症狀評估</h2><p>抵達高海拔後使用；四項各 0–3 分，不含睡眠題。</p>
      <form autoComplete="off" onSubmit={e=>{e.preventDefault();if(items.some(n=>n==="")){setLls({value:"尚未完成",label:"請回答四項症狀",message:"危險症狀不需要等候計分。"});return;}const r=scoreLakeLouise(items.map(Number),v.recentGain as TravelAnswer,v.sixHours as TravelAnswer);if(r)setLls({value:String(r.score),unit:"／12 分",label:r.label,message:r.advice,visual:{tone:danger?"danger":r.meetsResearchDefinition?"caution":"neutral"}});}}>
        <fieldset disabled={!ready} className="ready-fieldset" aria-label="LLS 2018 症狀輸入"><div className="assessment-fields">{field({key:"recentGain",label:"症狀是否出現在近期上升海拔之後？",choices:yesNo})}{field({key:"sixHours",label:"抵達目前海拔是否已至少 6 小時？",choices:yesNo})}</div>
        {lakeLouise2018.map((q,i)=><fieldset className="question-card" key={q.label}><legend>{i+1}. {q.label}</legend><div className="answer-options">{q.choices.map((label,score)=><label className="answer-option" key={score}><input type="radio" required name={`${id}-lls-${i}`} checked={items[i]===String(score)} onChange={()=>{setItems(old=>old.map((n,j)=>j===i?String(score):n));setLls(null);}}/><span>{label}</span></label>)}</div></fieldset>)}
        <button type="submit" className="button">查看症狀評估</button></fieldset>
      </form><ResultPanel result={lls}/>
    </section>
  </>;
}
