import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import matter from "gray-matter";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getArticle, headingsFor, parseArticle, referencedMarkdown } from "../src/lib/content";
import { validateFigure } from "../src/lib/article-figures";
import { ArticleMarkdown } from "../src/components/markdown";
import { ReferenceList } from "../src/components/articles/reference-list";

test("hyperuricemia retains clinical review, complete structure and verified separate datasets", () => {
  const article = getArticle("hyperuricemia")!;
  assert.equal(article.status, "pending-review");assert.equal(article.kind,"education");
  assert.equal(article.numberedSections,true);assert.equal(article.references.length,9);
  const sections = headingsFor(article.body).filter(h=>h.depth===2);
  assert.equal(sections.length,14);
  sections.forEach((heading,index)=>assert.ok(heading.text.startsWith(`${index+1}. `)));
  assert.ok(article.faq.length>=8);assert.ok(article.warnings.length);
  const hyper = article.figures.find(f=>f.id==="urate-prevalence")!;
  const gout = article.figures.find(f=>f.id==="gout-prevalence")!;
  assert.equal(hyper.type,"bar");assert.equal(gout.type,"bar");
  if(hyper.type!=="bar"||gout.type!=="bar")throw Error("wrong figure type");
  assert.deepEqual(hyper.data.map(row=>row.values),[{male:26.1,female:17},{male:17.9,female:9.9}]);
  assert.deepEqual(gout.data.map(row=>row.values.prevalence),[6.24,9.34,3.2]);
  assert.deepEqual(hyper.sources,["ref5"]);assert.deepEqual(gout.sources,["ref6"]);
  assert.match(hyper.note,/非 2026 年即時/);assert.match(gout.note,/不同/);
  const order=[...new Set([...article.body.matchAll(/\[來源:([a-z0-9-]+)\]/g)].map(match=>match[1]))];
  assert.deepEqual(order,article.references.map(ref=>ref.id));
});

test("figure schemas reject unsourced, missing and impossible statistical values",()=>{
  const base=JSON.parse(fs.readFileSync("content/figures/urate-prevalence.json","utf8"));
  for(const alter of [
    (f:typeof base)=>{f.sources=[];},(f:typeof base)=>{f.sources=["missing"];},
    (f:typeof base)=>{f.alt="";},(f:typeof base)=>{f.data[0].values.male=NaN;},
    (f:typeof base)=>{f.data[0].values.male=101;},(f:typeof base)=>{delete f.data[0].values.male;},
    (f:typeof base)=>{f.series.push(f.series[0]);},
  ]){const input=structuredClone(base);alter(input);assert.throws(()=>validateFigure(input,base.id,["ref5"]));}
});

test("diagram schemas reject clipped text and dangling connections",()=>{
  const base=JSON.parse(fs.readFileSync("content/figures/urate-decision.json","utf8"));
  for(const alter of [
    (f:typeof base)=>{f.edges[0].to="missing";},(f:typeof base)=>{f.nodes[0].x=900;},
    (f:typeof base)=>{f.nodes[0].height=20;},(f:typeof base)=>{f.nodes[0].x=Infinity;},
  ]){const input=structuredClone(base);alter(input);assert.throws(()=>validateFigure(input,base.id,["ref1","ref2","ref3","ref4"]));}
  const edges=base.edges.filter((edge:{from:string})=>edge.from==="acute");
  assert.deepEqual(edges.map((edge:{to:string})=>edge.to),["urgent","history"]);
});

test("educational article imports reject unregistered assets, citations and malformed bibliography",()=>{
  const parsed=matter(fs.readFileSync("content/articles/hyperuricemia.md","utf8"));
  for(const alter of [
    (data:typeof parsed.data)=>{delete data.references[0].vancouver;},
    (data:typeof parsed.data)=>{data.references[0].doi="invented";},
    (data:typeof parsed.data)=>{data.figures=["../secret"];},
    (data:typeof parsed.data)=>{data.faq[0].answer="[來源:missing]";},
  ]){const data=structuredClone(parsed.data);alter(data);assert.throws(()=>parseArticle(matter.stringify(parsed.content,data),"hyperuricemia"));}
  assert.throws(()=>parseArticle(matter.stringify(parsed.content+"\n![missing](/article-figures/missing)",parsed.data),"hyperuricemia"));
});

test("Markdown renders semantic tables, callouts, accessible sourced figures and Vancouver anchors",()=>{
  const article=getArticle("hyperuricemia")!;
  const html=renderToStaticMarkup(createElement(ArticleMarkdown,{body:article.body,figures:article.figures,references:article.references}));
  assert.match(html,/<table>/);assert.match(html,/role="note"/);
  assert.equal([...html.matchAll(/<figure /g)].length,4);
  assert.equal([...html.matchAll(/<svg /g)].length,2);
  assert.match(html,/<desc id=/);assert.match(html,/查看圖表數據/);assert.match(html,/查看圖示文字與分支/);
  assert.match(html,/href="#ref-ref5"/);assert.doesNotMatch(html,/<img[^>]+article-figures/);
  assert.doesNotMatch(html,/<p><figure/);
  const refs=renderToStaticMarkup(createElement(ReferenceList,{references:article.references,anchors:true}));
  assert.match(refs,/id="ref-ref1"/);assert.match(refs,/https:\/\/doi.org\//);assert.match(refs,/https:\/\/pubmed.ncbi.nlm.nih.gov\//);
  assert.match(referencedMarkdown("[來源:ref1]",article.references),/\[\[1\]\]\(#ref-ref1\)/);
  const unsafe=renderToStaticMarkup(createElement(ArticleMarkdown,{body:'<script>alert(1)</script>\n\n[unsafe](javascript:alert(1))'}));
  assert.doesNotMatch(unsafe,/<script|href="javascript:/);
});
