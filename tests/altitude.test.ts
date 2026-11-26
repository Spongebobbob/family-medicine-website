import test from "node:test";
import assert from "node:assert/strict";
import { assessAltitude, altitudeEmergency, scoreLakeLouise, type AltitudeInput } from "../src/lib/altitude";
const base:AltitudeInput={start:0,nights:[2700],priorNights:0,extraRest:"yes",history:"none-mild",specialHealth:"no"};
test("CDC first-night exact 2750 and 3400 boundaries are not replaced by WMS thresholds",()=>{
  for(const [height,expected] of [[2749.9,0],[2750,1],[3400,1],[3400.1,2]]) assert.equal(assessAltitude({...base,nights:[height]})!.level,expected);
});
test("starting altitude and preacclimatization limits prevent false table application",()=>{
  assert.equal(assessAltitude({...base,start:1199.9})!.level,0);
  assert.equal(assessAltitude({...base,start:1200})!.level,null);
  assert.equal(assessAltitude({...base,priorNights:2})!.level,null);
  assert.equal(assessAltitude({...base,priorNights:1})!.level,0);
});
test("sleeping ascent >500 above 3000, rest gaps and prior disease set independent risk conditions",()=>{
  assert.equal(assessAltitude({...base,nights:[2700,3200]})!.rapidDays.length,0);
  assert.equal(assessAltitude({...base,nights:[2700,3200.1],extraRest:"yes"})!.level,1);
  assert.equal(assessAltitude({...base,nights:[2700,3200.1],extraRest:"no"})!.level,2);
  const bad=assessAltitude({...base,nights:[3000,3600,4200],extraRest:"yes"})!;assert.equal(bad.restMissing,true);assert.equal(bad.level,2);
  const rest=assessAltitude({...base,nights:[3000,3600,3600,4200]})!;assert.equal(rest.restMissing,false);assert.equal(rest.level,1);assert.deepEqual(rest.restDays,[3]);
  assert.equal(assessAltitude({...base,history:"moderate-severe"})!.level,1);
  assert.equal(assessAltitude({...base,history:"hape-hace"})!.level,2);
});
test("unknowns are not low risk; special health remains separate from risk classification",()=>{
  assert.equal(assessAltitude({...base,history:"unknown"})!.level,null);
  assert.equal(assessAltitude({...base,nights:[3000,3600],extraRest:"unknown"})!.level,null);
  assert.equal(assessAltitude({...base,nights:[3500],history:"unknown"})!.level,2);
  assert.equal(assessAltitude({...base,specialHealth:"yes"})!.specialReview,true);
  assert.equal(assessAltitude({...base,specialHealth:"yes"})!.level,0);
});
test("invalid, sparse, missing and nonfinite altitude plans are rejected",()=>{
  for(const change of [{start:NaN},{start:9001},{priorNights:1.5},{priorNights:-1},{nights:[]},{nights:[Infinity]},{nights:Array(2)},{nights:Array(31).fill(2500)}]) assert.equal(assessAltitude({...base,...change}),null);
});
test("LLS 2018 all 256 combinations require headache and total >=3, not sleep or a fabricated score",()=>{
  for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++)for(let d=0;d<4;d++){
    const r=scoreLakeLouise([a,b,c,d],"yes","yes")!;assert.equal(r.score,a+b+c+d);assert.equal(r.meetsResearchDefinition,a>=1&&a+b+c+d>=3);
  }
  for(const a of [[],[1,1,1],[1,1,1,1,1],[NaN,0,0,0],[4,0,0,0],[.5,0,0,0],Array(4)]) assert.equal(scoreLakeLouise(a,"yes","yes"),null);
  assert.equal(scoreLakeLouise([3,3,3,3],"yes","no")!.applicable,false);
  assert.equal(scoreLakeLouise([3,3,3,3],"unknown","yes")!.meetsResearchDefinition,false);
});
test("HAPE/HACE alerts do not depend on LLS, itinerary completeness or total score",()=>{
  assert.equal(altitudeEmergency("yes",""),true);assert.equal(altitudeEmergency("","yes"),true);
  assert.equal(altitudeEmergency("unknown","no"),false);assert.equal(altitudeEmergency("no","no"),false);
});
