import test from "node:test";
import assert from "node:assert/strict";
import { malariaCountries, malariaCountryById, malariaCoverage, assessUkMalariaStop, malariaSpecialGroups, cdcMalariaComparison, taiwanMalariaComparison } from "../src/lib/malaria-guidance";
import { assessMalaria, compareMalariaDrug, malariaSchedule } from "../src/lib/travel-malaria";
import { emptyHealth, newTravelStop, type TravelHealth, type TravelStop, type TravelPlan } from "../src/lib/travel-plan";
const h:TravelHealth={...emptyHealth,age:30,weight:65,pregnant:"no",spleen:"no",complexConditions:"no",longTermVfr:"no",immune:"normal",renal:"normal",crcl:100,psychiatric:"no",seizures:"no",conduction:"no",psoriasis:"no",drugAllergy:"no",interactions:"no",breastfeeding:"no",breastfeedingSmallInfant:"no",g6pd:"normal"};
const stop=(country="KH",region="other-low",patch:Partial<TravelStop>={}):TravelStop=>({...newTravelStop(),country,region,start:"2027-01-10",end:"2027-01-20",setting:"forest",...patch});
const plan=(stops=[stop()]):TravelPlan=>({stops,animalContact:"no",remoteCare:"no",frequentTravel:"no",outdoorNights:"no"});
function segment(s=stop(),health=h,asOf="2026-11-26"){return assessUkMalariaStop(s,health,plan([s]),asOf);}
function result(stops=[stop()],health=h){const r=assessMalaria(plan(stops),health,"2026-11-26");if("error"in r)throw new Error(r.error);return r;}

test("global inventory distinguishes explicit evidence, unresolved countries and clinical review",()=>{
  assert.equal(malariaCountries.length,235);assert.equal(new Set(malariaCountries.map(c=>c.source)).size,235);
  assert.equal(malariaCoverage.textWithRiskAreas,91);assert.equal(malariaCoverage.explicitNoRisk,19);
  for(const c of malariaCountries){assert.ok(c.source.startsWith("https://travelhealthpro.org.uk/"));assert.equal(c.checked,"2026-11-26");assert.ok(c.version&&c.scope);assert.equal(c.physicianReview,"pending");assert.equal(c.mapLicense,"unconfirmed");
    assert.equal(new Set(c.regions.map(r=>r.id)).size,c.regions.length);for(const r of c.regions){assert.ok(["high","low","very_low","none","unknown"].includes(r.risk));assert.ok(!["medication","mosquito"].includes(r.risk));assert.ok(r.name);}
  }
  assert.equal(segment(stop("japan","unverified")).unresolved,true);assert.equal(segment(stop("china","all")).status,"none");
  assert.equal(segment(stop("NOT-A-COUNTRY","all")).prophylaxis,"unknown");
});
test("Cambodia has separate geographic risk, prophylaxis and western-border resistance",()=>{
  assert.equal(segment(stop("KH","phnom-penh",{setting:"urban"})).status,"none");assert.equal(segment(stop("KH","phnom-penh",{setting:"mixed"})).unresolved,true);
  assert.equal(segment(stop("KH","angkor-tonle-sap")).status,"very_low");
  assert.equal(segment().status,"low");assert.equal(segment().prophylaxis,"bite_avoidance");
  assert.deepEqual(segment(stop("KH","western-border"),{...h,spleen:"yes"}).drugs,["ap","doxy"]);
  assert.equal(result([stop("KH","western-border")],{...h,spleen:"yes"}).drugs.find(d=>d.id==="meflo")!.status,"excluded");
});
test("asplenia or hyposplenia changes low-risk drug advice but not the underlying risk",()=>{
  const low=segment(stop(),{...h,spleen:"yes"});assert.equal(low.status,"low");assert.equal(low.prophylaxis,"recommended");assert.match(low.reason,/避免/);
  const veryLow=segment(stop("KH","angkor-tonle-sap"),{...h,spleen:"yes"});assert.equal(veryLow.prophylaxis,"bite_avoidance");assert.match(veryLow.reason,/勸阻/);
  assert.equal(segment(stop("KH","phnom-penh",{setting:"urban"}),{...h,spleen:"yes"}).prophylaxis,"bite_avoidance");
});
test("every special group and unknown health condition prevents blanket low-risk no-drug advice",()=>{
  for(const patch of [{pregnant:"yes"},{immune:"suppressed"},{complexConditions:"yes"},{longTermVfr:"yes"},{age:70},{age:70.001},{age:0.5},{age:4.999},{spleen:"unknown"},{immune:"unknown"},{pregnant:"unknown"}] as Partial<TravelHealth>[]){const s=segment(stop(),{...h,...patch});assert.equal(s.status,"low");assert.equal(s.prophylaxis,"conditional");assert.equal(result([stop()],{...h,...patch}).drugs.every(d=>d.schedule===null),true);}
  assert.equal(segment(stop(),{...h,age:69.999}).prophylaxis,"bite_avoidance");assert.equal(segment(stop(),{...h,age:5}).prophylaxis,"bite_avoidance");
  assert.match(malariaSpecialGroups({...h,age:70},plan()).groups.join(),/原文為超過/);
});
test("very-low risk and no-risk remain distinct from low-risk special-group policy",()=>{
  for(const patch of [{spleen:"yes"},{pregnant:"yes"},{age:75},{immune:"suppressed"}] as Partial<TravelHealth>[]){const s=segment(stop("KH","angkor-tonle-sap"),{...h,...patch});assert.equal(s.status,"very_low");assert.equal(s.prophylaxis,"bite_avoidance");}
});
test("a guideline may recommend drugs without assigning a high/low infection label",()=>{
  const s=segment(stop("HT","all"));assert.equal(s.status,"unknown");assert.equal(s.prophylaxis,"recommended");assert.equal(s.unresolved,false);assert.ok(result([stop("HT","all")]).drugs.find(d=>d.id==="chloro")!.schedule);
});
test("altitude uses the UK strict wording and never treats a boundary or missing altitude as no risk",()=>{
  for(const n of [null,2499.99,2500])assert.equal(segment(stop("KE","highlands",{minAltitude:n})).unresolved,true);
  assert.equal(segment(stop("KE","highlands",{minAltitude:2500.01})).status,"very_low");
  assert.equal(segment(stop("tanzania","below",{minAltitude:1799.99})).status,"high");assert.equal(segment(stop("tanzania","below",{minAltitude:1800})).unresolved,true);
});
test("seasonal rules inspect every date, including cross-year and cross-season travel",()=>{
  const s=(start:string,end=start)=>segment(stop("botswana","north",{start,end}));
  assert.equal(s("2027-05-31").status,"high");assert.equal(s("2027-06-01").status,"low");assert.equal(s("2027-09-30").status,"low");assert.equal(s("2027-10-01").status,"high");
  assert.equal(s("2027-05-31","2027-06-01").prophylaxis,"recommended");assert.equal(s("2027-12-31","2028-01-01").status,"high");
  assert.equal(segment(stop("iran","seasonal",{start:"2027-01-01",end:"2027-01-02"})).unresolved,true);
});
test("map/text conflict, missing map-boundary verification and outbreak changes suppress conclusions",()=>{
  assert.equal(result([stop("panama","city-canal")]).unknown,true);assert.ok(result([stop("panama","east")]).drugs.every(d=>d.schedule===null));
  const c=malariaCountryById("KH")!,previous=c.mapConsistency;
  try{c.mapConsistency="conflict";const r=result();assert.equal(r.unknown,true);assert.ok(r.drugs.every(d=>d.schedule===null));}finally{c.mapConsistency=previous;}
  assert.equal(segment(stop("french-guiana","rivers")).unresolved,true);
});
test("multi-country UK candidates intersect resistance rules and unknown legs suppress calendars",()=>{
  const stops=[stop("HT","all"),stop("KH","western-border",{start:"2027-01-21",end:"2027-01-25"})];
  const r=result(stops,{...h,spleen:"yes"});assert.equal(r.needsMedication,true);assert.equal(r.drugs.find(d=>d.id==="chloro")!.status,"excluded");assert.equal(r.drugs.find(d=>d.id==="meflo")!.status,"excluded");assert.ok(r.drugs.find(d=>d.id==="ap")!.schedule);
  assert.ok(result([...stops,stop("OTHER","unverified",{start:"2027-01-26",end:"2027-01-27"})],{...h,spleen:"yes"}).drugs.every(d=>d.schedule===null));
});
test("UK-specific drug ages, epilepsy, pregnancy and breastfeeding exceptions are not CDC rules",()=>{
  const compare=(id:"ap"|"doxy"|"chloro",patch:Partial<TravelHealth>)=>compareMalariaDrug(id,{...h,...patch},[id],false);
  assert.equal(compare("doxy",{age:11.999}).status,"excluded");assert.notEqual(compare("doxy",{age:12}).status,"excluded");
  assert.equal(compare("chloro",{seizures:"yes"}).status,"excluded");assert.equal(compare("ap",{pregnant:"yes"}).status,"review");assert.equal(compare("ap",{breastfeedingSmallInfant:"yes"}).status,"review");
  assert.equal(compare("ap",{crcl:29.999,renal:"unknown"}).status,"excluded");assert.equal(compare("ap",{crcl:30}).status,"discuss");assert.equal(compare("ap",{g6pd:"deficient"}).status,"discuss");
  assert.equal(malariaSchedule("meflo","2027-01-10","2027-01-20")!.earliestStart,"2026-12-20");assert.equal(malariaSchedule("chloro","2027-01-10","2027-01-20")!.earliestStart,"2027-01-03");
});
test("CDC and Taiwan differences remain separate records and cannot change the UK result",()=>{
  const s=stop("KH","angkor-tonle-sap");assert.equal(segment(s).status,"very_low");assert.match(cdcMalariaComparison(s).version,/CDC/);assert.match(taiwanMalariaComparison("KH").risk,/無感染風險/);
  assert.notEqual(cdcMalariaComparison(s).source,taiwanMalariaComparison("KH").source);
  assert.equal(segment(stop("BR","amazon")).prophylaxis,"bite_avoidance");assert.match(cdcMalariaComparison(stop("BR","amazon")).recommendation,/列預防藥/);
});
