/* Orientation for the existing pilot; no new model or data claims. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const copy = {
    bs: {
      button:'Kako koristiti', close:'Zatvori vodič', eyebrow:'SPORTSPACE / KRATKI VODIČ',
      title:'Šta grad nudi za rekreaciju?',
      lead:'SportSpace povezuje mjesta za aktivnost, vrijeme puta, zelenilo, vodu i regionalne podatke o zraku i klimi za Stup i Ilidžu. Istražite mogućnosti, uporedite izbore i provjerite na čemu se rezultat zasniva.',
      question:'Počnite pitanjem', example:'Koja su igrališta dostupna iz mog probnog polazišta — i da li nešto duži put vodi do zelenijeg okruženja?',
      stepsTitle:'Od pitanja do rezultata',
      steps:[['Izaberite polazište i aktivnost','U izborniku odaberite probno polazište i vrstu aktivnosti. Otvorite Mjesta i izaberite odredište iz liste ili na mapi. Mapa uokviruje vaš izbor.'],['Pročitajte rezultat','Pristup otvara profil polazišta: pokazatelje i interaktivni grafikon. U Rezultatima prebacite profil na mjesto za detalje puta i okruženja. Uporedite mrežnu i pravolinijsku udaljenost.'],['Uključite slojeve','Dugme Slojevi je iznad mape. Birajte gotove kombinacije ili pojedinačne slojeve: vegetaciju, vodu, pokrivač zemljišta i gradijent udjela vegetacije. Legenda i izvori objašnjavaju prikaz.'],['Ispitajte šta mijenja izbor','U poređenju okruženja mijenjajte vrijeme puta i radijus. Planiraj ispituje izuzimanje mjesta iz ponude. Istraživanje prikazuje nalaze, termine i zrak, klimu te rad i podatke.']],
      readTitle:'Kako tumačiti brojeve i boje',
      readings:[['Minute i linije','Vrijeme puta proizlazi iz modelirane mreže i pretpostavljene brzine hoda. Isprekidane spojnice nisu provjerene. Animacija otkriva putanju; ne simulira stvarno kretanje.'],['Zelenilo i voda','Procenti opisuju satelitski pokrivač u izabranom radijusu. Gradijent sažima udio vegetacije, a 3D stabla su simboli satelitskih ćelija. To nisu potvrde hlada, prohodnosti ili javnog pristupa.'],['Zrak, klima i pokazatelji','Historijski regionalni nizovi daju vremenski kontekst za sve lokacije. Pokazatelji se čitaju odvojeno; nema jedinstvene zdravstvene ocjene. Veći broj nije automatski bolji — pogledajte naziv, jedinicu i prag.']],
      useTitle:'Kome i za šta služi?', use:'Građanima za razumijevanje rekreacijskih mogućnosti; planerima za poređenje dostupnosti i scenarija; istraživačima za provjeru računa, izvora i ograničenja.',
      limits:'Istraživački pilot, bez praćenja uživo. Polazišta su sintetička, a OSM mreža iz 2026. povezana je s okolišnim podacima iz 2021. Rezultati ne potvrđuju današnje stanje, kvalitet zraka u pojedinoj ulici ili zdravstveni učinak. Pristup lokacijama treba provjeriti.',
      controls:'Upravljanje mapom', controlsText:'Miš: povucite za pomjeranje, točkić za zumiranje; u 3D prikazu Shift + povlačenje rotira i mijenja nagib. Telefon: jedan prst pomjera, dva prsta zumiraju i rotiraju 3D pogled. Možete koristiti i dugmad +/− i strelice rotacije. Kada je mapa u fokusu: strelice pomjeraju, +/− zumiraju, Home vraća cijeli prikaz, Q/E rotiraju i R/F mijenjaju nagib u 3D prikazu.',
      space:'Na telefonu otvorite Mjesta ili Rezultate kada vam zatrebaju; zatvorite panel da ponovo vidite mapu. Proširi mapu (⛶) sklanja panele bez gubitka izbora.',
      actions:'Otvorite prikaz i isprobajte', map:'Istraži pristup', layers:'Otvori slojeve', environment:'Uporedi okruženje', research:'Istraživanje i rad', methods:'Metodologija i izvori', back:'Vrati se na mapu'
    },
    en: {
      button:'How to use', close:'Close guide', eyebrow:'SPORTSPACE / QUICK GUIDE',
      title:'What does the city offer for recreation?',
      lead:'SportSpace connects activity places, travel time, vegetation, water and regional air and climate data for Stup and Ilidža. Explore possibilities, compare choices and see the evidence behind each result.',
      question:'Start with a question', example:'Which playgrounds can I reach from a sample origin — and could a slightly longer trip lead to greener surroundings?',
      stepsTitle:'From a question to a result',
      steps:[['Choose an origin and activity','Select a sample origin and an activity type. Open Places and choose a destination from the list or map. The map frames your selection.'],['Read the result','Access opens the origin profile with indicators and an interactive chart. In Results, switch to the place profile for travel and environmental details. Compare network and straight-line distances.'],['Turn on layers','The Layers button is above the map. Choose a preset or individual layers: vegetation, water, land cover and a vegetation-share gradient. Legend and sources explain the display.'],['Explore what changes a choice','Change travel time and radius in the environmental comparison. Plan tests removing a place from the available destinations. Research presents findings, departure times and air, climate, the paper and data.']],
      readTitle:'How to read numbers and colours',
      readings:[['Minutes and lines','Travel time comes from the modelled network and an assumed walking speed. Dashed connectors are unverified. Animation reveals route geometry; it does not simulate actual movement.'],['Vegetation and water','Percentages describe satellite land cover within the selected radius. The gradient summarises vegetation share; 3D trees symbolise satellite cells. These do not confirm shade, walkability or public access.'],['Air, climate and indicators','Historical regional series provide temporal context shared by all locations. Read indicators separately; there is no combined health score. A higher number is not automatically better — check the label, unit and threshold.']],
      useTitle:'Who is it for?', use:'Residents can understand recreation opportunities; planners can compare accessibility and scenarios; researchers can inspect calculations, sources and limitations.',
      limits:'A research pilot without live monitoring. Origins are synthetic; the 2026 OSM network is combined with environmental data from 2021. Results do not confirm current conditions, street-level air quality or health effects. Access to places needs verification.',
      controls:'Map controls', controlsText:'Mouse: drag to pan, scroll to zoom; in 3D, Shift + drag rotates and tilts. Phone: use one finger to pan and two fingers to zoom and rotate the 3D view. You can also use the +/− and rotation buttons. With the map focused: arrow keys pan, +/− zoom, Home resets the view, Q/E rotate and R/F tilt in 3D.',
      space:'On a phone, open Places or Results as needed; close the panel to see the map again. Expand map (⛶) hides panels without losing your selection.',
      actions:'Open a view and try it', map:'Explore access', layers:'Open layers', environment:'Compare surroundings', research:'Research and paper', methods:'Methods and sources', back:'Back to the map'
    },
    tr: {
      button:'Nasıl kullanılır', close:'Kılavuzu kapat', eyebrow:'SPORTSPACE / KISA KILAVUZ',
      title:'Şehir rekreasyon için neler sunuyor?',
      lead:'SportSpace, Stup ve Ilidža için etkinlik alanlarını, yolculuk süresini, bitki örtüsünü, suyu ve bölgesel hava kalitesi ile iklim verilerini bir araya getirir. Olanakları keşfedin, seçenekleri karşılaştırın ve her sonucun dayanağını inceleyin.',
      question:'Bir soruyla başlayın', example:'Seçtiğim örnek başlangıçtan hangi oyun alanlarına ulaşabilirim — biraz daha uzun bir yolculuk daha yeşil bir çevreye götürebilir mi?',
      stepsTitle:'Sorudan sonuca',
      steps:[['Başlangıç ve etkinlik seçin','Menüden örnek bir başlangıç noktası ve etkinlik türü seçin. Yerler bölümünü açıp listeden veya haritadan bir hedef seçin. Harita seçiminizi çerçeveler.'],['Sonucu okuyun','Erişim, göstergeleri ve etkileşimli grafiği içeren başlangıç profilini açar. Yol ve çevre ayrıntıları için Sonuçlar içinde yer profiline geçin. Ağ mesafesini kuş uçuşu mesafeyle karşılaştırın.'],['Katmanları açın','Katmanlar düğmesi haritanın üstündedir. Hazır bir birleşim veya ayrı katmanlar seçin: bitki örtüsü, su, arazi örtüsü ve bitki örtüsü oranı gradyanı. Lejant ve kaynaklar görünümü açıklar.'],['Seçimi neyin değiştirdiğini inceleyin','Çevre karşılaştırmasında yolculuk süresini ve yarıçapı değiştirin. Planla, bir yerin seçeneklerden çıkarılmasını inceler. Araştırma; bulguları, hareket saatleri ve havayı, iklimi, makaleyi ve verileri sunar.']],
      readTitle:'Sayılar ve renkler nasıl okunur?',
      readings:[['Dakikalar ve çizgiler','Yolculuk süresi, modellenmiş ağdan ve varsayılan yürüme hızından hesaplanır. Kesikli bağlantılar doğrulanmamıştır. Animasyon rota geometrisini gösterir; gerçek hareketi simüle etmez.'],['Bitki örtüsü ve su','Yüzdeler, seçilen yarıçap içindeki uydu arazi örtüsünü tanımlar. Gradyan bitki örtüsü oranını özetler; 3B ağaçlar uydu hücrelerini simgeler. Bunlar gölgeyi, yürünebilirliği veya kamusal erişimi doğrulamaz.'],['Hava, iklim ve göstergeler','Geçmiş bölgesel seriler tüm konumlar için ortak zamansal bağlam sağlar. Göstergeleri ayrı okuyun; birleşik bir sağlık puanı yoktur. Daha yüksek değer her zaman daha iyi değildir: etiketi, birimi ve eşiği kontrol edin.']],
      useTitle:'Kimler için, ne amaçla?', use:'Kent sakinleri rekreasyon olanaklarını anlayabilir; planlamacılar erişilebilirliği ve senaryoları karşılaştırabilir; araştırmacılar hesapları, kaynakları ve sınırlılıkları inceleyebilir.',
      limits:'Canlı izleme içermeyen bir araştırma pilotudur. Başlangıç noktaları sentetiktir; 2026 OSM ağı, 2021 çevre verileriyle birleştirilmiştir. Sonuçlar güncel koşulları, sokak düzeyinde hava kalitesini veya sağlık etkilerini doğrulamaz. Yerlere erişim ayrıca doğrulanmalıdır.',
      controls:'Harita kontrolleri', controlsText:'Fare: kaydırmak için sürükleyin, yakınlaştırmak için tekerleği kullanın; 3B görünümde Shift + sürükleme döndürür ve eğer. Telefonda bir parmakla kaydırın, iki parmakla yakınlaştırın ve 3B görünümü döndürün. +/− ve döndürme düğmelerini de kullanabilirsiniz. Harita odaktayken: ok tuşları kaydırır, +/− yakınlaştırır, Home görünümü sıfırlar, Q/E döndürür ve R/F 3B eğimini değiştirir.',
      space:'Telefonda Yerler veya Sonuçlar bölümünü gerektiğinde açın; haritayı tekrar görmek için paneli kapatın. Haritayı genişlet (⛶), seçiminizi koruyarak panelleri gizler.',
      actions:'Bir görünüm açıp deneyin', map:'Erişimi keşfet', layers:'Katmanları aç', environment:'Çevreyi karşılaştır', research:'Araştırma ve makale', methods:'Yöntem ve kaynaklar', back:'Haritaya dön'
    }
  };
  const button = document.createElement('button');
  button.id='guideBtn'; button.type='button'; button.className='nav-item guide-trigger';
  button.dataset.noTranslate='true'; button.setAttribute('aria-haspopup','dialog'); button.setAttribute('aria-controls','guideDialog');
  $('.main-nav').append(button);
  const dialog=document.createElement('dialog');
  dialog.id='guideDialog'; dialog.className='modal guide-dialog'; dialog.dataset.noTranslate='true';
  dialog.setAttribute('aria-labelledby','guideTitle'); document.body.append(dialog);
  const rows = (items,tag) => items.map(([title,body])=>`<${tag}><h3>${title}</h3><p>${body}</p></${tag}>`).join('');
  function render(){
    const t=copy[SportSpaceI18n.language]||copy.bs;
    button.textContent=t.button;
    dialog.innerHTML=`<div class="guide-head"><span class="eyebrow">${t.eyebrow}</span><button type="button" class="icon-button" id="guideClose" aria-label="${t.close}">✕</button></div>
      <div class="guide-body"><h2 id="guideTitle" tabindex="-1">${t.title}</h2><p class="guide-lead">${t.lead}</p>
      <div class="guide-question"><span class="eyebrow">${t.question}</span><p>${t.example}</p></div>
      <h3 class="guide-section-title">${t.stepsTitle}</h3><ol class="guide-steps">${rows(t.steps,'li')}</ol>
      <details><summary>${t.readTitle}</summary><div class="guide-readings">${rows(t.readings,'section')}</div></details>
      <details><summary>${t.controls}</summary><p>${t.controlsText}</p><p>${t.space}</p></details>
      <section class="guide-purpose"><h3>${t.useTitle}</h3><p>${t.use}</p><p class="guide-limit">${t.limits}</p></section>
      <h3 class="guide-section-title">${t.actions}</h3><div class="guide-actions">${['map','layers','environment','research','methods'].map(k=>`<button type="button" data-guide-action="${k}">${t[k]} <span aria-hidden="true">↗</span></button>`).join('')}</div></div>
      <div class="guide-footer"><button type="button" id="guideBack">${t.back} <span aria-hidden="true">→</span></button></div>`;
    $('#guideClose').onclick=()=>dialog.close(); $('#guideBack').onclick=()=>dialog.close();
  }
  button.onclick=()=>{dialog.showModal();dialog.scrollTop=0;$('#guideTitle').focus({preventScroll:true});};
  dialog.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const items=[...dialog.querySelectorAll('button,summary,a[href]')].filter(el=>el.getClientRects().length);
    const first=items[0],last=items.at(-1),active=document.activeElement;
    if(e.shiftKey&&(active===first||!items.includes(active))){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&(active===last||!items.includes(active))){e.preventDefault();first.focus();}
  });
  dialog.addEventListener('close',()=>button.focus({preventScroll:true}));
  dialog.addEventListener('click',e=>{
    if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}
    const action=e.target.closest('[data-guide-action]')?.dataset.guideAction;if(!action)return;
    dialog.close();
    // Wait for native dialog focus restoration before opening another destination.
    requestAnimationFrame(()=>{
      const targets={map:'[data-view="access"]',environment:'#environmentBtn',research:'#findingsBtn',methods:'#methodologyBtn'};
      if(action==='layers'){
        if(!$('#layerPanel').hidden){$('#layerPanel').querySelector('button')?.focus();return;}
        $('#layersBtn').click();$('#layerPanel').querySelector('button')?.focus();
      }else{$(targets[action]).click();if(action==='map')$('#atlasResults').focus();}
    });
  });
  window.addEventListener('sportspace-language',render);render();
})();
