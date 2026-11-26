import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve("out");
const pages = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== "_next") walk(name);
    else if (item.isFile() && item.name === "index.html") pages.push(name);
  }
}
walk(root);
test("all exported pages have a single H1, canonical, Chinese language and noindex", () => {
  assert.ok(pages.length >= 20);
  for (const file of pages) {
    const html = fs.readFileSync(file, "utf8");
    assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, file);
    assert.doesNotMatch(html, /待醫師審閱|待審閱/, file);
    assert.match(html, /<html[^>]+lang="zh-Hant-TW"/, file);
    assert.match(html, /<meta name="robots" content="noindex, follow"/, file);
    if (
      [
        path.join(root, "404/index.html"),
        path.join(root, "_not-found/index.html"),
      ].includes(file)
    )
      continue;
    assert.match(html, /<link rel="canonical" href="https:\/\/[^"/]+\//, file);
    assert.match(html, /property="og:title"/, file);
  }
});

test("article header, key points, plain medical section and collapsed references follow the shared presentation", () => {
  const html = fs.readFileSync(path.join(root, "articles/hyperuricemia/index.html"), "utf8");
  const header = html.match(/<header class="article-header">([\s\S]*?)<\/header>/)?.[1];
  assert.ok(header);
  assert.match(header, /<h1>高尿酸血症<\/h1>/);
  assert.match(header, /王柏霖醫師<!-- --> 編輯|王柏霖醫師 編輯/);
  assert.match(header, /更新於/);
  assert.doesNotMatch(header, /發布|article-lead|category-label/);
  assert.match(html, /<details class="reference-disclosure"><summary>/);
  assert.doesNotMatch(html, /<details class="reference-disclosure"[^>]*\bopen/);
  assert.match(html, /class="article-red-flags prose"/);
  assert.doesNotMatch(html, /class="warning-box"/);
  assert.match(html, /<strong>尿酸約達/);
});
test("exported internal links and article section anchors resolve", () => {
  for (const file of pages) {
    const html = fs.readFileSync(file, "utf8");
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, `duplicate ID in ${file}`);
    for (const match of html.matchAll(/<a\s[^>]*href="([^"]+)"/g)) {
      const href = match[1];
      if (!href.startsWith("/") && !href.startsWith("#")) continue;
      const url = new URL(href.replaceAll("&amp;", "&"), "https://fmdoc.vercel.app");
      const hash = url.hash.slice(1);
      const target = href.startsWith("#") ? file : path.join(root, decodeURIComponent(url.pathname), "index.html");
      assert.ok(fs.existsSync(target), `${file}: ${href}`);
      if (hash) {
        const targetHtml = fs.readFileSync(target, "utf8");
        assert.ok(
          targetHtml.includes(`id="${decodeURIComponent(hash)}"`),
          `${file}: missing anchor ${href}`,
        );
      }
    }
  }
});
test("JSON-LD parses and every demo article exposes author, dates and citations", () => {
  let articles = 0;
  for (const file of pages) {
    const html = fs.readFileSync(file, "utf8");
    for (const script of html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    )) {
      const schema = JSON.parse(script[1]);
      for (const node of schema["@graph"] || [schema]) {
        if (node["@type"] === "Article") {
          articles++;
          assert.ok(node.author.name);
          assert.ok(node.datePublished);
          assert.ok(node.dateModified);
          assert.ok(node.citation.length);
          assert.equal(node.editor.name, "王柏霖醫師");
          assert.equal(node.creativeWorkStatus, undefined);
        }
      }
    }
  }
  assert.equal(articles, fs.readdirSync("content/articles").filter(name => name.endsWith(".md")).length);
  assert.ok(fs.existsSync(path.join(root, "404.html")));
  assert.ok(fs.existsSync(path.join(root, "robots.txt")));
  assert.ok(fs.existsSync(path.join(root, "sitemap.xml")));
  assert.ok(fs.existsSync(path.join(root, "og-card.png")));
});
test("public export includes usable forms without review labels for all twenty-five tools", () => {
  for (const slug of ["frax", "bmi", "fib-4", "egfr", "isi", "stop-bang", "phq-9", "gad-7", "cardiovascular-risk", "metabolic-syndrome", "tdee", "waist-height-ratio", "taiwan-cancer-screening", "adult-health-check", "adult-vaccines", "sarc-f", "mna-sf", "frail", "ess", "sleep-diary", "sarcopenia", "ldl-target", "altitude-illness", "malaria-prevention", "travel-vaccines"]) {
    const html = fs.readFileSync(path.join(root, "tools", slug, "index.html"), "utf8");
    assert.ok(html.includes('data-tool-available="true"'), slug);
    assert.match(html, /<form[\s>]/, slug);
    assert.ok(!html.includes("待醫師審閱"), slug);
    assert.ok(!html.includes("尚未開放評估"), slug);
    assert.ok(!html.includes("先把關，再開放評估"), slug);
    assert.ok(!html.includes("已完成醫師審閱"), slug);
    if (["isi", "stop-bang", "phq-9", "gad-7"].includes(slug)) {
      assert.ok(html.includes("健康自我評估問卷"), slug);
      assert.match(html, /type="radio"/, slug);
      assert.ok(!html.includes("輸入題本分數"), slug);
      assert.ok(!html.includes("依原題本選項"), slug);
      assert.ok(html.includes("查看評估結果"), slug);
    }
  }
});


test("every exported page has at most one medical warning block", () => {
  for (const file of pages) {
    const html = fs.readFileSync(file, "utf8");
    const blocks = [...html.matchAll(/<(?:aside|section|div)\b[^>]*class="(?:review-notice|warning-box|safety-notice|notice)"[^>]*>/g)];
    assert.ok(blocks.length <= 1, file + ": duplicate medical warnings");
    assert.ok(!html.includes('class="preview-note"'), file);
    assert.ok(!html.includes('class="review-badge"'), file);
    assert.ok(!html.includes('class="assessment-footer-note"'), file);
    assert.ok(!html.includes('class="article-disclaimer"'), file);
  }
});


test("tool pages omit the removed introductions, general warning, adult checkbox and privacy paragraph", () => {
  for (const slug of ["bmi", "fib-4", "egfr", "isi", "stop-bang", "phq-9", "gad-7", "cardiovascular-risk", "metabolic-syndrome", "tdee", "waist-height-ratio", "taiwan-cancer-screening", "adult-health-check", "adult-vaccines", "sarc-f", "mna-sf", "frail", "ess", "sleep-diary", "sarcopenia", "ldl-target", "altitude-illness", "malaria-prevention", "travel-vaccines"]) {
    const html = fs.readFileSync(path.join(root, "tools", slug, "index.html"), "utf8");
    assert.ok(!html.includes('class="privacy-note"'), slug);
    assert.ok(!html.includes('class="review-notice"'), slug);
    assert.ok(!html.includes('<h2>適用對象</h2>'), slug);
    assert.ok(!html.includes('我已滿 18 歲。'), slug);
    assert.ok(!html.includes('<legend>開始評估</legend>'), slug);
  }
});
