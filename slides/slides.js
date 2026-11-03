(function () {
  'use strict';
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var bar = document.getElementById('bar');
  var counter = document.getElementById('counter');
  var notes = document.getElementById('notes');
  var notesText = document.getElementById('notes-text');
  var help = document.getElementById('help');
  var body = document.body;
  var current = 0;

  function fit() {
    var w = window.innerWidth, h = window.innerHeight;
    if (body.classList.contains('overview')) { document.documentElement.style.setProperty('--scale', '1'); return; }
    var s = Math.min(w / 1920, h / 1080) * 0.98;
    document.documentElement.style.setProperty('--scale', String(s));
  }

  function show(i, push) {
    if (i < 0) i = 0;
    if (i >= slides.length) i = slides.length - 1;
    current = i;
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    counter.textContent = (i + 1) + ' / ' + slides.length;
    notesText.textContent = slides[i].getAttribute('data-notes') || '';
    if (push !== false) {
      if (history.replaceState) history.replaceState(null, '', '#' + (i + 1));
      else location.hash = '#' + (i + 1);
    }
  }

  function fromHash() {
    var n = parseInt((location.hash || '').replace('#', ''), 10);
    show(isNaN(n) ? 0 : n - 1, false);
  }

  function toggleOverview() {
    body.classList.toggle('overview');
    fit();
    if (body.classList.contains('overview')) {
      slides[current].scrollIntoView({ block: 'center' });
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown': case 'Enter':
        e.preventDefault(); if (body.classList.contains('overview')) toggleOverview(); show(current + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
        e.preventDefault(); if (body.classList.contains('overview')) toggleOverview(); show(current - 1); break;
      case 'Home': e.preventDefault(); show(0); break;
      case 'End': e.preventDefault(); show(slides.length - 1); break;
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        break;
      case 'n': case 'N': notes.hidden = !notes.hidden; break;
      case 'o': case 'O': toggleOverview(); break;
      case '?': case 'h': case 'H': help.hidden = !help.hidden; break;
      case 'Escape':
        if (!help.hidden) help.hidden = true;
        else if (body.classList.contains('overview')) toggleOverview();
        break;
    }
  });

  slides.forEach(function (s, k) {
    s.addEventListener('click', function (e) {
      if (body.classList.contains('overview')) { show(k); toggleOverview(); return; }
      if (e.target.closest && e.target.closest('a')) return;
      var x = e.clientX / window.innerWidth;
      show(x < 0.25 ? current - 1 : current + 1);
    });
  });

  var touchX = null;
  document.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) < 40) return;
    show(dx < 0 ? current + 1 : current - 1);
  }, { passive: true });

  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', fromHash);
  fit();
  fromHash();
})();
