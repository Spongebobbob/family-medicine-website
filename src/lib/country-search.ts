export type CountryChoice = { value: string; label: string; searchText?: string };
const normalize = (text: string) => text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/臺/g,"台").replace(/[-_()（）]/g," ").trim();
const aliases:Record<string,string>={usa:"united states america US", "united-kingdom":"UK Britain England", "united-arab-emirates":"UAE",netherlands:"Holland", "macao-china":"Macau", "hong-kong-china":"HK Hong Kong", "south-korea":"South Korea 韓國", "myanmar-burma":"Myanmar Burma 緬甸"};
export function searchCountries(choices: CountryChoice[], query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return choices.filter(choice => terms.every(term => normalize(`${choice.label} ${choice.searchText ?? ""} ${choice.value} ${aliases[choice.value]??""}`).includes(term)))
    .sort((a,b) => {
      const rank=(c:CountryChoice)=>terms.length&&normalize(`${c.label} ${c.searchText??""}`).split(/\s+/).some(word=>word.startsWith(terms[0]))?0:1;
      return rank(a)-rank(b);
    });
}
