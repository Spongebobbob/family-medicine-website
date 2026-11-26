import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { dateValue, shiftTravelDate, tripDays, travelDataCurrent, validateTravel, emptyHealth, newTravelStop, type TravelHealth, type TravelPlan, type TravelStop } from "../src/lib/travel-plan";
import { destinations, travelEvidence, TRAVEL_CHECKED, type DrugId } from "../src/lib/travel-data";
import { assessMalariaStop, assessMalaria, compareMalariaDrug, malariaSchedule, malariaFeverAlert } from "../src/lib/travel-malaria";
import { yellowEntryRequirement, yellowFeverSafety, yellowCertificate, assessTravelVaccines, type TravelRecords } from "../src/lib/travel-vaccines";
import { AltitudeForm } from "../src/components/tools/altitude-form";
import { TravelHealthForm } from "../src/components/tools/travel-health-form";
import { TravelPlanProvider } from "../src/components/tools/travel-plan-provider";
const today="2026-11-26";
const healthy:TravelHealth={age:30,weight:65,spleen:"no",complexConditions:"no",longTermVfr:"no",pregnant:"no",breastfeedingSmallInfant:"no",renal:"normal",crcl:100,psychiatric:"no",seizures:"no",conduction:"no",psoriasis:"no",drugAllergy:"no",interactions:"no",g6pd:"normal",immune:"normal",thymus:"no",vaccineAllergy:"no",breastfeeding:"no"};
const stop=(country="TH",region="border",patch:Partial<TravelStop>={}):TravelStop=>({...newTravelStop(),country,region,start:"2027-01-10",end:"2027-01-20",setting:"forest",fromRisk:"no",transit:"none",...patch});
const plan=(s:TravelStop=stop(),patch:Partial<TravelPlan>={}):TravelPlan=>({stops:[s],animalContact:"no",remoteCare:"no",frequentTravel:"no",outdoorNights:"no",...patch});
const records:TravelRecords={vaccines:{},yfDate:"",icvp:"unknown"};
function malaria(p=plan(),h=healthy,asOf=today){const r=assessMalaria(p,h,asOf);if("error"in r)throw Error(r.error);return r;}
function vaccines(p=plan(),h=healthy,r=records,asOf=today){const result=assessTravelVaccines(p,h,r,asOf);if("error"in result)throw Error(result.error);return result;}
test("calendar math is timezone-independent across leap days, year changes and inclusive stay dates",()=>{
  assert.equal(shiftTravelDate("2028-02-28",1),"2028-02-29");assert.equal(shiftTravelDate("2028-02-28",2),"2028-03-01");assert.equal(shiftTravelDate("2027-01-01",-1),"2026-12-31");
  for(const bad of ["2027-02-29","2026-11-31","2026-1-01","NaN","0000-01-01"])assert.equal(dateValue(bad),null);
  assert.equal(tripDays(stop("TH","border",{start:"2027-01-10",end:"2027-01-10"})),1);
  assert.equal(tripDays(stop("TH","border",{start:"2027-01-11",end:"2027-01-10"})),null);
});
test("data snapshots expire after exactly 90 days and do not apply before verification",()=>{
  assert.equal(travelDataCurrent(TRAVEL_CHECKED),true);assert.equal(travelDataCurrent(shiftTravelDate(TRAVEL_CHECKED,90)!),true);assert.equal(travelDataCurrent(shiftTravelDate(TRAVEL_CHECKED,91)!),false);assert.equal(travelDataCurrent("2026-11-25"),false);
  assert.equal(assessMalariaStop(stop(),"2027-03-01").status,"unknown");
  assert.equal(vaccines(plan(),healthy,records,"2027-03-01").items.filter(i=>i.group==="risk").length,0);
});
test("each country and regional rule has source, scope, version and verification metadata",()=>{
  assert.equal(destinations.length,6);const ids=new Set<string>();for(const c of destinations){assert.equal(c.checked,today);assert.ok(c.version&&c.scope&&c.source.startsWith("https://"));assert.ok(!ids.has(c.id));ids.add(c.id);assert.equal(new Set(c.regions.map(r=>r.id)).size,c.regions.length);for(const r of c.regions)assert.ok(r.name&&r.note);}
  for(const e of Object.values(travelEvidence))assert.ok(e.version&&e.checked===today&&e.scope&&e.url.startsWith("https://"));
});
test("NaTHNaC replaces the six-country CDC-led risk classification",()=>{
 for(const [country,region,patch,expected] of [["TH","cities",{setting:"urban"},"none"],["TH","border",{},"low"],["VN","rural",{},"low"],["KE","nairobi",{setting:"urban"},"very_low"],["KE","highlands",{minAltitude:2500.01},"very_low"],["BR","amazon",{},"low"],["HT","all",{},"unknown"],["JP","all",{},"unknown"]] as const) assert.equal(assessMalariaStop(stop(country,region,patch),today).status,expected);
 assert.equal(malaria(plan(stop("TH","border"))).needsMedication,false);
 assert.equal(malaria(plan(stop("HT","all"))).needsMedication,true);
});
test("unknown routes do not produce a whole-trip no-medication conclusion",()=>{
 const r=malaria(plan(stop("OTHER","unverified")));assert.equal(r.unknown,true);assert.ok(r.drugs.every(d=>d.status!=="discuss"&&d.schedule===null));
 const mixed=malaria(plan(stop("HT","all"),{stops:[stop("HT","all"),stop("OTHER","unverified",{start:"2027-01-21",end:"2027-01-23"})]}));assert.equal(mixed.needsMedication,true);assert.equal(mixed.unknown,true);assert.ok(mixed.drugs.every(d=>d.schedule===null));
});
test("dry season and a short stay do not silently remove year-round prophylaxis",()=>{
 for(const month of [1,5,10,12])assert.equal(assessMalariaStop(stop("angola","all",{start:"2027-"+String(month).padStart(2,"0")+"-01",end:"2027-"+String(month).padStart(2,"0")+"-01"}),today).prophylaxis,"recommended");
});
test("drug candidates intersect every UK segment requiring prophylaxis",()=>{
 const r=malaria(plan(stop("HT","all"),{stops:[stop("HT","all"),stop("KH","western-border",{start:"2027-01-21",end:"2027-01-25"})]}),{...healthy,spleen:"yes"});
 assert.equal(r.drugs.find(d=>d.id==="ap")!.status,"discuss");assert.equal(r.drugs.find(d=>d.id==="meflo")!.status,"excluded");assert.equal(r.drugs.find(d=>d.id==="chloro")!.status,"excluded");
 assert.equal(malaria(plan(stop("HT","all"))).drugs.find(d=>d.id==="chloro")!.status,"discuss");
});
test("AP, Doxycycline, Mefloquine and Chloroquine compute correct prophylaxis dates",()=>{
  assert.deepEqual(malariaSchedule("ap","2027-01-01","2027-01-10"),{latestStart:"2026-12-31",earliestStart:"2026-12-30",continueThrough:"2027-01-17",frequency:"每日",afterDays:7});
  assert.equal(malariaSchedule("doxy","2027-01-01","2027-01-10")!.continueThrough,"2027-02-07");
  assert.equal(malariaSchedule("meflo","2027-01-01","2027-01-10")!.latestStart,"2026-12-18");assert.equal(malariaSchedule("meflo","2027-01-01","2027-01-10")!.earliestStart,"2026-12-11");
  assert.equal(malariaSchedule("chloro","2027-01-01","2027-01-10")!.earliestStart,"2026-12-25");assert.equal(malariaSchedule("chloro","2027-01-01","2027-01-10")!.latestStart,"2026-12-25");
  assert.equal(malariaSchedule("ap","bad","2027-01-10"),null);assert.equal(malariaSchedule("ap","2027-01-11","2027-01-10"),null);
});
test("AP restrictions use actual CrCl <30, weight <5 and nursing infant <5kg boundaries",()=>{
  const compare=(patch:Partial<TravelHealth>)=>compareMalariaDrug("ap",{...healthy,...patch},["ap"],false);
  assert.equal(compare({crcl:29.999,renal:"unknown"}).status,"excluded");assert.equal(compare({crcl:30}).status,"discuss");assert.equal(compare({weight:4.999}).status,"excluded");assert.equal(compare({weight:5}).status,"review");assert.equal(compare({weight:11}).status,"discuss");
  assert.equal(compare({breastfeedingSmallInfant:"yes"}).status,"review");assert.equal(compare({renal:"unknown",crcl:null}).status,"review");assert.equal(compare({weight:null}).status,"review");
});
test("pregnancy, child age, psychiatric, seizure and conduction conditions are independently screened",()=>{
  assert.equal(compareMalariaDrug("ap",{...healthy,pregnant:"yes"},["ap"],false).status,"review");assert.equal(compareMalariaDrug("doxy",{...healthy,pregnant:"yes"},["doxy"],false).status,"excluded");
  assert.equal(compareMalariaDrug("doxy",{...healthy,age:11.999},["doxy"],false).status,"excluded");assert.notEqual(compareMalariaDrug("doxy",{...healthy,age:12},["doxy"],false).status,"excluded");
  for(const key of ["psychiatric","seizures","conduction"] as const){assert.equal(compareMalariaDrug("meflo",{...healthy,[key]:"yes"},["meflo"],false).status,"excluded");assert.equal(compareMalariaDrug("meflo",{...healthy,[key]:"unknown"},["meflo"],false).status,"review");}
  assert.equal(compareMalariaDrug("chloro",{...healthy,psoriasis:"yes"},["chloro"],false).status,"review");
});
test("unknown pregnancy, interactions and allergies are not treated as negative; G6PD is not a blanket four-drug contraindication",()=>{
  for(const id of ["ap","doxy","meflo","chloro"] as DrugId[])for(const key of ["pregnant","interactions","drugAllergy"] as const)assert.notEqual(compareMalariaDrug(id,{...healthy,[key]:"unknown"},[id],false).status,"discuss");
  assert.equal(compareMalariaDrug("ap",{...healthy,g6pd:"deficient"},["ap"],false).status,"discuss");assert.match(malaria(plan(),{...healthy,g6pd:"unknown"}).g6pd,/定量/);
});
test("missed start dates and contraindications suppress personal calendars",()=>{
  const r=malaria(plan(stop("HT","all",{start:"2026-12-01",end:"2026-12-10"})));
  assert.equal(r.drugs.find(d=>d.id==="meflo")!.schedule,null);assert.match(r.drugs.find(d=>d.id==="meflo")!.review.join(),/錯過/);
  assert.ok(malaria(plan(),{...healthy,pregnant:"yes"}).drugs.filter(d=>["ap","doxy"].includes(d.id)).every(d=>d.schedule===null));
});
test("fever warning fires without completed itinerary or medication choice",()=>{
  assert.equal(malariaFeverAlert("yes"),true);for(const a of ["no","unknown",""] as const)assert.equal(malariaFeverAlert(a),false);
});
test("Taiwan direct route, exact 12-hour layover and >12-hour YF exposure differ",()=>{
  const direct=stop("TH","cities",{setting:"urban"});assert.equal(yellowEntryRequirement(direct,[],30,today).status,"not-triggered");
  assert.equal(yellowEntryRequirement({...direct,transit:"risk",transitHours:12,leftAirport:"no"},[],30,today).status,"not-triggered");
  assert.equal(yellowEntryRequirement({...direct,transit:"risk",transitHours:12.001,leftAirport:"no"},[],30,today).status,"required");
  assert.equal(yellowEntryRequirement({...direct,transit:"risk",transitHours:2,leftAirport:"yes"},[],30,today).status,"required");
  assert.equal(yellowEntryRequirement({...direct,transit:"risk",transitHours:null,leftAirport:"no"},[],30,today).status,"unknown");
  assert.equal(yellowEntryRequirement({...direct,fromRisk:"unknown"},[],30,today).status,"unknown");
});
test("YF country-specific age and unknown transit rules are preserved, not generalized across countries",()=>{
  assert.equal(yellowEntryRequirement(stop("TH","cities",{fromRisk:"yes"}),[],.749,today).status,"below-age");assert.equal(yellowEntryRequirement(stop("TH","cities",{fromRisk:"yes"}),[],.75,today).status,"required");
  assert.equal(yellowEntryRequirement(stop("KE","safari",{fromRisk:"yes"}),[],.99,today).status,"below-age");assert.equal(yellowEntryRequirement(stop("KE","safari",{fromRisk:"yes"}),[],1,today).status,"required");
  assert.equal(yellowEntryRequirement(stop("KE","safari",{transit:"risk",transitHours:13,leftAirport:"no"}),[],30,today).status,"unknown");
  assert.equal(yellowEntryRequirement(stop("VN","cities",{fromRisk:"yes"}),[],30,today).status,"not-listed");
  assert.equal(yellowEntryRequirement(stop("OTHER","unverified"),[],30,today).status,"unknown");
});
test("previous risk country can trigger later entry requirement even when first country's city has no malaria",()=>{
  assert.equal(yellowEntryRequirement(stop("TH","cities"),[stop("BR","cities")],30,today).status,"required");
});
test("YF vaccine contraindications and precautions include exact infant and older-adult boundaries",()=>{
  assert.equal(yellowFeverSafety({...healthy,age:.49}).blocked,true);
  assert.equal(yellowFeverSafety({...healthy,age:.5}).blocked,false);assert.match(yellowFeverSafety({...healthy,age:.5}).precautions.join(),/6–8/);
  assert.ok(!yellowFeverSafety({...healthy,age:.75}).precautions.some(s=>s.includes("6–8")));
  assert.ok(!yellowFeverSafety({...healthy,age:59.999}).precautions.some(s=>s.includes("60 歲")));assert.match(yellowFeverSafety({...healthy,age:60}).precautions.join(),/60 歲/);
  for(const patch of [{immune:"suppressed"},{thymus:"yes"},{vaccineAllergy:"yes"}] as const)assert.equal(yellowFeverSafety({...healthy,...patch}).blocked,true);
  assert.equal(yellowFeverSafety({...healthy,pregnant:"yes"}).blocked,false);assert.match(yellowFeverSafety({...healthy,pregnant:"yes"}).precautions.join(),/懷孕/);
});
test("YF certificate is effective on day 10, not day 9; vaccination alone is not a certificate",()=>{
  const r:TravelRecords={vaccines:{yf:"complete"},yfDate:"2026-11-01",icvp:"yes"};
  assert.match(yellowCertificate(r,"2026-11-10"),/晚於/);assert.match(yellowCertificate(r,"2026-11-11"),/終身/);
  assert.match(yellowCertificate({...r,icvp:"no"},"2026-12-01"),/不等於/);
  assert.match(yellowCertificate({...r,yfDate:"invalid"},"2026-12-01"),/無效/);
});
test("entry requirement remains visible when vaccination is contraindicated; waiver is not guaranteed admission",()=>{
  const r=vaccines(plan(stop("TH","cities",{setting:"urban",fromRisk:"yes"})),{...healthy,immune:"suppressed"});
  assert.equal(r.entry[0].status,"required");assert.equal(r.items.find(i=>i.id==="yf")!.blocked,true);assert.match(r.items.find(i=>i.id==="yf")!.timing,/不保證入境/);
  assert.match(r.items.find(i=>i.id==="yf")!.reason,/路線有黃熱病證明條件/);
  assert.equal(r.items.find(i=>i.id==="mmr")!.blocked,true);assert.equal(r.items.find(i=>i.id==="varicella")!.blocked,true);
});
test("vaccine results separate routine, exposure and entry; complete records never silently erase entry requirements",()=>{
  const r=vaccines(plan(stop("BR","cities",{setting:"urban"})),healthy,{...records,vaccines:{yf:"complete",hepa:"complete"}});
  assert.ok(r.items.some(i=>i.group==="routine"));assert.equal(r.items.find(i=>i.id==="yf")!.group,"risk");assert.match(r.items.find(i=>i.id==="yf")!.status,/攜紀錄/);assert.equal(r.entry[0].status,"not-listed");
  assert.ok(vaccines(plan(stop("OTHER","unverified"))).items.every(i=>i.group==="routine"));
});
test("JE duration, rural and unknown activity conditions use exposure rather than country alone",()=>{
  const urban=stop("JP","all",{setting:"urban",start:"2027-01-01",end:"2027-01-29"});assert.ok(!vaccines(plan(urban)).items.some(i=>i.id==="je"));
  assert.ok(vaccines(plan({...urban,end:"2027-01-30"})).items.some(i=>i.id==="je"));
  assert.ok(vaccines(plan({...urban,setting:"rural"})).items.some(i=>i.id==="je"));
  assert.ok(vaccines(plan(urban,{outdoorNights:"unknown"})).items.some(i=>i.id==="je"));
});
test("late hepatitis A and rabies schedule retain safety distinctions",()=>{
  const p=plan(stop("TH","cities",{setting:"urban",start:"2026-12-01",end:"2026-12-10"}),{animalContact:"yes"});
  assert.match(vaccines(p,{...healthy,age:40.01}).items.find(i=>i.id==="hepa")!.reason,/免疫球蛋白/);
  assert.ok(!vaccines(p,{...healthy,age:40}).items.find(i=>i.id==="hepa")!.reason.includes("免疫球蛋白"));
  assert.match(vaccines(p).items.find(i=>i.id==="rabies")!.timing,/2026-12-03/);assert.match(vaccines(p).items.find(i=>i.id==="rabies")!.timing,/暴露後/);
});
test("travel validation rejects invalid, contradictory and unsorted data without filling unknowns as normal",()=>{
  for(const h of [{...emptyHealth},{...healthy,age:-1},{...healthy,weight:0},{...healthy,crcl:NaN},{...healthy,renal:"normal" as const,crcl:29.9}])assert.ok(validateTravel(plan(),h));
  assert.equal(validateTravel(plan(),{...healthy,crcl:0,renal:"severe"}),null);
  assert.ok(validateTravel(plan(stop(),{stops:[]}),healthy));assert.ok(validateTravel(plan(stop(),{stops:[stop(),stop("HT","all",{start:"2027-01-09"})]}),healthy));
  assert.ok("error"in assessMalaria(plan(),healthy,"bad"));assert.ok("error"in assessTravelVaccines(plan(),healthy,{...records,yfDate:"2027-01-01"},today));
});
test("new public tools hydrate with disabled input fieldsets and render full Chinese LLS 2018",()=>{
  const altitude=renderToStaticMarkup(createElement(AltitudeForm));assert.match(altitude,/disabled=""/);assert.match(altitude,/腸胃不適/);assert.match(altitude,/抵達目前海拔是否已至少 6 小時/);assert.match(altitude,/不含睡眠題/);
  for(const kind of ["malaria","vaccines"] as const){const html=renderToStaticMarkup(createElement(TravelPlanProvider,null,createElement(TravelHealthForm,{kind})));assert.match(html,/<fieldset class="ready-fieldset" disabled=""/);assert.match(html,/type="date"/);assert.match(html,/不清楚／尚未確認/);assert.doesNotMatch(html,/localStorage|sessionStorage/);}
});
