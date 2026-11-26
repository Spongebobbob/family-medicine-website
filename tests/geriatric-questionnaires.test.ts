import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { geriatricQuestionnaires, scoreGeriatricQuestionnaire } from "../src/lib/geriatric-questionnaires";
import { GeriatricQuestionnaire } from "../src/components/tools/geriatric-questionnaire";
import { getHealthTool } from "../src/lib/tool-catalog";
test("all complete answer combinations preserve source scoring and thresholds", () => {
  for (const kind of ["sarc-f", "frail"] as const) {
    const base = kind === "sarc-f" ? 3 : 2;
    for (let code = 0; code < base ** 5; code++) {
      const answers = Array.from({ length: 5 }, (_, i) => Math.floor(code / base ** i) % base);
      const result = scoreGeriatricQuestionnaire(kind, 70, answers)!;
      const total = answers.reduce((sum, n) => sum + n, 0);
      assert.equal(result.value, String(total));
      assert.equal(result.visual?.scale?.active, kind === "sarc-f" ? Number(total >= 4) : total === 0 ? 0 : total < 3 ? 1 : 2);
    }
  }
});
test("questionnaire rejects incomplete, sparse, noninteger and invalid responses", () => {
  for (const kind of ["sarc-f", "frail"] as const) {
    for (const answers of [[], [0, 0, 0, 0], Array(5), [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, NaN], [0, 0, 0, 0, -1], [0, 0, 0, 0, .5], [0, 0, 0, 0, 3]]) assert.equal(scoreGeriatricQuestionnaire(kind, 70, answers), null);
    for (const age of [64, 121, NaN, 65.5]) assert.equal(scoreGeriatricQuestionnaire(kind, age, [0, 0, 0, 0, 0]), null);
  }
  assert.equal(scoreGeriatricQuestionnaire("frail", 70, [2, 0, 0, 0, 0]), null);
});
test("Chinese wording preserves RGA six-month variant and SARC-F option distinctions", () => {
  const sarc = geriatricQuestionnaires["sarc-f"].questions;
  assert.match(sarc[0].text, /4.5 公斤/);
  assert.match(sarc[1].choices[2], /輔具/);
  assert.match(sarc[2].choices[2], /沒有人幫忙/);
  assert.match(sarc[3].text, /10 階/);
  assert.deepEqual(sarc[4].choices, ["沒有跌倒", "1–3 次", "4 次以上"]);
  const frail = geriatricQuestionnaires.frail.questions;
  assert.match(frail[3].text, /超過 5 種/);
  assert.match(frail[3].hint!, /6 種以上/);
  assert.match(frail[4].text, /6 個月.*超過 5%/);
  assert.match(frail[4].hint!, /剛好下降 5% 不算/);
});
test("both public Chinese questionnaires have five accessible groups and no total entry", () => {
  for (const kind of ["sarc-f", "frail"] as const) {
    const html = renderToStaticMarkup(createElement(GeriatricQuestionnaire, { kind }));
    assert.match(html, /<fieldset class="ready-fieldset" disabled=""/);
    assert.equal([...html.matchAll(/class="question-card"/g)].length, 5);
    assert.equal([...html.matchAll(/type="radio"/g)].length, kind === "sarc-f" ? 15 : 10);
    assert.ok(!html.includes("原題本總分"));
    assert.ok(!html.includes("網頁重製權限確認"));
    const tool = getHealthTool(kind)!;
    assert.equal(tool.rightsConfirmed, true);
    assert.equal(tool.review.status, "pending");
    assert.ok(tool.sources.some(s => s.title.includes("ICFSR")));
  }
});
