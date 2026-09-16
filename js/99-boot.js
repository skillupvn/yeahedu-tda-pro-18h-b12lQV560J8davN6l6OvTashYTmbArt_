// ================================================================
// YeahEdu-TDA v12 "PhoenixEdu Pro" - Module 99: Boot & Wire-up
// Gom 12 tab -> 7 tab voi dropdown menu
// ================================================================
(function(){
  'use strict';

  // ============================================================
  // BUOC 1: Reorganize tab structure (dropdown grouping)
  // ============================================================
  //
  // OLD (v11): 12 flat tabs
  //   Home | Quiz | Flash | Reader | Library | Topics | Stats
  //   | SM-2 | SG | FAQ | TL | MM3D
  //
  // NEW (v12): 7 tabs with 2 dropdowns
  //   Home | LUYEN TAP v (Quiz, Flash, Topics)
  //        | AI STUDIO v (Reader, SG, FAQ, TL, MM3D, SM-2)
  //        | Library | Progress | Profile | Guide
  //
  var NAV_STRUCTURE = [
    { id:'home', panel:'tabHome', label:'Trang ch\u1ee7', icon:'\u{1F3E0}' },
    {
      id:'practice', label:'Luy\u1ec7n t\u1eadp', icon:'\u{1F9EA}', type:'dropdown',
      items:[
        { id:'quiz',   panel:'tabQuiz',   label:'Tr\u1eafc nghi\u1ec7m', icon:'\u{1F4DD}', desc:'T\u1ea1o quiz t\u1eeb b\u1ea5t k\u1ef3 v\u0103n b\u1ea3n' },
        { id:'flash',  panel:'tabFlash',  label:'Flashcard 3D',        icon:'\u{1F3B4}', desc:'H\u1ecdc th\u1ebb ghi nh\u1edb' },
        { id:'topics', panel:'tabTopics', label:'Ch\u1ee7 \u0111\u1ec1', icon:'\u{1F4DA}', desc:'Ch\u1ee7 \u0111\u1ec1 c\u1ee7a t\u00f4i (\u0111\u1ed9ng)' }
      ]
    },
    {
      id:'ai', label:'AI Studio', icon:'\u{1F9E0}', type:'dropdown',
      items:[
        { id:'reader', panel:'tabReader', label:'AI Reader',   icon:'\u{1F4D6}', desc:'\u0110\u1ecdc & t\u1ea1o t\u00e0i li\u1ec7u' },
        { id:'sg',     panel:'tabSg',     label:'\u0110\u1ec1 c\u01b0\u01a1ng', icon:'\u{270D}\u{FE0F}', desc:'Study Guide t\u1ef1 sinh', badge:'V12' },
        { id:'faq',    panel:'tabFaq',    label:'FAQ',         icon:'\u2753',     desc:'Sinh c\u00e2u h\u1ecfi + \u0111\u00e1p',  badge:'V12' },
        { id:'tl',     panel:'tabTl',     label:'Timeline',    icon:'\u{1F4C5}', desc:'M\u1ed1c th\u1eddi gian t\u1ef1 \u0111\u1ed9ng', badge:'V12' },
        { id:'mm3d',   panel:'tabMm3d',   label:'Mind Map 3D', icon:'\u{1F5FA}\u{FE0F}', desc:'C\u00e2y tri th\u1ee9c 3D', badge:'V12' },
        { id:'sm2',    panel:'tabSm2',    label:'\u00d4n t\u1eadp SM-2', icon:'\u{1F9E0}', desc:'Spaced Repetition (Anki)', badge:'V12' }
      ]
    },
    { id:'library',  panel:'tabLibrary',  label:'Th\u01b0 vi\u1ec7n', icon:'\u{1F4DA}' },
    { id:'progress', panel:'tabProgress', label:'Ti\u1ebfn \u0111\u1ed9', icon:'\u{1F525}', badge:'V12' },
    { id:'profile',  panel:'tabProfile',  label:'H\u1ed3 s\u01a1',     icon:'\u{1F464}', badge:'V12' },
    { id:'guide',    panel:'tabGuide',    label:'H\u01b0\u1edbng d\u1eabn',   icon:'\u2753',     badge:'V12' }
  ];

  function _rebuildNav(){
    var nav = document.querySelector('.nav-tabs');
    if(!nav) return;
    // Clear old tabs
    nav.innerHTML = '';
    NAV_STRUCTURE.forEach(function(entry){
      if(entry.type === 'dropdown'){
        var wrap = document.createElement('div');
        wrap.className = 'nav-dropdown';
        wrap.dataset.groupId = entry.id;
        // Main button
        var btn = document.createElement('button');
        btn.className = 'nav-tab';
        btn.innerHTML = entry.icon + ' ' + entry.label;
        btn.onclick = function(e){
          e.stopPropagation();
          var wasOpen = wrap.classList.contains('open');
          _closeAllDropdowns(wrap);
          if(wasOpen){ wrap.classList.remove('open'); }
          else { wrap.classList.add('open'); }
        };
        wrap.appendChild(btn);
        // Dropdown menu
        var menu = document.createElement('div');
        menu.className = 'nav-dropdown-menu';
        entry.items.forEach(function(item){
          var mi = document.createElement('div');
          mi.className = 'nav-dropdown-item';
          mi.dataset.panel = item.panel;
          mi.innerHTML = '<span class="item-icon">'+item.icon+'</span>'
            + '<div style="flex:1"><div>'+item.label+'</div>'
            + (item.desc ? '<div class="item-desc">'+item.desc+'</div>' : '')
            + '</div>'
            + (item.badge ? '<span class="item-badge">'+item.badge+'</span>' : '');
          mi.onclick = function(e){
            e.stopPropagation();
            _closeAllDropdowns();
            // Update btn label to selected + active
            btn.innerHTML = item.icon + ' ' + item.label;
            btn.classList.add('active');
            _switchTo(item.panel, btn);
          };
          menu.appendChild(mi);
        });
        wrap.appendChild(menu);
        nav.appendChild(wrap);
      } else {
        var b = document.createElement('button');
        b.className = 'nav-tab';
        b.id = 'tab-' + entry.id;
        b.innerHTML = entry.icon + ' ' + entry.label + (entry.badge ? ' <span class="v11-badge">'+entry.badge+'</span>' : '');
        b.onclick = function(){
          _switchTo(entry.panel, b);
          _closeAllDropdowns();
        };
        nav.appendChild(b);
      }
    });
    console.log('[v12 Boot] Nav restructured: 7 top-level tabs (2 with dropdowns)');
  }

  function _closeAllDropdowns(except){
    document.querySelectorAll('.nav-dropdown.open').forEach(function(d){
      if(d !== except) d.classList.remove('open');
    });
    _removeBackdrops(); // Legacy cleanup
  }
  function _removeBackdrops(){
    document.querySelectorAll('.nav-dropdown-backdrop').forEach(function(b){ b.remove(); });
  }

  // v12.4 FIX: Use document-level click to close dropdowns instead of backdrop overlay
  // (backdrop was intercepting clicks on menu items in some z-index/stacking contexts)
  document.addEventListener('click', function(e){
    // If click is inside any open dropdown, don't close
    if(e.target.closest && e.target.closest('.nav-dropdown')) return;
    _closeAllDropdowns();
  });
  // Also close on Escape key
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') _closeAllDropdowns();
  });

  // ============================================================
  // BUOC 2: Wire switchTab wrapper (support new panels)
  // ============================================================
  var _origSwitchTab = null;

  function _switchTo(panelId, btn){
    if(!_origSwitchTab){
      // Fallback: manually toggle
      document.querySelectorAll('.nav-tab').forEach(function(b){ b.classList.remove('active'); });
      document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
      if(btn) btn.classList.add('active');
      var el = document.getElementById(panelId);
      if(el) el.classList.add('active');
    } else {
      _prepareNewPanel(panelId);
      try { _origSwitchTab(btn || document.querySelector('.nav-tab'), panelId); } catch(e){ console.warn(e); }
    }
    _renderPanel(panelId);
  }

  function _prepareNewPanel(panelId){
    var newPanels = {
      'tabSm2':      { title:'\u{1F9E0} \u00d4n t\u1eadp khoa h\u1ecdc SM-2',  areaId:'sm2Area', intro:'H\u1ec7 th\u1ed1ng \u00f4n t\u1eadp d\u1ef1a tr\u00ean thu\u1eadt to\u00e1n Anki SM-2. T\u1ea1o flashcard tr\u01b0\u1edbc, r\u1ed3i b\u1ea5m <b>"Th\u00eam v\u00e0o SM-2"</b>.' },
      'tabSg':       { title:'\u{270D}\u{FE0F} \u0110\u1ec1 c\u01b0\u01a1ng \u00f4n t\u1eadp', areaId:'sgArea' },
      'tabFaq':      { title:'\u2753 FAQ - C\u00e2u h\u1ecfi th\u01b0\u1eddng g\u1eb7p', areaId:'faqArea' },
      'tabTl':       { title:'\u{1F4C5} Timeline - D\u00f2ng th\u1eddi gian', areaId:'tlArea' },
      'tabMm3d':     { title:'\u{1F5FA}\u{FE0F} Mind Map 3D t\u01b0\u01a1ng t\u00e1c', areaId:'mm3dArea' },
      'tabProgress': null,  // Rendered by progressRender
      'tabProfile':  null,  // Rendered by profileRender
      'tabGuide':    null   // Rendered by guideRender
    };
    var meta = newPanels[panelId];
    if(!meta) return;
    var el = document.getElementById(panelId);
    if(el && !el.hasAttribute('data-v12-inited')){
      el.setAttribute('data-v12-inited', '1');
      var html = '<div class="sec-title">' + meta.title + '</div>';
      if(meta.intro) html += '<div class="alert alert-info" style="margin-bottom:14px">' + meta.intro + '</div>';
      html += '<div id="' + meta.areaId + '"></div>';
      el.innerHTML = html;
    }
  }

  function _renderPanel(panelId){
    setTimeout(function(){
      if(panelId === 'tabSm2' && window.sm2RenderDashboard) window.sm2RenderDashboard();
      else if(panelId === 'tabSg' && window.sgHistory) window.sgHistory();
      else if(panelId === 'tabFaq' && window.faqHistory) window.faqHistory();
      else if(panelId === 'tabTl' && window.tlHistory) window.tlHistory();
      else if(panelId === 'tabMm3d' && window.mm3dHistory) window.mm3dHistory();
      else if(panelId === 'tabTopics' && window.dynTopicsRender) window.dynTopicsRender();
      else if(panelId === 'tabProgress' && window.progressRender) window.progressRender();
      else if(panelId === 'tabProfile' && window.profileRender) window.profileRender();
      else if(panelId === 'tabGuide' && window.guideRender) window.guideRender();
    }, 60);
  }

  function _wrapSwitchTab(){
    if(typeof window.switchTab !== 'function'){
      setTimeout(_wrapSwitchTab, 300);
      return;
    }
    _origSwitchTab = window.switchTab;
    window.switchTab = function(btn, panelId){
      _prepareNewPanel(panelId);
      try { _origSwitchTab(btn, panelId); } catch(e){ console.warn(e); }
      _renderPanel(panelId);
    };
    console.log('[v12 Boot] switchTab wrapped');
  }

  // ============================================================
  // BUOC 3: Create new panel containers
  // ============================================================
  function _createPanels(){
    var main = document.querySelector('.main-content');
    if(!main) return;
    ['tabSm2','tabSg','tabFaq','tabTl','tabMm3d','tabProfile','tabProgress','tabGuide'].forEach(function(pid){
      if(document.getElementById(pid)) return;
      var p = document.createElement('div');
      p.className = 'panel';
      p.id = pid;
      p.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text2)">\u{1F504} \u0110ang chu\u1ea9n b\u1ecb...</div>';
      main.appendChild(p);
    });
  }

  // ============================================================
  // BUOC 4: Add SM-2 button to flashcard export bar
  // ============================================================
  function _addSm2Button(){
    setInterval(function(){
      var bar = document.querySelector('#flashPlay .export-bar');
      if(bar && !bar.querySelector('.sm2-import-btn')){
        var btn = document.createElement('button');
        btn.className = 'btn btn-primary btn-sm sm2-import-btn';
        btn.style.background = 'linear-gradient(135deg,#7928ca,#ff4d4d)';
        btn.setAttribute('onclick', 'sm2ImportFlash(ST.flash)');
        btn.innerHTML = '\u{1F9E0} Th\u00eam v\u00e0o SM-2';
        btn.title = '\u0110\u01b0a to\u00e0n b\u1ed9 flashcard v\u00e0o h\u1ec7 th\u1ed1ng \u00f4n t\u1eadp khoa h\u1ecdc';
        bar.appendChild(btn);
      }
    }, 1500);
  }

  // ============================================================
  // BUOC 5: Retrofit XP awards to existing features
  // ============================================================
  function _retrofitXP(){
    // Hook into existing quiz/flash/reader completions
    var origToast = window.toast;
    if(origToast){
      window.toast = function(title, msg, type, dur){
        // Detect achievement events from toast messages
        if(type === 'success' && msg){
          if(/quiz|tr\u1eafc nghi\u1ec7m/i.test(title + msg) && window.awardXP){
            setTimeout(function(){
              if(window.grantBadge) window.grantBadge('first_quiz');
              window.updateQuests('quiz_done', 1);
            }, 100);
          }
          if(/flash|th\u1ebb/i.test(title + msg) && window.awardXP){
            setTimeout(function(){
              if(window.grantBadge) window.grantBadge('first_flash');
              window.updateQuests('flash_view', 1);
            }, 100);
          }
          if(/reader/i.test(title + msg) && window.awardXP){
            setTimeout(function(){ window.updateQuests('reader_use', 1); }, 100);
          }
        }
        return origToast.apply(this, arguments);
      };
    }
  }

  // ============================================================
  // BUOC 6: Expose functions safety net
  // ============================================================
  function _exposeAll(){
    var fns = [
      // Old v11
      'sm2Init','sm2Start','sm2Flip','sm2Rate','sm2ImportFlash','sm2RenderDashboard','sm2DeleteDeck','sm2Export',
      'sgGenerate','sgRender','sgOpenDialog','sgRun','sgHistory','sgOpen','sgDelete','sgExport',
      'faqGenerate','faqRender','faqToggle','faqFilter','faqOpenDialog','faqRun','faqHistory','faqOpen','faqDelete','faqExport',
      'tlGenerate','tlRender','tlFilter','tlOpenDialog','tlRun','tlHistory','tlOpen','tlDelete','tlExport',
      'mm3dGenerate','mm3dRender','mm3dZoomIn','mm3dZoomOut','mm3dFit','mm3dRotate','mm3dExport','mm3dOpenDialog','mm3dRun','mm3dHistory','mm3dOpen','mm3dDelete',
      'setTheme','toggleTheme','getTheme',
      // v12
      'acctGetCurrentUser','acctSaveUser','acctCreateUser','acctOpenLogin','acctPickAvatar','acctDoCreate','acctCloseModal','acctSwitchUser','acctDeleteUser','acctGetAvatar','acctRenderHeader','acctOpenProfile',
      'awardXP','grantBadge','checkBadges','updateStreak','updateQuests','getDailyQuests','getXPForLevel','getLevelFromXP',
      'progressRender','progressLbFilter',
      'profileRender','profileChangeAvatar','profileRename','profileToggleSet','profileToggleFriend','profileChallenge','profileBuy','profileExport',
      'guideRender','guideToggleSection','startOnboarding','obNext','obPrev','obSkip',
      'dynTopicsRender','dynTopicsCollect','dynTopicFilter','dynTopicNew','dynTopicDelete','dynTopicOpen','dynTopicAction'
    ];
    var ok = 0, missing = [];
    fns.forEach(function(n){ if(typeof window[n]==='function') ok++; else missing.push(n); });
    console.log('[v12 Boot] Functions: ' + ok + ' / ' + fns.length);
    if(missing.length && missing.length<20) console.warn('[v12 Boot] Missing:', missing);
  }

  // ============================================================
  // BOOT
  // ============================================================
  function _boot(){
    _createPanels();
    _rebuildNav();
    _wrapSwitchTab();
    _addSm2Button();
    _retrofitXP();
    if(typeof window.sm2Init === 'function') window.sm2Init();
    // Set default active tab
    setTimeout(function(){
      var homeBtn = document.getElementById('tab-home');
      if(homeBtn) homeBtn.classList.add('active');
    }, 300);
    setTimeout(_exposeAll, 800);
    console.log('%c[YeahEdu v12 PhoenixEdu Pro] Da boot xong!', 'color:#00c896;font-weight:bold;font-size:14px');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _boot);
  else setTimeout(_boot, 100);

})();
