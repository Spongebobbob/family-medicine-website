import inventory from "../data/malaria-countries.json";
import { malariaCountryRules, type MalariaRegion, type MalariaRisk, type Prophylaxis } from "./malaria-country-rules";
import { destinationById } from "./travel-data";
import { dateValue, tripDays, type TravelHealth, type TravelPlan, type TravelStop } from "./travel-plan";

export const UK_MALARIA_SOURCE = "https://www.gov.uk/government/publications/malaria-prevention-guidelines-for-travellers-from-the-uk-2026";
export const MALARIA_CHECKED = "2026-11-26";
export const malariaRiskLabels:Record<MalariaRisk,string>={high:"高風險",low:"低風險",very_low:"極低風險",none:"官方明列無風險",unknown:"風險等級未定"};
export const prophylaxisLabels:Record<Prophylaxis,string>={recommended:"防蚊並轉介評估預防用藥",conditional:"特殊族群須個別評估",bite_avoidance:"以防蚊及症狀警覺為主",unknown:"用藥需求待確認"};
const aliases:Record<string,string>={KH:"cambodia",TH:"thailand",VN:"vietnam",KE:"kenya",BR:"brazil",HT:"haiti",JP:"japan"};
export const malariaCountries=inventory.map(c=>({...c,id:Object.entries(aliases).find(([,slug])=>slug===c.id)?.[0]??c.id,slug:c.id,regions:malariaCountryRules[c.id]??(c.textStatus==="explicit_no_risk"?[{id:"all",name:"官方文字明列全境",risk:"none",prophylaxis:"bite_avoidance",drugs:[]} as MalariaRegion]:[])}));
export function malariaCountryById(id:string){return malariaCountries.find(c=>c.id===id||c.slug===id);}
export const malariaCoverage={inventory:malariaCountries.length,textWithRiskAreas:malariaCountries.filter(c=>c.textStatus==="risk_areas_found").length,explicitNoRisk:malariaCountries.filter(c=>c.textStatus==="explicit_no_risk").length,structured:malariaCountries.filter(c=>c.regions.length>0).length,pending:malariaCountries.filter(c=>!c.regions.length).length};
export function malariaSpecialGroups(health:TravelHealth,plan:TravelPlan){
  const groups:string[]=[],unknown:string[]=[];
  if(health.age>70)groups.push("超過 70 歲");
  if(health.age===70)groups.push("70 歲：先提醒門診核對；NaTHNaC 原文為超過 70 歲，並非自動用藥門檻");
  if(health.age<5)groups.push("嬰幼兒：需兒童旅遊醫學評估（本工具以未滿 5 歲提示，不是自動投藥切點）");
  if(health.immune==="suppressed")groups.push("免疫抑制");else if(health.immune==="unknown")unknown.push("免疫狀態");
  for(const [key,label] of [["pregnant","懷孕／可能懷孕"],["spleen","無脾臟／脾功能低下"],["complexConditions","複雜共病"],["longTermVfr","長期探親訪友"]] as const){
    if(health[key]==="yes")groups.push(label);else if(health[key]!=="no")unknown.push(label);
  }
  if(plan.frequentTravel==="yes"&&!groups.includes("長期探親訪友"))unknown.push("長期居住／反覆往返的實際暴露");
  return {groups,unknown};
}
export function assessUkMalariaStop(stop:TravelStop,health:TravelHealth,plan:TravelPlan,asOf:string){
  const country=malariaCountryById(stop.country),region=country?.regions.find(r=>r.id===stop.region);
  let status:MalariaRisk=region?.risk??"unknown",prophylaxis:Prophylaxis=region?.prophylaxis??"unknown";
  let reason=region?.note??(region?"依 NaTHNaC 國別文字的明列地區評估。":"未取得可套用的明確地區規則；請查閱官方國別頁，不推定無風險。");
  const special=malariaSpecialGroups(health,plan);let unresolved=!region||prophylaxis==="unknown";
  const stopDecision=(message:string)=>{unresolved=true;status="unknown";prophylaxis="unknown";reason=message;};
  const ageOfData=country&&dateValue(asOf)!-dateValue(country.checked)!;
  if(!country||ageOfData===undefined||ageOfData<0||ageOfData>90*86400000)stopDecision("地區資料缺漏或已超過 90 天查核期限，需重新確認。");
  else if(country.mapConsistency==="conflict"||region?.requiresReview)stopDecision(region?.note??"官方地圖、文字或最新事件仍待複核，暫停確定性結論。");
  else if(region?.urbanOnly&&stop.setting!=="urban")stopDecision("此條件只適用明列市區；跨區、鄉村或未知活動須另填行程。");
  else if(region?.below!==undefined&&(stop.minAltitude===null||stop.minAltitude>=region.below))stopDecision(`需確認至少一處實際到訪地點低於 ${region.below}m；邊界值或海拔未知不能套用。`);
  else if(region?.above!==undefined&&(stop.minAltitude===null||stop.minAltitude<=region.above))stopDecision(`所有到訪地點須高於 ${region.above}m；邊界值或海拔未知不能套用。`);
  if(!unresolved&&region?.months){
    const start=dateValue(stop.start),end=dateValue(stop.end);
    if(start===null||end===null||end<start)stopDecision("旅行日期無效，無法核對傳播季節。");
    else {let inSeason=false,outSeason=false;for(let n=start;n<=end;n+=86400000){if(region.months.includes(new Date(n).getUTCMonth()+1))inSeason=true;else outSeason=true;}
      if(outSeason&&!region.otherSeason)stopDecision("此區非傳播季節的風險尚未明列，不能推定無風險。");
      else if(!inSeason&&region.otherSeason){status=region.otherSeason.risk;prophylaxis=region.otherSeason.prophylaxis;}
      reason+=inSeason&&outSeason?" 行程跨越傳播季節，保留季節內需求；藥物涵蓋日期由門診細排。":" 已依完整停留日期核對季節。";
    }
  }
  if(!unresolved&&prophylaxis==="conditional"){
    if(health.spleen==="yes") {prophylaxis="recommended";reason+=" 無脾臟／脾功能低下應避免前往瘧疾區；若不可避免，低風險區仍須專科評估預防藥。";}
    else if(special.groups.length||special.unknown.length){prophylaxis="conditional";reason+=" 有特殊族群或尚未確認的條件，需個別評估，不能直接判定不需藥物。";}
    else {prophylaxis="bite_avoidance";reason+=" 一般旅客不例行建議預防藥；特殊情況仍由門診決定。";}
  }
  if(!unresolved&&status==="very_low"&&health.spleen==="yes")reason+=" 無脾臟者仍應勸阻前往；就此極低風險區，國別建議不例行使用預防藥，須與專科確認行程。";
  if(!unresolved&&health.pregnant==="yes"&&status!=="none")reason+=" 懷孕應避免前往瘧疾傳播地區；必要旅行須專科評估。";
  return {stop,country,region,status,prophylaxis,unresolved,reason,special,days:tripDays(stop),drugs:region?.drugs??[],season:region?.months?`風險月份：${region.months.join("、")} 月；其餘月份依明列規則。`:"官方未在此規則提供季節降級條件；不因乾季或短程自行降級。",resistance:region?.drugs.includes("meflo")?"候選依該國別規則；不代表全境對所有藥物敏感。":"未列 Mefloquine 為候選或尚未核對；不從風險等級推測抗藥性。"};
}

// CDC remains an isolated comparator. Its categories never drive the UK decision above.
export function cdcMalariaComparison(stop:TravelStop){
  const key=malariaCountryById(stop.country)?.id??stop.country,country=destinationById(key);
  if(key==="KH")return {source:"https://www.cdc.gov/yellow-book/hcp/asia/cambodia.html",version:"CDC Yellow Book 2026",checked:MALARIA_CHECKED,risk:"森林地區暴露最高；吳哥窟、金邊、暹粒及洞里薩湖一帶風險很少或無風險（依其原文範圍）。",recommendation:"森林行程建議評估預防藥；列 AP、Doxycycline、Primaquine 或 Tafenoquine。後兩者不納入本站自動候選。"};
  if(key==="JP")return {source:"https://www.cdc.gov/malaria/travelers/country_table/j.html",version:"CDC 日本國別表／Traveler View",checked:MALARIA_CHECKED,risk:"CDC 國別表列日本無瘧疾；NaTHNaC 主結果仍保留其文字查核狀態。",recommendation:"CDC 未列日本例行瘧疾預防藥。"};
  const cdcAreas=country?.regions.filter(r=>r.malaria!=="unknown")??[];
  const medicationAreas=cdcAreas.filter(r=>r.malaria==="medication");
  return {source:country?.source??"https://wwwnc.cdc.gov/travel/destinations/list",version:country?.version??"CDC 國別頁：尚未逐國核對",checked:country?.checked??null,risk:cdcAreas.length?"CDC 另有自己的區域劃分："+cdcAreas.map(r=>r.name+"（"+r.note+"）").join("；"):"本段尚未完成 CDC 國別對照，不推測風險。",recommendation:medicationAreas.length?"CDC 原資料列預防藥的區域包括："+medicationAreas.map(r=>r.name).join("、")+"。與本頁 NaTHNaC 分區未完成逐一對齊，不能直接套用同名區域；請另查 CDC 原文。":"尚未完成本段 CDC 分區對照，請查閱官方來源。"};
}
export function taiwanMalariaComparison(countryId:string){
  return countryId==="KH"||countryId==="cambodia"?{source:"https://www.cdc.gov.tw/InternationalTravel/Print?Type=full&cid=490",version:"台灣疾管署國際旅遊處方箋查核快照",checked:MALARIA_CHECKED,risk:"吳哥窟周邊與金邊列無感染風險；暹粒與洞里薩湖周邊列較低風險。",recommendation:"與 NaTHNaC 的吳哥窟極低風險用語不同；預防藥仍須依實際行程至旅遊醫學門診核對。"}:{source:"https://www.cdc.gov.tw/Category/MPage/6786",version:"台灣疾管署：國際預防接種及藥物",checked:MALARIA_CHECKED,risk:"本段尚未完成台灣國別／次國家風險對照。",recommendation:"一般原則：赴高風險地區先諮詢旅遊醫學門診，依抗藥性及個人健康選藥；不以此通則代填國別結論。"};
}
