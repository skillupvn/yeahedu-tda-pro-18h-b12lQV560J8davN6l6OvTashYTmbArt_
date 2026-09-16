// ================================================================
// YeahEdu-TDA v12 - Module 20: Profile Tab (Ho so, friends, shop)
// ================================================================
(function(){
'use strict';

window.profileRender=function(){
  var el=document.getElementById('tabProfile');
  if(!el) return;
  var u=window.acctGetCurrentUser();
  if(!u){
    el.innerHTML='<div class="card" style="text-align:center;padding:40px"><div style="font-size:3rem;margin-bottom:16px">\u{1F464}</div>'
      +'<h3 style="margin-bottom:10px">Ch\u01b0a c\u00f3 h\u1ed3 s\u01a1</h3>'
      +'<button class="btn btn-primary" onclick="acctOpenLogin()">\u{1F31F} T\u1ea1o h\u1ed3 s\u01a1</button></div>';
    return;
  }
  var av=window.acctGetAvatar(u.avatarId);
  var allUsers=window.acctListAllUsers();
  var others=allUsers.filter(function(x){return x.id!==u.id;});

  var html='<div class="sec-title">\u{1F464} H\u1ed3 s\u01a1</div>';

  // Profile card
  html+='<div class="card"><div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">'
    +'<div style="width:120px;height:120px;border-radius:50%;background:'+av.color+';display:flex;align-items:center;justify-content:center;font-size:3.5rem;box-shadow:0 8px 24px '+av.color+'44;cursor:pointer" onclick="profileChangeAvatar()" title="\u0110\u1ed5i avatar">'+av.emoji+'</div>'
    +'<div style="flex:1">'
    +'<h2 style="margin-bottom:6px">'+_esc(u.name)+' <button class="btn btn-icon btn-sm" onclick="profileRename()" title="\u0110\u1ed5i t\u00ean">\u270F\u{FE0F}</button></h2>'
    +'<div style="color:var(--text2);margin-bottom:12px">L\u1edbp '+u.grade+' \u2022 Th\u00e0nh vi\u00ean t\u1eeb '+new Date(u.createdAt).toLocaleDateString('vi')+'</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
    +'<button class="btn btn-secondary btn-sm" onclick="acctOpenLogin()">\u{1F504} Chuy\u1ec3n h\u1ed3 s\u01a1</button>'
    +'<button class="btn btn-secondary btn-sm" onclick="profileExport()">\u{1F4E5} Xu\u1ea5t d\u1eef li\u1ec7u</button>'
    +'<button class="btn btn-danger btn-sm" onclick="acctDeleteUser(\''+u.id+'\')">\u{1F5D1}\u{FE0F} Xo\u00e1 h\u1ed3 s\u01a1</button>'
    +'</div>'
    +'</div>'
    +'</div></div>';

  // Cai dat ca nhan
  html+='<div class="sec-title" style="margin-top:24px">\u2699\uFE0F C\u00e0i \u0111\u1eb7t</div>';
  html+='<div class="card">';
  html+='<div style="display:grid;gap:14px">'
    +'<label class="toggle-wrap" onclick="profileToggleSet(\'sound\')"><div class="toggle '+(u.settings.sound?'on':'')+'" id="ps-sound"></div><span class="toggle-label">\u{1F509} \u00c2m thanh (chuy\u1ec3n tab, click)</span></label>'
    +'<label class="toggle-wrap" onclick="profileToggleSet(\'notify\')"><div class="toggle '+(u.settings.notify?'on':'')+'" id="ps-notify"></div><span class="toggle-label">\u{1F514} Th\u00f4ng b\u00e1o (XP, huy hi\u1ec7u)</span></label>'
    +'</div>';
  html+='</div>';

  // Ban be
  html+='<div class="sec-title" style="margin-top:24px">\u{1F465} B\u1ea1n b\u00e8 ('+(u.friends||[]).length+')</div>';
  html+='<div class="card">';
  if(!others.length){
    html+='<div class="alert alert-info">Ch\u01b0a c\u00f3 ng\u01b0\u1eddi d\u00f9ng kh\u00e1c tr\u00ean thi\u1ebft b\u1ecb n\u00e0y. M\u1eddi b\u1ea1n b\u00e8 t\u1ea1o h\u1ed3 s\u01a1 \u0111\u1ec3 k\u1ebft b\u1ea1n!</div>';
  } else {
    html+='<div style="margin-bottom:10px;font-size:.85rem;color:var(--text2)">C\u00e1c ng\u01b0\u1eddi d\u00f9ng tr\u00ean thi\u1ebft b\u1ecb n\u00e0y:</div>';
    others.forEach(function(other){
      var oav=window.acctGetAvatar(other.avatarId);
      var isFriend=(u.friends||[]).indexOf(other.id)>=0;
      html+='<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg3);border-radius:10px;margin-bottom:8px">'
        +'<div style="width:40px;height:40px;border-radius:50%;background:'+oav.color+';display:flex;align-items:center;justify-content:center">'+oav.emoji+'</div>'
        +'<div style="flex:1"><div style="font-weight:700">'+_esc(other.name)+'</div><div style="font-size:.75rem;color:var(--text2)">Lv.'+other.level+' \u2022 \u{1F525} '+(other.streak||0)+' \u2022 \u{1F3C6} '+((other.badges||[]).length)+'</div></div>'
        +'<button class="btn '+(isFriend?'btn-secondary':'btn-primary')+' btn-sm" onclick="profileToggleFriend(\''+other.id+'\')">'+(isFriend?'\u2713 B\u1ea1n':'\u2795 K\u1ebft b\u1ea1n')+'</button>'
        +'<button class="btn btn-secondary btn-sm" onclick="profileChallenge(\''+other.id+'\')">\u{1F3AE} \u0110\u1ea5u</button>'
        +'</div>';
    });
  }
  html+='</div>';

  // Shop (spend coins)
  html+='<div class="sec-title" style="margin-top:24px">\u{1F48E} C\u1eeda h\u00e0ng xu ('+u.coins+' xu)</div>';
  html+='<div class="card">';
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">';
  var shopItems=[
    {id:'boost_2x',name:'X2 XP 1h',icon:'\u26A1',cost:50,desc:'G\u1ea5p \u0111\u00f4i XP trong 1 gi\u1edd'},
    {id:'skip_quest',name:'B\u1ecf qua nhi\u1ec7m v\u1ee5',icon:'\u23ED\uFE0F',cost:30,desc:'Ho\u00e0n th\u00e0nh mi\u1ec5n ph\u00ed 1 quest'},
    {id:'streak_freeze',name:'\u0110\u00f4ng chu\u1ed7i',icon:'\u2744\uFE0F',cost:100,desc:'Gi\u1eef streak 1 ng\u00e0y kh\u00f4ng h\u1ecdc'},
    {id:'theme_gold',name:'Theme V\u00e0ng',icon:'\u{1F31F}',cost:500,desc:'Theme v\u00e0ng cao c\u1ea5p'},
    {id:'theme_sakura',name:'Theme Sakura',icon:'\u{1F338}',cost:500,desc:'Theme h\u1ed3ng anh \u0111\u00e0o'},
    {id:'hint_5',name:'5 g\u1ee3i \u00fd',icon:'\u{1F4A1}',cost:20,desc:'5 g\u1ee3i \u00fd cho quiz'}
  ];
  shopItems.forEach(function(it){
    var can=u.coins>=it.cost;
    var owned=(u.unlockedThemes||[]).indexOf(it.id.replace('theme_',''))>=0 || (u.inventory||[]).indexOf(it.id)>=0;
    html+='<div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;opacity:'+(can?1:.5)+'">'
      +'<div style="font-size:2rem;margin-bottom:6px">'+it.icon+'</div>'
      +'<div style="font-weight:700;font-size:.9rem">'+it.name+'</div>'
      +'<div style="color:var(--text2);font-size:.75rem;margin:4px 0 10px">'+it.desc+'</div>'
      +(owned?'<div class="badge badge-green">\u2713 \u0110\u00e3 s\u1edf h\u1eefu</div>':'<button class="btn '+(can?'btn-primary':'btn-secondary')+' btn-sm" '+(can?'':'disabled')+' onclick="profileBuy(\''+it.id+'\','+it.cost+')">\u{1F48E} '+it.cost+' xu</button>')
      +'</div>';
  });
  html+='</div></div>';

  // v12.3: Backup & Restore section
  html+='<div class="sec-title" style="margin-top:24px">\u{1F4E6} Sao l\u01b0u & Kh\u00f4i ph\u1ee5c</div>';
  if(typeof window.renderBackupCard === 'function'){
    html+=window.renderBackupCard();
  }

  el.innerHTML=html;
};

window.profileChangeAvatar=function(){
  window.acctOpenLogin();
};

window.profileRename=function(){
  var u=window.acctGetCurrentUser();
  if(!u) return;
  var newName=prompt('T\u00ean m\u1edbi:',u.name);
  if(newName && newName.trim() && newName!==u.name){
    u.name=newName.trim();
    window.acctSaveUser(u);
    window.acctRenderHeader();
    window.profileRender();
    if(window.toast) toast('\u0110\u00e3 \u0111\u1ed5i','T\u00ean m\u1edbi: '+u.name,'success');
  }
};

window.profileToggleSet=function(key){
  var u=window.acctGetCurrentUser();
  if(!u) return;
  if(!u.settings) u.settings={};
  u.settings[key]=!u.settings[key];
  window.acctSaveUser(u);
  document.getElementById('ps-'+key).classList.toggle('on',u.settings[key]);
};

window.profileToggleFriend=function(otherId){
  var u=window.acctGetCurrentUser();
  if(!u) return;
  if(!u.friends) u.friends=[];
  var idx=u.friends.indexOf(otherId);
  if(idx>=0) u.friends.splice(idx,1);
  else{
    u.friends.push(otherId);
    if(window.awardXP) window.awardXP('friend_add',5,'K\u1ebft b\u1ea1n m\u1edbi');
  }
  window.acctSaveUser(u);
  window.profileRender();
};

window.profileChallenge=function(otherId){
  var u=window.acctGetCurrentUser();
  var other=window.acctListAllUsers().find(function(x){return x.id===otherId;});
  if(!other) return;
  // Simple challenge: quick quiz race
  var html='<div class="modal-overlay" id="challengeModal" onclick="if(event.target.id===\'challengeModal\')this.remove()">'
    +'<div class="modal" style="max-width:520px"><div class="modal-header">'
    +'<div class="modal-title">\u{1F3AE} Th\u1ee7 th\u00e1ch 1v1</div>'
    +'<button class="btn btn-icon btn-sm" onclick="document.getElementById(\'challengeModal\').remove()">\u2715</button>'
    +'</div>'
    +'<div class="modal-body"><div style="text-align:center;padding:20px">'
    +'<div style="display:flex;justify-content:space-around;margin-bottom:20px">'
    +'<div><div style="width:80px;height:80px;border-radius:50%;background:'+window.acctGetAvatar(u.avatarId).color+';display:flex;align-items:center;justify-content:center;font-size:2.5rem;margin:0 auto">'+window.acctGetAvatar(u.avatarId).emoji+'</div><div style="font-weight:700;margin-top:8px">'+_esc(u.name)+'</div><div style="color:var(--text2);font-size:.85rem">Lv.'+u.level+'</div></div>'
    +'<div style="font-size:3rem;align-self:center">\u26A1</div>'
    +'<div><div style="width:80px;height:80px;border-radius:50%;background:'+window.acctGetAvatar(other.avatarId).color+';display:flex;align-items:center;justify-content:center;font-size:2.5rem;margin:0 auto">'+window.acctGetAvatar(other.avatarId).emoji+'</div><div style="font-weight:700;margin-top:8px">'+_esc(other.name)+'</div><div style="color:var(--text2);font-size:.85rem">Lv.'+other.level+'</div></div>'
    +'</div>'
    +'<p style="color:var(--text2)">Tr\u1eadn \u0111\u1ea5u 1v1: 5 c\u00e2u tr\u1eafc nghi\u1ec7m, ai tr\u1ea3 l\u1eddi nhanh + \u0111\u00fang nhi\u1ec1u h\u01a1n s\u1ebd th\u1eafng!</p>'
    +'<div class="alert alert-info" style="text-align:left">\u{1F6A7} T\u00ednh n\u0103ng \u0111ang ph\u00e1t tri\u1ec3n. Trong phi\u00ean b\u1ea3n hi\u1ec7n t\u1ea1i, b\u1ea1n c\u00f3 th\u1ec3 t\u1ef1 t\u1ea1o quiz r\u1ed3i so \u0111i\u1ec3m v\u1edbi b\u1ea1n.</div>'
    +'<button class="btn btn-primary" onclick="document.getElementById(\'challengeModal\').remove();document.getElementById(\'tab-quiz\').click()">\u{1F4DD} T\u1ea1o quiz ngay</button>'
    +'</div></div></div></div>';
  var wrap=document.createElement('div');
  wrap.innerHTML=html;
  document.body.appendChild(wrap.firstChild);
};

window.profileBuy=function(itemId,cost){
  var u=window.acctGetCurrentUser();
  if(!u || u.coins<cost) return;
  u.coins-=cost;
  if(itemId.indexOf('theme_')===0){
    if(!u.unlockedThemes) u.unlockedThemes=[];
    u.unlockedThemes.push(itemId.replace('theme_',''));
  } else {
    if(!u.inventory) u.inventory=[];
    u.inventory.push(itemId);
  }
  window.acctSaveUser(u);
  window.acctRenderHeader();
  window.profileRender();
  if(window.toast) toast('\u{1F6D2} Mua th\u00e0nh c\u00f4ng!','\u0110\u00e3 mua v\u1eadt ph\u1ea9m','success');
};

window.profileExport=function(){
  var u=window.acctGetCurrentUser();
  if(!u) return;
  var blob=new Blob([JSON.stringify(u,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='profile-'+u.name.replace(/\s+/g,'-')+'.json';a.click();
  URL.revokeObjectURL(url);
  if(window.toast) toast('\u0110\u00e3 xu\u1ea5t','H\u1ed3 s\u01a1 \u0111\u00e3 t\u1ea3i v\u1ec1','success');
};

function _esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

console.log('[v12 Module 20] Profile Tab loaded');
})();
