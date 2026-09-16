// ================================================================
// YeahEdu-TDA v12 "PhoenixEdu Pro" - Module 10: SM-2 Spaced Repetition
// Version tieng Viet co dau (ASCII-escaped)
// ================================================================
(function(){
  'use strict';
  var L = window.L.sm2, C = window.L.common;
  var DB_NAME='YeahEdu_v11', DB_VER=2, STORE='sm2_cards';

  function _openDB(cb){
    var req=indexedDB.open(DB_NAME,DB_VER);
    req.onupgradeneeded=function(e){
      var db=e.target.result;
      if(!db.objectStoreNames.contains(STORE)){
        var st=db.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});
        st.createIndex('deck','deck',{unique:false});
        st.createIndex('due','due',{unique:false});
      }
      ['sg_docs','faq_docs','timeline_docs','mindmap_docs','user_profiles','friends','custom_topics'].forEach(function(s){
        if(!db.objectStoreNames.contains(s)) db.createObjectStore(s,{keyPath:'id',autoIncrement:true});
      });
      // xp_events has userId index for fast per-user queries
      if(!db.objectStoreNames.contains('xp_events')){
        var xp=db.createObjectStore('xp_events',{keyPath:'id',autoIncrement:true});
        xp.createIndex('userId','userId',{unique:false});
        xp.createIndex('ts','ts',{unique:false});
      }
    };
    req.onsuccess=function(){cb(null,req.result);};
    req.onerror=function(){cb(req.error);};
  }
  function _tx(store,mode,fn){
    _openDB(function(err,db){
      if(err) return console.warn('DB error',err);
      var tx=db.transaction([store],mode);
      fn(tx.objectStore(store),tx);
    });
  }

  function _sm2Update(card,q){
    if(q<3){card.reps=0;card.interval=1;}
    else{
      if(card.reps===0) card.interval=1;
      else if(card.reps===1) card.interval=6;
      else card.interval=Math.round(card.interval*card.ef);
      card.reps++;
    }
    card.ef=card.ef+(0.1-(5-q)*(0.08+(5-q)*0.02));
    if(card.ef<1.3) card.ef=1.3;
    card.due=Date.now()+card.interval*86400000;
    card.lastReview=Date.now();
    card.totalReviews=(card.totalReviews||0)+1;
    return card;
  }

  window.sm2ImportFlash=function(flashData,deckName){
    if(!flashData||!flashData.cards||!flashData.cards.length){
      if(window.toast) toast(C.error,'Kh\u00f4ng c\u00f3 flashcard \u0111\u1ec3 import','error');
      return;
    }
    var deck=deckName||flashData.title||'B\u1ed9 th\u1ebb '+Date.now();
    _tx(STORE,'readwrite',function(st){
      var count=0;
      flashData.cards.forEach(function(c){
        st.add({deck:deck,front:c.front,back:c.back,hint:c.hint||'',icon:c.icon||'',
          ef:2.5,interval:0,reps:0,due:Date.now(),createdAt:Date.now(),totalReviews:0});
        count++;
      });
      if(window.toast) toast(C.success,L.imported.replace('{n}',count).replace('{d}',deck),'success');
      if(window.awardXP) window.awardXP('sm2_import',count*2,'Import '+count+' th\u1ebb v\u00e0o SM-2');
      if(window.sm2RenderDashboard) setTimeout(window.sm2RenderDashboard,300);
    });
  };

  function _getDueCards(cb){
    _tx(STORE,'readonly',function(st){
      var now=Date.now(),cards=[];
      st.index('due').openCursor(IDBKeyRange.upperBound(now)).onsuccess=function(e){
        var c=e.target.result;
        if(c){cards.push(c.value);c.continue();} else cb(cards);
      };
    });
  }
  function _getAllCards(cb){
    _tx(STORE,'readonly',function(st){
      var cards=[];
      st.openCursor().onsuccess=function(e){
        var c=e.target.result;
        if(c){cards.push(c.value);c.continue();} else cb(cards);
      };
    });
  }

  var _session={cards:[],idx:0,showAnswer:false,stats:{again:0,hard:0,good:0,easy:0}};

  window.sm2Start=function(){
    _getDueCards(function(cards){
      if(!cards.length){
        _getAllCards(function(all){
          if(!all.length){ _showMsg(L.noCards); return; }
          all.sort(function(a,b){return a.due-b.due;});
          var d=Math.ceil((all[0].due-Date.now())/86400000);
          _showMsg(L.nextDue.replace('{n}',d));
        });
        return;
      }
      cards.sort(function(){return Math.random()-0.5;});
      _session={cards:cards,idx:0,showAnswer:false,stats:{again:0,hard:0,good:0,easy:0}};
      _renderCard();
    });
  };

  function _showMsg(msg){
    var el=document.getElementById('sm2Area');
    if(!el) return;
    el.innerHTML='<div class="alert alert-info" style="text-align:center;padding:24px">'+msg+'</div>'+
      '<div style="text-align:center;margin-top:16px"><button class="btn btn-primary" onclick="sm2RenderDashboard()">'+L.backDash+'</button></div>';
  }

  function _renderCard(){
    var el=document.getElementById('sm2Area');
    if(!el) return;
    if(_session.idx>=_session.cards.length){ el.innerHTML=_renderComplete(); return; }
    var c=_session.cards[_session.idx];
    var progress=((_session.idx/_session.cards.length)*100).toFixed(0);
    var html='<div class="sm2-review-container">'
      +'<div class="progress-bar" style="margin-bottom:16px"><div class="progress-fill" style="width:'+progress+'%"></div></div>'
      +'<div style="text-align:center;color:var(--text2);margin-bottom:16px">'+L.cardOf.replace('{i}',_session.idx+1).replace('{n}',_session.cards.length)+' <b>'+_esc(c.deck)+'</b></div>'
      +'<div class="sm2-card '+(_session.showAnswer?'':'hidden-answer')+'" onclick="sm2Flip()">'
      +'<div style="font-size:2rem;margin-bottom:12px">'+(c.icon||'')+'</div>'
      +'<div class="sm2-question">'+_esc(c.front)+'</div>'
      +(c.hint?'<div style="color:var(--text2);font-size:.88rem;margin-top:6px">'+L.hint+': '+_esc(c.hint)+'</div>':'')
      +'<div class="sm2-answer">'+_esc(c.back)+'</div>'
      +(_session.showAnswer?'':'<div style="margin-top:20px;color:var(--text2);font-size:.85rem">'+L.tapToSee+'</div>')
      +'</div>';
    if(_session.showAnswer){
      html+='<div class="sm2-rating">'
        +'<button class="r-again" onclick="sm2Rate(0)">'+L.rateAgain+'<small>'+L.ratedIn+'</small></button>'
        +'<button class="r-hard"  onclick="sm2Rate(3)">'+L.rateHard +'<small>'+_predictInterval(c,3)+'</small></button>'
        +'<button class="r-good"  onclick="sm2Rate(4)">'+L.rateGood +'<small>'+_predictInterval(c,4)+'</small></button>'
        +'<button class="r-easy"  onclick="sm2Rate(5)">'+L.rateEasy +'<small>'+_predictInterval(c,5)+'</small></button>'
        +'</div>';
    }
    html+='</div>';
    el.innerHTML=html;
  }

  function _predictInterval(card,q){
    var clone=JSON.parse(JSON.stringify(card));
    var u=_sm2Update(clone,q);
    var days=u.interval;
    if(days<1) return '<1 ng\u00e0y';
    if(days===1) return '1 ng\u00e0y';
    if(days<30) return days+' ng\u00e0y';
    if(days<365) return Math.round(days/30)+' th\u00e1ng';
    return Math.round(days/365)+' n\u0103m';
  }

  window.sm2Flip=function(){ _session.showAnswer=true; _renderCard(); };

  window.sm2Rate=function(q){
    var c=_session.cards[_session.idx];
    _sm2Update(c,q);
    if(q===0) _session.stats.again++;
    else if(q===3) _session.stats.hard++;
    else if(q===4) _session.stats.good++;
    else _session.stats.easy++;
    _tx(STORE,'readwrite',function(st){st.put(c);});
    if(window.awardXP) window.awardXP('sm2_review',q>=3?5:2,'\u00d4n th\u1ebb SM-2');
    _session.idx++; _session.showAnswer=false;
    _renderCard();
  };

  function _renderComplete(){
    var s=_session.stats, total=s.again+s.hard+s.good+s.easy;
    if(window.awardXP) window.awardXP('sm2_session',10,'Ho\u00e0n th\u00e0nh phi\u00ean SM-2');
    return '<div class="sm2-review-container" style="text-align:center;padding:20px">'
      +'<h2 style="color:var(--c1);margin-bottom:16px">\u{1F389} '+L.complete+'</h2>'
      +'<p style="color:var(--text2);margin-bottom:20px">'+L.reviewedN.replace('{n}',total)+'</p>'
      +'<div class="sm2-stats">'
      +'<div class="sm2-stat"><div class="sv">'+s.again+'</div><div class="sl">'+L.rateAgain+'</div></div>'
      +'<div class="sm2-stat"><div class="sv">'+s.hard +'</div><div class="sl">'+L.rateHard+'</div></div>'
      +'<div class="sm2-stat"><div class="sv">'+s.good +'</div><div class="sl">'+L.rateGood+'</div></div>'
      +'<div class="sm2-stat"><div class="sv">'+s.easy +'</div><div class="sl">'+L.rateEasy+'</div></div>'
      +'</div>'
      +'<button class="btn btn-primary" onclick="sm2Start()">'+L.keepGoing+'</button> '
      +'<button class="btn btn-secondary" onclick="sm2RenderDashboard()">'+L.backDash+'</button>'
      +'</div>';
  }

  window.sm2RenderDashboard=function(){
    var el=document.getElementById('sm2Area');
    if(!el) return;
    _getAllCards(function(all){
      var now=Date.now();
      var due=all.filter(function(c){return c.due<=now;});
      var learned=all.filter(function(c){return c.reps>0;});
      var mature=all.filter(function(c){return c.interval>=21;});
      var decks={};
      all.forEach(function(c){
        if(!decks[c.deck]) decks[c.deck]={total:0,due:0};
        decks[c.deck].total++;
        if(c.due<=now) decks[c.deck].due++;
      });
      var html='<div class="sm2-stats" style="grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px">'
        +'<div class="sm2-stat"><div class="sv">'+all.length+'</div><div class="sl">'+L.totalCards+'</div></div>'
        +'<div class="sm2-stat"><div class="sv" style="color:var(--c4)">'+due.length+'</div><div class="sl">'+L.dueCards+'</div></div>'
        +'<div class="sm2-stat"><div class="sv">'+learned.length+'</div><div class="sl">'+L.learnedCards+'</div></div>'
        +'<div class="sm2-stat"><div class="sv" style="color:var(--c2)">'+mature.length+'</div><div class="sl">'+L.matureCards+'</div></div>'
        +'</div>';
      if(due.length){
        html+='<button class="btn btn-primary btn-block" style="margin-bottom:20px;padding:16px" onclick="sm2Start()">\u{1F680} '+L.startReviewN.replace('{n}',due.length)+'</button>';
      } else {
        html+='<div class="alert alert-success" style="margin-bottom:20px;text-align:center">\u{1F389} '+L.allDone+'</div>';
      }
      html+='<h3 style="margin-bottom:12px;color:var(--text2);font-size:.9rem;text-transform:uppercase">'+L.yourDecks+'</h3>';
      var keys=Object.keys(decks);
      if(!keys.length) html+='<div class="alert alert-info">'+L.noDecks+'</div>';
      else keys.forEach(function(name){
        var d=decks[name];
        var pct=d.total?Math.round(((d.total-d.due)/d.total)*100):0;
        html+='<div class="card" style="margin-bottom:10px;padding:14px">'
          +'<div style="display:flex;justify-content:space-between;align-items:center">'
          +'<div><div style="font-weight:700">\u{1F4DA} '+_esc(name)+'</div>'
          +'<div style="font-size:.85rem;color:var(--text2)">'+d.total+' th\u1ebb \u2022 '+d.due+' \u0111\u1ebfn h\u1ea1n \u2022 '+pct+'% ok</div></div>'
          +'<button class="btn btn-danger btn-sm" onclick="sm2DeleteDeck(\''+_esc(name).replace(/\'/g,'&#39;')+'\')">\u{1F5D1}\u{FE0F}</button>'
          +'</div>'
          +'<div class="progress-bar" style="margin-top:8px;height:6px"><div class="progress-fill" style="width:'+pct+'%"></div></div>'
          +'</div>';
      });
      html+='<div style="margin-top:20px;text-align:center"><button class="btn btn-secondary btn-sm" onclick="sm2Export()">\u{1F4E5} '+L.exportBtn+'</button></div>';
      el.innerHTML=html;
    });
  };

  window.sm2DeleteDeck=function(deck){
    if(!confirm(L.deckDelConfirm.replace('{d}',deck))) return;
    _tx(STORE,'readwrite',function(st){
      st.index('deck').openCursor(IDBKeyRange.only(deck)).onsuccess=function(e){
        var c=e.target.result;
        if(c){c.delete();c.continue();}
        else { if(window.toast) toast(C.deleted,L.deckDeleted,'info'); window.sm2RenderDashboard(); }
      };
    });
  };

  window.sm2Export=function(){
    _getAllCards(function(all){
      var blob=new Blob([JSON.stringify(all,null,2)],{type:'application/json'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url; a.download='yeahedu-sm2-'+new Date().toISOString().slice(0,10)+'.json';
      a.click(); URL.revokeObjectURL(url);
      if(window.toast) toast(C.exportSuccess,L.exported.replace('{n}',all.length),'success');
    });
  };

  function _esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  window.sm2Init=function(){ _openDB(function(err){ if(!err) console.log('[SM-2 v12] DB ready'); }); };

  console.log('[v12 Module 10] SM-2 Vietnamese loaded');
})();
