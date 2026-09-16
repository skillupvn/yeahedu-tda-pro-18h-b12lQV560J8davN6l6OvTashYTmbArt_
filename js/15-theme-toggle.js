// ================================================================
// YeahEdu-TDA v11 "PhoenixEdu" - Module 15: Theme Toggle (Light/Dark)
// Depends on: css/theme.css
// Exports (window.*): setTheme, toggleTheme, getTheme
// ================================================================

(function(){
  'use strict';

  var KEY = 'yeahedu_v11_theme';

  window.getTheme = function(){
    return document.documentElement.getAttribute('data-theme') || 'dark';
  };

  window.setTheme = function(name){
    if(name !== 'light' && name !== 'dark') name = 'dark';
    document.documentElement.setAttribute('data-theme', name);
    document.body.setAttribute('data-theme', name);
    try { localStorage.setItem(KEY, name); } catch(e){}
    // Update button icons
    var btn = document.getElementById('themeToggleBtn');
    if(btn){
      btn.innerHTML = name === 'dark' ? '&#x2600;' : '&#x1F319;';
      btn.title = 'Chuyen sang ' + (name === 'dark' ? 'sang' : 'toi');
    }
  };

  window.toggleTheme = function(){
    var cur = window.getTheme();
    window.setTheme(cur === 'dark' ? 'light' : 'dark');
    if(window.toast) toast('Da doi giao dien', 'Che do ' + (window.getTheme() === 'dark' ? 'toi' : 'sang'), 'info', 1500);
  };

  // Auto-init on load
  function _boot(){
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch(e){}
    window.setTheme(saved || 'dark');
    // Inject toggle button in header if not exists
    setTimeout(function(){
      if(document.getElementById('themeToggleBtn')) return;
      var actions = document.querySelector('.header-actions');
      if(!actions) return;
      var btn = document.createElement('button');
      btn.id = 'themeToggleBtn';
      btn.className = 'theme-toggle-btn';
      btn.setAttribute('onclick', 'toggleTheme()');
      btn.title = 'Chuyen sang / toi';
      btn.innerHTML = window.getTheme() === 'dark' ? '&#x2600;' : '&#x1F319;';
      actions.insertBefore(btn, actions.firstChild);
    }, 100);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _boot);
  else _boot();

  console.log('[v11 Module 15] Theme Toggle loaded');
})();
