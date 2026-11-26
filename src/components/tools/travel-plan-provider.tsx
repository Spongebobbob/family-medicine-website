"use client";
import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import { emptyHealth, newTravelStop, type TravelHealth, type TravelPlan } from "@/lib/travel-plan";
import type { TravelRecords } from "@/lib/travel-vaccines";
type TravelState={plan:TravelPlan;setPlan:Dispatch<SetStateAction<TravelPlan>>;health:TravelHealth;setHealth:Dispatch<SetStateAction<TravelHealth>>;records:TravelRecords;setRecords:Dispatch<SetStateAction<TravelRecords>>;clear:()=>void};
const initialPlan=():TravelPlan=>({stops:[newTravelStop()],animalContact:"unknown",remoteCare:"unknown",frequentTravel:"unknown",outdoorNights:"unknown"});
const initialHealth=():TravelHealth=>({...emptyHealth,pregnant:"no",immune:"normal",spleen:"no",complexConditions:"no",longTermVfr:"no"});
const initialRecords=():TravelRecords=>({vaccines:{},yfDate:"",icvp:"unknown"});
const Context=createContext<TravelState|null>(null);
export function TravelPlanProvider({children}:{children:React.ReactNode}){
  const [plan,setPlan]=useState<TravelPlan>(initialPlan),[health,setHealth]=useState<TravelHealth>(initialHealth),[records,setRecords]=useState<TravelRecords>(initialRecords);
  return <Context.Provider value={{plan,setPlan,health,setHealth,records,setRecords,clear:()=>{setPlan(initialPlan());setHealth(initialHealth());setRecords(initialRecords());}}}>{children}</Context.Provider>;
}
export function useTravelPlan(){const state=useContext(Context);if(!state)throw new Error("TravelPlanProvider is required");return state;}
