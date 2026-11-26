import test from "node:test";
import assert from "node:assert/strict";
import { searchCountries } from "../src/lib/country-search";
import { malariaCountries } from "../src/lib/malaria-guidance";
const countries=malariaCountries.map(c=>({value:c.id,label:c.name,searchText:c.slug.replaceAll("-"," ")}));
test("country search handles Chinese, English, codes, multiple words and Taiwan variants",()=>{
  for(const query of ["柬埔寨"," Cambodia ","kh"])assert.ok(searchCountries(countries,query).some(c=>c.value==="KH"));
  assert.ok(searchCountries(countries,"United States").some(c=>c.value==="usa"));
  assert.ok(searchCountries(countries,"UK").some(c=>c.value==="united-kingdom"));
  assert.ok(searchCountries(countries,"Hong Kong").some(c=>c.value==="hong-kong-china"));
  assert.deepEqual(searchCountries(countries,"臺灣"),searchCountries(countries,"台灣"));
  assert.equal(searchCountries(countries,"EG")[0].value,"egypt");
});
test("empty search preserves all countries; no match cannot resolve an arbitrary country",()=>{
  const before=JSON.stringify(countries);assert.equal(searchCountries(countries,"").length,235);
  assert.deepEqual(searchCountries(countries,"不存在的國家 xyz"),[]);
  assert.equal(JSON.stringify(countries),before);
});
