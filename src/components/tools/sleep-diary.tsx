"use client";
import { useId, useRef, useState } from "react";
import { calculateSleepNight, sleepCsv, summarizeSleep, type SleepNight } from "@/lib/aging-sleep-assessments";
import { FormField, ResultPanel, type Field } from "./assessment-form";
import { useClientReady } from "./use-client-ready";
const minuteFields: Field[] = [
  { key: "latency", label: "上床到睡著的清醒時間", unit: "分鐘", min: 0, max: 1439, integer: true, hint: "包含上床後看書、滑手機等尚未睡著的時間。" },
  { key: "awake", label: "睡著後，半夜醒來的時間合計", unit: "分鐘", min: 0, max: 1439, integer: true },
  { key: "finalAwake", label: "最後醒來到離床的時間", unit: "分鐘", min: 0, max: 1439, integer: true },
  { key: "nap", label: "當天白天小睡合計", unit: "分鐘", min: 0, max: 1440, integer: true },
];
const duration = (minutes: number) => `${Math.floor(Math.round(minutes) / 60)} 小時 ${Math.round(minutes) % 60} 分`;
export function SleepDiary() {
  const ready = useClientReady(), prefix = useId(), form = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nights, setNights] = useState<SleepNight[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const summary = summarizeSleep(nights);
  const change = (key: string, value: string) => { setValues(old => ({ ...old, [key]: value })); setErrors({}); setStatus(""); };
  function submit(e: React.FormEvent) {
    e.preventDefault(); const issues: Record<string, string> = {};
    for (const key of ["date", "bedtime", "riseTime", ...minuteFields.map(f => f.key)]) if (!values[key]?.trim()) issues[key] = ["date", "bedtime", "riseTime"].includes(key) ? "請填寫日期或時間。" : "請填寫此欄位；沒有請填 0。";
    for (const f of minuteFields) if (values[f.key]?.trim() && (!Number.isInteger(Number(values[f.key])) || Number(values[f.key]) < f.min! || Number(values[f.key]) > f.max!)) issues[f.key] = `請填 ${f.min}–${f.max} 的整數。`;
    if (nights.some(n => n.date === values.date && n.date !== editing)) issues.date = "這個日期已有紀錄，請使用下方編輯功能。";
    if (!editing && nights.length >= 14) issues.date = "最多保留 14 天；請先下載或刪除舊紀錄。";
    const night = Object.keys(issues).length ? null : calculateSleepNight({ date: values.date, bedtime: values.bedtime, riseTime: values.riseTime, latency: Number(values.latency), awake: Number(values.awake), finalAwake: Number(values.finalAwake), nap: Number(values.nap) });
    if (!Object.keys(issues).length && !night) issues.bedtime = "請核對日期與時間：上床及離床不能相同，清醒合計不能超過在床時間。";
    setErrors(issues);
    if (!night || Object.keys(issues).length) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    setNights(old => [...old.filter(n => n.date !== editing), night].sort((a, b) => a.date.localeCompare(b.date)));
    setValues({}); setEditing(null); setStatus("已加入這一天，資料只保留在目前分頁。");
  }
  function download() {
    const csv = sleepCsv(nights); if (!csv) return;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "睡眠日誌.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="assessment-workspace sleep-diary">
    <p className="field-hint">早上填一次，最多 14 天。僅保留此分頁；離開前可下載 CSV 或列印。</p>
    <form ref={form} autoComplete="off" noValidate onSubmit={submit}><fieldset className="ready-fieldset" disabled={!ready} aria-label="睡眠日誌輸入">
      {!ready && <p role="status">工具載入中，請稍候再填寫。</p>}
      <div className="assessment-fields">
        {[["date", "離床日期", "date"], ["bedtime", "這次睡眠的上床時間", "time"], ["riseTime", "最後離床時間", "time"]].map(([key, label, type]) => <div className="assessment-field" key={key}><label htmlFor={`${prefix}-${key}`}>{label}</label><input id={`${prefix}-${key}`} type={type} value={values[key] ?? ""} required aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${prefix}-${key}-error` : key === "bedtime" ? `${prefix}-overnight` : undefined} onInput={e => change(key, e.currentTarget.value)} onChange={e => change(key, e.target.value)} />{errors[key] && <p className="field-error" id={`${prefix}-${key}-error`}>{errors[key]}</p>}</div>)}
        {minuteFields.map(f => <FormField key={f.key} prefix={prefix} field={f} value={values[f.key] ?? ""} error={errors[f.key]} onChange={v => change(f.key, v)} />)}
      </div>
      <p className="field-hint" id={`${prefix}-overnight`}>例如昨晚 23:00 上床、今天 07:00 離床，記在今天。離床較早時視為跨日；本工具限單次在床未滿 24 小時。</p>
      <div className="calculator-actions"><button type="submit" className="button">{editing ? "更新這一天" : "加入這一天"}</button><button type="button" className="text-link" onClick={() => { setValues({}); setErrors({}); setEditing(null); }}>清空本次輸入</button></div>
      {Object.keys(errors).length > 0 && <p role="alert" className="form-error">請依欄位提示核對資料。</p>}
      <p role="status">{status}</p>
    </fieldset></form>
    <ResultPanel result={summary ? { value: duration(summary.averageSleep), unit: `${summary.nights} 天平均每次睡眠`, label: "依日誌估計的睡眠時間", message: "睡眠效率是在床時間中實際睡著的比例；小睡另列，不加入這個比例。數值不單獨判斷睡眠疾病，也不用來自行縮短睡眠時間。", rows: [{ label: "整體睡眠效率", value: `${summary.efficiency.toFixed(1)}%` }, { label: "平均在床時間", value: duration(summary.averageInBed) }, { label: "平均白天小睡", value: duration(summary.averageNap) }] } : null} />
    {nights.length > 0 && <section aria-label="已記錄的睡眠日誌"><h2>已記錄 {nights.length}／14 天</h2>
      <div className="diary-list">{nights.map(n => <article className="diary-night" key={n.date}><h3>{n.date}</h3><p>{n.bedtime} 上床・{n.riseTime} 離床</p><strong>估計睡眠 {duration(n.asleep)}</strong><div className="diary-bar" aria-hidden="true"><span style={{ width: `${n.efficiency}%` }} /></div><p>在床 {duration(n.inBed)}・效率 {n.efficiency.toFixed(1)}%・小睡 {n.nap} 分</p><div className="calculator-actions"><button type="button" className="text-link" onClick={() => { setEditing(n.date); setValues(Object.fromEntries(Object.entries(n).map(([key, v]) => [key, String(v)]))); setErrors({}); setStatus(`正在編輯 ${n.date}；請至上方表單修改。`); requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>('input')?.focus()); }}>編輯 {n.date}</button><button type="button" className="text-link" onClick={() => { setNights(old => old.filter(x => x.date !== n.date)); if (editing === n.date) { setEditing(null); setValues({}); } }}>刪除 {n.date}</button></div></article>)}</div>
      <div className="calculator-actions"><button className="button" type="button" onClick={download}>下載 CSV</button><button className="text-link" type="button" onClick={() => window.print()}>列印日誌</button><button className="text-link" type="button" onClick={() => { setNights([]); setEditing(null); setValues({}); setErrors({}); setStatus("已清除所有日誌。"); }}>清除全部日誌</button></div>
    </section>}
  </div>;
}
