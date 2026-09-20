/* SportSpace: transparent sensitivity analysis of a fixed network run. */
(() => {
  'use strict';
  function evaluate(data, {activity='all', minutes=15, excluded='' }={}) {
    const candidates=data.candidates.features.filter(f=>activity==='all'||f.properties.activity_class===activity);
    const ids=new Set(candidates.map(f=>f.properties.feature_id));
    const threshold=Number(minutes);
    if(!Number.isFinite(threshold)||threshold<0)throw new Error('Invalid time threshold');
    const origins=data.origins.features.map(f=>{
      const id=f.properties.origin_id;
      const rows=data.run.rows.filter(r=>r.origin_id===id&&ids.has(r.feature_id));
      const valid=rows.filter(r=>r.network_distance_m!==null&&Number.isFinite(r.travel_time_min));
      const baseline=valid.filter(r=>r.travel_time_min<=threshold);
      const remaining=valid.filter(r=>r.feature_id!==excluded);
      const scenario=baseline.filter(r=>r.feature_id!==excluded);
      const nearest=a=>a.length?Math.min(...a.map(r=>r.travel_time_min)):null;
      return {id,baseline:baseline.length,scenario:scenario.length,baselineMinutes:nearest(valid),scenarioMinutes:nearest(remaining),unrouted:valid.length===0,rows,baselineRows:baseline,scenarioRows:scenario};
    });
    return {origins,candidates,minutes:threshold,excluded,activity,baseline:origins.filter(o=>o.baseline>0).length,scenario:origins.filter(o=>o.scenario>0).length,unrouted:origins.filter(o=>o.unrouted).length,lost:origins.filter(o=>o.baseline>0&&o.scenario===0).length};
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={evaluate};return;}
  const data=window.SPORTSPACE_DATA;if(!data)return;
  const $=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const types={playground:'Igralište',pitch:'Sportski teren',sports_centre:'Sportski centar'};
  const name=f=>f.properties.name||`${types[f.properties.activity_class]||'Mesto'} ${String(data.candidates.features.indexOf(f)+1).padStart(2,'0')}`;
  const fmt=n=>n===null?'—':Number(n).toLocaleString(window.SportSpaceI18n.locale(),{maximumFractionDigits:1});
  const dialog=$('#planningDialog');let mode='daily',result;
  $('#planOrigin').innerHTML=data.origins.features.map((f,i)=>`<option value="${esc(f.properties.origin_id)}">Probno polazište ${String(i+1).padStart(2,'0')}</option>`).join('');
  function fillExclusions(){const previous=$('#planExcluded').value;$('#planExcluded').innerHTML='<option value="">Sva mesta u modelu</option>'+data.candidates.features.filter(f=>$('#planActivity').value==='all'||f.properties.activity_class===$('#planActivity').value).map(f=>`<option value="${esc(f.properties.feature_id)}">${esc(name(f))}</option>`).join('');if([...$('#planExcluded').options].some(o=>o.value===previous))$('#planExcluded').value=previous;}
  function render(){
    result=evaluate(data,{activity:$('#planActivity').value,minutes:Number($('#planMinutes').value),excluded:mode==='city'?$('#planExcluded').value:''});
    $('#planMinutesValue').textContent=`${result.minutes} min`;
    $('#planOriginLabel').hidden=mode!=='daily';$('#planExcludedLabel').hidden=mode!=='city';
    $('#planTitle').textContent=mode==='daily'?'Gde ima mesta za moju aktivnost?':'Koliko mogućnosti ostaje ako jedno mesto izostane?';
    $('#planLead').textContent=mode==='daily'?'Izaberi aktivnost i vreme puta u jednom smeru. Istraži mogućnosti iz probnog polazišta, pa proveri uslove korišćenja mesta.':'Uporedi isti model sa svim kandidatima i bez jednog odredišta. Otkrij gde se izbor sužava i šta bi trebalo proveriti na terenu.';
    $('#planScope').textContent=result.activity==='all'?'Prikazane su različite aktivnosti koje nisu međusobne zamene. Za smislenije poređenje izaberi jednu vrstu.':'Vreme je proračunato kroz postojeći graf pri brzini 1,2 m/s. Prag nije preporuka koliko treba hodati.';
    document.querySelectorAll('[data-plan-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.planMode===mode)));
    const target=$('#planResults');
    if(mode==='daily'){
      const o=result.origins.find(o=>o.id===$('#planOrigin').value),within=o.baselineRows.slice().sort((a,b)=>a.travel_time_min-b.travel_time_min);
      const outside=o.rows.filter(r=>r.network_distance_m!==null&&Number.isFinite(r.travel_time_min)&&r.travel_time_min>result.minutes).length;
      target.innerHTML=`<div class="plan-outcome"><strong>${within.length}</strong><div><h3>${within.length===1?'mesto':'mesta'} unutar ${result.minutes} minuta</h3><p>Od ${result.candidates.length} kandidata za izabranu aktivnost · probno polazište ${result.origins.indexOf(o)+1}</p></div></div><p class="plan-reading">${o.unrouted?'Za ovo polazište model nema izračunatu vezu. To nije dokaz da je stvarni prolaz nemoguć.':within.length?'Ovo su mogućnosti prema udaljenosti. Otvorenost danas, cena, bezbednost i pristupačnost nisu potvrđeni.':`Nijedno mesto nije unutar izabranog praga. ${outside} kandidata je izvan njega; promeni vreme ili polazište.`}</p><div class="plan-place-grid">${within.map(r=>{const f=result.candidates.find(f=>f.properties.feature_id===r.feature_id);return `<button class="plan-place" data-plan-place="${esc(r.feature_id)}" data-plan-origin="${esc(o.id)}"><span>${esc(name(f))}</span><strong>${fmt(r.travel_time_min)} <small>min</small></strong><small>${Math.round(r.network_distance_m)} m kroz model · otvorenost danas nepoznata</small><span class="plan-link">Pogledaj put i izvore →</span></button>`;}).join('')}</div><div class="plan-next"><strong>Pre polaska</strong><p>Proveri radno vreme, cenu, uslove ulaska i odgovarajući ulaz. Pilot koristi probne tačke; još nije dnevni navigator sa tvojom adresom.</p></div>`;
    }else{
      const excluded=result.candidates.find(f=>f.properties.feature_id===result.excluded);
      target.innerHTML=`<div class="plan-comparison"><div><small>SA SVIM MESTIMA</small><strong>${result.baseline}<span> / ${result.origins.length}</span></strong></div><span class="plan-arrow">→</span><div><small>${excluded?'BEZ IZABRANOG MESTA':'ISTI MODEL'}</small><strong>${result.scenario}<span> / ${result.origins.length}</span></strong></div></div><p class="plan-reading">Probna polazišta sa najmanje jednim odredištem unutar ${result.minutes} minuta. ${excluded?`Izuzeto: <strong>${esc(name(excluded))}</strong>. ${result.lost} polazišta gubi poslednju mogućnost unutar praga.`:'Izaberi mesto koje želiš da izuzmeš iz scenarija.'}</p><div class="plan-point-grid" aria-label="Rezultati svih probnih polazišta">${result.origins.map((o,i)=>`<button class="plan-point ${o.unrouted?'missing':o.baseline>0&&o.scenario===0?'lost':o.scenario>0?'retained':'outside'}" data-plan-origin="${esc(o.id)}" title="Polazište ${i+1}: ${o.baseline} pre, ${o.scenario} posle; ${o.unrouted?'nema mrežnog rezultata':o.scenario?'ima mesto unutar praga':'nema mesto unutar praga'}"><b>${String(i+1).padStart(2,'0')}</b><span>${o.unrouted?'—':`${o.baseline} → ${o.scenario}`}</span></button>`).join('')}</div><div class="plan-point-key"><span>● Ima mogućnost</span><span>◐ Gubi poslednju</span><span>○ Izvan praga</span><span>— Nema mrežnog rezultata (${result.unrouted})</span></div><p class="plan-reading">Svaka pločica predstavlja jednu probnu tačku; brojevi su broj odredišta pre → posle. Klik otvara osnovni model na mapi, sa svim mestima.</p><div class="plan-next"><strong>Šta odluka dobija</strong><p>Vidi gde izbor zavisi od jednog mesta. Zatim proveri stvarne korisnike, zamenska odredišta i režime rada. Ovo nisu procenti stanovništva niti rang investicionih prioriteta. Izuzimanje ne menja ulicu ili graf.</p></div>`;
    }
    $('#planExport').hidden=mode!=='city';$('#planAnnouncement').textContent=mode==='city'?`${result.baseline} pre, ${result.scenario} posle, od ${result.origins.length} probnih polazišta.`:`${result.origins.find(o=>o.id===$('#planOrigin').value).baseline} mesta unutar ${result.minutes} minuta.`;
  }
  window.addEventListener('sportspace-language',()=>render());
  function open(){ $('#planOrigin').value=$('#originSelect').value;fillExclusions();render();dialog.showModal(); }
  $('#planningBtn').addEventListener('click',open);$('#closePlanning').addEventListener('click',()=>dialog.close());
  document.querySelectorAll('[data-plan-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.planMode;render();}));
  $('#planActivity').addEventListener('change',()=>{fillExclusions();render();});for(const id of ['planOrigin','planExcluded'])$('#'+id).addEventListener('change',render);$('#planMinutes').addEventListener('input',render);
  $('#planResults').addEventListener('click',e=>{const b=e.target.closest('[data-plan-origin]');if(!b)return;dialog.close();$('#mobileActivity').value=$('#planActivity').value;$('#mobileActivity').dispatchEvent(new Event('change'));$('#originSelect').value=b.dataset.planOrigin;$('#originSelect').dispatchEvent(new Event('change'));$('[data-measure="network"]').click();if(b.dataset.planPlace){const candidate=[...document.querySelectorAll('[data-place]')].find(el=>el.dataset.place===b.dataset.planPlace);candidate?.click();}else{$('[data-view="access"]').click();}$('#fitBtn').click();$('#mapCanvas').focus({preventScroll:true});$('#liveAnnouncement').textContent='Mapa prikazuje osnovni model sa svim mestima. Scenario izuzimanja ostaje u panelu Planiraj.';});
  $('#planExport').addEventListener('click',()=>{
    const headers=['method_run','source_run_sha256','source_snapshot','activity','threshold_min_one_way','speed_m_s','excluded_feature_id','origin_id','baseline_options','scenario_options','baseline_nearest_min','scenario_nearest_min','baseline_unrouted'];
    const rows=result.origins.map(o=>['method_run_002',data.source_hashes.run,'2026-09-19',result.activity,result.minutes,1.2,result.excluded,o.id,o.baseline,o.scenario,o.baselineMinutes,o.scenarioMinutes,o.unrouted]);
    const csv=[headers,...rows].map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='sportspace-scenario.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
})();
