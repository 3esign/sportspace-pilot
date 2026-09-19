(() => {
  'use strict';
  const data = window.SPORTSPACE_DATA;
  if (!data) throw new Error('SPORTSPACE_DATA missing');

  const $ = selector => document.querySelector(selector);
  const canvas = $('#mapCanvas');
  const ctx = canvas.getContext('2d');
  const ui = {
    metrics: $('#metricList'), hover: $('#hoverReadout'), guardrails: $('#guardrailStrip'),
    title: $('#selectionTitle'), status: $('#selectionStatus'), body: $('#selectionBody'),
    evidence: $('#evidencePanel'), compare: $('#compareGrid')
  };
  const state = { mode: 'overview', selected: null, pinA: null, pinB: null, pixelRatio: 1 };
  const aoi = data.aoi.features[0];
  const bbox = aoi.properties.bbox_wsen;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  const fmt = (value, unit = '') => value === null || value === undefined ? 'n/a' : `${value}${unit}`;
  const safeUrl = value => /^https:\/\//.test(value || '') ? value : '#';
  const labelStatus = status => ({
    documented_access_or_regime_not_field_verified: 'dokumentovan režim',
    same_source_confirmation_rejected: 'isto poreklo odbačeno',
    independent_locality_document_exact_feature_unresolved: 'tačna tačka nerazrešena',
    not_sampled: 'van uzorka'
  })[status] || status || 'nepoznato';
  const accessLabel = value => value === 'public_documented'
    ? 'dokumentovan režim, bez terenske potvrde'
    : 'nepoznat režim';
  const statusClass = status => status?.startsWith('documented_') ? 'documented' : status?.startsWith('same_source_') ? 'rejected' : status?.includes('unresolved') ? 'unresolved' : 'unsampled';

  const candidates = data.candidates.features.map(feature => ({
    type: 'candidate', id: feature.properties.feature_id,
    label: feature.properties.name || feature.properties.feature_id,
    lon: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1], props: feature.properties
  }));
  const origins = data.origins.features.map(feature => ({
    type: 'origin', id: feature.properties.origin_id, label: feature.properties.origin_id,
    lon: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1], props: feature.properties
  }));
  const candidateById = new Map(candidates.map(item => [item.id, item]));
  const nearestByOrigin = new Map(data.run.nearest_by_origin.map(item => [item.origin_id, item]));
  const rowsByOrigin = new Map();
  const rowsByCandidate = new Map();
  for (const row of data.run.rows) {
    if (!rowsByOrigin.has(row.origin_id)) rowsByOrigin.set(row.origin_id, []);
    if (!rowsByCandidate.has(row.feature_id)) rowsByCandidate.set(row.feature_id, []);
    rowsByOrigin.get(row.origin_id).push(row);
    rowsByCandidate.get(row.feature_id).push(row);
  }
  const eventsByCandidate = new Map();
  for (const event of data.verification.events) {
    if (!eventsByCandidate.has(event.feature_id)) eventsByCandidate.set(event.feature_id, []);
    eventsByCandidate.get(event.feature_id).push(event);
  }
  const sourceById = new Map(data.verification.sources.map(source => [source.source_id, source]));

  function project(lon, lat) {
    const pad = Math.min(62, canvas.clientWidth * 0.12);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const [west, south, east, north] = bbox;
    const scale = Math.min((width - pad * 2) / (east - west), (height - pad * 2) / (north - south));
    const mapWidth = (east - west) * scale;
    const mapHeight = (north - south) * scale;
    return [(width - mapWidth) / 2 + (lon - west) * scale, (height - mapHeight) / 2 + (north - lat) * scale];
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    state.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * state.pixelRatio));
    canvas.height = Math.max(1, Math.floor(rect.height * state.pixelRatio));
    ctx.setTransform(state.pixelRatio, 0, 0, state.pixelRatio, 0, 0);
    draw();
  }

  function drawGround() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.fillStyle = '#eee8dc';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(24,32,31,.055)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 42) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += 42) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    const points = aoi.geometry.coordinates[0].map(([lon, lat]) => project(lon, lat));
    ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    ctx.fillStyle = 'rgba(217,227,213,.56)'; ctx.strokeStyle = 'rgba(24,32,31,.35)'; ctx.lineWidth = 1.3; ctx.fill(); ctx.stroke();
  }

  function drawRelations() {
    if (!['overview','nearest','unroutable'].includes(state.mode)) return;
    for (const origin of origins) {
      const nearest = nearestByOrigin.get(origin.id);
      const candidate = candidateById.get(nearest?.nearest_network?.feature_id);
      if (!candidate) continue;
      const hasUnrouted = (rowsByOrigin.get(origin.id) || []).some(row => row.route_status !== 'routed');
      if (state.mode === 'unroutable' && !hasUnrouted) continue;
      const [x1, y1] = project(origin.lon, origin.lat);
      const [x2, y2] = project(candidate.lon, candidate.lat);
      ctx.save(); ctx.setLineDash(hasUnrouted ? [4, 6] : [10, 8]);
      ctx.strokeStyle = hasUnrouted ? 'rgba(152,60,55,.58)' : 'rgba(21,87,255,.26)';
      ctx.lineWidth = hasUnrouted ? 2.2 : 1.4;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
    }
  }

  function candidateColor(status) {
    if (state.mode !== 'verification') return '#4f7f5f';
    return { documented:'#1c7552', rejected:'#a35f2b', unresolved:'#8a6a10', unsampled:'#766d7d' }[statusClass(status)];
  }

  function drawPoint(item, selected) {
    const [x, y] = project(item.lon, item.lat);
    const isCandidate = item.type === 'candidate';
    const rows = isCandidate ? rowsByCandidate.get(item.id) || [] : rowsByOrigin.get(item.id) || [];
    const hasUnrouted = rows.some(row => row.route_status !== 'routed');
    const radius = (isCandidate ? 8 : 5.5) + (selected ? 3 : 0);
    const fill = isCandidate ? candidateColor(item.props.verification_status) : (hasUnrouted ? '#983c37' : '#1557ff');
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, radius + (selected ? 7 : 3), 0, Math.PI * 2);
    ctx.fillStyle = selected ? 'rgba(21,87,255,.18)' : 'rgba(255,250,240,.65)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = selected ? '#1557ff' : '#fffaf0'; ctx.lineWidth = selected ? 3 : 1.5; ctx.stroke();
    if (state.mode === 'verification' && isCandidate && item.props.in_verification_sample) {
      ctx.setLineDash([3, 3]); ctx.strokeStyle = fill; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, radius + 8, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawLabels() {
    if (!['verification','nearest','unroutable'].includes(state.mode)) return;
    ctx.font = '12px ui-sans-serif, system-ui'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(24,32,31,.76)';
    const items = state.mode === 'verification' ? candidates.filter(item => item.props.in_verification_sample) : origins;
    for (const item of items) {
      const [x, y] = project(item.lon, item.lat);
      ctx.fillText(item.type === 'candidate' ? (item.props.name || item.props.activity_class) : item.id, x + 13, y);
    }
  }

  function draw() {
    drawGround(); drawRelations();
    const selectedId = state.selected?.id;
    for (const origin of origins) drawPoint(origin, selectedId === origin.id);
    for (const candidate of candidates) drawPoint(candidate, selectedId === candidate.id);
    drawLabels();
  }

  function hitTest(event) {
    const rect = canvas.getBoundingClientRect();
    const mouse = [event.clientX - rect.left, event.clientY - rect.top];
    let best = null;
    for (const item of [...candidates, ...origins]) {
      const [x, y] = project(item.lon, item.lat);
      const distance = Math.hypot(mouse[0] - x, mouse[1] - y);
      if (distance < 19 && (!best || distance < best.distance)) best = { item, distance };
    }
    return best?.item || null;
  }

  const kv = rows => `<div class="kv">${rows.map(([key, value]) => `<span>${esc(key)}</span><span>${esc(value)}</span>`).join('')}</div>`;
  const card = (title, body) => `<section class="info-card"><h3>${esc(title)}</h3>${body}</section>`;

  function sourceLinks(item) {
    const ids = item.props.verification_source_refs || [];
    if (!ids.length) return '<p>Nema prihvatljivog nezavisnog izvora u ovom uzorku.</p>';
    return `<ul class="source-list">${ids.map(id => {
      const source = sourceById.get(id);
      return source ? `<li><a class="source-link" href="${esc(safeUrl(source.url))}" target="_blank" rel="noopener">${esc(id)} · ${esc(source.title)}</a><small>${esc(source.independence_from_osm)} · pregledano ${esc(source.retrieved_on)}</small></li>` : '';
    }).join('')}</ul>`;
  }

  function eventTable(item) {
    const events = eventsByCandidate.get(item.id) || [];
    if (!events.length) return '<p>Ovaj kandidat nije u petočlanom verifikacionom uzorku.</p>';
    return `<div class="event-list">${events.map(event => `<article><div><strong>${esc(event.property)}</strong><span class="verification-badge ${esc(statusClass(item.props.verification_status))}">${esc(event.observed_value.status)}</span></div><p>${esc(event.observed_value.detail)}</p><small>${esc(event.confidence)} confidence · ${esc(event.source_independence)}</small></article>`).join('')}</div>`;
  }

  function candidateBody(item) {
    const rows = rowsByCandidate.get(item.id) || [];
    const routed = rows.filter(row => row.route_status === 'routed').sort((a, b) => a.network_distance_m - b.network_distance_m);
    const best = routed[0];
    const definition = data.verification.status_definitions[item.props.verification_status] || 'Status nije definisan.';
    return [
      card('Identitet kandidata', kv([
        ['naziv', item.props.name || 'bez imena'], ['klasa', item.props.activity_class],
        ['OSM ref', `${item.props.source_osm_type}/${item.props.source_osm_id}`], ['dedupe', item.props.dedupe_status]
      ])),
      card('Status dokaza', `<p class="status-explain">${esc(definition)}</p>${kv([
        ['status', labelStatus(item.props.verification_status)], ['status režima', accessLabel(item.props.access_model)],
        ['u uzorku', item.props.in_verification_sample ? 'da' : 'ne'], ['terenska provera', 'nije sprovedena']
      ])}`),
      card('Proverena svojstva', eventTable(item)),
      card('Javni izvori', sourceLinks(item)),
      card('Mrežni baseline', kv([
        ['rutirani parovi', `${routed.length}/${rows.length}`], ['najbliži origin', best?.origin_id || 'n/a'],
        ['najkraće vreme', fmt(best?.travel_time_min, ' min')], ['interpretacija', best?.interpretation_status || 'n/a']
      ]))
    ].join('');
  }

  function originBody(item) {
    const nearest = nearestByOrigin.get(item.id);
    const rows = rowsByOrigin.get(item.id) || [];
    const unrouted = rows.filter(row => row.route_status !== 'routed').length;
    const nearestCandidate = nearest?.nearest_network;
    return [
      card('Najbliži mrežni kandidat', kv([
        ['kandidat', nearestCandidate?.name || nearestCandidate?.feature_id || 'n/a'],
        ['klasa', nearestCandidate?.activity_class || 'n/a'], ['mrežna distanca', fmt(nearestCandidate?.network_distance_m, ' m')],
        ['vreme hoda', fmt(nearestCandidate?.travel_time_min, ' min')], ['status dokaza', labelStatus(nearestCandidate?.verification_status)]
      ])),
      card('Integritet mreže', `<p>${unrouted ? `${unrouted} parova nije rutirano iz ovog origina. To je signal za proveru grafa, a ne dokaz stvarne prepreke.` : 'Svi parovi iz ovog origina rutirani su u tehničkom baseline grafu.'}</p>`),
      card('Granica', `<p>${esc(item.props.claim_limit)}</p>`)
    ].join('');
  }

  function renderInspector() {
    const item = state.selected;
    if (!item) {
      ui.title.textContent = 'Izaberite element'; ui.status.textContent = 'bez izbora'; ui.status.className = 'status-pill';
      ui.body.innerHTML = card('Šta možete proveriti', '<p>Uključite prikaz Provera i izaberite označeni kandidat. Inspektor odvaja mrežni rezultat, status svojstva, izvor i granicu tvrdnje.</p>');
      renderEvidence(); return;
    }
    ui.title.textContent = item.label;
    if (item.type === 'candidate') {
      const status = statusClass(item.props.verification_status);
      ui.status.textContent = labelStatus(item.props.verification_status);
      ui.status.className = `status-pill ${status}`;
      ui.body.innerHTML = candidateBody(item);
    } else {
      ui.status.textContent = 'sintetički origin'; ui.status.className = 'status-pill origin-status';
      ui.body.innerHTML = originBody(item);
    }
    renderEvidence();
  }

  function renderEvidence() {
    ui.evidence.innerHTML = `<p><strong>${esc(data.run.run_id)}</strong> · ${esc(data.run.method_version)}</p>
      <ul><li>20 sintetičkih origina × 12 kandidata</li><li>5 kandidata u dokumentarnom uzorku · 15 događaja</li><li>2 dokumentovana režima · 0 terenskih potvrda</li></ul>
      <p>${esc(data.evidence.public_claim_limit)}</p>
      <p class="hash">run sha256: ${esc(data.source_hashes.run)}</p>`;
  }

  function renderMetrics() {
    const counts = data.run.counts;
    const rows = [
      ['kandidati', counts.candidates], ['origini', counts.origins], ['rutirano', counts.routed_pairs],
      ['uzorak provere', counts.verification_sample_candidates], ['dokumentovano', counts.documented_access_or_regime_candidates],
      ['terenski potvrđeno', counts.public_verified_candidates], ['odbačeno isto poreklo', counts.same_source_rejected_candidates],
      ['nerazrešen spoj', counts.unresolved_entity_match_candidates]
    ];
    ui.metrics.innerHTML = rows.map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('');
  }

  function renderGuardrails() {
    ui.guardrails.innerHTML = data.hard_limits.slice(0, 3).map(limit => `<span class="guardrail-chip">${esc(limit)}</span>`).join('');
  }

  function renderCompare() {
    const renderPin = (label, item) => `<div class="compare-card"><strong>${label}: ${esc(item?.label || 'prazno')}</strong><span>${item ? esc(item.type === 'candidate' ? labelStatus(item.props.verification_status) : 'sintetički origin') : 'Izaberite element i sačuvajte.'}</span></div>`;
    ui.compare.innerHTML = renderPin('A', state.pinA) + renderPin('B', state.pinB);
  }

  function select(item) { state.selected = item; renderInspector(); draw(); }
  canvas.addEventListener('click', event => { const item = hitTest(event); if (item) select(item); });
  canvas.addEventListener('mousemove', event => { const item = hitTest(event); ui.hover.textContent = item ? `${item.label} · ${item.type === 'candidate' ? labelStatus(item.props.verification_status) : 'sintetički origin'}` : 'Izaberite tačku ili kandidata'; });
  canvas.addEventListener('keydown', event => {
    const items = state.mode === 'verification' ? candidates.filter(item => item.props.in_verification_sample) : [...origins, ...candidates];
    const current = Math.max(0, items.findIndex(item => item.id === state.selected?.id));
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); select(items[(current + 1) % items.length]); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); select(items[(current - 1 + items.length) % items.length]); }
    if (event.key === 'Enter' && !state.selected) { event.preventDefault(); select(items[0]); }
  });
  document.querySelectorAll('.mode-btn').forEach(button => button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    document.querySelectorAll('.mode-btn').forEach(item => item.classList.toggle('is-active', item === button));
    ui.hover.textContent = state.mode === 'verification' ? 'Pet kandidata u dokumentarnom uzorku označeno je prstenom' : 'Izaberite tačku ili kandidata';
    draw();
  }));
  $('#pinA').addEventListener('click', () => { if (state.selected) state.pinA = state.selected; renderCompare(); });
  $('#pinB').addEventListener('click', () => { if (state.selected) state.pinB = state.selected; renderCompare(); });
  $('#resetViewBtn').addEventListener('click', () => {
    state.mode = 'overview'; state.selected = null; state.pinA = null; state.pinB = null;
    document.querySelectorAll('.mode-btn').forEach(button => button.classList.toggle('is-active', button.dataset.mode === 'overview'));
    ui.hover.textContent = 'Izaberite tačku ili kandidata'; renderInspector(); renderCompare(); draw();
  });
  window.addEventListener('resize', resizeCanvas);

  renderMetrics(); renderGuardrails(); renderInspector(); renderCompare(); resizeCanvas();
})();
