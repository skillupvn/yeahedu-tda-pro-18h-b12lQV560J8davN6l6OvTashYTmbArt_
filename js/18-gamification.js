// ================================================================
// YeahEdu-TDA v12 - Module 18: Gamification (XP, Level, Streak, Badges, Quests)
// Depends on: 17-account-system.js
// ================================================================
(function(){
'use strict';
var STORE_XP='xp_events', DB_NAME='YeahEdu_v11';

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
function _tx(store,mode,fn){_openDB(function(err,db){if(err) return; try{var t=db.transaction([store],mode);fn(t.objectStore(store));}catch(e){console.warn(e);}});}

// ========== Level formula ==========
// Level 1: 0-99 XP, Level 2: 100-249, Level 3: 250-449, ... Fibonacci-ish
window.getXPForLevel=function(level){
  if(level<=1) return 0;
  // Total XP for reach level L = 50*L*(L-1)
  return 50*level*(level-1);
};

window.getLevelFromXP=function(xp){
  // Solve 50*L*(L-1) <= xp => L = (1+sqrt(1+xp/12.5))/2
  var l=Math.floor((1+Math.sqrt(1+xp/12.5))/2);
  return Math.max(1,l);
};

// ========== BADGES (thanh tich) ==========
window.BADGES=[
  {id:'first_login',name:'Ch\u00e0o m\u1eebng',icon:'\u{1F44B}',desc:'\u0110\u0103ng nh\u1eadp l\u1ea7n \u0111\u1ea7u',color:'#00c896',xp:10},
  {id:'first_quiz',name:'Nh\u00e0 tri th\u1ee9c',icon:'\u{1F393}',desc:'Ho\u00e0n th\u00e0nh Quiz \u0111\u1ea7u ti\u00ean',color:'#007cf0',xp:20},
  {id:'first_flash',name:'Th\u1ebb ma thu\u1eadt',icon:'\u{1F3B4}',desc:'T\u1ea1o Flashcard \u0111\u1ea7u ti\u00ean',color:'#7928ca',xp:20},
  {id:'first_sm2',name:'Nh\u1edb l\u00e2u nh\u1ea5t',icon:'\u{1F9E0}',desc:'Import th\u1ebb v\u00e0o SM-2',color:'#f7971e',xp:30},
  {id:'streak_3',name:'B\u00e9 ch\u0103m ch\u1ec9',icon:'\u{1F525}',desc:'H\u1ecdc 3 ng\u00e0y li\u00ean t\u1ee5c',color:'#f7971e',xp:30},
  {id:'streak_7',name:'B\u1ea3y ng\u00e0y v\u00e0ng',icon:'\u{1F31F}',desc:'H\u1ecdc 7 ng\u00e0y li\u00ean t\u1ee5c',color:'#f59e0b',xp:70},
  {id:'streak_30',name:'H\u1ecdc su\u1ed1t th\u00e1ng',icon:'\u{1F396}\u{FE0F}',desc:'H\u1ecdc 30 ng\u00e0y li\u00ean t\u1ee5c',color:'#ff4d4d',xp:300},
  {id:'streak_100',name:'B\u1ea5t di b\u1ea5t d\u1ecbch',icon:'\u{1F451}',desc:'H\u1ecdc 100 ng\u00e0y li\u00ean t\u1ee5c',color:'#ff0080',xp:1000},
  {id:'level_5',name:'Le\u00f4 le\u00f4',icon:'\u{1F680}',desc:'\u0110\u1ea1t Level 5',color:'#00c896',xp:50},
  {id:'level_10',name:'Th\u1ea7n \u0111\u1ed3ng',icon:'\u{1F947}',desc:'\u0110\u1ea1t Level 10',color:'#f59e0b',xp:100},
  {id:'level_20',name:'B\u1ea1n cao th\u1ee7',icon:'\u{1F3C6}',desc:'\u0110\u1ea1t Level 20',color:'#ff4d4d',xp:200},
  {id:'quiz_10',name:'Ch\u0103m luy\u1ec7n',icon:'\u{1F4DD}',desc:'Ho\u00e0n th\u00e0nh 10 Quiz',color:'#007cf0',xp:50},
  {id:'flash_50',name:'M\u00e1y nh\u1edb',icon:'\u{1F4C7}',desc:'H\u1ecdc 50 flashcard',color:'#7928ca',xp:60},
  {id:'sg_create',name:'Nh\u00e0 so\u1ea1n gi\u1ea3',icon:'\u{270D}\u{FE0F}',desc:'T\u1ea1o \u0111\u1ec1 c\u01b0\u01a1ng \u0111\u1ea7u ti\u00ean',color:'#00c896',xp:30},
  {id:'faq_create',name:'Th\u1ea7y h\u1ecfi \u0111\u00e1p',icon:'\u2753',desc:'T\u1ea1o FAQ \u0111\u1ea7u ti\u00ean',color:'#00c896',xp:30},
  {id:'tl_create',name:'S\u1eed gia',icon:'\u{1F4C5}',desc:'T\u1ea1o Timeline \u0111\u1ea7u ti\u00ean',color:'#f7971e',xp:30},
  {id:'mm3d_create',name:'Ki\u1ebfn tr\u00fac s\u01b0 tri th\u1ee9c',icon:'\u{1F5FA}\u{FE0F}',desc:'T\u1ea1o Mind Map 3D \u0111\u1ea7u ti\u00ean',color:'#7928ca',xp:40},
  {id:'coin_100',name:'Ti\u1ec3u ph\u00fa',icon:'\u{1F48E}',desc:'S\u1edf h\u1eefu 100 xu',color:'#f59e0b',xp:50},
  {id:'coin_1000',name:'Tri\u1ec7u ph\u00fa',icon:'\u{1F3E6}',desc:'S\u1edf h\u1eefu 1000 xu',color:'#ff0080',xp:500},
  {id:'all_features',name:'Kh\u00e1m ph\u00e1',icon:'\u{1F5FA}\u{FE0F}',desc:'D\u00f9ng \u0111\u1ee7 5 t\u00ednh n\u0103ng v11',color:'#7928ca',xp:100}
];

// ========== DAILY QUESTS ==========
window.DAILY_QUESTS_POOL=[
  {id:'q_quiz1',desc:'L\u00e0m 1 quiz b\u1ea5t k\u1ef3',xp:15,coins:5,check:'quiz_done',target:1},
  {id:'q_quiz3',desc:'L\u00e0m 3 quiz',xp:40,coins:15,check:'quiz_done',target:3},
  {id:'q_flash5',desc:'H\u1ecdc 5 flashcard',xp:20,coins:8,check:'flash_view',target:5},
  {id:'q_sm2_10',desc:'\u00d4n 10 th\u1ebb SM-2',xp:30,coins:10,check:'sm2_review',target:10},
  {id:'q_sg1',desc:'T\u1ea1o 1 \u0111\u1ec1 c\u01b0\u01a1ng',xp:25,coins:12,check:'sg_create',target:1},
  {id:'q_faq1',desc:'T\u1ea1o 1 FAQ',xp:20,coins:10,check:'faq_create',target:1},
  {id:'q_reader1',desc:'D\u00f9ng AI Reader 1 l\u1ea7n',xp:15,coins:5,check:'reader_use',target:1},
  {id:'q_topic',desc:'M\u1edf 1 ch\u1ee7 \u0111\u1ec1',xp:10,coins:5,check:'topic_open',target:1},
  {id:'q_login',desc:'\u0110\u0103ng nh\u1eadp h\u00f4m nay',xp:5,coins:5,check:'login',target:1}
];

// ========== Core API: awardXP ==========
window.awardXP=function(source,amount,desc){
  var u=window.acctGetCurrentUser();
  if(!u) return;
  var oldLevel=u.level;
  u.xp=(u.xp||0)+amount;
  u.level=window.getLevelFromXP(u.xp);
  // Award coins
  var coinReward=Math.round(amount*0.3);
  u.coins=(u.coins||0)+coinReward;
  window.acctSaveUser(u);
  window.acctRenderHeader();
  // Log XP event
  _tx(STORE_XP,'readwrite',function(st){
    st.add({userId:u.id,source:source,amount:amount,desc:desc,ts:Date.now()});
  });
  // Level up notification
  if(u.level>oldLevel){
    _showLevelUp(u.level);
  } else if(amount>=15){
    _showXPGain(amount,coinReward,desc);
  }
  // Check badges
  window.checkBadges();
  // Update daily quests
  window.updateQuests(source,1);
  // Streak
  window.updateStreak();
};

function _showXPGain(xp,coins,desc){
  var n=document.createElement('div');
  n.style.cssText='position:fixed;top:80px;right:20px;background:linear-gradient(135deg,#00c896,#007cf0);color:#fff;padding:12px 20px;border-radius:12px;box-shadow:0 6px 24px rgba(0,200,150,.4);z-index:9999;font-weight:700;animation:slideInRight .3s ease;font-size:.95rem';
  n.innerHTML='+'+xp+' XP  \u2022  +'+coins+' \u{1F48E}<div style="font-size:.75rem;font-weight:400;opacity:.9;margin-top:2px">'+desc+'</div>';
  document.body.appendChild(n);
  setTimeout(function(){n.style.animation='slideOutRight .3s ease forwards';setTimeout(function(){n.remove();},300);},2500);
}

function _showLevelUp(level){
  var overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);animation:fadeIn .3s';
  overlay.innerHTML='<div style="background:linear-gradient(135deg,#7928ca,#ff4d4d);color:#fff;padding:40px 50px;border-radius:24px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:slideUp .4s cubic-bezier(.34,1.56,.64,1)">'
    +'<div style="font-size:5rem;margin-bottom:10px">\u{1F389}</div>'
    +'<div style="font-size:1.2rem;opacity:.9">CH\u00daC M\u1eeeNG!</div>'
    +'<div style="font-size:2.5rem;font-weight:900;margin:8px 0">LEVEL '+level+'</div>'
    +'<div style="opacity:.85">B\u1ea1n \u0111\u00e3 l\u00ean c\u1ea5p</div>'
    +'<button style="margin-top:20px;background:#fff;color:#7928ca;border:none;padding:10px 24px;border-radius:10px;font-weight:700;cursor:pointer" onclick="this.parentElement.parentElement.remove()">Tuy\u1ec7t v\u1eddi!</button>'
    +'</div>';
  document.body.appendChild(overlay);
  // Confetti effect
  _confetti();
  setTimeout(function(){if(overlay.parentElement) overlay.remove();},5000);
}

function _confetti(){
  var colors=['#00c896','#007cf0','#7928ca','#ff4d4d','#f7971e','#f59e0b'];
  for(var i=0;i<80;i++){
    (function(i){
      var c=document.createElement('div');
      c.style.cssText='position:fixed;top:-20px;left:'+(Math.random()*100)+'%;width:10px;height:10px;background:'+colors[i%colors.length]+';border-radius:'+(Math.random()>0.5?'50%':'2px')+';z-index:10001;pointer-events:none;transition:all 3s cubic-bezier(.5,.2,.7,.9)';
      document.body.appendChild(c);
      setTimeout(function(){
        c.style.top=(100+Math.random()*20)+'%';
        c.style.transform='rotate('+(Math.random()*720)+'deg) translateX('+((Math.random()-0.5)*200)+'px)';
        c.style.opacity='0';
      },10);
      setTimeout(function(){c.remove();},3200);
    })(i);
  }
}

// ========== STREAK ==========
window.updateStreak=function(){
  var u=window.acctGetCurrentUser();
  if(!u) return;
  var today=new Date().toDateString();
  var last=u.lastActiveDate?new Date(u.lastActiveDate).toDateString():null;
  if(last===today) return; // Da tinh hom nay
  var yesterday=new Date(Date.now()-86400000).toDateString();
  if(last===yesterday){
    u.streak=(u.streak||0)+1;
  } else if(last!==today){
    u.streak=1; // Reset
  }
  u.lastActiveDate=Date.now();
  if(u.streak>(u.longestStreak||0)) u.longestStreak=u.streak;
  window.acctSaveUser(u);
  window.acctRenderHeader();
  window.checkBadges();
};

// ========== BADGES CHECK ==========
window.checkBadges=function(){
  var u=window.acctGetCurrentUser();
  if(!u) return;
  var newBadges=[];
  window.BADGES.forEach(function(b){
    if((u.badges||[]).indexOf(b.id)>=0) return;
    var earned=false;
    if(b.id==='first_login') earned=true;
    else if(b.id==='streak_3' && u.streak>=3) earned=true;
    else if(b.id==='streak_7' && u.streak>=7) earned=true;
    else if(b.id==='streak_30' && u.streak>=30) earned=true;
    else if(b.id==='streak_100' && u.streak>=100) earned=true;
    else if(b.id==='level_5' && u.level>=5) earned=true;
    else if(b.id==='level_10' && u.level>=10) earned=true;
    else if(b.id==='level_20' && u.level>=20) earned=true;
    else if(b.id==='coin_100' && u.coins>=100) earned=true;
    else if(b.id==='coin_1000' && u.coins>=1000) earned=true;
    if(earned){
      newBadges.push(b);
      if(!u.badges) u.badges=[];
      u.badges.push(b.id);
    }
  });
  if(newBadges.length){
    u.xp+=newBadges.reduce(function(s,b){return s+b.xp;},0);
    window.acctSaveUser(u);
    newBadges.forEach(function(b){
      _showBadgeUnlock(b);
    });
  }
};

// Called from other modules when specific event happens
window.grantBadge=function(badgeId){
  var u=window.acctGetCurrentUser();
  if(!u) return;
  if((u.badges||[]).indexOf(badgeId)>=0) return;
  var b=window.BADGES.find(function(x){return x.id===badgeId;});
  if(!b) return;
  if(!u.badges) u.badges=[];
  u.badges.push(badgeId);
  u.xp+=b.xp;
  u.coins+=Math.round(b.xp*0.3);
  window.acctSaveUser(u);
  window.acctRenderHeader();
  _showBadgeUnlock(b);
};

function _showBadgeUnlock(badge){
  var n=document.createElement('div');
  n.style.cssText='position:fixed;top:120px;right:20px;background:linear-gradient(135deg,'+badge.color+',#fff2);color:#fff;padding:16px 20px;border-radius:14px;box-shadow:0 6px 24px rgba(0,0,0,.4);z-index:9999;font-weight:700;display:flex;gap:12px;align-items:center;animation:slideInRight .4s ease;max-width:320px';
  n.innerHTML='<div style="font-size:2.4rem">'+badge.icon+'</div><div><div style="font-size:.75rem;opacity:.9">HUY HI\u1ec6U M\u1edaI!</div><div style="font-size:1rem">'+badge.name+'</div><div style="font-size:.72rem;font-weight:400;opacity:.85">+'+badge.xp+' XP</div></div>';
  document.body.appendChild(n);
  setTimeout(function(){n.style.animation='slideOutRight .3s ease forwards';setTimeout(function(){n.remove();},300);},4000);
}

// ========== DAILY QUESTS ==========
var QUESTS_KEY='yeahedu_v12_quests';

window.getDailyQuests=function(){
  var today=new Date().toDateString();
  var saved=null;
  try{saved=JSON.parse(localStorage.getItem(QUESTS_KEY)||'null');}catch(e){}
  if(saved && saved.date===today) return saved;
  // Rotate 3 quests random
  var pool=window.DAILY_QUESTS_POOL.slice();
  pool.sort(function(){return Math.random()-0.5;});
  var quests=pool.slice(0,3).map(function(q){return Object.assign({},q,{progress:0,done:false});});
  // Always include "login" if not
  if(!quests.find(function(q){return q.id==='q_login';})) quests[2]=Object.assign({},window.DAILY_QUESTS_POOL.find(function(q){return q.id==='q_login';}),{progress:1,done:true});
  var data={date:today,quests:quests};
  localStorage.setItem(QUESTS_KEY,JSON.stringify(data));
  return data;
};

window.updateQuests=function(check,delta){
  var qData=window.getDailyQuests();
  var changed=false;
  qData.quests.forEach(function(q){
    if(q.done) return;
    if(q.check===check){
      q.progress+=delta;
      if(q.progress>=q.target){
        q.done=true;
        var u=window.acctGetCurrentUser();
        if(u){
          u.xp+=q.xp;
          u.coins+=q.coins;
          window.acctSaveUser(u);
          window.acctRenderHeader();
          _showQuestComplete(q);
        }
      }
      changed=true;
    }
  });
  if(changed) localStorage.setItem(QUESTS_KEY,JSON.stringify(qData));
};

function _showQuestComplete(q){
  var n=document.createElement('div');
  n.style.cssText='position:fixed;bottom:80px;right:20px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:14px 20px;border-radius:12px;box-shadow:0 6px 24px rgba(34,197,94,.4);z-index:9999;font-weight:700;animation:slideInRight .3s';
  n.innerHTML='\u2705 Ho\u00e0n th\u00e0nh nhi\u1ec7m v\u1ee5!<div style="font-size:.8rem;font-weight:400;opacity:.9">'+q.desc+' \u2022 +'+q.xp+' XP, +'+q.coins+' \u{1F48E}</div>';
  document.body.appendChild(n);
  setTimeout(function(){n.style.animation='slideOutRight .3s ease forwards';setTimeout(function(){n.remove();},300);},3500);
}

// Init: grant login badge/quest on app open
window.addEventListener('DOMContentLoaded',function(){
  setTimeout(function(){
    if(window.acctGetCurrentUser()){
      window.grantBadge('first_login');
      window.updateStreak();
      window.updateQuests('login',1);
    }
  },1500);
});

console.log('[v12 Module 18] Gamification loaded ('+window.BADGES.length+' badges, '+window.DAILY_QUESTS_POOL.length+' quests)');
})();
