import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { calculateBmi } from "../src/lib/health";
import {
  getArticles,
  parseArticle,
  headingsFor,
  toSearchArticle,
  referencedMarkdown,
} from "../src/lib/content";
import { searchArticles, searchTools } from "../src/lib/search";
import { healthTools } from "../src/lib/tool-catalog";
import { categories } from "../src/lib/site";
import { jsonLd } from "../src/lib/seo";

test("BMI uses Taiwan boundaries without rounding the classification", () => {
  for (const [weight, category] of [
    [73.96, "體重過輕"],
    [74, "健康體位"],
    [95.999, "健康體位"],
    [96, "體重過重"],
    [107.999, "體重過重"],
    [108, "肥胖"],
  ] as const)
    assert.equal(calculateBmi(200, weight)?.category, category);
  assert.equal(calculateBmi(200, 80)?.value, 20);
});
test("BMI rejects empty, nonfinite and out-of-range measurements", () => {
  for (const [h, w] of [
    [0, 60],
    [165, 0],
    [NaN, 60],
    [165, Infinity],
    [99, 60],
    [251, 60],
    [165, 19],
    [165, 401],
  ])
    assert.equal(calculateBmi(h, w), null);
});
test("all sample articles have review labels, valid references and categories", () => {
  const articles = getArticles().filter((a) =>
    ["sleep-basics", "home-blood-pressure", "health-check-red-flags"].includes(
      a.slug,
    ),
  );
  assert.equal(articles.length, 3);
  assert.equal(categories.length, 9);
  for (const a of articles) {
    assert.equal(a.status, "pending-review");
    assert.match(a.author, /尚未醫師署名/);
    assert.ok(a.references.length);
    assert.ok(categories.some((c) => c.slug === a.category));
    assert.ok(a.faq.length);
    assert.ok(a.warnings.length);
  }
});
test("invalid frontmatter, dates, duplicate sources and unknown citations fail early", () => {
  const source = fs.readFileSync("content/articles/sleep-basics.md", "utf8");
  for (const invalid of [
    source.replace("sleep-mental-health", "unknown"),
    source.replace('published: "2026-11-25"', 'published: "2026-99-99"'),
    source.replace("pending-review", "reviewed"),
    source + "\n[來源:missing]",
    source.replace("id: insomnia-treatment", "id: sleep-habits"),
  ])
    assert.throws(() => parseArticle(invalid, "sleep-basics"));
});
test("automatic heading anchors support Chinese, repeated headings and ignore code blocks", () => {
  assert.deepEqual(
    headingsFor(
      "## 先看 **睡眠**\n\n## 先看 睡眠\n\n```md\n## 假標題\n```\n\n### 下一步",
    ),
    [
      { id: "先看-睡眠", text: "先看 睡眠", depth: 2 },
      { id: "先看-睡眠-1", text: "先看 睡眠", depth: 2 },
      { id: "下一步", text: "下一步", depth: 3 },
    ],
  );
});
test("body headings cannot collide with template section IDs", () => {
  assert.deepEqual(
    headingsFor("## FAQ\n\n## summary").map((h) => h.id),
    ["faq-1", "summary-1"],
  );
  assert.deepEqual(
    headingsFor("## Test\n\n## Test\n\n## Test-1").map((h) => h.id),
    ["test", "test-1", "test-1-1"],
  );
});
test("search matches body, multiple terms, whitespace and no-match states", () => {
  const articles = getArticles().map(toSearchArticle);
  assert.equal(searchArticles(articles, "   ").length, articles.length);
  assert.equal(
    searchArticles(articles, "血壓 袖帶")[0].slug,
    "home-blood-pressure",
  );
  assert.equal(searchArticles(articles, "失眠")[0].slug, "sleep-basics");
  assert.equal(searchArticles(articles, "不存在的內容").length, 0);
});

test("home search finds health tools by Chinese names, English terms and multiple words", () => {
  assert.equal(searchTools(healthTools, "  ldl  ")[0].slug, "ldl-target");
  assert.ok(searchTools(healthTools, "失眠").some(tool => tool.slug === "isi"));
  assert.ok(searchTools(healthTools, "eGFR 腎").some(tool => tool.slug === "egfr"));
  assert.equal(searchTools(healthTools, "LDL 不存在的內容").length, 0);
  assert.equal(searchTools(healthTools, "TSH").length, 0);
  assert.equal(searchTools(healthTools, "   ").length, 0);
});
test("source markers link to references and JSON-LD escapes script delimiters", () => {
  assert.equal(
    referencedMarkdown("參考[來源:aha-home]"),
    "參考[〔來源〕](#ref-aha-home)",
  );
  assert.ok(!jsonLd({ title: "</script>" }).includes("<"));
});
