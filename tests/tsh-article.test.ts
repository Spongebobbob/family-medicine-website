import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getArticle, headingsFor } from "../src/lib/content";
import { forestAxis, validateFigure } from "../src/lib/article-figures";
import { ArticleMarkdown } from "../src/components/markdown";

test("TSH article retains 17-section structure, nonpregnant scope and pending review",()=>{
  const article=getArticle("tsh")!;
  assert.equal(article.kind,"education");assert.equal(article.status,"pending-review");
  assert.equal(article.numberedSections,true);assert.equal(article.references.length,13);assert.equal(article.faq.length,7);
  const sections=headingsFor(article.body).filter(h=>h.depth===2);
  assert.equal(sections.length,14);sections.forEach((h,index)=>assert.ok(h.text.startsWith(`${index+1}. `)));
  assert.match(article.body,/非懷孕成人/);assert.match(article.body,/二手來源/);
  assert.equal(article.figures.length,5);assert.ok(article.warnings.some(w=>w.includes("發燒、喉嚨痛")));
  assert.ok(!article.references.some(ref=>ref.id==="tsh-ref14"));
  const order=[...new Set([...article.body.matchAll(/\[來源:([a-z0-9-]+)\]/g)].map(match=>match[1]))];
  assert.deepEqual(order,article.references.filter(ref=>order.includes(ref.id)).map(ref=>ref.id));
});

test("TSH figures preserve provided HR and SMD confidence intervals without mixing measures",()=>{
  const figures=getArticle("tsh")!.figures;
  const hr=figures.find(f=>f.id==="tsh-chd-risk")!,smd=figures.find(f=>f.id==="tsh-treatment-effects")!;
  assert.ok(hr.type==="forest"&&smd.type==="forest");
  assert.equal(hr.measure,"HR");assert.equal(hr.nullValue,1);
  assert.deepEqual(hr.rows.map(r=>[r.estimate,r.lower,r.upper]),[[1,.86,1.18],[1.17,.96,1.43],[1.89,1.28,2.8]]);
  assert.equal(smd.measure,"SMD");assert.equal(smd.nullValue,0);
  for(const figure of [hr,smd]){const axis=forestAxis(figure);assert.ok(axis.ticks.includes(figure.nullValue));assert.ok(figure.rows.every(row=>row.lower>=axis.domain[0]&&row.upper<=axis.domain[1]));}
  assert.deepEqual(smd.rows.map(r=>[r.estimate,r.lower,r.upper,r.n]),[[-.11,-.25,.03,796],[.01,-.12,.14,858]]);
  assert.match(hr.note,/不是冠心病死亡/);assert.match(smd.note,/2192 人套用/);
  const prevalence=figures.find(f=>f.type==="bar")!;assert.equal(prevalence.type,"bar");
  assert.deepEqual(prevalence.data.map(r=>r.values.prevalence),[6,2]);assert.match(prevalence.note,/不是全國代表性/);
});

test("forest schemas reject reversed CI, nonfinite effects and wrong null-effect lines",()=>{
  const base=JSON.parse(fs.readFileSync("content/figures/tsh-treatment-effects.json","utf8"));
  for(const alter of [
    (f:typeof base)=>{f.nullValue=1;},(f:typeof base)=>{f.rows[0].lower=.5;},
    (f:typeof base)=>{f.rows[0].estimate=NaN;},(f:typeof base)=>{f.rows[0].n=1.5;},
    (f:typeof base)=>{f.sources=[];},
  ]){const input=structuredClone(base);alter(input);assert.throws(()=>validateFigure(input,base.id,["tsh-ref5"]));}
  const hr=JSON.parse(fs.readFileSync("content/figures/tsh-chd-risk.json","utf8"));hr.rows[0].lower=-.1;
  assert.throws(()=>validateFigure(hr,hr.id,["tsh-ref11"]));
});

test("feedback diagrams preserve inhibition direction and validate routed edges",()=>{
  const diagram=getArticle("tsh")!.figures.find(f=>f.id==="tsh-feedback")!;
  assert.ok(diagram.type==="mechanism");
  assert.deepEqual(diagram.edges.filter(e=>e.effect==="inhibition").map(e=>e.to),["hypothalamus","pituitary"]);
  const input=structuredClone(diagram);input.edges[0].via=[{x:10000,y:1}];
  assert.throws(()=>validateFigure(input,input.id,["tsh-ref1","tsh-ref2"]));
  const article=getArticle("tsh")!;
  const html=renderToStaticMarkup(createElement(ArticleMarkdown,{body:article.body,figures:article.figures,references:article.references}));
  assert.equal([...html.matchAll(/<figure /g)].length,5);
  assert.match(html,/95% CI/);assert.match(html,/-0\.25/);assert.match(html,/796/);assert.match(html,/抑制/);
  assert.doesNotMatch(html,/<img[^>]+(?:assets|article-figures)/);
});
