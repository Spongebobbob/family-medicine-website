"use client";
import { useId, useRef, useState } from "react";
import { fraxOfficialUrl, fraxRiskFactors, prepareFrax, recordFraxResult, type FraxValues } from "@/lib/frax";
import { FormField, type Field } from "./assessment-form";
import { useClientReady } from "./use-client-ready";

const answers = [{ value: "yes", label: "有" }, { value: "no", label: "無" }, { value: "unknown", label: "未確認" }];
const preparationFields: Field[] = [
  { key: "age", label: "年齡", unit: "歲", min: 40, max: 90, integer: true },
  { key: "sex", label: "官方模型使用的性別參數", choices: [{ value: "female", label: "女性" }, { value: "male", label: "男性" }] },
  { key: "weight", label: "體重", unit: "kg", min: 0 }, { key: "height", label: "身高", unit: "cm", min: 0 },
  ...fraxRiskFactors.map(f => ({ ...f, choices: answers })),
  { key: "bmd", label: "股骨頸骨密度報告", choices: [{ value: "none", label: "沒有，先用無 BMD 方式評估" }, { value: "report", label: "有股骨頸報告" }, { value: "unknown", label: "不確定測量部位或資料" }], hint: "官方可使用有／無 BMD 的方式計算；腰椎、全髖與跟骨數值不能直接填成股骨頸 BMD。" },
];
const resultFields: Field[] = [
  { key: "major", label: "主要骨鬆性骨折機率", unit: "%", min: 0, max: 100 },
  { key: "hip", label: "髖部骨折機率", unit: "%", min: 0, max: 100 },
  { key: "bmd", label: "這次官方計算使用骨密度嗎？", choices: [{ value: "without", label: "未使用 BMD" }, { value: "with", label: "使用股骨頸 BMD" }] },
];
export function FraxForm() {
  const ready = useClientReady(), prefix = useId();
  const prepForm = useRef<HTMLFormElement>(null), resultForm = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FraxValues>({}), [entry, setEntry] = useState<FraxValues>({});
  const [prepared, setPrepared] = useState<ReturnType<typeof prepareFrax> | null>(null);
  const [recorded, setRecorded] = useState<ReturnType<typeof recordFraxResult> | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const focusError = (form: HTMLFormElement | null) => requestAnimationFrame(() => form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  return <div className="frax-workspace">
    <p className="frax-intro">FRAX® 評估未來十年的骨折機率。本頁協助準備資料、前往官方計算，再整理官方結果；<strong>機率由官方 FRAX 產生，本頁不自行估算。</strong></p>
    <section aria-labelledby={`${prefix}-official`}>
      <h2 id={`${prefix}-official`}>前往官方計算</h2>
      <p>在官方頁選擇「亞洲 → Taiwan（台灣）」，填入病史與身高體重；可選擇有或沒有股骨頸骨密度（BMD）。</p>
      <a className="button" href={fraxOfficialUrl} target="_blank" rel="noopener noreferrer">開啟官方 FRAX 計算（新分頁）</a>
      <p className="field-hint">這個連結不會帶入你的資料，請在官方網站重新填寫及核對。官方頁可能需要完成安全驗證。</p>
    </section>
    <details className="travel-details frax-preparation"><summary>計算前，先整理需要的資料（選用）</summary>
      <form ref={prepForm} noValidate autoComplete="off" onSubmit={e => { e.preventDefault(); const next = prepareFrax(values); setPrepared(next); setCopyMessage(""); if (Object.keys(next.errors).length) focusError(prepForm.current); }}>
        <fieldset disabled={!ready} className="ready-fieldset"><legend className="sr-only">FRAX 計算準備資料</legend>
          <div className="assessment-fields">{preparationFields.map(field => <FormField key={field.key} field={field} prefix={`${prefix}-prep`} value={values[field.key] ?? ""} error={prepared?.errors[field.key]} onChange={value => { setValues(v => ({ ...v, [field.key]: value })); setPrepared(null); setRecorded(null); setEntry({}); setCopyMessage(""); }} />)}</div>
          <div className="assessment-actions"><button className="button" type="submit">整理資料清單</button><button className="text-button" type="button" onClick={() => { setValues({}); setPrepared(null); setEntry({}); setRecorded(null); setCopyMessage(""); }}>清除全部輸入</button></div>
        </fieldset>
      </form>
      {prepared?.summary && <section aria-label="準備資料清單"><pre className="frax-summary">{prepared.summary}</pre><button className="text-button" type="button" onClick={async () => { try { await navigator.clipboard.writeText(prepared.summary!); setCopyMessage("已複製資料清單。"); } catch { setCopyMessage("無法自動複製，請選取上方文字複製。"); } }}>複製資料清單</button><p role="status">{copyMessage}</p></section>}
      <p className="field-hint">本頁輸入只保留在目前頁面，重新整理即清除；不儲存、不自動傳送。未確認的病史會保留為未知，請帶資料向醫師核對。</p>
    </details>
    <section aria-labelledby={`${prefix}-result-title`}>
      <h2 id={`${prefix}-result-title`}>整理官方計算結果</h2><p>把官方顯示的兩個十年機率填入下方。這是手動結果紀錄，不會重新計算 FRAX。</p>
      <form ref={resultForm} noValidate autoComplete="off" onSubmit={e => { e.preventDefault(); const next = recordFraxResult(entry); setRecorded(next); if (Object.keys(next.errors).length) focusError(resultForm.current); }}>
        <fieldset disabled={!ready} className="ready-fieldset"><legend className="sr-only">官方 FRAX 結果紀錄</legend>
          <div className="assessment-fields">{resultFields.map(field => <FormField key={field.key} field={field} prefix={`${prefix}-result`} value={entry[field.key] ?? ""} error={recorded?.errors[field.key]} onChange={value => { setEntry(v => ({ ...v, [field.key]: value })); setRecorded(null); }} />)}</div>
          <div className="frax-confirmation"><label><input type="checkbox" checked={entry.confirmed === "yes"} onChange={e => { setEntry(v => ({ ...v, confirmed: e.target.checked ? "yes" : "" })); setRecorded(null); }} aria-invalid={Boolean(recorded?.errors.confirmed)} aria-describedby={recorded?.errors.confirmed ? `${prefix}-confirm-error` : undefined} /> 我已確認結果來自官方 FRAX，且使用 Taiwan（台灣）模型。</label>{recorded?.errors.confirmed && <p className="field-error" id={`${prefix}-confirm-error`}>{recorded.errors.confirmed}</p>}</div>
          <div className="assessment-actions"><button className="button" type="submit">顯示結果摘要</button><button type="button" className="text-button" onClick={() => { setEntry({}); setRecorded(null); }}>清除結果</button></div>
        </fieldset>
      </form>
      {recorded?.result && <section className="frax-result" aria-label="手動紀錄的官方 FRAX 結果" aria-live="polite"><h3>十年骨折機率</h3><p>官方 FRAX・Taiwan（台灣）模型・手動紀錄・{recorded.result.bmd === "with" ? "有股骨頸 BMD" : "無 BMD"}</p><dl><div><dt>主要骨鬆性骨折</dt><dd>{recorded.result.major}%</dd></div><div><dt>髖部骨折</dt><dd>{recorded.result.hip}%</dd></div></dl><p>主要骨鬆性骨折包含髖部、臨床脊椎、遠端前臂與近端肱骨骨折；髖部已包含在內，<strong>兩個機率不可相加</strong>。</p><p>這不是本站計算或驗證的機率，也不直接決定是否用藥。請把官方完整結果、骨密度報告、骨折及用藥史帶至門診討論。</p></section>}
    </section>
  </div>;
}
