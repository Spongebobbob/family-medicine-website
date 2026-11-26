import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { assessMalariaNeed, defaultMalariaSafety, emptyMalariaSafety, evaluateMalariaCandidates, malariaExposureWindows, neededMalariaSafety, type MalariaSafety } from "../src/lib/malaria-planner";
import { planMalariaSchedule } from "../src/lib/malaria-schedule";
import { emptyHealth, newTravelStop, dateValue, shiftTravelDate, type TravelPlan, type TravelStop, type TravelHealth } from "../src/lib/travel-plan";
import { MalariaPlannerForm } from "../src/components/tools/malaria-planner-form";
import { TravelPlanProvider } from "../src/components/tools/travel-plan-provider";
const today="2026-11-26";
const healthy:TravelHealth={...emptyHealth,age:32,weight:65,pregnant:"no",immune:"normal",spleen:"no",complexConditions:"no",longTermVfr:"no"};
const safe=():MalariaSafety=>{const value=emptyMalariaSafety();for(const key of Object.keys(value) as (keyof MalariaSafety)[]){if(key!=="weight"&&key!=="allergyDrugs")value[key]="no";}value.weight=65;return value;};
const stop=(country="indonesia",region="papua",patch:Partial<TravelStop>={}):TravelStop=>({...newTravelStop(),country,region,start:"2027-01-10",end:"2027-01-12",...patch});
const plan=(stops=[stop()]):TravelPlan=>({stops,animalContact:"unknown",remoteCare:"unknown",frequentTravel:"no",outdoorNights:"unknown"});
function need(p=plan(),h=healthy){const r=assessMalariaNeed(p,h,today);if("error"in r)throw Error(r.error);return r;}
function evaluate(p=plan(),h=healthy,s=safe(),preference:"shorter"|"daily"|"weekly"="shorter"){const r=evaluateMalariaCandidates(p,h,s,today,preference);if("error"in r)throw Error(r.error);return r;}
function schedule(id:"ap"|"doxy"|"meflo"|"chloro",windows=[{start:"2027-01-10",end:"2027-01-12"}]){const r=planMalariaSchedule(id,windows,today);if("error"in r)throw Error(r.error);return r;}

test("first stage returns all five distinct clinical decisions without asking drug safety",()=>{
  assert.equal(need(plan([stop("KH","phnom-penh",{setting:"urban"})])).need,"none");
  const low=need(plan([stop("KH","other-low")]));assert.equal(low.need,"bite");assert.equal(low.canScreen,false);
  assert.equal(need(plan([stop("KH","other-low")]),{...healthy,complexConditions:"yes"}).need,"individual");
  const high=need();assert.equal(high.need,"recommended");assert.equal(high.label,"建議服用瘧疾預防藥物");assert.equal(high.canScreen,true);
  assert.equal(need(plan([stop("OTHER","unverified")])).need,"unknown");
});

test("South Africa screenshot itinerary reaches drug screening and medication calendars",()=>{
  const p=plan([stop("south-africa","kruger",{start:"2026-12-24",end:"2026-12-31"})]);
  const decision=need(p);
  assert.equal(decision.need,"recommended");assert.equal(decision.unresolved,false);assert.equal(decision.canScreen,true);
  assert.deepEqual(decision.allowed,["ap","doxy","meflo"]);
  // The national text recommends drugs without assigning a high/low risk label.
  assert.equal(decision.segments[0].status,"unknown");
  assert.deepEqual(malariaExposureWindows(p,healthy,today),[{start:"2026-12-24",end:"2026-12-31"}]);
  assert.equal(evaluate(p,healthy,emptyMalariaSafety()).ready.length,0);
  const ap=evaluate(p).ready.find(c=>c.id==="ap")!.schedule!;
  assert.ok(!("error"in ap));assert.equal(ap.courses[0].lastDose,"2027-01-07");
});

test("Myanmar altitude choice is sufficient without a duplicate numeric altitude field",()=>{
  const p=(region:string,minAltitude:number|null=null)=>plan([stop("myanmar-burma",region,{start:"2026-11-28",end:"2026-11-30",minAltitude})]);
  const above=need(p("above"));
  assert.equal(above.need,"bite");assert.equal(above.unresolved,false);assert.equal(above.canScreen,false);
  assert.equal(above.segments[0].status,"low");assert.equal(above.segments[0].region?.above,undefined);
  // Old numeric values no longer contradict the selected altitude category.
  assert.equal(need(p("above",1000)).need,"bite");
  const below=need(p("below"));assert.equal(below.need,"recommended");assert.equal(below.canScreen,true);
  assert.deepEqual(below.allowed,["ap","doxy"]);assert.equal(below.segments[0].region?.below,undefined);
  assert.equal(need(p("above"),{...healthy,pregnant:"yes"}).need,"individual");
  assert.equal(need(p("above"),{...healthy,immune:"suppressed"}).need,"individual");
  for(const region of ["boundary","unverified"]){const d=need(p(region));assert.equal(d.need,"unknown");assert.equal(d.canScreen,false);}
  assert.match(need(p("boundary")).segments[0].reason,/正好 1000m/);
});

test("South Africa separates seasons, mapped zones and genuinely unresolved locations",()=>{
  const p=(region:string,start:string,end=start)=>plan([stop("south-africa",region,{start,end})]);
  for(const date of ["2027-05-31","2027-09-01","2027-12-31"])assert.equal(need(p("kruger",date)).need,"recommended");
  for(const date of ["2027-06-01","2027-08-31"])assert.equal(need(p("kruger",date)).need,"bite");
  const cross=p("kruger","2027-08-31","2027-09-02");
  assert.equal(need(cross).need,"recommended");
  assert.deepEqual(malariaExposureWindows(cross,healthy,today),[{start:"2027-09-01",end:"2027-09-02"}]);
  assert.equal(need(p("seasonal-low","2026-12-24")).need,"bite");
  assert.equal(need(p("seasonal-low","2026-12-24"),{...healthy,pregnant:"yes"}).need,"individual");
  assert.equal(need(p("seasonal-low","2026-12-24"),{...healthy,spleen:"yes"}).need,"recommended");
  assert.equal(need(p("seasonal-very-low","2026-12-24")).need,"bite");
  assert.equal(need(p("no-risk","2026-12-24")).need,"none");
  for(const region of ["seasonal-low","seasonal-very-low"])assert.equal(need(p(region,"2027-06-01")).need,"unknown");
  for(const region of ["other","unverified"]){const d=need(p(region,"2026-12-24"));assert.equal(d.need,"unknown");assert.equal(d.unresolved,true);assert.equal(d.canScreen,false);assert.equal(evaluate(p(region,"2026-12-24")).ready.length,0);}
  const mixed=plan([stop("south-africa","kruger"),stop("south-africa","other",{start:"2027-01-13",end:"2027-01-14"})]);
  assert.equal(need(mixed).need,"unknown");assert.equal(need(mixed).recommended,true);assert.equal(need(mixed).canScreen,false);
});
test("unknown itinerary or health never yields a whole-trip reassuring result",()=>{
  const p=plan([stop(),stop("OTHER","unverified",{start:"2027-01-13",end:"2027-01-14"})]);assert.equal(need(p).need,"unknown");assert.equal(need(p).recommended,true);assert.equal(need(p).canScreen,false);
  assert.equal(need(plan([stop("KH","other-low")]),{...healthy,spleen:"unknown"}).need,"individual");
  assert.ok(evaluate(p).ready.length===0);
});
test("high-risk short trip resolves to clear candidates only after the relevant safety questions",()=>{
  const unknown=evaluate(plan(),healthy,emptyMalariaSafety());assert.equal(unknown.ready.length,0);assert.ok(unknown.candidates.filter(c=>c.status!=="excluded").every(c=>c.schedule===null));
  const r=evaluate();assert.deepEqual(r.ready.map(c=>c.id),["ap","doxy","meflo"]);assert.equal(r.candidates.find(c=>c.id==="chloro")!.status,"excluded");assert.match(r.rankingNote,/不是官方/);
  assert.equal(evaluate(plan(),healthy,safe(),"weekly").ready[0].id,"meflo");
});
test("tomorrow's departure keeps daily options and does not ask mefloquine-only questions",()=>{
  const p=plan([stop("indonesia","papua",{start:"2026-11-27",end:"2026-11-29"})]);const s=emptyMalariaSafety();
  const r=evaluate(p,healthy,s);assert.equal(r.candidates.find(c=>c.id==="meflo")!.status,"too_late");
  const keys=neededMalariaSafety(r,s).keys;assert.ok(!keys.includes("psychiatric")&&!keys.includes("seizures")&&!keys.includes("cardiac"));assert.ok(keys.includes("renal"));
  const ready=evaluate(p);assert.deepEqual(ready.ready.map(c=>c.id),["ap","doxy"]);const course=ready.ready[0].schedule!;assert.ok(!("error"in course));assert.equal(course.courses[0].start,today);
});
test("same-day or past departures do not invent loading doses or late-start schedules",()=>{
  for(const date of [today,"2026-11-25"]){const r=evaluate(plan([stop("indonesia","papua",{start:date,end:"2026-11-29"})]));assert.equal(r.ready.length,0);assert.ok(r.candidates.every(c=>c.schedule===null));}
});
test("contraindications remove only affected candidates; unknown key answers cannot pass",()=>{
  const psychiatric=evaluate(plan(),healthy,{...safe(),psychiatric:"yes"});assert.equal(psychiatric.candidates.find(c=>c.id==="meflo")!.status,"excluded");assert.ok(psychiatric.ready.some(c=>c.id==="ap"));
  const renal=evaluate(plan(),healthy,{...safe(),renal:"yes",severeRenal:"yes"});assert.equal(renal.candidates.find(c=>c.id==="ap")!.status,"excluded");
  for(const key of ["pregnant","breastfeeding","hepatic","allergy","interactions"] as const){const r=evaluate(plan(),healthy,{...safe(),[key]:"unknown"});assert.equal(r.ready.length,0);assert.ok(r.candidates.every(c=>c.schedule===null));}
  assert.equal(evaluate(plan(),healthy,{...safe(),renal:"unknown"}).candidates.find(c=>c.id==="ap")!.status,"review");
});
test("children, pregnant travellers and complex disease do not receive automatic adult plans",()=>{
  for(const h of [{...healthy,age:17},{...healthy,age:70},{...healthy,pregnant:"yes" as const},{...healthy,complexConditions:"yes" as const},{...healthy,immune:"suppressed" as const}]){const r=evaluate(plan(),h);assert.equal(r.ready.length,0);assert.ok(r.candidates.every(c=>!c.doseReady&&c.schedule===null));}
  assert.equal(evaluate(plan(),{...healthy,pregnant:"yes"}).candidates.find(c=>c.id==="doxy")!.status,"excluded");
});
test("adult tablet weight boundaries follow UKMEAG 40kg and 45kg tables",()=>{
  assert.equal(evaluate(plan(),healthy,{...safe(),weight:39.99}).candidates.find(c=>c.id==="ap")!.status,"review");
  assert.equal(evaluate(plan(),healthy,{...safe(),weight:40}).candidates.find(c=>c.id==="ap")!.status,"candidate");
  assert.equal(evaluate(plan(),healthy,{...safe(),weight:44.99}).candidates.find(c=>c.id==="meflo")!.status,"review");
  assert.equal(evaluate(plan(),healthy,{...safe(),weight:45}).candidates.find(c=>c.id==="meflo")!.status,"candidate");
});
test("shared positive health records cannot silently turn into safe negative answers",()=>{
  const r=evaluate(plan(),{...healthy,renal:"severe",crcl:20,psychiatric:"yes",seizures:"yes",drugAllergy:"yes"});assert.equal(r.ready.length,0);assert.equal(r.candidates.find(c=>c.id==="ap")!.status,"excluded");assert.equal(r.candidates.find(c=>c.id==="meflo")!.status,"excluded");
});
test("questions deduplicate, retain exclusion-causing answers and keep entered weight editable",()=>{
  const s={...safe(),psychiatric:"yes" as const};const required=neededMalariaSafety(evaluate(plan(),healthy,s),s);assert.equal(new Set(required.keys).size,required.keys.length);assert.ok(required.keys.includes("psychiatric"));assert.equal(required.weight,true);
});
test("daily schedules use inclusive exposure dates and exact 7/28 day tails",()=>{
  const ap=schedule("ap",[{start:"2026-11-27",end:"2026-11-29"}]);assert.equal(ap.courses[0].start,"2026-11-26");assert.equal(ap.courses[0].lastDose,"2026-12-06");assert.equal(ap.totalDoses,11);assert.equal(ap.totalTablets,11);
  const doxy=schedule("doxy");assert.equal(doxy.courses[0].lastDose,"2027-02-09");assert.equal(doxy.totalDoses,32);
});
test("weekly schedules retain the same weekday and exactly four post-exposure weekly doses for all seven exit weekdays",()=>{
  for(const id of ["meflo","chloro"] as const)for(let offset=0;offset<7;offset++){const end=shiftTravelDate("2027-01-10",offset)!;const r=schedule(id,[{start:"2027-01-10",end}]),c=r.courses[0];assert.equal(c.doseDates.filter(d=>d>end).length,4);for(let i=1;i<c.doseDates.length;i++)assert.equal(dateValue(c.doseDates[i])!-dateValue(c.doseDates[i-1])!,7*86400000);assert.equal(r.totalTablets,r.totalDoses*(id==="chloro"?2:1));}
});
test("overlapping tails merge, long gaps create independent restart courses without double counting",()=>{
  const close=[{start:"2027-01-10",end:"2027-01-12"},{start:"2027-01-15",end:"2027-01-18"}];assert.equal(schedule("ap",close).courses.length,1);
  const far=[{start:"2027-01-10",end:"2027-01-12"},{start:"2027-04-10",end:"2027-04-12"}];for(const id of ["ap","doxy","meflo","chloro"] as const){const r=schedule(id,far);assert.equal(r.courses.length,2);assert.equal(new Set(r.courses.flatMap(c=>c.doseDates)).size,r.totalDoses);assert.ok(r.courses[1].start>r.courses[0].lastDose);}
});
test("cross-season trips use actual medication-risk days rather than the full country stay",()=>{
  const p=plan([stop("botswana","north",{start:"2027-05-30",end:"2027-06-04"})]);assert.equal(need(p).need,"recommended");assert.deepEqual(malariaExposureWindows(p,healthy,today),[{start:"2027-05-30",end:"2027-05-31"}]);
  const r=evaluate(p);const ap=r.ready.find(c=>c.id==="ap")!.schedule!;assert.ok(!("error"in ap));assert.equal(ap.courses[0].lastDose,"2027-06-07");
});
test("multi-country prophylaxis intersects resistance restrictions before personal ranking",()=>{
  const p=plan([stop("HT","all"),stop("TH","border",{start:"2027-01-13",end:"2027-01-16"})]);const h={...healthy,spleen:"yes" as const};assert.deepEqual(need(p,h).allowed,["ap","doxy"]);const r=evaluate(p,h);assert.equal(r.candidates.find(c=>c.id==="meflo")!.status,"excluded");assert.equal(r.ready.length,0);
});
test("invalid dates, malformed safety values and nonfinite weights fail closed",()=>{
  assert.ok("error"in assessMalariaNeed(plan([stop("indonesia","papua",{end:"2027-02-30"})]),healthy,today));
  for(const weight of [0,NaN,Infinity,-1,501])assert.ok("error"in evaluateMalariaCandidates(plan(),healthy,{...safe(),weight},today));
  assert.ok("error"in evaluateMalariaCandidates(plan(),healthy,{...safe(),pregnant:"bad"} as unknown as MalariaSafety,today));
  assert.ok("error"in planMalariaSchedule("ap",[{start:"2027-01-02",end:"2027-01-01"}],today));
});
test("initial public form excludes vaccine routing, drug screening, weight and removed warning box",()=>{
  const html=renderToStaticMarkup(createElement(TravelPlanProvider,null,createElement(MalariaPlannerForm)));
  assert.match(html,/disabled=""/);assert.match(html,/查看是否需要預防藥/);assert.doesNotMatch(html,/防蚊與發燒提醒/);assert.doesNotMatch(html,/黃熱病|轉機|體重|精神疾病|用藥與疫苗限制/);
  assert.equal((html.match(/class="safety-notice"/g)??[]).length,0);
});

test("identified allergy excludes that drug only after remaining ingredients are professionally confirmed",()=>{
 const s={...safe(),allergy:"yes" as const,allergyDrugs:["doxy" as const],otherAllergyClear:"yes" as const};const r=evaluate(plan(),healthy,s);assert.equal(r.candidates.find(c=>c.id==="doxy")!.status,"excluded");assert.ok(r.ready.some(c=>c.id==="ap"));assert.equal(evaluate(plan(),healthy,{...s,otherAllergyClear:"unknown"}).ready.length,0);
});


test("public safety defaults visible questions to no while preserving recorded positives and explicit unknowns",()=>{const s=defaultMalariaSafety(plan(),healthy,today);const r=evaluate(plan(),healthy,s);for(const key of neededMalariaSafety(r,s).keys)assert.equal(s[key],"no");assert.equal(s.severeRenal,"unknown");assert.equal(defaultMalariaSafety(plan(),{...healthy,pregnant:"yes"},today).pregnant,"yes");const unknown=evaluate(plan(),healthy,{...s,pregnant:"unknown"});assert.equal(unknown.ready.length,0);});
