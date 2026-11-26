import test from "node:test";
import assert from "node:assert/strict";
import { fib4Visual, egfrVisual, questionnaireVisual, waistHeightVisual, bmiVisual } from "../src/lib/result-visuals";

test("FIB-4 visuals respect age-adjusted and unrounded clinical boundaries", () => {
  assert.equal(fib4Visual(1.29999, 65).scale?.active, 0);
  assert.equal(fib4Visual(1.3, 65).scale?.active, 1);
  assert.equal(fib4Visual(1.99, 66).scale?.active, 0);
  assert.equal(fib4Visual(2, 66).scale?.active, 1);
  assert.equal(fib4Visual(2.67, 66).scale?.active, 1);
  assert.equal(fib4Visual(2.67001, 66).scale?.active, 2);
  assert.equal(fib4Visual(1, 66).scale?.bands[0].range, "< 2");
  assert.equal(fib4Visual(10, 34).scale, undefined);
  assert.equal(fib4Visual(10, 34).tone, "neutral");
  assert.equal(fib4Visual(NaN, 60).scale, undefined);
});

test("eGFR and BMI graphics use the same raw-value categories as calculations", () => {
  assert.equal(egfrVisual(90).scale?.active, 0);
  assert.equal(egfrVisual(60).scale?.active, 1);
  assert.equal(egfrVisual(59.99999).scale?.active, 2);
  assert.equal(egfrVisual(45).scale?.active, 2);
  assert.equal(egfrVisual(30).scale?.active, 3);
  assert.equal(egfrVisual(15).scale?.active, 4);
  assert.equal(egfrVisual(14.99999).scale?.active, 5);
  assert.equal(bmiVisual(18.5).scale?.active, 1);
  assert.equal(bmiVisual(24).scale?.active, 2);
  assert.equal(bmiVisual(27).scale?.active, 3);
});

test("PHQ-9 safety signal never receives a reassuring low-score scale", () => {
  for (const item9 of [1, 2, 3]) {
    const visual = questionnaireVisual("phq-9", [...Array(8).fill(0), item9]);
    assert.equal(visual.tone, "danger");
    assert.equal(visual.scale, undefined);
  }
  assert.equal(questionnaireVisual("phq-9", Array(9).fill(0)).scale?.active, 0);
  assert.equal(questionnaireVisual("phq-9", Array(8).fill(0)).scale, undefined);
});

test("STOP-BANG combination and waist-height eligibility are preserved visually", () => {
  assert.equal(questionnaireVisual("stop-bang", [1, 1, 0, 0, 1, 0, 0, 0]).scale?.active, 2);
  assert.equal(questionnaireVisual("stop-bang", [1, 1, 1, 0, 0, 0, 0, 0]).scale?.active, 1);
  assert.equal(waistHeightVisual("higher", false).scale, undefined);
  assert.equal(waistHeightVisual("increased", true).scale?.active, 2);
  assert.equal(questionnaireVisual("isi", [4, 4, 4, 4, 4, 2, 0]).scale?.active, 3);
});
