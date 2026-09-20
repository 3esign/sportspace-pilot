# SportSpace — recreation, access and urban surroundings

**doc. dr. Semir Poturak · prof. dr. Amra Tuzović**  
University of Travnik, Faculty of Technical Sciences

SportSpace is an exploratory 2D/3D atlas for urban planning of sport and recreation in Stup / Ilidža. It connects an OSM-derived access model, satellite vegetation and water, and historical regional air and meteorology. The interface is available in Bosnian (ijekavica), English and Turkish.

## Use the pilot

- **Places:** choose an activity and synthetic origin; select a destination or inspect mapped green areas and satellite candidates.
- **Results:** open the origin profile, interactive travel–vegetation chart and separate destination details. Close this panel or expand the map for more space.
- **Layers:** choose a purposeful preset or individual layers. Open the compact legend for scales, source dates and interpretation.
- **Plan:** compare accessibility scenarios with an unavailable destination.
- **Research:** findings, 12 departure-time/pollutant/stay scenarios, monthly ERA5/CAMS summaries, spatial summary figure, methodology and final paper downloads.

The map occupies approximately 80–87% of desktop width initially; side panels occupy their own layout space. On small screens the place list and results open separately. Mouse, touch and keyboard controls are described on the map.

## Scientific interpretation

There are 20 synthetic origins, 12 routed destination candidates and 228 computed connections out of 240. The 2026 network is combined with 2021 environmental data; these are not simultaneous observations. Origins do not represent residents. Historical CAMS/ERA5 regional cells do not establish local street conditions or live air quality. Travel times, gradients and animations are model outputs. There is no validated composite health index, noise layer, field-verified navigation or numerical station validation.

The paper and analytical supplement are in English. Website 0.30 presents the saved scientific outputs; the final v0.29 paper package remains unchanged. The public repository may still show an earlier release until deployment.

[Final paper](research/SportSpace_ICSIE_2026_FINAL.docx) · [Analytical supplement](research/SportSpace_ICSIE_2026_submission.zip) · [Displayed data](research/results.json) · [Spatial/environmental methodology](ENVIRONMENT-METHODS.md) · [Visualization methodology](VISUALIZATION-METHODS.md) · [Data licences](DATA-LICENSE.md) · [Software licence](LICENSE)

No build step, npm installation or network API is required to use this static site. Open `index.html` or serve this directory locally. Research output regeneration is described in the public package's REPRODUCE.md; the full scientific rebuild is documented inside the analytical supplement.
