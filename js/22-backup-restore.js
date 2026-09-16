// ================================================================
// YeahEdu-TDA v12.3 - Module 22: Backup & Restore
// Sao luu toan bo du lieu ung dung ra JSON, restore tu file JSON
// - Backup CA NHAN: chi profile + XP events cua user hien tai
// - Backup TOAN BO: moi thu (khuyen dung khi chuyen may)
// - Auto-backup optional moi 7 ngay (luu vao localStorage)
// ================================================================
(function(){
'use strict';

var BACKUP_VERSION = 3;   // Format version - bump when structure changes
var DB_APP = 'YeahEdu_v11';
var DB_APP_VER = 2;
var DB_LIB = 'yeahedu_library';
var DB_LIB_VER = 1;

// All stores in DB_APP (from module 10 upgrade)
var APP_STORES = ['sm2_cards','sg_docs','faq_docs','timeline_docs','mindmap_docs','xp_events','user_profiles','friends','custom_topics'];
// localStorage keys used by app (prefix + individual)
var LS_KEYS = ['yeahedu_v12_current_user','yeahedu_v12_theme','yeahedu_v12_quests','yeahedu_v12_onboarded','yeahedu_tda_state','yeahedu_v12_last_backup','yeahedu_v12_dismiss_login'];
var LS_PREFIX = 'user_'; // user_<uid> profiles

// ============================================================
// PHASE 1: COLLECT DATA
// ============================================================
function _dumpDB(name, ver, stores, cb){
  var req = indexedDB.open(name, ver);
  req.onupgradeneeded = function(e){
    // Create missing stores so backup doesn't fail on fresh install
    var db = e.target.result;
    stores.forEach(function(s){
      if(!db.objectStoreNames.contains(s)){
        db.createObjectStore(s, {keyPath:'id', autoIncrement:true});
      }
    });
  };
  req.onsuccess = function(){
    var db = req.result;
    var result = {};
    var pending = stores.length;
    if(pending === 0){ db.close(); cb(result); return; }
    stores.forEach(function(store){
      try {
        if(!db.objectStoreNames.contains(store)){
          result[store] = [];
          if(--pending === 0){ db.close(); cb(result); }
          return;
        }
        var tx = db.transaction([store],'readonly');
        var items = [];
        tx.objectStore(store).openCursor().onsuccess = function(e){
          var c = e.target.result;
          if(c){ items.push(c.value); c.continue(); }
          else {
            result[store] = items;
            if(--pending === 0){ db.close(); cb(result); }
          }
        };
      } catch(e){
        console.warn('backup dump err', store, e);
        result[store] = [];
        if(--pending === 0){ db.close(); cb(result); }
      }
    });
  };
  req.onerror = function(){
    console.warn('backup open err', name);
    cb({});
  };
}

function _dumpLocalStorage(){
  var out = {};
  try {
    // Known keys
    LS_KEYS.forEach(function(k){
      var v = localStorage.getItem(k);
      if(v !== null) out[k] = v;
    });
    // All user_<id> keys
    for(var i=0; i<localStorage.length; i++){
      var k = localStorage.key(i);
      if(k && k.indexOf(LS_PREFIX) === 0 && k !== 'yeahedu_v12_current_user'){
        out[k] = localStorage.getItem(k);
      }
    }
  } catch(e){ console.warn('LS dump err', e); }
  return out;
}

// ============================================================
// PHASE 2: BUILD BACKUP OBJECT
// ============================================================
window.buildBackup = function(mode, cb){
  // mode: 'personal' (current user only) | 'full' (all data)
  var cu = (typeof window.acctGetCurrentUser === 'function') ? window.acctGetCurrentUser() : null;
  var userIdFilter = (mode === 'personal' && cu) ? cu.id : null;
  var userNameFilter = (mode === 'personal' && cu) ? cu.name : null;

  var backup = {
    _meta: {
      appName: 'YeahEdu-TDA',
      appVersion: '12.3',
      backupVersion: BACKUP_VERSION,
      mode: mode,
      timestamp: Date.now(),
      timestampISO: new Date().toISOString(),
      userAgent: navigator.userAgent,
      forUser: cu ? { id: cu.id, name: cu.name, level: cu.level, xp: cu.xp } : null
    },
    localStorage: {},
    databases: {}
  };

  // Dump localStorage
  var lsAll = _dumpLocalStorage();
  if(mode === 'personal' && cu){
    // Personal: keep only current user profile + shared settings
    backup.localStorage[LS_PREFIX + cu.id] = lsAll[LS_PREFIX + cu.id];
    backup.localStorage['yeahedu_v12_current_user'] = cu.id;
    backup.localStorage['yeahedu_v12_theme'] = lsAll['yeahedu_v12_theme'];
    backup.localStorage['yeahedu_tda_state'] = lsAll['yeahedu_tda_state']; // API keys + settings
    backup.localStorage['yeahedu_v12_quests'] = lsAll['yeahedu_v12_quests'];
  } else {
    backup.localStorage = lsAll;
  }

  // Dump DBs (both)
  var pending = 2;
  function dbDone(){
    if(--pending === 0){
      // Apply personal filter to XP events (they have userId)
      if(userIdFilter && backup.databases.YeahEdu_v11){
        var xp = backup.databases.YeahEdu_v11.xp_events || [];
        backup.databases.YeahEdu_v11.xp_events = xp.filter(function(e){ return e.userId === userIdFilter; });
        // Filter user_profiles to current user only
        var profs = backup.databases.YeahEdu_v11.user_profiles || [];
        backup.databases.YeahEdu_v11.user_profiles = profs.filter(function(p){ return p.id === userIdFilter; });
      }
      // Add stats
      backup._meta.stats = _computeStats(backup);
      cb(backup);
    }
  }
  _dumpDB(DB_APP, DB_APP_VER, APP_STORES, function(data){
    backup.databases[DB_APP] = data;
    dbDone();
  });
  _dumpDB(DB_LIB, DB_LIB_VER, ['docs'], function(data){
    backup.databases[DB_LIB] = data;
    dbDone();
  });
};

function _computeStats(backup){
  var s = { totalRecords: 0, byStore: {} };
  Object.keys(backup.databases).forEach(function(dbName){
    var db = backup.databases[dbName];
    Object.keys(db).forEach(function(store){
      var count = (db[store] || []).length;
      s.byStore[store] = count;
      s.totalRecords += count;
    });
  });
  s.lsKeys = Object.keys(backup.localStorage).length;
  return s;
}

// ============================================================
// PHASE 3: DOWNLOAD BACKUP FILE
// ============================================================
window.downloadBackup = function(mode){
  mode = mode || 'full';
  if(window.toast) toast('\u{1F4E6} Sao l\u01b0u', '\u0110ang chu\u1ea9n b\u1ecb d\u1eef li\u1ec7u...', 'info', 2000);
  window.buildBackup(mode, function(backup){
    var json = JSON.stringify(backup, null, 2);
    var blob = new Blob([json], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var date = new Date().toISOString().slice(0,10);
    var uname = backup._meta.forUser ? backup._meta.forUser.name.replace(/\s+/g,'-') : 'all';
    a.href = url;
    a.download = 'yeahedu-backup-' + mode + '-' + uname + '-' + date + '.json';
    a.click();
    URL.revokeObjectURL(url);
    // Remember last backup time
    try { localStorage.setItem('yeahedu_v12_last_backup', Date.now()); } catch(e){}
    var size = (json.length / 1024).toFixed(1);
    if(window.toast) toast('\u2705 \u0110\u00e3 sao l\u01b0u', 'File ' + size + ' KB, ' + backup._meta.stats.totalRecords + ' b\u1ea3n ghi', 'success', 4000);
    if(window.awardXP) window.awardXP('backup', 10, 'Sao l\u01b0u d\u1eef li\u1ec7u');
  });
};

// ============================================================
// PHASE 4: RESTORE FROM FILE
// ============================================================
window.uploadRestore = function(){
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.onchange = function(){
    var file = input.files && input.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(){
      try {
        var backup = JSON.parse(reader.result);
        _showRestorePreview(backup, file.name);
      } catch(e){
        if(window.toast) toast('\u274C L\u1ed7i', 'File kh\u00f4ng h\u1ee3p l\u1ec7: ' + e.message, 'error');
      }
    };
    reader.onerror = function(){
      if(window.toast) toast('\u274C L\u1ed7i', '\u0110\u1ecdc file th\u1ea5t b\u1ea1i', 'error');
    };
    reader.readAsText(file);
  };
  input.click();
};

function _showRestorePreview(backup, filename){
  if(!backup || !backup._meta){
    if(window.toast) toast('\u274C L\u1ed7i', 'File kh\u00f4ng ph\u1ea3i backup YeahEdu h\u1ee3p l\u1ec7', 'error');
    return;
  }
  var meta = backup._meta;
  var stats = meta.stats || _computeStats(backup);
  var forUser = meta.forUser;

  var html = '<div class="modal-overlay" id="restoreModal" onclick="if(event.target.id===\'restoreModal\')this.remove()">'
    + '<div class="modal" style="max-width:560px">'
    + '<div class="modal-header"><div class="modal-title">\u{1F4E5} Kh\u00f4i ph\u1ee5c d\u1eef li\u1ec7u</div>'
    + '<button class="btn btn-icon btn-sm" onclick="document.getElementById(\'restoreModal\').remove()">\u2715</button>'
    + '</div>'
    + '<div class="modal-body">'
    + '<div class="alert alert-warn" style="margin-bottom:14px"><b>\u26A0\uFE0F C\u1ea3nh b\u00e1o:</b> Kh\u00f4i ph\u1ee5c s\u1ebd <b>GHI \u0110\u00c8</b> ho\u1eb7c <b>H\u1ee2P NH\u1ea4T</b> d\u1eef li\u1ec7u hi\u1ec7n t\u1ea1i. H\u00e3y ch\u1ecdn ch\u1ebf \u0111\u1ed9 ph\u00f9 h\u1ee3p.</div>'
    + '<div class="card" style="background:var(--bg3);border:1px solid var(--border);padding:14px;margin-bottom:14px">'
    + '<div style="font-weight:700;margin-bottom:8px">\u{1F4C4} ' + _esc(filename) + '</div>'
    + '<div style="color:var(--text2);font-size:.85rem;line-height:1.7">'
    + '\u2022 T\u1ea1o l\u00fac: <b>' + new Date(meta.timestamp).toLocaleString('vi') + '</b><br>'
    + '\u2022 Ch\u1ebf \u0111\u1ed9: <b>' + (meta.mode === 'personal' ? 'C\u00e1 nh\u00e2n' : 'To\u00e0n b\u1ed9') + '</b><br>'
    + '\u2022 Phi\u00ean b\u1ea3n: <b>v' + (meta.appVersion || '?') + ' (format v' + meta.backupVersion + ')</b><br>'
    + (forUser ? '\u2022 T\u00e0i kho\u1ea3n: <b>' + _esc(forUser.name) + '</b> (Lv.' + forUser.level + ', ' + forUser.xp + ' XP)<br>' : '')
    + '\u2022 T\u1ed5ng b\u1ea3n ghi: <b>' + stats.totalRecords + '</b>'
    + '</div></div>'
    // Detail breakdown
    + '<details style="margin-bottom:14px"><summary>\u{1F50D} Chi ti\u1ebft d\u1eef li\u1ec7u</summary>'
    + '<div style="padding:10px 14px;background:var(--bg3);border-radius:8px;margin-top:8px;font-size:.85rem">'
    + _renderStatsTable(stats)
    + '</div></details>'
    // Merge mode selector
    + '<div class="fgroup" style="margin-bottom:14px"><label>Ch\u1ebf \u0111\u1ed9 kh\u00f4i ph\u1ee5c</label>'
    + '<select id="restoreMode" style="background:var(--bg3);border:1.5px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--text);width:100%">'
    + '<option value="merge" selected>H\u1ee3p nh\u1ea5t (khuy\u1ebfn ngh\u1ecb) - Gi\u1eef d\u1eef li\u1ec7u hi\u1ec7n t\u1ea1i, th\u00eam d\u1eef li\u1ec7u m\u1edbi t\u1eeb backup</option>'
    + '<option value="overwrite">Ghi \u0111\u00e8 - XO\u00c1 t\u1ea5t c\u1ea3 d\u1eef li\u1ec7u hi\u1ec7n t\u1ea1i, thay b\u1eb1ng backup</option>'
    + '</select></div>'
    + '<div class="alert alert-error" id="overwriteWarn" style="display:none;margin-bottom:14px">\u26A0\uFE0F <b>NGUY HI\u1ec2M:</b> Ch\u1ebf \u0111\u1ed9 ghi \u0111\u00e8 s\u1ebd xo\u00e1 <b>t\u1ea5t c\u1ea3</b> d\u1eef li\u1ec7u \u0111ang c\u00f3 (bao g\u1ed3m user, XP, flashcard...). Kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c!</div>'
    // Actions
    + '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">'
    + '<button class="btn btn-secondary" onclick="document.getElementById(\'restoreModal\').remove()">H\u1ee7y</button>'
    + '<button class="btn btn-primary" onclick="doRestore()" style="background:linear-gradient(135deg,#00c896,#007cf0)">\u{1F504} B\u1eaft \u0111\u1ea7u kh\u00f4i ph\u1ee5c</button>'
    + '</div>'
    + '</div></div></div>';

  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  document.body.appendChild(wrap.firstChild);
  window.__pendingRestore = backup;

  // Wire up mode change warning
  var sel = document.getElementById('restoreMode');
  if(sel) sel.onchange = function(){
    document.getElementById('overwriteWarn').style.display = (sel.value === 'overwrite') ? 'block' : 'none';
  };
}

function _renderStatsTable(stats){
  var STORE_NAMES = {
    sm2_cards:'\u{1F9E0} Th\u1ebb SM-2', sg_docs:'\u{270D}\uFE0F \u0110\u1ec1 c\u01b0\u01a1ng', faq_docs:'\u2753 FAQ',
    timeline_docs:'\u{1F4C5} Timeline', mindmap_docs:'\u{1F5FA}\uFE0F Mind Map', xp_events:'\u{1F4CA} XP events',
    user_profiles:'\u{1F464} H\u1ed3 s\u01a1', friends:'\u{1F465} B\u1ea1n b\u00e8', custom_topics:'\u{1F31F} Ch\u1ee7 \u0111\u1ec1 t\u1ef1 t\u1ea1o',
    docs:'\u{1F4DA} T\u00e0i li\u1ec7u th\u01b0 vi\u1ec7n'
  };
  var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px">';
  Object.keys(stats.byStore).sort().forEach(function(s){
    var name = STORE_NAMES[s] || s;
    var count = stats.byStore[s];
    html += '<div>' + name + '</div><div style="text-align:right;color:' + (count > 0 ? 'var(--c1)' : 'var(--text2)') + '"><b>' + count + '</b></div>';
  });
  return html + '</div><div style="margin-top:8px;font-size:.78rem;color:var(--text2)">+ ' + stats.lsKeys + ' localStorage keys</div>';
}

window.doRestore = function(){
  var backup = window.__pendingRestore;
  if(!backup) return;
  var mode = document.getElementById('restoreMode').value;
  var modal = document.getElementById('restoreModal');
  if(modal) modal.remove();

  // Extra confirm for overwrite
  if(mode === 'overwrite'){
    if(!confirm('X\u00c1C NH\u1eacN CU\u1ed0I C\u00d9NG: Xo\u00e1 to\u00e0n b\u1ed9 d\u1eef li\u1ec7u hi\u1ec7n t\u1ea1i v\u00e0 thay b\u1eb1ng backup?\n\nH\u00e0nh \u0111\u1ed9ng n\u00e0y KH\u00d4NG th\u1ec3 ho\u00e0n t\u00e1c!')) return;
  }

  // Show progress
  var toast_id = 'restore-progress';
  if(window.toast) toast('\u{1F504} Kh\u00f4i ph\u1ee5c', '\u0110ang x\u1eed l\u00fd d\u1eef li\u1ec7u...', 'info', 30000);

  _doRestoreInner(backup, mode, function(err, summary){
    if(err){
      if(window.toast) toast('\u274C L\u1ed7i kh\u00f4i ph\u1ee5c', err.message || String(err), 'error', 5000);
      return;
    }
    if(window.toast) toast('\u2705 Ho\u00e0n t\u1ea5t!', '\u0110\u00e3 kh\u00f4i ph\u1ee5c ' + summary.total + ' b\u1ea3n ghi. \u0110ang t\u1ea3i l\u1ea1i trang...', 'success', 3000);
    // Reload to apply everything
    setTimeout(function(){ location.reload(); }, 1500);
  });
};

function _doRestoreInner(backup, mode, cb){
  var summary = { total: 0, restored: {} };

  // Restore localStorage FIRST
  try {
    if(mode === 'overwrite'){
      // Clear all yeahedu keys
      var toDel = [];
      for(var i=0; i<localStorage.length; i++){
        var k = localStorage.key(i);
        if(k && (k.indexOf('yeahedu_') === 0 || k.indexOf('user_') === 0)) toDel.push(k);
      }
      toDel.forEach(function(k){ localStorage.removeItem(k); });
    }
    Object.keys(backup.localStorage || {}).forEach(function(k){
      var v = backup.localStorage[k];
      if(v !== null && v !== undefined) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    });
  } catch(e){ return cb(e); }

  // Restore both DBs sequentially
  var dbs = Object.keys(backup.databases || {});
  var idx = 0;
  function nextDB(){
    if(idx >= dbs.length){ cb(null, summary); return; }
    var dbName = dbs[idx++];
    var dbData = backup.databases[dbName];
    var ver = (dbName === DB_APP) ? DB_APP_VER : DB_LIB_VER;
    var storesInBackup = Object.keys(dbData);
    _restoreDB(dbName, ver, storesInBackup, dbData, mode, function(err, restored){
      if(err){ console.warn('restore db err', dbName, err); }
      else {
        Object.keys(restored || {}).forEach(function(s){
          summary.restored[s] = (summary.restored[s] || 0) + restored[s];
          summary.total += restored[s];
        });
      }
      nextDB();
    });
  }
  nextDB();
}

function _restoreDB(name, ver, storesNeeded, data, mode, cb){
  var req = indexedDB.open(name, ver);
  req.onupgradeneeded = function(e){
    var db = e.target.result;
    storesNeeded.forEach(function(s){
      if(!db.objectStoreNames.contains(s)){
        db.createObjectStore(s, {keyPath:'id', autoIncrement:true});
      }
    });
  };
  req.onsuccess = function(){
    var db = req.result;
    // Filter storesNeeded to those that actually exist in DB
    var storesActual = storesNeeded.filter(function(s){ return db.objectStoreNames.contains(s); });
    if(storesActual.length === 0){ db.close(); cb(null, {}); return; }

    try {
      var tx = db.transaction(storesActual, 'readwrite');
      var restored = {};

      // If overwrite mode: clear each store first
      if(mode === 'overwrite'){
        storesActual.forEach(function(s){
          try { tx.objectStore(s).clear(); } catch(e){}
        });
      }

      // Add records - use put() so it overwrites by primary key (idempotent)
      storesActual.forEach(function(store){
        var items = data[store] || [];
        var st = tx.objectStore(store);
        restored[store] = 0;
        items.forEach(function(item){
          try {
            st.put(item);
            restored[store]++;
          } catch(e){
            console.warn('put err', store, e);
          }
        });
      });

      tx.oncomplete = function(){ db.close(); cb(null, restored); };
      tx.onerror = function(e){ db.close(); cb(e.target.error); };
    } catch(e){
      db.close();
      cb(e);
    }
  };
  req.onerror = function(){ cb(req.error); };
}

// ============================================================
// PHASE 5: UI - CARD FOR SETTINGS / PROFILE
// ============================================================
window.renderBackupCard = function(){
  var last = null;
  try { last = parseInt(localStorage.getItem('yeahedu_v12_last_backup') || '0'); } catch(e){}
  var lastStr = last ? new Date(last).toLocaleString('vi') : 'Ch\u01b0a c\u00f3';
  var daysSince = last ? Math.floor((Date.now() - last) / 86400000) : 999;
  var warnClass = daysSince >= 7 ? 'alert alert-warn' : 'alert alert-info';
  var warnIcon = daysSince >= 7 ? '\u26A0\uFE0F' : '\u{1F4BE}';

  return '<div class="card" style="background:linear-gradient(135deg,rgba(0,200,150,.08),rgba(0,124,240,.05));border-color:var(--c1)">'
    + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">'
    + '<div style="font-size:1.8rem">\u{1F4E6}</div>'
    + '<div><h3 style="margin:0;color:var(--c1)">Sao l\u01b0u & Kh\u00f4i ph\u1ee5c</h3>'
    + '<div style="color:var(--text2);font-size:.82rem">Chuy\u1ec3n d\u1eef li\u1ec7u sang m\u00e1y kh\u00e1c ho\u1eb7c \u0111\u1ec1 ph\u00f2ng m\u1ea5t d\u1eef li\u1ec7u</div></div>'
    + '</div>'
    + '<div class="' + warnClass + '" style="font-size:.85rem;margin-bottom:12px">'
    + warnIcon + ' L\u1ea7n sao l\u01b0u g\u1ea7n nh\u1ea5t: <b>' + lastStr + '</b>'
    + (daysSince >= 7 && last ? ' \u2014 <b>\u0110\u00e3 ' + daysSince + ' ng\u00e0y</b>, n\u00ean sao l\u01b0u l\u1ea1i!' : '')
    + '</div>'
    // Backup buttons
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-bottom:14px">'
    + '<button class="btn btn-primary" onclick="downloadBackup(\'full\')" style="padding:14px">'
    + '\u{1F4E6} Sao l\u01b0u TO\u00c0N B\u1ed8'
    + '<div style="font-size:.72rem;font-weight:400;opacity:.9;margin-top:2px">M\u1ecdi user + m\u1ecdi d\u1eef li\u1ec7u</div>'
    + '</button>'
    + '<button class="btn btn-secondary" onclick="downloadBackup(\'personal\')" style="padding:14px">'
    + '\u{1F464} Ch\u1ec9 c\u1ee7a t\u00f4i'
    + '<div style="font-size:.72rem;font-weight:400;opacity:.9;margin-top:2px">Profile + XP c\u1ee7a b\u1ea1n</div>'
    + '</button>'
    + '</div>'
    // Restore
    + '<div style="display:grid;grid-template-columns:1fr;gap:10px">'
    + '<button class="btn" onclick="uploadRestore()" style="background:linear-gradient(135deg,#f7971e,#f59e0b);color:#fff;padding:14px">'
    + '\u{1F4E5} Kh\u00f4i ph\u1ee5c t\u1eeb file backup'
    + '<div style="font-size:.72rem;font-weight:400;opacity:.9;margin-top:2px">Ch\u1ecdn file <code>.json</code> \u0111\u00e3 sao l\u01b0u tr\u01b0\u1edbc \u0111\u00f3</div>'
    + '</button>'
    + '</div>'
    // Info
    + '<div style="margin-top:14px;padding:10px 14px;background:var(--bg3);border-radius:8px;font-size:.8rem;color:var(--text2);line-height:1.65">'
    + '<b>\u{1F4A1} M\u1eb9o:</b><br>'
    + '\u2022 <b>Sao l\u01b0u to\u00e0n b\u1ed9</b> khi mu\u1ed1n chuy\u1ec3n sang m\u00e1y kh\u00e1c (mang theo file <code>.json</code>)<br>'
    + '\u2022 <b>Kh\u00f4i ph\u1ee5c "H\u1ee3p nh\u1ea5t"</b>: an to\u00e0n, kh\u00f4ng m\u1ea5t d\u1eef li\u1ec7u hi\u1ec7n c\u00f3<br>'
    + '\u2022 <b>Kh\u00f4i ph\u1ee5c "Ghi \u0111\u00e8"</b>: nguy hi\u1ec3m, xo\u00e1 s\u1ea1ch tr\u01b0\u1edbc khi n\u1ea1p<br>'
    + '\u2022 File backup l\u00e0 JSON thu\u1ea7n, c\u00f3 th\u1ec3 m\u1edf b\u1eb1ng Notepad \u0111\u1ec3 xem'
    + '</div>'
    + '</div>';
};

// ============================================================
// PHASE 6: INJECT INTO SETTINGS MODAL
// ============================================================
window.injectBackupIntoSettings = function(){
  // Called from renderProfileTab (already integrated below)
  // Also try to inject into settings modal if it exists
  var settingsBody = document.querySelector('#settingsModal .modal-body');
  if(!settingsBody) return;
  if(settingsBody.querySelector('.backup-section-injected')) return; // Already there
  var section = document.createElement('div');
  section.className = 'backup-section-injected';
  section.style.marginTop = '20px';
  section.innerHTML = '<div class="divider"></div>' + window.renderBackupCard();
  settingsBody.appendChild(section);
};

// Monkey-patch openSettings to inject backup UI
var _origOpenSettings = window.openSettings;
window.openSettings = function(){
  if(typeof _origOpenSettings === 'function') _origOpenSettings.apply(this, arguments);
  setTimeout(window.injectBackupIntoSettings, 150);
};

// ============================================================
// PHASE 7: AUTO-BACKUP CHECK (reminder only, doesn't auto-download)
// ============================================================
window.checkAutoBackupReminder = function(){
  try {
    var last = parseInt(localStorage.getItem('yeahedu_v12_last_backup') || '0');
    var dismissed = parseInt(localStorage.getItem('yeahedu_v12_backup_reminder_dismissed') || '0');
    var now = Date.now();
    // Only show if: never backed up OR >14 days AND haven't dismissed in last 3 days
    var neverBackedUp = !last;
    var oldBackup = last && (now - last) > 14 * 86400000;
    var recentlyDismissed = dismissed && (now - dismissed) < 3 * 86400000;
    if((neverBackedUp || oldBackup) && !recentlyDismissed){
      // Only nag if user has actual data
      var cu = window.acctGetCurrentUser && window.acctGetCurrentUser();
      if(cu && cu.xp >= 20){
        _showBackupReminder(neverBackedUp);
      }
    }
  } catch(e){}
};

function _showBackupReminder(never){
  var n = document.createElement('div');
  n.style.cssText = 'position:fixed;bottom:20px;left:20px;background:linear-gradient(135deg,#f7971e,#f59e0b);color:#fff;padding:16px 20px;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.3);z-index:9998;max-width:320px;animation:slideInRight .4s ease';
  n.innerHTML = '<div style="display:flex;gap:12px;align-items:flex-start">'
    + '<div style="font-size:1.8rem">\u{1F4BE}</div>'
    + '<div style="flex:1"><div style="font-weight:800;margin-bottom:2px">Nh\u1eafc sao l\u01b0u</div>'
    + '<div style="font-size:.82rem;opacity:.95;margin-bottom:10px">' + (never ? 'B\u1ea1n ch\u01b0a t\u1eebng sao l\u01b0u d\u1eef li\u1ec7u!' : 'H\u01a1n 14 ng\u00e0y ch\u01b0a sao l\u01b0u!') + '</div>'
    + '<div style="display:flex;gap:6px">'
    + '<button onclick="downloadBackup(\'full\');this.closest(\'div[style*=position]\').remove()" style="background:#fff;color:#f59e0b;border:none;padding:6px 12px;border-radius:8px;font-weight:700;cursor:pointer;font-size:.82rem">Sao l\u01b0u ngay</button>'
    + '<button onclick="localStorage.setItem(\'yeahedu_v12_backup_reminder_dismissed\',Date.now());this.closest(\'div[style*=position]\').remove()" style="background:rgba(255,255,255,.2);color:#fff;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:.82rem">3 ng\u00e0y sau</button>'
    + '</div>'
    + '</div>'
    + '<button onclick="this.parentElement.remove()" style="background:none;border:none;color:#fff;font-size:1.2rem;cursor:pointer;padding:0;opacity:.7">\u2715</button>'
    + '</div>';
  document.body.appendChild(n);
}

// Trigger reminder after boot
window.addEventListener('DOMContentLoaded', function(){
  setTimeout(window.checkAutoBackupReminder, 8000);
});

// Utility
function _esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

console.log('[v12.3 Module 22] Backup & Restore loaded');
})();
