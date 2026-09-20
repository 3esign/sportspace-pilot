# SportSpace v0.24 — podaci, slojevi i tumačenje

Autori: **doc. dr. Semir Poturak**, **prof. dr. Amra Tuzović**. University of Travnik, Faculty of Technical Sciences.

## Šta korisnik može saznati

1. Koliko se pravolinijska blizina razlikuje od modelovanog puta.
2. Koja mjesta iste aktivnosti imaju kraći put, a koja više vegetacije u okruženju.
3. Kako promjena radijusa 100/300/500 m ili vremenskog praga mijenja rezultat.
4. Gdje satelit klasificira vegetaciju i vodu, uključujući površine bez OSM naziva.
5. Kako se regionalni model zraka mijenja kroz 2021. godinu.

Sve su to analize sekundarnih podataka. Ne zahtijevaju nova mjerenja; nisu mjerenje zdravstvenih efekata ili današnjeg stanja lokacija.

## Uloge slojeva

| Sloj | Uloga u računu | Šta prikaz ne dokazuje |
| --- | --- | --- |
| 12 odredišta i 20 probnih polazišta | Isti postojeći E01 model dostupnosti | Stanovništvo, potražnju ili kapacitete |
| 228 izračunatih putanja | Dužina, vrijeme pri 1,2 m/s, blizina vegetacije | Potvrđenu navigaciju ili ulaz |
| WorldCover 2021 | Površinski udjeli vegetacije, drveća, vode i drugih klasa | Hlad, kvalitet parka ili kvalitet vode |
| OSM zgrade, zelene i vodene površine | Kartografski kontekst i 3D visine gdje su dostupne | Javnu dostupnost ili satelitsku klasifikaciju |
| Jedna ćelija CAMS/Open-Meteo | Regionalni historijski vremenski profili | Razlike zraka među ulicama ili rang odredišta |
| Buka | Nije uključena | Izvor i prava za lokalni georeferencirani sloj nisu potvrđeni |

Slojevi se mogu zasebno uključivati. Preseti **Pristup**, **Zelenilo i voda**, **Put i okruženje**, **Zrak kroz godinu** imaju namjensku interpretaciju. Vidljivost sloja ne mijenja račun niti izabrano odredište.

## Vegetacijski gradijent

Za svaki centar pravilne mreže koraka 50 m računamo:

`G(x) = 100 × Σ(area[p] × vegetation[p]) / Σ(area[p] × valid[p])`

Sume obuhvataju piksele čiji centri pripadaju kvadratnom prozoru **200 × 200 m** oko centra x. Vegetacijske klase su 10, 20, 30, 90, 95, 100; poljoprivreda 40 nije vegetacija u ovom pokazatelju. Validni denominator obuhvata poznate WorldCover klase. Površinska težina proporcionalna je kosinusu geografske širine centra reda; za jednaki geografski korak to odgovara relativnoj površini sfernih piksela. Projekcija za metrički prozor koristi isti lokalni equirectangular okvir kao prikaz, širinu 43,839°.

Integralne slike ubrzavaju sabiranje bez promjene definicije. Na granici izvoda prozori koji bi bili nepotpuni ostaju bez vrijednosti. Skala je fiksna **0–100%**, bez normalizacije po pogledu. Izvor ostaje nominalno 10 m; 50 m je korak izvedenog prikaza, a 200 m širina prozora. Preklopljeni prozori su korelirani. Klik otkriva prozor i broj; boja nije model temperature, buke ili nesigurnosti. Nezavisna direktna suma za 20 prozora odstupa najviše 0,00000322 procentna poena, zbog Float32 izlaza.

## Zelene lokacije

Iz postojećeg OSM kartografskog izvoda izdvojeno je 347 poligona veličine najmanje 500 m² ili sa nazivom; 10 ima naziv. Tipovi i nazivi sačuvani su u `site/data/green-context.js`, uz izvorni hash i ODbL. Izvedene površine koriste lokalni metrički okvir i približne OSM granice. Poligoni mogu biti preklopljeni, pa njihove površine nisu ukupna površina zelenila. Park prijateljstva, Centar Safet Zajko i ostali nazivi mogu se pretražiti i otvoriti na mapi. Nisu automatski dodani među 12 rutiranih odredišta. Kontakti i adrese iz izvornog zapisa nisu izvezeni.

## Vizualizacijske odluke i izvori

- Povezani izbor mape, liste i profila: [Vega-Lite crossfilter](https://vega.github.io/vega-lite/examples/interactive_crossfilter.html).
- Ista skala za male grafikone radijusa: [Vega-Lite repeat](https://vega.github.io/vega-lite/docs/repeat.html).
- Sekvencijalna svijetlo–tamna skala za uređen pokazatelj: [ColorBrewer](https://colorbrewer2.org/learnmore/schemes.html).
- Dvopromenljive legende su mogući naredni prikaz za vrijeme × vegetaciju na stvarnim odredištima: [Esri](https://pro.arcgis.com/en/pro-app/3.4/help/mapping/layer-properties/bivariate-colors.htm). Nisu interpolirani lokalni model zraka.
- 3D statistički stubovi ostaju moguća nadogradnja. [Tilt Map](https://arxiv.org/abs/2006.14120) istražuje prelaze kartografskih prikaza u VR; nije dokaz prednosti našeg desktop interfejsa. Sadašnje 3D zgrade i simbolična stabla ne prikazuju statističku visinu pokazatelja.
- Buka: pronađen [historijski izvještaj KS 2009](https://mpz.ks.gov.ba/sites/mpz.ks.gov.ba/files/INFORMACIJA%20BUKA%202009_0.pdf). Nije potvrđen lokalni dataset/pravo redistribucije, pa nije korišten u računu.

## Jezici i provjera

Bosanski ijekavski je početni jezik, uz engleski i turski. Katalozi sadrže tekstove, pristupačne oznake i parametarske obrasce; dinamički brojevi i mjeseci prate jezik. Izvorni nazivi lokacija, bibliografski naslovi, autori, službena afilijacija, formule i identifikatori ostaju sačuvani. Chromium nema pouzdan bs-BA formatter na svim instalacijama; za bosanske decimalne/grupne separatore koristi se de-DE format, dok HTML ostaje `lang="bs"`.

Automatska provjera: sva tri jezika na 390/768/1160/1440 px, 2D/3D, slojevi, očuvanje odredišta, pretraga parkova, nezavisni raster račun, postojeći modeli i CSV. Korisnička studija nije provedena. Javna verzija v0.30 je objavljena na GitHub Pages.

### 2026-09-20 — auto-kadar i kandidati zelenila
Automatski kadar sada obuhvata polazište, odredište i cijelu modelovanu putanju (ili pravolinijsku vezu), uz prostor za panele u 2D/3D. Na telefonu se izbor vraća na mapu sa sažetim rezultatom. Provjereno na 390 i 1160 px.

Probno izdvajanje komponenti WorldCover vegetacije u tehničkom AOI koristi 4-susjedstvo. Za prag 1.000 m² izdvojene su 223 povezane komponente, od kojih 42 imaju odnos glavnih osa ≥ 3 (PCA sa varijansom unutar piksela). To su scenarijski geometrijski kandidati; nisu potvrđeni parkovi, zelene rute ili javni prolazi. Rubni fragmenti označeni su kao odsječeni AOI-jem. Za prag 2.000 m² ostaje 129 komponenti i 26 izduženih; time je vidljiva osjetljivost na kriterijum. Nalazi su u review/v024/green-screening.json; nisu dodani kao potvrđena odredišta u interfejs.

### Satelitski kandidati — implementirani pregled
Kartica Moguće površine / Potential areas / Olası alanlar prikazuje 223 komponente ≥1000 m². Filter izduženosti koristi puni PCA odnos osa ≥3: tačan broj je 41, umjesto preliminarnih 42. Za ≥2000 m² ima 129 komponenti i 25 izduženih; za ≥5000 m² ima 72 i 12 izduženih. Zaokruživanje se primjenjuje samo u prikazu.

Jantarne tačke G su geometrijski centri, a izbor prikazuje stvarne piksele komponente preko horizontalnih rasterskih traka. Centar može biti izvan konkavne komponente i nije ulaz. Prikazuju se granica AOI i status nepoznatog pristupa. Komponente nisu dodane u E01 rutirani skup.

Dodatna dva opisna pokazatelja: vegetacijski udio validne površine piksela u krugu 300 m oko centra (centar piksela određuje pripadnost, težina cos geografske širine); minimalna euklidska udaljenost centra do segmenata prikazanog OSM puta u lokalnom metričkom okviru. Isključene su oznake motorway/motorway_link/trunk/trunk_link, ali ostale oznake ne dokazuju dozvoljen pješački pristup. Ne optimizujemo rutu do kandidata i ne pravimo zbirni skor. Izvori su WorldCover 2021 i OSM 2026, uz različite datume i atribucije.

Ponovljivost: node tools/green-candidates-build.cjs iz projektnog ili ravnog javnog paketa. Rezultat site/data/green-candidates.js (odnosno data/ u paketu) sadrži hash rastera i OSM izvora. Geometrija/vegetacija: CC BY 4.0; povezani pokazatelj blizine OSM puta: ODbL 1.0. Test green-candidates.test.cjs provjerava svih 50.126 predstavljenih piksela, preklapanje, pripadnost klasama, granični prag i UI na tri jezika.

## Origin dashboard
Each synthetic origin has a linked destination scatter (network travel minutes versus WorldCover vegetation share within 300 m). A 5–60 minute slider and animation alter the scenario threshold. Access potential is the sum of 2^(-t/15) over computed routes of the selected activity; 15 minutes is an exploratory half-life. The joint indicator counts destinations meeting the time threshold and >=20% vegetation; 20% is exploratory, not a validated health threshold. Missing routes are excluded; when all are missing, indicators are unknown. Water is the arithmetic mean water share of eligible destination buffers, not union area. Analysis circles are 300 m destination buffers, not network isochrones; overlaps are not summed. Regional annual PM2.5 is contextual and does not rank origins. Sources and licences remain OSM, WorldCover 2021 and CAMS/Open-Meteo 2021 as documented above.
