import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  LabAssessment,
  ScaleQuestionnaire,
} from "../src/components/tools/assessment-form";
import { PreventionAssessment } from "../src/components/tools/prevention-form";
import { BmiCalculator } from "../src/components/bmi-calculator";
test("assessment forms are disabled in server HTML until event handlers hydrate", () => {
  for (const element of [
    createElement(BmiCalculator),
    createElement(PreventionAssessment, { kind: "taiwan-cancer-screening" }),
    createElement(PreventionAssessment, { kind: "adult-health-check" }),
    createElement(PreventionAssessment, { kind: "adult-vaccines" }),
    createElement(LabAssessment, { kind: "fib-4" }),
    createElement(LabAssessment, { kind: "egfr" }),
    createElement(ScaleQuestionnaire, { kind: "phq-9" }),
  ]) {
    const html = renderToStaticMarkup(element);
    assert.match(html, /<fieldset class="ready-fieldset" disabled=""/);
    assert.ok(html.includes("工具載入中，請稍候再填寫。"));
    assert.match(html, /<form[^>]*autoComplete="off"/);
  }
});
