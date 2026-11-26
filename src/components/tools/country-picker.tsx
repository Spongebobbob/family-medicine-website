"use client";
import { useEffect, useId, useRef, useState } from "react";
import { searchCountries, type CountryChoice } from "@/lib/country-search";

export function CountryPicker({choices,value,onChange}:{choices:CountryChoice[];value:string;onChange:(value:string)=>void}) {
  const id=useId(),button=useRef<HTMLButtonElement>(null),input=useRef<HTMLInputElement>(null);
  const [open,setOpen]=useState(false),[query,setQuery]=useState(""),[active,setActive]=useState(-1);
  const results=searchCountries(choices,query),selected=choices.find(c=>c.value===value);
  useEffect(()=>{if(open)input.current?.focus();},[open]);
  const close=()=>{setOpen(false);setQuery("");setActive(-1);};
  const choose=(choice:CountryChoice)=>{if(choice.value!==value)onChange(choice.value);close();button.current?.focus();};
  return <div className="assessment-field country-picker" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))close();}}>
    <label id={`${id}-label`} htmlFor={`${id}-button`}>目的地國家</label>
    <button ref={button} id={`${id}-button`} type="button" className="country-picker-trigger" aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open?`${id}-list`:undefined} onClick={()=>{if(open)close();else setOpen(true);}} onKeyDown={e=>{if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();setOpen(true);}}}>
      <span id={`${id}-value`}>{selected?.label??"請選擇國家"}</span><span aria-hidden="true">⌄</span>
    </button>
    {open&&<div className="country-picker-panel">
      <input ref={input} type="search" role="combobox" aria-label="搜尋國家" placeholder="輸入中文或英文國名" autoComplete="off" spellCheck={false} enterKeyHint="search" aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={active>=0&&results[active]?`${id}-option-${active}`:undefined} value={query} onChange={e=>{setQuery(e.target.value);setActive(-1);}} onKeyDown={e=>{
        if(e.nativeEvent.isComposing||e.nativeEvent.keyCode===229)return;
        if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();const next=results.length?(e.key==="ArrowDown"?(active+1)%results.length:active<=0?results.length-1:active-1):-1;setActive(next);if(next>=0)document.getElementById(`${id}-option-${next}`)?.scrollIntoView({block:"nearest"});}
        if(e.key==="Enter"){e.preventDefault();const choice=results[active<0?0:active];if(choice)choose(choice);}
        if(e.key==="Escape"){e.preventDefault();close();button.current?.focus();}
      }}/>
      <p className="country-picker-count" role="status">{results.length?`${results.length} 個符合的國家／地區`:"找不到國家，請換個關鍵字。"}</p>
      <ul id={`${id}-list`} role="listbox" aria-label="國家搜尋結果">
        {results.map((choice,index)=><li id={`${id}-option-${index}`} role="option" aria-selected={choice.value===value} data-active={index===active} key={choice.value} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(choice)}><span>{choice.label}</span>{choice.value===value&&<span aria-hidden="true">✓</span>}</li>)}
      </ul>
    </div>}
  </div>;
}
