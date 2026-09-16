// ================================================================
// YeahEdu-TDA v11 "PhoenixEdu" - Module: 08-init.js
// Auto-split from monolithic v10, ASCII-only, Live-Server safe
// ================================================================

// BLOCK 6F \u2014 KEYBOARD SHORTCUTS (T17)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2550\u2550\u2550 NEW v2: Global keyboard shortcuts
function _initKeyboardShortcuts() {
  document.addEventListener('keydown', function (e) {
    // B\u1ecf qua n\u1ebfu \u0111ang focus trong input/textarea/select
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    // Alt + s\u1ed1: chuy\u1ec3n tab
    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
      const tabMap = {
        '1': 'tabHome',
        '2': 'tabQuiz',
        '3': 'tabFlash',
        '4': 'tabTopics',
        '5': 'tabStats',
        '6': 'tabReader',
      };
    if (tabMap[e.key]) {
        e.preventDefault();
        const tabBtn = document.querySelector(`.nav-tab[data-tab="${tabMap[e.key]}"]`);
        if (tabBtn) switchTab(tabBtn, tabMap[e.key]);
      }
    }

    // Alt + S: m\u1edf Settings
    if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      openSettings();
    }

    // Ctrl + Enter: b\u1eaft \u0111\u1ea7u Quiz/Flashcard/Reader t\u00f9y tab \u0111ang active
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      const activePanel = document.querySelector('.panel.active');
      if (!activePanel) return;
      if (activePanel.id === 'tabQuiz' && !document.getElementById('quizConfig').classList.contains('hidden')) {
        document.getElementById('btnStartQuiz')?.click();
      } else if (activePanel.id === 'tabFlash' && !document.getElementById('flashConfig')?.classList.contains('hidden')) {
        document.getElementById('btnStartFlash')?.click();
      } else if (activePanel.id === 'tabReader') {
        document.getElementById('btnReaderRun')?.click();
      }
    }

    // Space: l\u1eadt flashcard (khi \u0111ang ch\u01a1i flashcard)
    if (e.key === ' ' && ST.flash && !document.getElementById('flashPlay')?.classList.contains('hidden')) {
      e.preventDefault();
      flipCard();
    }

    // Arrow left/right: \u0111i\u1ec1u h\u01b0\u1edbng flashcard
    if (e.key === 'ArrowLeft' && ST.flash && !document.getElementById('flashPlay')?.classList.contains('hidden')) {
      e.preventDefault();
      fcNav(-1);
    }
    if (e.key === 'ArrowRight' && ST.flash && !document.getElementById('flashPlay')?.classList.contains('hidden')) {
      e.preventDefault();
      fcNav(1);
    }

    // 1-4: ch\u1ecdn \u0111\u00e1p \u00e1n quiz (khi \u0111ang ch\u01a1i quiz)
    if (['1', '2', '3', '4'].includes(e.key) && ST.quiz && !document.getElementById('quizPlay')?.classList.contains('hidden')) {
      const opts = document.querySelectorAll('.q-opt:not(.disabled)');
      const idx = parseInt(e.key) - 1;
      if (opts[idx]) opts[idx].click();
    }

    // Enter: next question trong quiz
    if (e.key === 'Enter' && !e.ctrlKey && ST.quiz && !document.getElementById('quizPlay')?.classList.contains('hidden')) {
      const btnNext = document.getElementById('btnNext');
      if (btnNext && !btnNext.classList.contains('hidden')) {
        e.preventDefault();
        btnNext.click();
      }
    }

    // Escape: \u0111\u00f3ng modal
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => {
        closeModal(m.id);
      });
    }
  });
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// BLOCK 6G \u2014 FIX v2: INIT \u2014 Kh\u1edfi t\u1ea1o to\u00e0n b\u1ed9 app
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2550\u2550\u2550 FIX v2: init m\u1edf r\u1ed9ng \u2014 th\u00eam Reader tab, keyboard shortcuts, auto-detect API key
function init() {
  // BC1: Load d\u1eef li\u1ec7u t\u1eeb localStorage
  loadAll();

  // BC2: Render c\u00e1c ph\u1ea7n UI t\u0129nh
  renderTopics();
  renderHome();
  renderStats();

  // \u2550\u2550\u2550 NEW v2: Render Reader tab (n\u1ebfu c\u00f3 trong HTML)
  if (document.getElementById('tabReader')) {
    renderReaderTab();
  }
  if (document.getElementById('tabLibrary')) {
    refreshLibrary();
  }

  // BC3: Settings UI
  document.getElementById('setProvider').value = ST.provider;
  renderModelSelect(ST.provider);
  if (ST.model) document.getElementById('setModel').value = ST.model;

  // BC4: Sound icon
  document.getElementById('soundToggle').textContent = ST.soundEnabled ? '\ud83d\udd0a' : '\ud83d\udd07';

  // BC5: Drop zone cho Quiz file upload
  const dz = document.getElementById('dropZone');
  if (dz) {
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag'); handleFiles({ target: { files: e.dataTransfer.files } }); });
  }

  // BC6: Source type sync
  const srcTab = document.querySelector(`.source-tab[data-src="${ST.sourceType}"]`);
  if (srcTab) switchSource(srcTab, ST.sourceType);

  // \u2550\u2550\u2550 NEW v2: BC7 \u2014 Keyboard shortcuts
  _initKeyboardShortcuts();

  // \u2550\u2550\u2550 NEW v2: BC8 \u2014 Auto-select Reader source tab n\u1ebfu c\u00f3 saved state
  if (ST.reader.inputSource && document.getElementById('tabReader')) {
    const rsrcTab = document.querySelector(`#readerSourceTabs .source-tab[data-rsrc="${ST.reader.inputSource}"]`);
    if (rsrcTab) switchReaderSource(rsrcTab, ST.reader.inputSource);
  }

  // \u2550\u2550\u2550 NEW v2: BC9 \u2014 Temperature slider sync
  const tempSlider = document.getElementById('setTemp');
  const tempVal = document.getElementById('tempVal');
  if (tempSlider && tempVal) {
    tempSlider.addEventListener('input', function () {
      tempVal.textContent = this.value;
    });
  }

  // \u2550\u2550\u2550 NEW v2: BC10 \u2014 Hi\u1ec3n th\u1ecb shortcut hints
  _showShortcutHints();

  // \u2550\u2550\u2550 NEW v2: BC11 \u2014 Auto-detect n\u1ebfu ch\u01b0a c\u00f3 API key \u2192 hi\u1ec7n welcome toast
  if (!ST.apiKeys.length || !ST.apiKeys.some(k => k.key.trim())) {
    setTimeout(function () {
      toast('\ud83d\udc4b Ch\u00e0o m\u1eebng \u0111\u1ebfn YeahEdu-TDA!', 'Nh\u1ea5n \u2699\ufe0f C\u00e0i \u0111\u1eb7t \u0111\u1ec3 th\u00eam API key b\u1eaft \u0111\u1ea7u h\u1ecdc.', 'info', 6000);
    }, 1500);
  } else {
    // \u2550\u2550\u2550 NEW v2: BC12 \u2014 Ki\u1ec3m tra nhanh key status khi kh\u1edfi \u0111\u1ed9ng (kh\u00f4ng block UI)
    _quickKeyHealthCheck();
  }

  console.log('\u2705 YeahEdu-TDA v2.0 initialized \u2014 ' + ST.apiKeys.length + ' keys, provider: ' + ST.provider);
}

// \u2550\u2550\u2550 NEW v2: Hi\u1ec3n th\u1ecb shortcut hints nh\u1ecf d\u01b0\u1edbi header
function _showShortcutHints() {
  // Ch\u1ec9 hi\u1ec3n th\u1ecb tr\u00ean desktop
  if (window.innerWidth < 768) return;

  const hint = document.createElement('div');
  hint.style.cssText = 'text-align:center;padding:4px;font-size:.72rem;color:var(--text2);opacity:.6;background:var(--bg2);border-bottom:1px solid var(--border)';
  hint.textContent = '\u2328\ufe0f Alt+1-6: chuy\u1ec3n tab \u00b7 Alt+S: c\u00e0i \u0111\u1eb7t \u00b7 Ctrl+Enter: b\u1eaft \u0111\u1ea7u \u00b7 Space: l\u1eadt flashcard \u00b7 1-4: ch\u1ecdn \u0111\u00e1p \u00e1n';
  hint.id = 'shortcutHintBar';

  // Ch\u00e8n sau nav-tabs
  const nav = document.querySelector('.nav-tabs');
  if (nav && nav.parentNode && !document.getElementById('shortcutHintBar')) {
    nav.parentNode.insertBefore(hint, nav.nextSibling);
  }
}

// \u2550\u2550\u2550 NEW v2: Quick health check API keys (background, kh\u00f4ng block)
async function _quickKeyHealthCheck() {
  const activeKeys = ST.apiKeys.filter(k => k.key.trim() && k.status !== 'dead');
  if (!activeKeys.length) return;

  // Ch\u1ec9 check key \u0111\u1ea7u ti\u00ean c\u1ee7a provider \u0111ang d\u00f9ng
  const primaryKey = activeKeys.find(k => k.provider === ST.provider) || activeKeys[0];
  if (!primaryKey) return;

  try {
    const prov = PROVIDERS[primaryKey.provider];
    if (!prov) return;

    if (primaryKey.provider === 'gemini') {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${primaryKey.key}`, {
        signal: AbortSignal.timeout(8000)
      });
      if (r.ok) {
        primaryKey.status = 'ok';
        _clearCool(primaryKey.key);
      } else if (r.status === 401 || r.status === 403) {
        primaryKey.status = 'dead';
        toast('\u26a0\ufe0f API key l\u1ed7i', `Key ${primaryKey.label || primaryKey.provider} kh\u00f4ng ho\u1ea1t \u0111\u1ed9ng`, 'warn', 4000);
      }
    } else {
      // V\u1edbi provider kh\u00e1c: check nhanh b\u1eb1ng endpoint nh\u1eb9 nh\u1ea5t
      const cheapModel = prov.models[prov.models.length - 1]?.id || prov.models[0]?.id;
      const ep = prov.endpoint(cheapModel, primaryKey.key);
      const headers = { 'Content-Type': 'application/json' };
      if (prov.authHeader) Object.assign(headers, prov.authHeader(primaryKey.key));

      const testBody = prov.buildBody([{ role: 'user', content: 'hi' }], '0.1', cheapModel);
      testBody.max_tokens = 1; // T\u1ed1i thi\u1ec3u

      const r = await fetch(ep, {
        method: 'POST',
        headers,
        body: JSON.stringify(testBody),
        signal: AbortSignal.timeout(10000)
      });

      if (r.ok || r.status === 429) {
        primaryKey.status = r.ok ? 'ok' : 'ratelimit';
        _clearCool(primaryKey.key);
      } else if (r.status === 401 || r.status === 403) {
        primaryKey.status = 'dead';
        toast('\u26a0\ufe0f API key l\u1ed7i', `Key ${primaryKey.label || primaryKey.provider} h\u1ebft h\u1ea1n/sai`, 'warn', 4000);
      }
    }
    saveAll();
  } catch (e) {
    // Kh\u00f4ng hi\u1ec3n th\u1ecb l\u1ed7i \u2014 \u0111\u00e2y l\u00e0 background check
    console.log('Quick key health check:', e.message);
  }
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// RUN \u2014 G\u1ecdi init khi DOM s\u1eb5n s\u00e0ng
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
document.addEventListener('DOMContentLoaded', init);
