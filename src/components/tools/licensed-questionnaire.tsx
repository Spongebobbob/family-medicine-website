"use client";
import { useId, useRef, useState } from "react";
import { licensedQuestionnaires, mnaMeasurementScore, scoreEss, scoreMnaSf, type LicensedQuestionnaireKind, type MnaMeasurement } from "@/lib/licensed-questionnaires";
import { FormField, ResultPanel, type AssessmentResult, type Field } from "./assessment-form";
import { useClientReady } from "./use-client-ready";
export function LicensedQuestionnaire({ kind }: { kind: LicensedQuestionnaireKind }) {
  const ready = useClientReady(), prefix = useId(), form = useRef<HTMLFormElement>(null);
  const questionnaire = licensedQuestionnaires[kind], isMna = kind === "mna-sf", count = isMna ? 6 : 8;
  const [age, setAge] = useState("");
  const [answers, setAnswers] = useState<string[]>(Array(questionnaire.questions.length).fill(""));
  const [method, setMethod] = useState<"bmi" | "calf">("bmi");
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const ageInvalid = !age.trim() || !Number.isInteger(Number(age)) || Number(age) < questionnaire.minAge || Number(age) > 120;
  const fields: Field[] = method === "bmi" ? [{ key: "height", label: "身高", unit: "公分", min: 100, max: 250 }, { key: "weight", label: "體重", unit: "公斤", min: 20, max: 350 }] : [{ key: "calf", label: "小腿圍", unit: "公分", min: 10, max: 100, hint: "量小腿最粗處一圈，皮尺保持水平、不勒緊；有水腫時請由醫療人員評估。" }];
  const measurement: MnaMeasurement = method === "bmi" ? { method, height: Number(measurements.height), weight: Number(measurements.weight) } : { method, calf: Number(measurements.calf) };
  const measurementReady = fields.every(f => measurements[f.key]?.trim()) && mnaMeasurementScore(measurement) !== null;
  const incomplete = answers.some(a => a === "") || (isMna && !measurementReady);
  const clearResult = () => { setSubmitted(false); setResult(null); };
  function submit(e: React.FormEvent) {
    e.preventDefault(); setSubmitted(true); setResult(null);
    if (ageInvalid || incomplete) { requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus()); return; }
    setResult(isMna ? scoreMnaSf(Number(age), answers.map(Number), measurement) : scoreEss(Number(age), answers.map(Number)));
  }
  return <div className="assessment-workspace">
    <form ref={form} autoComplete="off" noValidate onSubmit={submit}><fieldset className="ready-fieldset" disabled={!ready} aria-label={isMna ? "MNA-SF 營養篩檢問卷" : "ESS 日間嗜睡問卷"}>
      {!ready && <p role="status">工具載入中，請稍候再填寫。</p>}
      <FormField prefix={prefix} field={{ key: "age", label: "年齡", unit: "歲", min: questionnaire.minAge, max: 120, integer: true }} value={age} error={submitted && ageInvalid ? `請輸入 ${questionnaire.minAge}–120 的整數年齡。` : undefined} onChange={value => { setAge(value); clearResult(); }} />
      <p>{questionnaire.intro}</p>
      <p className="score-progress" role="status">已完成 {answers.filter(a => a !== "").length + Number(isMna && measurementReady)}／{count} 題</p>
      <div className="question-list">{questionnaire.questions.map((q, index) => <fieldset className="question-card" key={index} aria-describedby={submitted && answers[index] === "" ? `${prefix}-error-${index}` : undefined}>
        <legend>{index + 1}. {q.text}</legend>{q.hint && <p className="field-hint">{q.hint}</p>}
        <div className="answer-options">{q.choices.map(c => <label className="answer-option" key={c.score}><input type="radio" name={`${prefix}-question-${index}`} value={c.score} checked={answers[index] === String(c.score)} data-invalid={submitted && answers[index] === ""} onChange={() => { setAnswers(old => old.map((a, i) => i === index ? String(c.score) : a)); clearResult(); }} /><span>{c.label}</span></label>)}</div>
        {submitted && answers[index] === "" && <p className="field-error" id={`${prefix}-error-${index}`}>請選擇一個答案。</p>}
      </fieldset>)}
      {isMna && <fieldset className="question-card"><legend>6. 身體質量指數（BMI）或小腿圍</legend>
        <FormField prefix={prefix} field={{ key: "measurementMethod", label: "使用哪一種量測？", choices: [{ value: "bmi", label: "可以取得身高體重：使用 BMI" }, { value: "calf", label: "無法取得 BMI：改用小腿圍" }] }} value={method} onChange={value => { setMethod(value as "bmi" | "calf"); setMeasurements({}); clearResult(); }} />
        <div className="assessment-fields">{fields.map(f => <FormField key={f.key} prefix={prefix} field={f} value={measurements[f.key] ?? ""} error={submitted && (!measurements[f.key]?.trim() || !Number.isFinite(Number(measurements[f.key])) || Number(measurements[f.key]) < f.min! || Number(measurements[f.key]) > f.max!) ? `請輸入 ${f.min}–${f.max} 的數字。` : undefined} onChange={value => { setMeasurements(old => ({ ...old, [f.key]: value })); clearResult(); }} />)}</div>
      </fieldset>}
      </div>
      {submitted && (ageInvalid || incomplete) && <p className="form-error" role="alert">請填寫年齡並完成全部 {count} 題。</p>}
      <div className="calculator-actions"><button type="submit" className="button">查看評估結果</button><button type="button" className="text-link" onClick={() => { setAge(""); setAnswers(Array(questionnaire.questions.length).fill("")); setMethod("bmi"); setMeasurements({}); clearResult(); }}>清除所有輸入</button></div>
    </fieldset></form>
    <ResultPanel result={result} />
    <p className="field-hint">{isMna ? "MNA® © Société des Produits Nestlé, S.A., Vevey, Switzerland, Trademark Owners. © Nestlé 1994, Revision 2009." : "ESS © M. W. Johns 1990–1997."}</p>
  </div>;
}
