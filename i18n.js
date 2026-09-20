(() => {
 'use strict';
 const entries=window.SPORTSPACE_TRANSLATIONS||[],exact=new Map(),patterns=[],unknown=new Set(),nodeSources=new WeakMap(),attrSources=new WeakMap();
 const reEscape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 for(const e of entries){if(/\{\d+\}/.test(e.source)){const ids=[];let at=0,pattern='';for(const m of e.source.matchAll(/\{(\d+)\}/g)){pattern+=reEscape(e.source.slice(at,m.index))+'(.+?)';ids.push(+m[1]);at=m.index+m[0].length;}pattern+=reEscape(e.source.slice(at));patterns.push({re:new RegExp('^'+pattern+'$'),ids,e});}else exact.set(e.source,e);}
 patterns.sort((a,b)=>b.e.source.length-a.e.source.length);
 let language='bs';try{const saved=localStorage.getItem('sportspace-language');if(['bs','en','tr'].includes(saved))language=saved;}catch{}
 const proper=new Set((window.SPORTSPACE_DATA?.candidates.features||[]).map(f=>f.properties.name).filter(Boolean));
 const replacements=[['vazduh','zrak'],['Vazduh','Zrak'],['vazdušno','zračnom linijom'],['Vazdušno','Zračnom linijom'],['vazdušna','zračna'],['Vazdušna','Zračna'],['vreme','vrijeme'],['Vreme','Vrijeme'],['vremena','vremena'],['mesto','mjesto'],['Mesto','Mjesto'],['mesta','mjesta'],['Mesta','Mjesta'],['mestu','mjestu'],['mestima','mjestima'],['procena','procjena'],['Procena','Procjena'],['procenat','procenat'],['provera','provjera'],['Provera','Provjera'],['proveri','provjeri'],['Proveri','Provjeri'],['provereno','provjereno'],['proverena','provjerena'],['promena','promjena'],['promene','promjene'],['promeni','promijeni'],['Promeni','Promijeni'],['smer','smjer'],['Smer','Smjer'],['razrešen','razriješen'],['Nerazrešen','Nerazriješen'],['vrednost','vrijednost'],['Vrednost','Vrijednost'],['mesec','mjesec'],['Meseč','Mjeseč'],['meseč','mjeseč'],['prosek','prosjek'],['Prosečan','Prosječan'],['prosečan','prosječan'],['senke','sjene'],['senka','sjena'],['Sneg','Snijeg'],['svetlo','svijetlo'],['svetla','svijetla'],['celu','cijelu'],['celi','cijeli'],['korišćen','korišten'],['kriterijumi','kriteriji'],['udeo','udio'],['Udeo','Udio'],['udela','udjela'],['uslov','uslov']];
 function text(value,depth=0){const s=String(value),key=s.trim();if(!key)return s;let translated;if(proper.has(key))return s;const e=exact.get(key);if(e)translated=e[language]??e.bs??key;
  if(translated===undefined&&depth<3){for(const p of patterns){const m=key.match(p.re);if(!m)continue;const vars={};p.ids.forEach((id,i)=>vars[id]=text(m[i+1],depth+1));translated=(p.e[language]??p.e.bs??key).replace(/\{(\d+)\}/g,(_,n)=>vars[n]);break;}}
  if(translated===undefined){const generic=key.match(/^(Igralište|Sportski teren|Sportski centar) (\d+)$/);if(generic)translated=text(generic[1],depth+1)+' '+generic[2];}
  if(translated===undefined){translated=key;if(language==='bs')for(const [a,b] of replacements)translated=translated.split(a).join(b);if(/[A-Za-zčćžšđČĆŽŠĐ]{3}/.test(key)&&!proper.has(key))unknown.add(key);}
  return s.slice(0,s.indexOf(key))+translated+s.slice(s.indexOf(key)+key.length);
 }
 const ignored=el=>!el||!!el.closest('script,style,code,[data-no-translate],.language-switch');
 const attrs=['title','aria-label','placeholder','alt'];
 function translateDOM(){observer.disconnect();const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){if(ignored(node.parentElement))continue;const current=node.nodeValue,old=nodeSources.get(node),source=old&&current===old.output?old.source:current,output=text(source);if(output!==current)node.nodeValue=output;nodeSources.set(node,{source,output});}
  for(const el of document.querySelectorAll('[title],[aria-label],[placeholder],[alt],meta[name="description"]')){if(ignored(el))continue;const memory=attrSources.get(el)||{};for(const a of el.matches('meta')?['content']:attrs){if(!el.hasAttribute(a))continue;const current=el.getAttribute(a),old=memory[a],source=old&&current===old.output?old.source:current,output=text(source);if(current!==output)el.setAttribute(a,output);memory[a]={source,output};}attrSources.set(el,memory);}
  document.documentElement.lang=language;document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===language)));observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
 }
 let pending=false;const observer=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;translateDOM();});});
 function setLanguage(next){if(!['bs','en','tr'].includes(next))return;language=next;unknown.clear();try{localStorage.setItem('sportspace-language',next);}catch{}window.dispatchEvent(new Event('sportspace-language'));translateDOM();}
 window.SportSpaceI18n={get language(){return language;},locale:()=>({bs:'de-DE',en:'en-GB',tr:'tr-TR'})[language],text,setLanguage,refresh:translateDOM,unknown};
 document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.language)));
 translateDOM();
})();
