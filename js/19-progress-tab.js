// ================================================================
// YeahEdu-TDA v12 - Module 19: Progress Tab (Dashboard XP/Badge/Leaderboard/Quest)
// Tab "Tien do" - hien thi toan bo gamification data
// ================================================================
(function(){
'use strict';

window.progressRender=function(){
  var el=document.getElementById('tabProgress');
  if(!el) return;
  var u=window.acctGetCurrentUser();
  if(!u){
    el.innerHTML='<div class="card" style="text-align:center;padding:40px">'
      +'<div style="font-size:3rem;margin-bottom:16px">\u{1F464}</div>'
      +'<h3 style="margin-bottom:10px">Ch\u01b0a c\u00f3 h\u1ed3 s\u01a1</h3>'
      +'<p style="color:var(--text2);margin-bottom:20px">T\u1ea1o h\u1ed3 s\u01a1 \u0111\u1ec3 theo d\u00f5i ti\u1ebfn \u0111\u1ed9 h\u1ecdc t\u1eadp c\u1ee7a b\u1ea1n!</p>'
      +'<button class="btn btn-primary" onclick="acctOpenLogin()">\u{1F31F} T\u1ea1o h\u1ed3 s\u01a1</button>'
      +'</div>';
    return;
  }
  var av=window.acctGetAvatar(u.avatarId);
  var xpForNext=window.getXPForLevel(u.level+1);
  var xpForCur=window.getXPForLevel(u.level);
  var progress=Math.round(((u.xp-xpForCur)/(xpForNext-xpForCur))*100);
  var quests=window.getDailyQuests();
  var allBadges=window.BADGES;
  var earnedBadges=allBadges.filter(function(b){return (u.badges||[]).indexOf(b.id)>=0;});
  var lockedBadges=allBadges.filter(function(b){return (u.badges||[]).indexOf(b.id)<0;});

  var html='<div class="sec-title">\u{1F525} Ti\u1ebfn \u0111\u1ed9 c\u1ee7a t\u00f4i</div>';

  // Hero card - user stats
  html+='<div class="card" style="background:linear-gradient(135deg,'+av.color+'22,rgba(0,124,240,.08));border-color:'+av.color+';padding:24px">'
    +'<div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">'
    +'<div style="width:100px;height:100px;border-radius:50%;background:'+av.color+';display:flex;align-items:center;justify-content:center;font-size:3rem;box-shadow:0 8px 24px '+av.color+'44">'+av.emoji+'</div>'
    +'<div style="flex:1;min-width:200px">'
    +'<div style="font-size:1.6rem;font-weight:800;margin-bottom:4px">'+_esc(u.name)+'</div>'
    +'<div style="color:var(--text2);font-size:.9rem;margin-bottom:10px">L\u1edbp '+u.grade+' \u2022 Tham gia t\u1eeb '+new Date(u.createdAt).toLocaleDateString('vi')+'</div>'
    +'<div style="display:flex;gap:16px;flex-wrap:wrap">'
    +'<div><div style="font-size:1.6rem;font-weight:800;color:var(--c1)">Lv.'+u.level+'</div><div style="font-size:.7rem;color:var(--text2)">C\u1ea5p \u0111\u1ed9</div></div>'
    +'<div><div style="font-size:1.6rem;font-weight:800;color:#f7971e">\u{1F525} '+u.streak+'</div><div style="font-size:.7rem;color:var(--text2)">Chu\u1ed7i ng\u00e0y</div></div>'
    +'<div><div style="font-size:1.6rem;font-weight:800;color:var(--c2)">\u2b50 '+u.xp+'</div><div style="font-size:.7rem;color:var(--text2)">XP t\u1ed5ng</div></div>'
    +'<div><div style="font-size:1.6rem;font-weight:800;color:#f59e0b">\u{1F48E} '+u.coins+'</div><div style="font-size:.7rem;color:var(--text2)">Xu</div></div>'
    +'<div><div style="font-size:1.6rem;font-weight:800;color:#7928ca">\u{1F3C6} '+earnedBadges.length+'</div><div style="font-size:.7rem;color:var(--text2)">Huy hi\u1ec7u</div></div>'
    +'</div>'
    +'</div>'
    +'</div>'
    // Progress bar to next level
    +'<div style="margin-top:16px">'
    +'<div style="display:flex;justify-content:space-between;font-size:.85rem;margin-bottom:6px"><span>Ti\u1ebfn \u0111\u1ed9 l\u00ean Level '+(u.level+1)+'</span><span style="color:var(--text2)">'+u.xp+' / '+xpForNext+' XP</span></div>'
    +'<div class="progress-bar" style="height:12px"><div class="progress-fill" style="width:'+progress+'%"></div></div>'
    +'</div>'
    +'</div>';

  // Daily quests
  html+='<div class="sec-title" style="margin-top:24px">\u{1F3AF} Nhi\u1ec7m v\u1ee5 h\u00f4m nay</div>';
  html+='<div class="card">';
  quests.quests.forEach(function(q){
    var pct=Math.min(100,Math.round((q.progress/q.target)*100));
    html+='<div style="padding:12px 0;border-bottom:1px dashed var(--border)">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
      +'<div><span style="font-weight:600">'+(q.done?'\u2705':'\u{1F4CC}')+' '+q.desc+'</span></div>'
      +'<div style="font-size:.8rem;color:var(--text2)">+'+q.xp+' XP, +'+q.coins+' \u{1F48E}</div>'
      +'</div>'
      +'<div class="progress-bar" style="height:6px"><div class="progress-fill" style="width:'+pct+'%;background:'+(q.done?'#22c55e':'linear-gradient(90deg,var(--c1),var(--c2))')+'"></div></div>'
      +'<div style="text-align:right;font-size:.72rem;color:var(--text2);margin-top:2px">'+q.progress+' / '+q.target+'</div>'
      +'</div>';
  });
  html+='<div style="text-align:center;color:var(--text2);font-size:.8rem;margin-top:10px">\u{1F550} Nhi\u1ec7m v\u1ee5 m\u1edbi m\u1ed7i 00:00 h\u00e0ng ng\u00e0y</div>';
  html+='</div>';

  // Badges - earned
  html+='<div class="sec-title" style="margin-top:24px">\u{1F3C6} Huy hi\u1ec7u ('+earnedBadges.length+'/'+allBadges.length+')</div>';
  html+='<div class="card">';
  if(earnedBadges.length){
    html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:16px">';
    earnedBadges.forEach(function(b){
      html+='<div style="background:linear-gradient(135deg,'+b.color+'44,'+b.color+'22);border:2px solid '+b.color+';border-radius:12px;padding:14px 10px;text-align:center;transition:all .2s" onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 6px 16px '+b.color+'44\'" onmouseout="this.style.transform=\'none\';this.style.boxShadow=\'none\'">'
        +'<div style="font-size:2.5rem;margin-bottom:6px">'+b.icon+'</div>'
        +'<div style="font-weight:700;font-size:.85rem">'+b.name+'</div>'
        +'<div style="color:var(--text2);font-size:.72rem;margin-top:4px">'+b.desc+'</div>'
        +'</div>';
    });
    html+='</div>';
  }
  // Locked badges
  if(lockedBadges.length){
    html+='<div style="color:var(--text2);font-size:.85rem;margin-bottom:8px">\u{1F510} Ch\u01b0a m\u1edf kh\u00f3a ('+lockedBadges.length+'):</div>';
    html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px">';
    lockedBadges.forEach(function(b){
      html+='<div style="background:var(--bg3);border:1px dashed var(--border2);border-radius:10px;padding:10px 8px;text-align:center;opacity:.6" title="'+b.desc+'">'
        +'<div style="font-size:1.5rem;filter:grayscale(1);margin-bottom:4px">'+b.icon+'</div>'
        +'<div style="font-size:.72rem;color:var(--text2)">'+b.name+'</div>'
        +'</div>';
    });
    html+='</div>';
  }
  html+='</div>';

  // Leaderboard
  html+='<div class="sec-title" style="margin-top:24px">\u{1F3C5} B\u1ea3ng x\u1ebfp h\u1ea1ng</div>';
  html+='<div class="card">';
  var all=window.acctListAllUsers();
  if(all.length<=1){
    html+='<div class="alert alert-info">\u{1F464} Ch\u01b0a c\u00f3 ng\u01b0\u1eddi kh\u00e1c. M\u1eddi b\u1ea1n b\u00e8 t\u1ea1o h\u1ed3 s\u01a1 tr\u00ean thi\u1ebft b\u1ecb n\u00e0y \u0111\u1ec3 c\u00f9ng thi \u0111ua!</div>';
  }
  all.sort(function(a,b){return (b.xp||0)-(a.xp||0);});
  var topN=all.slice(0,10);
  html+='<div style="display:flex;gap:8px;margin-bottom:12px"><button class="chip active" onclick="progressLbFilter(\'all\')">T\u1ea5t c\u1ea3 th\u1eddi gian</button><button class="chip" onclick="progressLbFilter(\'week\')">Tu\u1ea7n</button><button class="chip" onclick="progressLbFilter(\'month\')">Th\u00e1ng</button></div>';
  topN.forEach(function(usr,idx){
    var av2=window.acctGetAvatar(usr.avatarId);
    var isMe=usr.id===u.id;
    var medal=idx===0?'\u{1F947}':idx===1?'\u{1F948}':idx===2?'\u{1F949}':'#'+(idx+1);
    html+='<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:'+(isMe?'linear-gradient(135deg,rgba(0,200,150,.15),rgba(0,124,240,.1))':'var(--bg3)')+';border:1px solid '+(isMe?'var(--c1)':'var(--border)')+';border-radius:10px;margin-bottom:8px">'
      +'<div style="width:32px;text-align:center;font-weight:800;font-size:1.1rem">'+medal+'</div>'
      +'<div style="width:36px;height:36px;border-radius:50%;background:'+av2.color+';display:flex;align-items:center;justify-content:center;font-size:1rem">'+av2.emoji+'</div>'
      +'<div style="flex:1"><div style="font-weight:700">'+_esc(usr.name)+(isMe?' <span style="color:var(--c1)">(b\u1ea1n)</span>':'')+'</div><div style="font-size:.75rem;color:var(--text2)">L\u1edbp '+usr.grade+' \u2022 \u{1F525} '+(usr.streak||0)+' \u2022 \u{1F3C6} '+((usr.badges||[]).length)+'</div></div>'
      +'<div style="text-align:right"><div style="font-weight:800;color:var(--c1)">Lv.'+usr.level+'</div><div style="font-size:.75rem;color:var(--text2)">'+usr.xp+' XP</div></div>'
      +'</div>';
  });
  html+='</div>';

  // History chart placeholder
  html+='<div class="sec-title" style="margin-top:24px">\u{1F4CA} Ho\u1ea1t \u0111\u1ed9ng g\u1ea7n \u0111\u00e2y</div>';
  html+='<div class="card"><div id="xpChartArea">\u0110ang t\u1ea3i bi\u1ec3u \u0111\u1ed3...</div></div>';

  el.innerHTML=html;
  setTimeout(_renderXPChart,100);
};

function _renderXPChart(){
  var el=document.getElementById('xpChartArea');
  if(!el) return;
  var u=window.acctGetCurrentUser();
  if(!u){el.innerHTML='<div class="alert alert-info">C\u1ea7n h\u1ed3 s\u01a1</div>';return;}
  var req=indexedDB.open('YeahEdu_v11',2);
  req.onsuccess=function(){
    var db=req.result;
    var tx=db.transaction(['xp_events'],'readonly');
    var st=tx.objectStore('xp_events');
    var events=[];
    st.openCursor().onsuccess=function(e){
      var c=e.target.result;
      if(c){ if(c.value.userId===u.id) events.push(c.value); c.continue(); }
      else{
        // Group by day (last 7 days)
        var days={};
        for(var i=6;i>=0;i--){
          var d=new Date(Date.now()-i*86400000).toDateString();
          days[d]=0;
        }
        events.forEach(function(ev){
          var d=new Date(ev.ts).toDateString();
          if(days[d]!==undefined) days[d]+=ev.amount;
        });
        var maxVal=Math.max.apply(null,Object.values(days).concat([50]));
        var html='<div style="display:flex;align-items:flex-end;gap:8px;height:180px;padding:20px 10px 30px;background:var(--bg3);border-radius:10px;position:relative">';
        Object.keys(days).forEach(function(d){
          var h=Math.max(4,Math.round(days[d]/maxVal*140));
          var lbl=new Date(d).toLocaleDateString('vi',{weekday:'short'});
          html+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px">'
            +'<div style="font-size:.7rem;color:var(--text2)">'+days[d]+' XP</div>'
            +'<div style="width:100%;height:'+h+'px;background:linear-gradient(180deg,var(--c1),var(--c2));border-radius:4px 4px 0 0;transition:all .3s"></div>'
            +'<div style="font-size:.7rem;color:var(--text2);text-transform:capitalize">'+lbl+'</div>'
            +'</div>';
        });
        html+='</div>';
        html+='<div style="text-align:center;margin-top:8px;color:var(--text2);font-size:.85rem">XP theo ng\u00e0y (7 ng\u00e0y g\u1ea7n nh\u1ea5t)</div>';
        el.innerHTML=html;
      }
    };
  };
}

window.progressLbFilter=function(mode){
  document.querySelectorAll('#tabProgress .chip').forEach(function(el){el.classList.remove('active');});
  event.target.classList.add('active');
  // TODO: filter by time (v12.1)
};

function _esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

console.log('[v12 Module 19] Progress Tab loaded');
})();
