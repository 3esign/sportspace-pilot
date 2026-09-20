# Data licence and attribution

The browser data in `data/sportspace-data.js` and `data/manifest.json` includes an extract and derived results based on OpenStreetMap data. It is made available under the Open Data Commons Open Database License (ODbL) 1.0.

© OpenStreetMap contributors. See <https://www.openstreetmap.org/copyright> and <https://opendatacommons.org/licenses/odbl/1-0/>.

The visible Canvas map is a Produced Work. Public-source verification metadata records URLs and short factual observations; it does not redistribute the source pages, images, or PDFs. Those sources retain their own terms.

The software is licensed separately under the MIT License in `LICENSE`.


## v0.21 spatial display

`data/display-data.js` is a separate ODbL derived display database: simplified street/building/water/land-context geometry and reconstructed baseline path geometry. Raw snapshots and the full routing graph remain local. Building heights use OSM height tags, or an explicit display estimate of 3 metres per mapped level; missing heights remain flat. Cartographic green areas are not validated environmental indicators. Both 2D Canvas and 3D WebGL views are Produced Works.

## v0.23 environment and published model families

The WorldCover2021 raster extract and CAMS/Open-Meteo2021 time series are CC BY4.0 data. The combined data/environment-data.js includes these data plus OSM-linked derived destination and route metrics; retain ODbL obligations for that derived database and all original CC BY attributions. Original CC BY components remain separately identified.

© ESA WorldCover project2021 / Contains modified Copernicus Sentinel data(2021) processed by ESA WorldCover consortium. Source: https://esa-worldcover.org/en/data-access ; DOI10.5281/zenodo.7254221. Changes: regional extraction, classification grouping, buffer/path aggregation, visualization.

CAMS ENSEMBLE data via Open-Meteo; contains modified Copernicus Atmosphere Monitoring Service information(2021). Sources: https://open-meteo.com/en/licence and https://ads.atmosphere.copernicus.eu/datasets/cams-europe-air-quality-reanalyses?tab=overview . Changes: UTC hourly series aggregated into monthly/annual/hourly profiles. Open-Meteo API data are CC BY4.0; its free API service separately permits noncommercial use under https://open-meteo.com/en/terms . This static package makes no live API calls.

CC BY4.0: https://creativecommons.org/licenses/by/4.0/ . Do not imply endorsement. Source WorldCover and air inputs are included in the reproducibility package; source correspondence and the unresolved-license2024station transcription are excluded.

## Satellite candidate screening
`data/green-candidates.js`: WorldCover2021 component geometries and vegetation statistics (CC BY 4.0) combined with an OSM-derived geometric road-proximity field (ODbL 1.0). Source hashes and component licences are explicit in the dataset. © ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium. © OpenStreetMap contributors. No field access verification is implied.

## v0.30 research presentation

`data/research-data.js` and `research/results.json` present saved v0.25 outputs without changing numerical models. ERA5 meteorology via Open-Meteo: contains modified Copernicus Climate Change Service information (2021), ERA5 reanalysis, cell 43.75 N / 18.25 E, 0.25 degrees. Open-Meteo data licence: https://open-meteo.com/en/licence ; source documentation: https://open-meteo.com/en/docs/historical-weather-api . Changes: hourly values aggregated to annual, local monthly and directional summaries. CAMS attribution above also applies to temporal concentration–time scenarios. These are model outputs, not live monitoring.

`research/SportSpace_ICSIE_2026_FINAL.docx` and the scientific supplement ZIP are unchanged copies of the authors’ v0.29 local submission artifacts. The supplement preserves its own input licences, source receipts and reproducibility instructions. `research/planning-map.png` is a Produced Work derived from OSM and ESA WorldCover; retain both attributions. The software licence does not override data/source rights.
