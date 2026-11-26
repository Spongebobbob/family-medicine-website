import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { questionnaires, type QuestionnaireKind } from "../src/lib/questionnaires";
import { ScaleQuestionnaire } from "../src/components/tools/assessment-form";

test("all questionnaires render complete Chinese questions and named answer options", () => {
  for (const [kind, count, options] of [
    ["stop-bang", 8, 2], ["isi", 7, 5], ["phq-9", 9, 4], ["gad-7", 7, 4],
  ] as const) {
    const config = questionnaires[kind];
    assert.equal(config.questions.length, count);
    const html = renderToStaticMarkup(createElement(ScaleQuestionnaire, { kind }));
    assert.equal([...html.matchAll(/type="radio"/g)].length, count * options);
    assert.ok(!html.includes("輸入題本分數"));
    assert.ok(!html.includes("依原題本選項"));
    assert.ok(!html.includes("官方線上問卷（英文）"));
    for (const q of config.questions) {
      assert.match(q.text, /[\u4e00-\u9fff]/);
      assert.equal(q.choices.length, options);
      assert.equal(new Set(q.choices).size, options);
      assert.ok(html.includes(q.text));
    }
    const marker = [...html.matchAll(/data-medical-notice=/g)].length;
    assert.equal(marker, 0);
  }
});

test("Chinese clinical anchors preserve score direction and selected STOP-Bang version", () => {
  const stop = questionnaires["stop-bang"].questions;
  assert.match(stop[4].text, /超過 35/);
  assert.match(stop[5].text, /超過 50/);
  assert.match(stop[6].text, /男性 43 公分、女性 41 公分/);
  assert.deepEqual(stop[0].choices, ["否", "是"]);
  assert.equal(questionnaires.isi.questions[3].choices[0], "非常滿意");
  assert.equal(questionnaires.isi.questions[3].choices[4], "非常不滿意");
  for (const kind of ["phq-9", "gad-7"] as QuestionnaireKind[]) {
    assert.equal(questionnaires[kind].questions[0].choices[0], "完全沒有");
    assert.equal(questionnaires[kind].questions[0].choices[3], "幾乎每天");
  }
  assert.match(questionnaires["phq-9"].questions[8].text, /傷害自己/);
});
