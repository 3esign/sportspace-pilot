# SportSpace v0.23 — dostupnost, vegetacija, voda i vazduh

doc. dr. Semir Poturak · prof. dr. Amra Tuzović  
University of Travnik, Faculty of Technical Sciences

## Istraživački okvir

Pitanje: kako se prostorne mogućnosti za aktivnost razlikuju po mrežnom vremenu, izboru odredišta i vegetacionom/vodenom okruženju, i kakav je istorijski regionalni vremenski kontekst vazduha?

Rad obrađuje postojeće sekundarne podatke. Nova terenska merenja, senzori i studija učesnika nisu uslov ovog rada. Predmet nisu procena zdravstvenih ishoda, potražnje ili dokaz promene ponašanja.

## Izvori i licence

| Izvor | Upotrebljeni podaci | Uslovi |
|---|---|---|
| OpenStreetMap, snimak19.09.2026 | 12 kandidata, mreža, 20 sintetičkih polazišta, 228 rutiranih parova | ODbL1.0, © OpenStreetMap contributors |
| ESA WorldCover2021 v200 | Lokalni raster klasifikacije, nominalno10m; original N42E018 | CC BY4.0; DOI10.5281/zenodo.7254221 |
| CAMS Europe preko Open-Meteo,2021 | Jedna regionalna ćelija43.8N/18.3E, 8760sati ×4parametra | API podaci CC BY4.0; atribucija CAMS ENSEMBLE i Open-Meteo; besplatna usluga ima zasebne nekomercijalne uslove |

Prava: [WorldCover](https://esa-worldcover.org/en/data-access), [Open-Meteo licenca](https://open-meteo.com/en/licence), [Open-Meteo uslovi](https://open-meteo.com/en/terms), [CAMS katalog](https://ads.atmosphere.copernicus.eu/datasets/cams-europe-air-quality-reanalyses?tab=overview), [OSM](https://www.openstreetmap.org/copyright).

Obavezna atribucija karte: © ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium. Prostorna obrada, izvod i agregati: SportSpace. Vazduh: CAMS ENSEMBLE data via Open-Meteo; contains modified Copernicus Atmosphere Monitoring Service information (2021).

Izvorni regionalni podaci i satelitski izvod zadržavaju CC BY4.0. Povezane tabele sa OSM identifikatorima i rutama zadržavaju i ODbL obaveze za izvedenu bazu, uz atribuciju CC BY izvora. Licenca koda MIT ne prekriva podatke.

Postojeći prepis staničnih podataka Ilidža2024 nije uključen: otvorena stranica nije dokaz otvorene licence baze. On ostaje odvojeni radni ulaz. Ne objavljujemo izvorni PDF, mejl, podatke posmatrača ili privatne izvode.

## Pribavljanje i raster

`environment-acquire-v023.cjs` preuzima tačno navedene byte-range delove GeoTIFF-a i jedan istorijski JSON odgovor. Manifest čuva URL, opsege, vreme, dužine i SHA-256. Nema korisničkih lokacija, naloga ili ključeva. `domains=cams_europe` je podržani selektor; ne postoji potvrđen javni `cams_europe_reanalysis` selektor. Za2021 koristi se istorijski evropski arhivski tok; podtip validated/interim ne tvrdi se za ovaj odgovor.

WorldCover je little-endian TIFF, Deflate8, Predictor1, single-band8bit, tiled1024×1024, EPSG4326, PixelIsArea. Izvod ima1442×962piksela; nominalno10m, stvarna geografska ćelija ima različite metričke stranice na ovoj širini. Sačuvani binarni izvod i georeferenciranje omogućavaju ponovljiv račun bez ponovnog preuzimanja.

## Okolina odredišta

Za tačku j i radijus r∈{100,300,500}m biraju se pikseli čiji centar leži unutar kruga. Rastojanje koristi lokalnu ekvirektangularnu projekciju sa referentnom širinom43.839°N. Površina ćelije računa se sferno: A=R²Δλ(sinφ_n−sinφ_s), R=6371008.8m.

Udeo klase K: F(j,r,K)=Σ A_p·1(klasa_p∈K) / Σ A_p, u imenitelju samo validni klasifikovani pikseli. Nodata0 se izostavlja i pokrivenost se prikazuje posebno. Svi sadašnji bufferi imaju100% validnu pokrivenost. Disk je aproksimiran izborom centara piksela, ne preciznim presekom rubnih piksela.

- Vegetacione klase K={10,20,30,90,95,100}; poljoprivreda40 je odvojena.
- Drveće K={10}: udeo površine klase drveća, ne procenat krošnji ili stvarni broj stabala.
- Voda K={80}: trajna vodena tela, uključujući reke. Uski vodotokovi mogu izostati u rasteru. OSM vodotokovi su zaseban kartografski kontekst i ne sabiraju se sa ovim površinama.
- Izgrađeno K={50}.

Nezavisna provera šest krugova geodetskim haversine rastojanjem daje najveću razliku0.03594procentnih poena, nastalu na tri granična piksela. UI prikazuje jednu decimalu. Ova provera ne predstavlja procenu ukupne tačnosti satelitske klasifikacije.

## Okruženje putanje

Svaki segment već postojeće mrežne putanje deli se na podsegmente dužine≤10m. Na sredini svakog uzorka traži se bar jedan centar vegetacionog piksela u25m;50m služi proveri osetljivosti. Rezultat je zbir dužina pozitivnih podsegmenata podeljen zbirnom validnom uzorkovanom dužinom. Neproverene spojnice između lokacije i grafa nisu uključene.

Ovo je udeo dužine u blizini vegetacione klase. Nije udeo površine zelenila u koridoru, vidljivost, hlad ili izloženost. Svih228putanja ima validnu pokrivenost i za50m rezultat nije manji nego za25m. Račun ne traži zeleniju alternativnu trasu do istog odredišta.

## Tri modela dostupnosti i Pareto pogled

Za polazište i, odredišta iste aktivnosti J i mrežna vremena t_ij:

1. **Najbliže:** M_i=min_j t_ij. Jedinica: minut, manja vrednost znači bliži prvi izbor.
2. **Kumulativno:** C_i(T)=Σ_j1(t_ij≤T). Jedinica: broj odredišta. T je korisnički prag, ne medicinska preporuka.
3. **Potencijal:** P_i(h)=Σ_j2^(−t_ij/h). Jedinica: ponderisane mogućnosti. Odredište na h minuta doprinosi0.5; svako ima težinu1. h=10/15/30min su demonstracioni scenariji, nisu procenjeni iz ponašanja. Viša vrednost znači veću modelovanu ponudu, ne više stanovnika ili kapaciteta.

Samo konačni mrežni rezultati ulaze u ove račune. Polazište bez ijednog rezultata je nepoznato; rutirano polazište bez mesta unutar praga ima nula kumulativnih mogućnosti. Ova razlika je očuvana u interfejsu i testovima.

Pareto poređenje minimizira vreme i maksimizira vegetacione klase oko odredišta. Opcija je dominirana ako druga ima oba kriterijuma najmanje jednako dobra, a jedan strogo bolji. Nedominirane opcije nisu ukupna preporuka: drugi kriterijumi i ograničenja nisu uključeni. Ne izmišljamo kapacitete, težine zdravstvenih koristi ili kalibraciju ponašanja.

Zajednički scenario broji sintetička polazišta koja imaju makar jedno mesto unutar T i sa vegetacijom≥g u izabranom radijusu. Poređenje100/300/500m pokazuje koliko zaključak zavisi od prostorne definicije okruženja. Pragovi i radiјusi su transparentne operacionalizacije, ne novi validirani modeli.

## Vazduh

Četiri parametra su PM2.5, PM10, NO2 i O3, uµg/m³. Provereno8760jedinstvenih uzastopnih UTC sati za2021; nema praznih vrednosti. Mesečne/godišnje sredine računaju se iz odgovarajućih sati; godišnja sredina nije neponderisan prosek mesečnih sredina. Prosečan satni profil grupiše isti UTC sat svih dana. Kvantili koriste linearnu interpolaciju između sortiranih vrednosti.

DJF znači januar, februar i decembar iste2021, a ne neprekinutu zimsku sezonu. Gruba regionalna ćelija0.1° koristi se kao zajednički vremenski kontekst svih mesta. Nema interpolacije među ulicama, rangiranja lokalnih objekata po kvalitetu vazduha, individualne doze, medicinske preporuke ili skora zdravlja.

## Prikaz i interakcija

2D i3D prikazuju istu analitičku osnovu. OSM visine ili procene po etažama oblikuju zgrade. Jedan stilizovani3D simbol uzorkuje svaku šestu rastersku kolonu/red gde je izabrana ćelija klase10; geometrija simbola je ilustrativna (14m vrh), ne izmereno stablo. Broj simbola nema analitičko značenje. Tekst u3D prikazu to označava. Raster i svi proračuni ostaju nepromenjeni pri promeni dimenzije.

Miš: povlačenje pomera, točkić zumira, desno/Shift povlačenje u3D rotira i naginje. Dodir: jedan prst pomera, dva zumiraju/pomeraju/rotiraju. Tastatura: strelice,+/−,Home,Q/E,R/F. Liste i tabele ostaju tekstualna alternativa prostornoj interakciji.

## Literatura

- Geurs,K.T.(2018). *Transport Planning With Accessibility Indices in the Netherlands*. International Transport Forum Discussion Papers2018/09. [DOI10.1787/c62be65d-en](https://doi.org/10.1787/c62be65d-en). Osnova porodica kumulativne i potencijalne dostupnosti; konkretno poluvreme je naš scenario.
- Boyd,S.; Vandenberghe,L.(2004). *Convex Optimization*,§4.7. [Autorsko izdanje](https://web.stanford.edu/~boyd/cvxbook/). Osnova Pareto odnosa, bez tvrdnje da naš diskretan problem zahteva konveksni solver.
- Zanaga,D. et al.(2022). *ESA WorldCover10m2021v200*. [DOI10.5281/zenodo.7254221](https://doi.org/10.5281/zenodo.7254221). [Product User Manualv2.0](https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/docs/WorldCover_PUM_V2.0.pdf).
- Copernicus Atmosphere Monitoring Service. *CAMS European air quality reanalyses*. [DOI10.24381/7cc0465a](https://doi.org/10.24381/7cc0465a). Naš pristup preko [Open-Meteo API-ja](https://open-meteo.com/en/docs/air-quality-api); čuvati i posredničku atribuciju.
- WHO Regional Office for Europe(2016). *Urban green spaces and health*. [Zvanični izveštaj](https://www.who.int/europe/publications/i/item/WHO-EURO-2016-3352-43111-60341). Kontekst veze prostora i zdravlja; nije dokaz efekta našeg alata.

## Honest verdict

Provereni su izvori/licence, georeferenciranje, hashovi, nezavisni uzorak prostornih računa, kompletan vremenski niz i programske invarijante. Nije izvršena nova klasifikacija satelitskih snimaka, lokalna kalibracija vazduha, merenje korišćenja prostora ili zdravlja. Novi rad može biti metodološka i računarska analiza sekundarnih podataka sa tim jasno navedenim granicama. Spoljna terenska i korisnička validacija ostaje mogući budući rad.
