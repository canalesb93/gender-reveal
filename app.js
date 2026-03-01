/**
 * Gender Reveal Scratch-Off Game
 *
 * A mobile-friendly scratch card game that progressively reveals the
 * baby's gender. Uses HTML5 Canvas for the scratch-off mechanic and
 * js-confetti for celebration effects.
 */
(function () {
  'use strict';

  // ── Resolve configuration ──────────────────────────────────────

  var C = (typeof REVEAL_CONFIG !== 'undefined') ? REVEAL_CONFIG : {};

  var gender  = C.gender || 'girl';
  var isGirl  = gender === 'girl';
  var gridSize = 9;
  var winCount = 5;
  var loseCount = 4;

  // Emojis
  var winEmoji  = isGirl ? '\u{1F467}' : '\u{1F466}';  // 👧 or 👦
  var loseEmoji = isGirl ? '\u{1F466}' : '\u{1F467}';

  // Color palettes derived from gender
  var PINK = {
    cellBg: ['#FFDAE0', '#FFB6C1'], fill: ['#FFB6C1', '#E891A0'],
    ring: '#E891A0', confetti: ['#FFB6C1', '#FF69B4', '#FF1493', '#FFC0CB', '#FF6B9D'],
  };
  var BLUE = {
    cellBg: ['#B8E0F7', '#87CEEB'], fill: ['#87CEEB', '#5BA3D9'],
    ring: '#5BA3D9', confetti: ['#87CEEB', '#5BA3D9', '#4FC3F7', '#81D4FA', '#29B6F6'],
  };
  var winPalette  = isGirl ? PINK : BLUE;
  var losePalette = isGirl ? BLUE : PINK;

  var confettiColors = winPalette.confetti;
  var celebrationBg  = isGirl ? 'rgba(255, 182, 193, 0.88)' : 'rgba(135, 206, 235, 0.88)';

  var rainEmojis = isGirl
    ? ['\u{1F467}', '\u{1F476}', '\u{1F380}', '\u{1F495}', '\u{1F338}', '\u{1F496}', '\u{2728}', '\u{1F31F}', '\u{1F37C}', '\u{1F49E}', '\u{1F389}', '\u{1F339}', '\u{2764}\u{FE0F}', '\u{1F490}']
    : ['\u{1F466}', '\u{1F476}', '\u{2B50}', '\u{1F680}', '\u{1F3C6}', '\u{26BD}', '\u{2728}', '\u{1F31F}', '\u{1F37C}', '\u{1F389}', '\u{1F499}', '\u{1F30D}', '\u{2764}\u{FE0F}', '\u{1F451}'];

  var riggedSequence = C.riggedSequence || [];
  var celebrationText = "It's a " + (isGirl ? 'Girl' : 'Boy') + '!';
  var title     = C.title || 'Baby Gender Reveal';
  var subtitle  = C.subtitle || 'Scratch to find out!';
  var shareText = subtitle + ' \u{1F476}';

  // ── Rigged mode ──────────────────────────────────────────────────

  var isRigged = new URLSearchParams(window.location.search).has('rigged');
  var riggedIndex = 0;

  // ── Apply config to DOM ──────────────────────────────────────────

  function applyConfigToDOM() {
    document.querySelector('.header h1').textContent = title;
    document.querySelector('.header .subtitle').textContent = subtitle;
    document.title = title;

    // Progress bar
    document.querySelector('.progress-emoji-left').textContent = loseEmoji;
    document.querySelector('.progress-emoji-right').textContent = winEmoji;
    document.getElementById('fillBoy').style.background =
      'linear-gradient(90deg, ' + losePalette.fill[0] + ', ' + losePalette.fill[1] + ')';
    document.getElementById('fillGirl').style.background =
      'linear-gradient(270deg, ' + winPalette.fill[0] + ', ' + winPalette.fill[1] + ')';

    // Celebration screen
    var celeb = document.getElementById('celebration');
    celeb.querySelector('h2').textContent = celebrationText;
    celeb.style.background = celebrationBg;

    var dueDateEl = celeb.querySelector('.due-date');
    dueDateEl.textContent = C.dueDate || '';
    dueDateEl.style.display = C.dueDate ? '' : 'none';

    var parentsEl = celeb.querySelector('.parents');
    parentsEl.textContent = C.parentNames || '';
    parentsEl.style.display = C.parentNames ? '' : 'none';

    var scanEl = celeb.querySelector('.scan-photo');
    if (C.celebrationImage) {
      scanEl.src = C.celebrationImage;
      scanEl.style.display = '';
    } else {
      scanEl.style.display = 'none';
    }

    // OG meta tags
    setMeta('og:title', title);
    setMeta('og:description', shareText);
    setMeta('twitter:title', title);
    setMeta('twitter:description', shareText);
    if (C.ogImage) {
      setMeta('og:image', C.ogImage);
      setMeta('twitter:image', C.ogImage);
    }
  }

  function setMeta(prop, value) {
    var el = document.querySelector('meta[property="' + prop + '"], meta[name="' + prop + '"]');
    if (el) el.setAttribute('content', value);
  }

  // ── Game state ───────────────────────────────────────────────────

  var grid = [];
  var winRevealed = 0;
  var loseRevealed = 0;
  var activeCell = -1;
  var phase = 'playing';
  var confettiInterval = null;
  var emojiRainInterval = null;
  var winConfettiInterval = null;
  var jsConfetti = null;

  try {
    if (typeof JSConfetti !== 'undefined') {
      jsConfetti = new JSConfetti();
    }
  } catch (e) { /* CDN unavailable — falls back to DOM confetti */ }

  // ── Utilities ────────────────────────────────────────────────────

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  // ── Initialize / reset the game ──────────────────────────────────

  function initGame() {
    winRevealed = 0;
    loseRevealed = 0;
    riggedIndex = 0;
    activeCell = -1;
    phase = 'playing';

    if (confettiInterval) { clearInterval(confettiInterval); confettiInterval = null; }
    if (emojiRainInterval) { clearInterval(emojiRainInterval); emojiRainInterval = null; }
    if (winConfettiInterval) { clearInterval(winConfettiInterval); winConfettiInterval = null; }

    document.querySelectorAll('.confetti-piece, .emoji-rain, .mini-confetti').forEach(function (el) { el.remove(); });

    document.getElementById('celebration').classList.remove('active');
    document.body.style.removeProperty('--app-bg');
    document.body.style.setProperty('--app-bg-color', '#FFF5F0');
    document.documentElement.style.backgroundColor = '#FFF5F0';

    // Build gender array: winCount winning cells, loseCount losing cells
    var genders = [];
    for (var w = 0; w < winCount; w++) genders.push('win');
    for (var l = 0; l < loseCount; l++) genders.push('lose');
    shuffle(genders);

    grid = genders.map(function (g) { return { side: g, revealed: false }; });

    var gridEl = document.getElementById('grid');
    gridEl.innerHTML = '';

    grid.forEach(function (item, index) {
      var cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = 'cell-' + index;

      var content = document.createElement('div');
      var isWin = item.side === 'win';
      var pal = isWin ? winPalette : losePalette;
      content.className = 'cell-content';
      content.style.background = 'linear-gradient(135deg, ' + pal.cellBg[0] + ', ' + pal.cellBg[1] + ')';

      var emojiSpan = document.createElement('span');
      emojiSpan.className = 'emoji';
      emojiSpan.textContent = isWin ? winEmoji : loseEmoji;
      content.appendChild(emojiSpan);

      var canvas = document.createElement('canvas');
      canvas.style.touchAction = 'none';

      cell.appendChild(content);
      cell.appendChild(canvas);
      gridEl.appendChild(cell);

      requestAnimationFrame(function () { setupCanvas(canvas, index); });
    });

    updateProgress();
    document.getElementById('instructions').textContent = 'Scratch to reveal!';
  }

  // ── Canvas setup & scratch mechanic ──────────────────────────────

  function setupCanvas(canvas, index) {
    var cell = canvas.parentElement;
    var dpr = window.devicePixelRatio || 1;
    var w = cell.clientWidth;
    var h = cell.clientHeight;

    if (w === 0 || h === 0) {
      requestAnimationFrame(function () { setupCanvas(canvas, index); });
      return;
    }

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.scale(dpr, dpr);

    // Metallic scratch cover
    ctx.fillStyle = '#B0A89E';
    ctx.fillRect(0, 0, w, h);

    // Noise texture
    for (var i = 0; i < 600; i++) {
      var nx = Math.random() * w;
      var ny = Math.random() * h;
      var brightness = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = 'rgba(' + brightness + ',' + brightness + ',' + brightness + ',' + (Math.random() * 0.06) + ')';
      ctx.fillRect(nx, ny, 1.5, 1.5);
    }

    // Sparkle dots
    for (var s = 0; s < 15; s++) {
      ctx.fillStyle = 'rgba(255,255,255,' + (0.15 + Math.random() * 0.2) + ')';
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // "SCRATCH ME" label
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '600 ' + Math.round(w * 0.13) + 'px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH ME', w / 2, h / 2);

    // Scratch state (closure-scoped per cell)
    var isScratching = false;
    var lastX = null, lastY = null;
    var cachedRect = null;
    var lastCheckTime = 0;
    var lastParticleTime = 0;
    var RADIUS = 19;

    function getPos(e) {
      var touch = e.touches ? e.touches[0] : e;
      var r = cachedRect || canvas.getBoundingClientRect();
      return { x: touch.clientX - r.left, y: touch.clientY - r.top };
    }

    function scratch(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      ctx.arc(x, y, RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    function scratchLine(x0, y0, x1, y1) {
      var dx = x1 - x0, dy = y1 - y0;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var steps = Math.max(1, Math.ceil(dist / (RADIUS * 0.4)));
      for (var s = 0; s <= steps; s++) {
        var t = s / steps;
        scratch(x0 + dx * t, y0 + dy * t);
      }
    }

    function checkReveal() {
      if (grid[index].revealed) return;
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var data = imageData.data;
      var total = 0, transparent = 0;
      for (var i = 3; i < data.length; i += 16) {
        total++;
        if (data[i] < 128) transparent++;
      }
      var pct = transparent / total;
      var cellEl = document.getElementById('cell-' + index);
      var content = cellEl.querySelector('.cell-content');

      // Progressive color reveal
      var coverOpacity = Math.max(0, 0.75 * (1 - pct / 0.65));
      content.style.setProperty('--cover-opacity', coverOpacity);

      if (pct > 0.45 && pct <= 0.65) {
        cellEl.classList.add('almost-there');
      }
      if (pct > 0.65) {
        cellEl.classList.remove('almost-there');
        revealCell(index);
      }
    }

    function onStart(e) {
      if (phase !== 'playing' || grid[index].revealed) return;
      e.preventDefault();

      // Lock: one card at a time
      if (activeCell !== -1 && activeCell !== index) {
        var activeCellEl = document.getElementById('cell-' + activeCell);
        if (activeCellEl) {
          if (activeCellEl._pulseTimer) clearTimeout(activeCellEl._pulseTimer);
          activeCellEl.classList.remove('pulse-hint');
          void activeCellEl.offsetWidth;
          activeCellEl.classList.add('pulse-hint');
          activeCellEl._pulseTimer = setTimeout(function () {
            activeCellEl.classList.remove('pulse-hint');
            activeCellEl._pulseTimer = null;
          }, 400);
        }
        return;
      }
      activeCell = index;
      cachedRect = canvas.getBoundingClientRect();
      isScratching = true;
      var pos = getPos(e);
      lastX = pos.x; lastY = pos.y;
      scratch(pos.x, pos.y);
      checkReveal();
    }

    function onMove(e) {
      if (!isScratching || phase !== 'playing' || grid[index].revealed) return;
      e.preventDefault();
      var pos = getPos(e);
      scratchLine(lastX, lastY, pos.x, pos.y);
      lastX = pos.x; lastY = pos.y;

      var now = Date.now();
      if (now - lastParticleTime > 50) {
        lastParticleTime = now;
        spawnParticle(e, canvas);
      }
      if (now - lastCheckTime > 100) {
        lastCheckTime = now;
        checkReveal();
      }
    }

    function onEnd(e) {
      if (!isScratching) return;
      e.preventDefault();
      isScratching = false;
      cachedRect = null;
      checkReveal();
      lastX = null; lastY = null;
    }

    // On cancel (iOS interruptions like phone calls, notifications),
    // release the lock so the user isn't stuck on a card they can't reach.
    function onCancel(e) {
      if (!isScratching) return;
      isScratching = false;
      cachedRect = null;
      activeCell = -1;
      lastX = null; lastY = null;
    }

    // Touch on touch devices, mouse on desktop — never both
    if ('ontouchstart' in window) {
      canvas.addEventListener('touchstart', onStart, { passive: false });
      canvas.addEventListener('touchmove', onMove, { passive: false });
      canvas.addEventListener('touchend', onEnd, { passive: false });
      canvas.addEventListener('touchcancel', onCancel, { passive: false });
    } else {
      canvas.addEventListener('mousedown', onStart);
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('mouseup', onEnd);
      canvas.addEventListener('mouseleave', onEnd);
    }
  }

  // ── Reveal a cell ────────────────────────────────────────────────

  function revealCell(index) {
    if (grid[index].revealed) return;
    grid[index].revealed = true;
    activeCell = -1;

    // Rigged mode: override the side at reveal time for dramatic arc
    if (isRigged && riggedSequence.length > 0) {
      var riggedGender = riggedSequence[riggedIndex++] || gender;
      grid[index].side = (riggedGender === gender) ? 'win' : 'lose';
    }

    var cell = document.getElementById('cell-' + index);
    var content = cell.querySelector('.cell-content');
    var isWin = grid[index].side === 'win';

    // Update visuals for (possibly rigged) assignment
    var pal = isWin ? winPalette : losePalette;
    content.style.background = 'linear-gradient(135deg, ' + pal.cellBg[0] + ', ' + pal.cellBg[1] + ')';
    content.querySelector('.emoji').textContent = isWin ? winEmoji : loseEmoji;

    cell.classList.add('revealed');
    cell.classList.remove('pulse-hint');
    cell.style.color = pal.ring;

    if (navigator.vibrate) navigator.vibrate(50);

    if (isWin) { winRevealed++; } else { loseRevealed++; }

    updateProgress();

    if (winRevealed >= winCount && phase === 'playing') {
      phase = 'won';
      document.getElementById('instructions').textContent = '';
      progressBarWin();
      setTimeout(showCelebration, 600);
    }
  }

  // ── Progress bar ─────────────────────────────────────────────────

  function updateProgress() {
    var losePct = (loseRevealed / gridSize) * 100;
    var winPct  = (winRevealed / gridSize) * 100;

    document.getElementById('fillBoy').style.width = losePct + '%';
    document.getElementById('fillGirl').style.width = winPct + '%';

    updateScaredEmojis();

    // Subtle background shift toward leading side
    var diff = winRevealed - loseRevealed;
    var revealed = winRevealed + loseRevealed;
    if (revealed === 0) {
      document.body.style.removeProperty('--app-bg');
      document.body.style.setProperty('--app-bg-color', '#FFF5F0');
      document.documentElement.style.backgroundColor = '#FFF5F0';
    } else {
      var t = Math.min(Math.abs(diff) / 5, 1) * 0.15;
      if (diff > 0) {
        // Winning side leading
        document.body.style.setProperty('--app-bg', 'linear-gradient(135deg, rgba(255,218,224,' + t + '), rgba(255,182,193,' + (t * 0.7) + '), rgba(253,232,224,' + (1 - t * 0.3) + '), rgba(255,240,245,' + (1 - t * 0.2) + '))');
        document.body.style.setProperty('--app-bg-color', '#FFF0F5');
        document.documentElement.style.backgroundColor = '#FFF0F5';
      } else if (diff < 0) {
        // Losing side leading
        document.body.style.setProperty('--app-bg', 'linear-gradient(135deg, rgba(184,224,247,' + t + '), rgba(135,206,235,' + (t * 0.7) + '), rgba(232,240,254,' + (1 - t * 0.3) + '), rgba(240,244,255,' + (1 - t * 0.2) + '))');
        document.body.style.setProperty('--app-bg-color', '#F0F4FF');
        document.documentElement.style.backgroundColor = '#F0F4FF';
      }
    }
  }

  function progressBarWin() {
    document.getElementById('fillGirl').style.width = '100%';
    document.getElementById('fillBoy').style.width = '0%';
    document.querySelector('.progress-emoji-left').classList.remove('scared', 'winning');
    document.querySelector('.progress-emoji-right').classList.remove('scared', 'winning');
    if (winConfettiInterval) { clearInterval(winConfettiInterval); winConfettiInterval = null; }

    // Full winning-side background
    if (gender === 'girl') {
      document.body.style.setProperty('--app-bg', 'linear-gradient(135deg, #FFF0F3 0%, #FFE0E6 30%, #FFDAE0 60%, #FFF0F5 100%)');
      document.body.style.setProperty('--app-bg-color', '#FFF0F3');
      document.documentElement.style.backgroundColor = '#FFF0F3';
    } else {
      document.body.style.setProperty('--app-bg', 'linear-gradient(135deg, #F0F4FF 0%, #E0ECFF 30%, #D0E4FF 60%, #F0F8FF 100%)');
      document.body.style.setProperty('--app-bg-color', '#F0F4FF');
      document.documentElement.style.backgroundColor = '#F0F4FF';
    }
  }

  // ── Celebration screen ───────────────────────────────────────────

  function showCelebration() {
    document.getElementById('celebration').classList.add('active');
    fireConfetti();
    setTimeout(fireConfetti, 800);
    setTimeout(fireConfetti, 1600);
    confettiInterval = setInterval(fireConfetti, 3000);
    spawnEmojiRainBatch();
    emojiRainInterval = setInterval(spawnEmojiRainBatch, 2000);
  }

  function fireConfetti() {
    if (jsConfetti) {
      jsConfetti.addConfetti({
        confettiColors: confettiColors,
        confettiRadius: 6,
        confettiNumber: 50,
      });
    }
  }

  function spawnEmojiRainBatch() {
    for (var i = 0; i < 8; i++) {
      var el = document.createElement('div');
      el.className = 'emoji-rain';
      el.textContent = rainEmojis[Math.floor(Math.random() * rainEmojis.length)];
      el.style.left = (Math.random() * 96 + 2) + '%';
      var size = 16 + Math.floor(Math.random() * 12);
      el.style.setProperty('--rain-size', size + 'px');
      var duration = 5 + Math.random() * 4;
      el.style.setProperty('--rain-duration', duration + 's');
      el.style.setProperty('--rain-delay', (Math.random() * 1.8) + 's');
      el.style.setProperty('--rain-spin', Math.floor(Math.random() * 360 - 180) + 'deg');
      document.getElementById('celebration').appendChild(el);
      (function (elem, dur) {
        setTimeout(function () { elem.remove(); }, (dur + 2) * 1000);
      })(el, duration);
    }
  }

  // ── Particles ────────────────────────────────────────────────────

  function spawnParticle(e, canvas) {
    var touch = e.touches ? e.touches[0] : e;
    var colors = ['#C8B8A8', '#D4C8B8', '#B8AEA0', '#E0D6C8', '#DDD4C8', '#D8D0C4'];
    for (var p = 0; p < 6; p++) {
      var el = document.createElement('div');
      el.className = 'scratch-particle';
      var dx = (Math.random() - 0.5) * 120;
      var dy = (Math.random() - 0.5) * 120 - 20;
      el.style.setProperty('--dx', dx + 'px');
      el.style.setProperty('--dy', dy + 'px');
      el.style.left = touch.clientX + 'px';
      el.style.top = touch.clientY + 'px';
      var size = 5 + Math.random() * 8;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      document.body.appendChild(el);
      (function (elem) { setTimeout(function () { elem.remove(); }, 1000); })(el);
    }
  }

  // ── Progress emoji animations ────────────────────────────────────

  function updateScaredEmojis() {
    var loseEl = document.querySelector('.progress-emoji-left');
    var winEl  = document.querySelector('.progress-emoji-right');
    loseEl.classList.remove('scared', 'winning');
    winEl.classList.remove('scared', 'winning');
    if (winConfettiInterval) { clearInterval(winConfettiInterval); winConfettiInterval = null; }

    if (winRevealed > loseRevealed) {
      loseEl.classList.add('scared');
      winEl.classList.add('winning');
      spawnWinConfetti(winEl, true);
      winConfettiInterval = setInterval(function () { spawnWinConfetti(winEl, true); }, 600);
    } else if (loseRevealed > winRevealed) {
      winEl.classList.add('scared');
      loseEl.classList.add('winning');
      spawnWinConfetti(loseEl, false);
      winConfettiInterval = setInterval(function () { spawnWinConfetti(loseEl, false); }, 600);
    }
  }

  function spawnWinConfetti(emojiEl, isWinSide) {
    if (phase !== 'playing') return;
    var rect = emojiEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var colors = (isWinSide ? winPalette : losePalette).confetti;

    for (var i = 0; i < 3; i++) {
      var el = document.createElement('div');
      el.className = 'mini-confetti';
      el.style.setProperty('--mc-dx', ((Math.random() - 0.5) * 60) + 'px');
      el.style.setProperty('--mc-dy', (-20 - Math.random() * 30) + 'px');
      el.style.setProperty('--mc-size', (3 + Math.random() * 4) + 'px');
      el.style.setProperty('--mc-dur', (0.6 + Math.random() * 0.4) + 's');
      el.style.setProperty('--mc-rot', Math.floor(Math.random() * 360) + 'deg');
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      document.body.appendChild(el);
      (function (elem) { setTimeout(function () { elem.remove(); }, 1200); })(el);
    }
  }

  // ── Share button ─────────────────────────────────────────────────

  var shareUrl = window.location.origin + window.location.pathname;

  document.getElementById('shareBtn').addEventListener('click', function () {
    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
      navigator.share({ title: title, text: shareText, url: shareUrl });
    } else {
      var btn = document.getElementById('shareBtn');
      navigator.clipboard.writeText(shareUrl).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Share'; }, 2000);
      }).catch(function () {
        btn.textContent = 'Copy failed';
        setTimeout(function () { btn.textContent = 'Share'; }, 2000);
      });
    }
  });

  // ── Restart button ───────────────────────────────────────────────

  document.getElementById('restartBtn').addEventListener('click', function () {
    if (isRigged) {
      isRigged = false;
      var url = new URL(window.location);
      url.searchParams.delete('rigged');
      window.history.replaceState({}, '', url);
    }
    initGame();
  });

  // ── Visibility change — pause effects when tab is hidden ────────

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (confettiInterval) { clearInterval(confettiInterval); confettiInterval = null; }
      if (emojiRainInterval) { clearInterval(emojiRainInterval); emojiRainInterval = null; }
    } else if (phase === 'won') {
      if (!confettiInterval) confettiInterval = setInterval(fireConfetti, 3000);
      if (!emojiRainInterval) emojiRainInterval = setInterval(spawnEmojiRainBatch, 2000);
    }
  });

  // Prevent double-tap zoom and context menu on the game area
  document.addEventListener('dblclick', function (e) { e.preventDefault(); });
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // ── Boot ─────────────────────────────────────────────────────────

  applyConfigToDOM();
  initGame();
})();
