import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fraxOfficialUrl, fraxRiskFactors, prepareFrax, recordFraxResult } from "../src/lib/frax";
import { FraxForm } from "../src/components/tools/frax-form";
import { getHealthTool } from "../src/lib/tool-catalog";

const valid = () => ({ age: "65", sex: "female", weight: "55", height: "160", bmd: "none", ...Object.fromEntries(fraxRiskFactors.map(f => [f.key, "no"])) });
test("FRAX preparation validates age without clamping, and retains unknown history", () => {
  for (const age of ["40", "90"]) assert.ok(prepareFrax({ ...valid(), age }).summary);
  for (const age of ["", "39", "91", "65.5", "NaN", "Infinity"]) assert.ok(prepareFrax({ ...valid(), age }).errors.age);
  const result = prepareFrax({ ...valid(), fracture: "unknown" });
  assert.match(result.summary!, /成年後曾有輕微外力造成的骨折：未確認/);
  assert.match(result.summary!, /1 項病史未確認/);
  assert.doesNotMatch(result.summary!, /骨折機率.*%/);
});
test("missing and invalid preparation data cannot be silently turned into normal values", () => {
  for (const change of [{ weight: "0" }, { height: "-1" }, { weight: "Infinity" }, { height: "" }, { sex: "unknown" }, { smoking: "" }, { smoking: "constructor" }, { bmd: "lumbar" }] as Record<string, string>[]) {
    assert.ok(Object.keys(prepareFrax({ ...valid(), ...change }).errors).length);
    assert.equal(prepareFrax({ ...valid(), ...change }).summary, undefined);
  }
  assert.ok(prepareFrax({ ...valid(), bmd: "report" }).summary?.includes("機型"));
});
test("transcription accepts true zero and exact decimals but rejects absent, impossible and unconfirmed probabilities", () => {
  const input = { major: "12.34", hip: "2.01", bmd: "without", confirmed: "yes" };
  assert.deepEqual(recordFraxResult(input).result, { major: 12.34, hip: 2.01, bmd: "without" });
  assert.equal(recordFraxResult({ ...input, major: "0", hip: "0" }).result?.major, 0);
  assert.equal(recordFraxResult({ ...input, major: "100", hip: "100" }).result?.hip, 100);
  for (const change of [{ major: "" }, { hip: "NaN" }, { hip: "-0.1" }, { major: "100.1" }, { hip: "20" }, { bmd: "unknown" }, { confirmed: "" }]) assert.equal(recordFraxResult({ ...input, ...change }).result, undefined);
});
test("FRAX route uses a sourced official workflow and hydrated forms, never a fake risk engine", () => {
  const tool = getHealthTool("frax")!;
  assert.equal(tool.kind, "guide"); assert.ok(tool.sources.some(s => s.url === fraxOfficialUrl));
  const html = renderToStaticMarkup(createElement(FraxForm));
  assert.match(html, /機率由官方 FRAX 產生/);
  assert.match(html, /href="https:\/\/www.fraxplus.org\/zh-Hant\/calculation-tool\/"/);
  assert.match(html, /fieldset disabled/); assert.equal([...html.matchAll(/<form\b/g)].length, 2);
  assert.doesNotMatch(html, /name="(?:patient|identity)"|[?&](?:age|weight)=/);
});
