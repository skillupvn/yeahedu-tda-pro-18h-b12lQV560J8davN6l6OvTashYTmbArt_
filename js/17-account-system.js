// ================================================================
// YeahEdu-TDA v12 - Module 17: Account System (Local, Multi-user)
// Ho so nguoi dung, dang ky/dang nhap, avatar, profile
// ================================================================
(function(){
'use strict';
var STORE='user_profiles', DB_NAME='YeahEdu_v11';

function _openDB(cb){var r=indexedDB.open(DB_NAME,2);
    r.onupgradeneeded=function(e){
      var db=e.target.result;
      // Fallback: đảm bảo mọi store v11+v12 đều tồn tại (idempotent)
      ['sm2_cards','sg_docs','faq_docs','timeline_docs','mindmap_docs','user_profiles','friends','custom_topics'].forEach(function(s){
        if(!db.objectStoreNames.contains(s)){
          var st=db.createObjectStore(s,{keyPath:'id',autoIncrement:true});
          if(s==='sm2_cards'){ st.createIndex('deck','deck',{unique:false}); st.createIndex('due','due',{unique:false}); }
        }
      });
      if(!db.objectStoreNames.contains('xp_events')){
        var xp=db.createObjectStore('xp_events',{keyPath:'id',autoIncrement:true});
        xp.createIndex('userId','userId',{unique:false});
        xp.createIndex('ts','ts',{unique:false});
      }
    };
 r.onsuccess=function(){cb(null,r.result);};r.onerror=function(){cb(r.error);};}
function _tx(mode,fn){_openDB(function(err,db){if(err) return; try{var t=db.transaction([STORE],mode);fn(t.objectStore(STORE));}catch(e){console.warn(e);}});}

var CUR_USER_KEY='yeahedu_v12_current_user';

// Avatar preset (SVG data URI - khong can external image)
var AVATAR_PRESETS=[
  {id:1,name:'Ph\u01a1',color:'#00c896',emoji:'\u{1F98A}'},
  {id:2,name:'Voi con',color:'#007cf0',emoji:'\u{1F418}'},
  {id:3,name:'H\u1ed5',color:'#f7971e',emoji:'\u{1F405}'},
  {id:4,name:'C\u00fa m\u00e8o',color:'#7928ca',emoji:'\u{1F989}'},
  {id:5,name:'K\u1ef3 l\u00e2n',color:'#ff4d4d',emoji:'\u{1F984}'},
  {id:6,name:'R\u1ed3ng',color:'#00c896',emoji:'\u{1F409}'},
  {id:7,name:'Ch\u00f3 nh\u1ecf',color:'#f7971e',emoji:'\u{1F415}'},
  {id:8,name:'M\u00e8o',color:'#7928ca',emoji:'\u{1F408}'},
  {id:9,name:'G\u1ea5u tr\u00fac',color:'#111',emoji:'\u{1F43C}'},
  {id:10,name:'C\u00e1 heo',color:'#007cf0',emoji:'\u{1F42C}'},
  {id:11,name:'Ch\u1ed3n',color:'#ff4d4d',emoji:'\u{1F98A}'},
  {id:12,name:'Kh\u1ec9',color:'#f7971e',emoji:'\u{1F412}'}
];

// ========== Public API ==========
window.acctGetCurrentUser=function(){
  try{
    var uid=localStorage.getItem(CUR_USER_KEY);
    if(!uid) return null;
    return JSON.parse(localStorage.getItem('user_'+uid)||'null');
  }catch(e){return null;}
};

window.acctSaveUser=function(user,cb){
  try{
    localStorage.setItem('user_'+user.id,JSON.stringify(user));
    localStorage.setItem(CUR_USER_KEY,user.id);
    if(cb) cb(user);
    // Broadcast update
    window.dispatchEvent(new CustomEvent('userChanged',{detail:user}));
  }catch(e){console.warn(e);}
};

window.acctListAllUsers=function(){
  var users=[];
  try{
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(k&&k.indexOf('user_')===0&&k!==CUR_USER_KEY){
        try{users.push(JSON.parse(localStorage.getItem(k)));}catch(e){}
      }
    }
  }catch(e){}
  return users;
};

window.acctCreateUser=function(name,avatarId,grade){
  var id='u_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
  var user={
    id:id,
    name:name||'H\u1ecdc sinh',
    avatarId:avatarId||1,
    grade:grade||'10',
    createdAt:Date.now(),
    xp:0,
    level:1,
    coins:50,           // Xu khoi diem
    streak:0,
    longestStreak:0,
    lastActiveDate:null,
    badges:[],
    friends:[],
    unlockedThemes:['dark','light'],
    theme:'dark',
    settings:{sound:true,notify:true}
  };
  window.acctSaveUser(user);
  if(window.toast) toast('\u{1F389} Ch\u00e0o m\u1eebng!','H\u1ed3 s\u01a1 c\u1ee7a b\u1ea1n \u0111\u00e3 \u0111\u01b0\u1ee3c t\u1ea1o','success');
  return user;
};

window.acctSwitchUser=function(uid){
  var u=JSON.parse(localStorage.getItem('user_'+uid)||'null');
  if(!u) return;
  localStorage.setItem(CUR_USER_KEY,uid);
  window.dispatchEvent(new CustomEvent('userChanged',{detail:u}));
  if(window.toast) toast('\u{1F464} \u0110\u00e3 chuy\u1ec3n','Xin ch\u00e0o '+u.name,'success');
  if(window.acctRenderHeader) window.acctRenderHeader();
  location.reload();
};

window.acctDeleteUser=function(uid){
  if(!confirm('Xo\u00e1 to\u00e0n b\u1ed9 h\u1ed3 s\u01a1 n\u00e0y? T\u1ea5t c\u1ea3 XP, badge s\u1ebd m\u1ea5t!')) return;
  localStorage.removeItem('user_'+uid);
  if(localStorage.getItem(CUR_USER_KEY)===uid) localStorage.removeItem(CUR_USER_KEY);
  if(window.acctRenderProfileTab) window.acctRenderProfileTab();
  if(window.toast) toast('\u0110\u00e3 xo\u00e1','H\u1ed3 s\u01a1 \u0111\u00e3 xo\u00e1','info');
};

window.acctGetAvatar=function(id){
  return AVATAR_PRESETS.find(function(a){return a.id===parseInt(id);})||AVATAR_PRESETS[0];
};

window.acctRenderHeader=function(){
  var u=window.acctGetCurrentUser();
  var wrap=document.getElementById('acctHeaderWrap');
  if(!wrap){
    var actions=document.querySelector('.header-actions');
    if(!actions) return;
    wrap=document.createElement('div');
    wrap.id='acctHeaderWrap';
    wrap.style.cssText='display:flex;align-items:center;gap:8px';
    actions.insertBefore(wrap,actions.firstChild);
  }
  if(!u){
    wrap.innerHTML='<button class="btn btn-primary btn-sm" onclick="acctOpenLogin()">\u{1F464} \u0110\u0103ng nh\u1eadp</button>';
    return;
  }
  var av=window.acctGetAvatar(u.avatarId);
  var nextLevel=window.getXPForLevel?window.getXPForLevel(u.level+1):(u.level*100);
  var progress=Math.min(100,Math.round((u.xp%100)/100*100));
  wrap.innerHTML='<div class="user-mini" onclick="acctOpenProfile()" style="display:flex;align-items:center;gap:8px;padding:4px 12px 4px 4px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'var(--c1)\'" onmouseout="this.style.borderColor=\'var(--border)\'">'
    +'<div style="width:32px;height:32px;border-radius:50%;background:'+av.color+';display:flex;align-items:center;justify-content:center;font-size:1.1rem">'+av.emoji+'</div>'
    +'<div style="display:flex;flex-direction:column;line-height:1.1">'
    +'<div style="font-size:.85rem;font-weight:700">'+_esc(u.name)+'</div>'
    +'<div style="font-size:.7rem;color:var(--text2)">Lv.'+u.level+' \u2022 \u2b50 '+u.xp+' XP</div>'
    +'</div>'
    +(u.streak>0?'<div style="background:linear-gradient(135deg,#f7971e,#ff4d4d);color:#fff;padding:2px 8px;border-radius:10px;font-size:.75rem;font-weight:700">\u{1F525} '+u.streak+'</div>':'')
    +'<div style="background:linear-gradient(135deg,#f7971e,#f59e0b);color:#fff;padding:2px 8px;border-radius:10px;font-size:.75rem;font-weight:700">\u{1F48E} '+u.coins+'</div>'
    +'</div>';
};

window.acctOpenLogin=function(){
  var existing=window.acctListAllUsers();
  var html='<div class="modal-overlay" onclick="acctCloseModal(event)" id="acctModal"><div class="modal" style="max-width:520px">'
    +'<div class="modal-header"><div class="modal-title">\u{1F464} H\u1ed3 s\u01a1 h\u1ecdc t\u1eadp</div><button class="btn btn-icon btn-sm" onclick="acctCloseModal()">\u2715</button></div>'
    +'<div class="modal-body">';
  if(existing.length){
    html+='<div style="margin-bottom:16px"><h4 style="margin-bottom:10px">Ch\u1ecdn h\u1ed3 s\u01a1:</h4><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">';
    existing.forEach(function(u){
      var av=window.acctGetAvatar(u.avatarId);
      html+='<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px;cursor:pointer;display:flex;align-items:center;gap:10px" onclick="acctSwitchUser(\''+u.id+'\')" onmouseover="this.style.borderColor=\'var(--c1)\'" onmouseout="this.style.borderColor=\'var(--border)\'">'
        +'<div style="width:40px;height:40px;border-radius:50%;background:'+av.color+';display:flex;align-items:center;justify-content:center;font-size:1.3rem">'+av.emoji+'</div>'
        +'<div style="flex:1"><div style="font-weight:700">'+_esc(u.name)+'</div><div style="font-size:.75rem;color:var(--text2)">Lv.'+u.level+' \u2022 \u{1F525} '+(u.streak||0)+'</div></div>'
        +'</div>';
    });
    html+='</div><div class="divider"></div></div>';
  }
  html+='<h4 style="margin-bottom:10px">'+(existing.length?'Ho\u1eb7c t\u1ea1o h\u1ed3 s\u01a1 m\u1edbi:':'T\u1ea1o h\u1ed3 s\u01a1 \u0111\u1ea7u ti\u00ean:')+'</h4>'
    +'<div class="fgroup"><label>T\u00ean c\u1ee7a b\u1ea1n</label><input id="acctNewName" placeholder="V\u00ed d\u1ee5: Minh Anh" style="background:var(--bg3);border:1.5px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--text);width:100%"></div>'
    +'<div class="fgroup" style="margin-top:12px"><label>C\u1ea5p l\u1edbp</label><select id="acctNewGrade" style="background:var(--bg3);border:1.5px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--text);width:100%">'
    +'<option value="2">L\u1edbp 2</option><option value="3">L\u1edbp 3</option><option value="4">L\u1edbp 4</option><option value="5">L\u1edbp 5</option>'
    +'<option value="6">L\u1edbp 6</option><option value="7">L\u1edbp 7</option><option value="8">L\u1edbp 8</option><option value="9">L\u1edbp 9</option>'
    +'<option value="10" selected>L\u1edbp 10</option><option value="11">L\u1edbp 11</option><option value="12">L\u1edbp 12</option>'
    +'<option value="dh">\u0110\u1ea1i h\u1ecdc</option><option value="tuhoc">T\u1ef1 h\u1ecdc</option>'
    +'</select></div>'
    +'<div class="fgroup" style="margin-top:12px"><label>Ch\u1ecdn avatar</label><div id="acctAvatarPicker" style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">';
  AVATAR_PRESETS.forEach(function(a){
    html+='<div class="av-choice" data-id="'+a.id+'" onclick="acctPickAvatar('+a.id+')" style="width:100%;aspect-ratio:1;border-radius:50%;background:'+a.color+';display:flex;align-items:center;justify-content:center;font-size:1.4rem;cursor:pointer;border:3px solid transparent;transition:all .2s">'+a.emoji+'</div>';
  });
  html+='</div></div>'
    +'<button class="btn btn-primary btn-block" style="margin-top:16px" onclick="acctDoCreate()">\u{1F31F} T\u1ea1o h\u1ed3 s\u01a1</button>'
    +'</div></div></div>';
  var wrap=document.createElement('div');
  wrap.innerHTML=html;
  document.body.appendChild(wrap.firstChild);
  setTimeout(function(){window.acctPickAvatar(1);},100);
};

window.acctPickAvatar=function(id){
  window.__acctSelectedAvatar=id;
  document.querySelectorAll('.av-choice').forEach(function(el){
    el.style.border=parseInt(el.dataset.id)===id?'3px solid #fff':'3px solid transparent';
    el.style.transform=parseInt(el.dataset.id)===id?'scale(1.1)':'scale(1)';
  });
};

window.acctDoCreate=function(){
  var name=document.getElementById('acctNewName').value.trim();
  if(!name){ if(window.toast) toast('L\u1ed7i','H\u00e3y nh\u1eadp t\u00ean','error'); return; }
  var grade=document.getElementById('acctNewGrade').value;
  var avatarId=window.__acctSelectedAvatar||1;
  window.acctCreateUser(name,avatarId,grade);
  window.acctCloseModal();
  window.acctRenderHeader();
  location.reload();
};

window.acctCloseModal=function(e){
  if(e && e.target.id!=='acctModal') return;
  var m=document.getElementById('acctModal');
  if(m) m.remove();
};

window.acctOpenProfile=function(){
  var b=document.getElementById('tab-profile');
  if(b) b.click();
};

// Init - auto show login if no user
window.addEventListener('DOMContentLoaded',function(){
  setTimeout(function(){
    window.acctRenderHeader();
    if(!window.acctGetCurrentUser() && !localStorage.getItem('yeahedu_v12_dismiss_login')){
      // Auto show login after 2s if new visitor
      setTimeout(function(){
        if(!window.acctGetCurrentUser()) window.acctOpenLogin();
      },1500);
    }
  },800);
});

console.log('[v12 Module 17] Account System loaded');
})();
