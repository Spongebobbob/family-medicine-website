"use client";
import { useId, useRef, useState } from "react";
import { geriatricQuestionnaires, scoreGeriatricQuestionnaire, type GeriatricQuestionnaireKind } from "@/lib/geriatric-questionnaires";
import { FormField, ResultPanel, type AssessmentResult } from "./assessment-form";
import { useClientReady } from "./use-client-ready";
export function GeriatricQuestionnaire({ kind }: { kind: GeriatricQuestionnaireKind }) {
  const ready = useClientReady(), prefix = useId(), form = useRef<HTMLFormElement>(null);
  const questionnaire = geriatricQuestionnaires[kind];
  const [age, setAge] = useState("");
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const ageInvalid = !age.trim() || !Number.isInteger(Number(age)) || Number(age) < 65 || Number(age) > 120;
  const incomplete = answers.some(a => a === "");
  function submit(e: React.FormEvent) {
    e.preventDefault(); setSubmitted(true); setResult(null);
    if (ageInvalid || incomplete) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus());
      return;
    }
    setResult(scoreGeriatricQuestionnaire(kind, Number(age), answers.map(Number)));
  }
  return <div className="assessment-workspace">
    <form ref={form} autoComplete="off" noValidate onSubmit={submit}><fieldset className="ready-fieldset" disabled={!ready} aria-label="高齡健康問卷輸入">
      {!ready && <p role="status">工具載入中，請稍候再填寫。</p>}
      <FormField prefix={prefix} field={{ key: "age", label: "年齡", unit: "歲", min: 65, max: 120, integer: true }} value={age} error={submitted && ageInvalid ? "此問卷頁面適用 65–120 歲成人，請輸入整數年齡。" : undefined} onChange={value => { setAge(value); setSubmitted(false); setResult(null); }} />
      <p>{questionnaire.intro}</p>
      <p className="score-progress" role="status">已完成 {answers.filter(a => a !== "").length}／5 題</p>
      <div className="question-list">{questionnaire.questions.map((q, index) => <fieldset className="question-card" key={index} aria-describedby={submitted && answers[index] === "" ? `${prefix}-error-${index}` : undefined}>
        <legend>{index + 1}. {q.text}</legend>
        {q.hint && <p className="field-hint">{q.hint}</p>}
        <div className="answer-options">{q.choices.map((label, value) => <label className="answer-option" key={value}><input type="radio" name={`${prefix}-question-${index}`} value={value} checked={answers[index] === String(value)} data-invalid={submitted && answers[index] === ""} onChange={() => { setAnswers(old => old.map((a, i) => i === index ? String(value) : a)); setSubmitted(false); setResult(null); }} /><span>{label}</span></label>)}</div>
        {submitted && answers[index] === "" && <p className="field-error" id={`${prefix}-error-${index}`}>請選擇一個答案。</p>}
      </fieldset>)}</div>
      {submitted && (ageInvalid || incomplete) && <p className="form-error" role="alert">請填寫年齡並回答全部 5 題。</p>}
      <div className="calculator-actions"><button type="submit" className="button">查看評估結果</button><button type="button" className="text-link" onClick={() => { setAge(""); setAnswers(Array(5).fill("")); setSubmitted(false); setResult(null); }}>清除所有輸入</button></div>
    </fieldset></form>
    <ResultPanel result={result} />
  </div>;
}
