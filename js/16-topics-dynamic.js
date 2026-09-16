// ================================================================
// YeahEdu-TDA v12 - Module 16: Dynamic Topics
// Tab Chu de dong - tao tu Library + User custom + 5 tinh nang moi
// ================================================================
(function(){
'use strict';
var STORE='custom_topics', DB_NAME='YeahEdu_v11';

// FIX v12.1: Cache DB connection to avoid reopening (which can block)
var _cachedDB=null;
function _openDB(cb){
  if(_cachedDB){ cb(null,_cachedDB); return; }
  var r=indexedDB.open(DB_NAME,2);
  r.onupgradeneeded=function(e){
    var db=e.target.result;
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
  r.onsuccess=function(){ _cachedDB=r.result; cb(null,_cachedDB); };
  r.onerror=function(){ cb(r.error); };
  r.onblocked=function(){ console.warn('DB open blocked - another tab has old version'); if(cb) cb('blocked'); };
}
// FIX v12.1: _tx now accepts an onError callback so caller can decrement pending
function _tx(store,mode,fn,onErr){
  _openDB(function(err,db){
    if(err){ console.warn('DB open err',err); if(onErr) onErr(err); return; }
    try{
      var t=db.transaction([store],mode);
      t.onerror=function(e){ console.warn('tx err',store,e); if(onErr) onErr(e); };
      fn(t.objectStore(store));
    }catch(e){
      console.warn('tx setup err',store,e);
      if(onErr) onErr(e);
    }
  });
}

// FIX v12.1: Library docs live in SEPARATE database 'yeahedu_library', store name 'docs'
function _libTx(fn,onErr){
  var req=indexedDB.open('yeahedu_library',1);
  req.onupgradeneeded=function(e){
    var db=e.target.result;
    if(!db.objectStoreNames.contains('docs')){
      var st=db.createObjectStore('docs',{keyPath:'id',autoIncrement:true});
      st.createIndex('ts','ts',{unique:false});
    }
  };
  req.onsuccess=function(){
    var db=req.result;
    try{
      if(!db.objectStoreNames.contains('docs')){ if(onErr) onErr('no docs store'); return; }
      var t=db.transaction(['docs'],'readonly');
      fn(t.objectStore('docs'));
    }catch(e){ console.warn('lib tx err',e); if(onErr) onErr(e); }
  };
  req.onerror=function(){ if(onErr) onErr(req.error); };
}

// Thu thap chu de tu MOI NGUON du lieu
window.dynTopicsCollect=function(cb){
  var collected={library:[],sm2:[],sg:[],faq:[],tl:[],mm3d:[],custom:[]};
  var pending=7;
  var cbCalled=false;
  function done(){
    pending--;
    if(pending<=0 && !cbCalled){ cbCalled=true; cb(collected); }
  }
  // FIX v12.1: Safety timeout - if any source hangs 5s, render with what we have
  setTimeout(function(){
    if(!cbCalled){
      cbCalled=true;
      console.warn('[Topics] Timeout waiting for sources, pending='+pending);
      cb(collected);
    }
  }, 5000);

  // 1. Tu Library (docs in yeahedu_library DB)
  _libTx(function(st){
    var items=[];
    st.openCursor().onsuccess=function(e){
      var c=e.target.result;
      if(c){items.push({id:c.value.id,title:c.value.title||'T\u00e0i li\u1ec7u',content:(c.value.content||'').slice(0,500),ts:c.value.ts||0,src:'library'});c.continue();}
      else{collected.library=items;done();}
    };
  }, function(){ done(); });
  // 2. SM-2 decks
  _tx('sm2_cards','readonly',function(st){
    var decks={};
    st.openCursor().onsuccess=function(e){
      var c=e.target.result;
      if(c){var d=c.value.deck||'Deck';if(!decks[d]) decks[d]={name:d,count:0};decks[d].count++;c.continue();}
      else{collected.sm2=Object.values(decks);done();}
    };
  }, function(){ done(); });
  // 3. Study Guides
  _tx('sg_docs','readonly',function(st){
    var items=[];
    st.openCursor(null,'prev').onsuccess=function(e){
      var c=e.target.result;
      if(c){items.push({id:c.value.id,title:c.value.title,ts:c.value.ts,sections:(c.value.sections||[]).length,src:'sg'});c.continue();}
      else{collected.sg=items;done();}
    };
  }, function(){ done(); });
  // 4. FAQ
  _tx('faq_docs','readonly',function(st){
    var items=[];
    st.openCursor(null,'prev').onsuccess=function(e){
      var c=e.target.result;
      if(c){items.push({id:c.value.id,title:c.value.title,ts:c.value.ts,count:(c.value.items||[]).length,src:'faq'});c.continue();}
      else{collected.faq=items;done();}
    };
  }, function(){ done(); });
  // 5. Timeline
  _tx('timeline_docs','readonly',function(st){
    var items=[];
    st.openCursor(null,'prev').onsuccess=function(e){
      var c=e.target.result;
      if(c){items.push({id:c.value.id,title:c.value.title,ts:c.value.ts,count:(c.value.events||[]).length,src:'tl'});c.continue();}
      else{collected.tl=items;done();}
    };
  }, function(){ done(); });
  // 6. Mind Map
  _tx('mindmap_docs','readonly',function(st){
    var items=[];
    st.openCursor(null,'prev').onsuccess=function(e){
      var c=e.target.result;
      if(c){items.push({id:c.value.id,title:c.value.title,ts:c.value.ts,count:(c.value.nodes||[]).length,src:'mm3d'});c.continue();}
      else{collected.mm3d=items;done();}
    };
  }, function(){ done(); });
  // 7. Custom topics
  _tx('custom_topics','readonly',function(st){
    var items=[];
    st.openCursor(null,'prev').onsuccess=function(e){
      var c=e.target.result;
      if(c){items.push(c.value);c.continue();}
      else{collected.custom=items;done();}
    };
  }, function(){ done(); });
};

// Render tab Chu de dong
window.dynTopicsRender=function(){
  var el=document.getElementById('tabTopics');
  if(!el) return;
  el.innerHTML='<div class="spin-wrap"><div class="spinner"></div><div class="spin-text">\u{1F4DA} \u0110ang t\u1eadp h\u1ee3p ch\u1ee7 \u0111\u1ec1</div></div>';

  window.dynTopicsCollect(function(data){
    var totalItems=data.library.length+data.sm2.length+data.sg.length+data.faq.length+data.tl.length+data.mm3d.length+data.custom.length;
    var html='<div class="sec-title">\u{1F4DA} Ch\u1ee7 \u0111\u1ec1 c\u1ee7a t\u00f4i</div>';

    // Action bar
    html+='<div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">'
      +'<button class="btn btn-primary" onclick="dynTopicNew()">\u2795 T\u1ea1o ch\u1ee7 \u0111\u1ec1 m\u1edbi</button>'
      +'<button class="btn btn-secondary" onclick="dynTopicsRender()">\u{1F504} L\u00e0m m\u1edbi</button>'
      +'<div style="flex:1;min-width:180px"><input id="dynTopicSearch" placeholder="\u{1F50D} T\u00ecm ch\u1ee7 \u0111\u1ec1..." style="width:100%;padding:10px 14px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg3);color:var(--text)" oninput="dynTopicFilter(this.value)"></div>'
      +'</div>';

    if(totalItems===0){
      html+='<div class="card" style="text-align:center;padding:40px"><div style="font-size:3rem;margin-bottom:16px">\u{1F4DD}</div>'
        +'<h3 style="margin-bottom:10px">Ch\u01b0a c\u00f3 ch\u1ee7 \u0111\u1ec1 n\u00e0o</h3>'
        +'<p style="color:var(--text2);margin-bottom:20px">Ch\u1ee7 \u0111\u1ec1 s\u1ebd t\u1ef1 \u0111\u1ed9ng xu\u1ea5t hi\u1ec7n khi b\u1ea1n:</p>'
        +'<ul style="text-align:left;max-width:400px;margin:0 auto;color:var(--text2);line-height:1.8">'
        +'<li>\u{1F4C4} Upload t\u00e0i li\u1ec7u v\u00e0o Th\u01b0 vi\u1ec7n</li>'
        +'<li>\u{1F9E0} T\u1ea1o flashcard SM-2</li>'
        +'<li>\u{1F4DD} T\u1ea1o \u0111\u1ec1 c\u01b0\u01a1ng / FAQ / Timeline / Mind Map</li>'
        +'<li>\u2795 T\u1ea1o ch\u1ee7 \u0111\u1ec1 t\u1ef1 do</li>'
        +'</ul>'
        +'<button class="btn btn-primary" style="margin-top:20px" onclick="dynTopicNew()">\u2795 T\u1ea1o ch\u1ee7 \u0111\u1ec1 \u0111\u1ea7u ti\u00ean</button>'
        +'</div>';
    } else {
      // Custom topics
      if(data.custom.length){
        html+='<div class="sec-title" style="margin-top:12px">\u{1F31F} Ch\u1ee7 \u0111\u1ec1 t\u1ef1 t\u1ea1o ('+data.custom.length+')</div>';
        html+='<div class="topic-grid-wrap" id="grid-custom">';
        data.custom.forEach(function(t){
          html+=_renderTopicCard(t.name||'Ch\u1ee7 \u0111\u1ec1',t.desc||'',t.id,'custom','\u{1F31F}','var(--c5)',{ts:t.ts});
        });
        html+='</div>';
      }
      // Library
      if(data.library.length){
        html+='<div class="sec-title" style="margin-top:20px">\u{1F4DA} T\u1eeb Th\u01b0 vi\u1ec7n ('+data.library.length+')</div>';
        html+='<div class="topic-grid-wrap" id="grid-library">';
        data.library.forEach(function(t){
          html+=_renderTopicCard(t.title,(t.content||'').slice(0,80),t.id,'library','\u{1F4C4}','var(--c2)',{ts:t.ts});
        });
        html+='</div>';
      }
      // SM-2 decks
      if(data.sm2.length){
        html+='<div class="sec-title" style="margin-top:20px">\u{1F9E0} B\u1ed9 flashcard SM-2 ('+data.sm2.length+')</div>';
        html+='<div class="topic-grid-wrap" id="grid-sm2">';
        data.sm2.forEach(function(d){
          html+=_renderTopicCard(d.name,d.count+' th\u1ebb',d.name,'sm2','\u{1F9E0}','var(--c3)');
        });
        html+='</div>';
      }
      // Study Guides
      if(data.sg.length){
        html+='<div class="sec-title" style="margin-top:20px">\u{1F4DD} \u0110\u1ec1 c\u01b0\u01a1ng ('+data.sg.length+')</div>';
        html+='<div class="topic-grid-wrap" id="grid-sg">';
        data.sg.forEach(function(t){
          html+=_renderTopicCard(t.title,t.sections+' ph\u1ea7n',t.id,'sg','\u{1F4DD}','var(--c1)',{ts:t.ts});
        });
        html+='</div>';
      }
      // FAQ
      if(data.faq.length){
        html+='<div class="sec-title" style="margin-top:20px">\u2753 B\u1ed9 FAQ ('+data.faq.length+')</div>';
        html+='<div class="topic-grid-wrap" id="grid-faq">';
        data.faq.forEach(function(t){
          html+=_renderTopicCard(t.title,t.count+' c\u00e2u',t.id,'faq','\u2753','var(--c4)',{ts:t.ts});
        });
        html+='</div>';
      }
      // Timeline
      if(data.tl.length){
        html+='<div class="sec-title" style="margin-top:20px">\u{1F4C5} Timeline ('+data.tl.length+')</div>';
        html+='<div class="topic-grid-wrap" id="grid-tl">';
        data.tl.forEach(function(t){
          html+=_renderTopicCard(t.title,t.count+' s\u1ef1 ki\u1ec7n',t.id,'tl','\u{1F4C5}','var(--c5)',{ts:t.ts});
        });
        html+='</div>';
      }
      // Mind Map
      if(data.mm3d.length){
        html+='<div class="sec-title" style="margin-top:20px">\u{1F5FA}\u{FE0F} Mind Map 3D ('+data.mm3d.length+')</div>';
        html+='<div class="topic-grid-wrap" id="grid-mm3d">';
        data.mm3d.forEach(function(t){
          html+=_renderTopicCard(t.title,t.count+' n\u00fat',t.id,'mm3d','\u{1F5FA}\u{FE0F}','#7928ca',{ts:t.ts});
        });
        html+='</div>';
      }
    }
    el.innerHTML=html;
  });
};

function _renderTopicCard(title,desc,id,src,icon,color,extras){
  extras=extras||{};
  var timeStr=extras.ts?new Date(extras.ts).toLocaleDateString('vi'):'';
  return '<div class="topic-item" data-title="'+_esc(title).toLowerCase()+'" style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;cursor:pointer;transition:all .2s" onclick="dynTopicOpen(\''+src+'\','+JSON.stringify(id).replace(/"/g,'&quot;')+')" onmouseover="this.style.borderColor=\''+color+'\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.transform=\'none\'">'
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:1.5rem">'+icon+'</span><span style="font-weight:700;color:'+color+'">'+_esc(title)+'</span></div>'
    +'<div style="color:var(--text2);font-size:.85rem;margin-bottom:8px">'+_esc(desc)+'</div>'
    +(timeStr?'<div style="color:var(--text2);font-size:.72rem">\u{1F4C5} '+timeStr+'</div>':'')
    +'<div style="margin-top:10px;display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="event.stopPropagation();dynTopicAction(\''+src+'\','+JSON.stringify(id).replace(/"/g,'&quot;')+',\'quiz\')">\u{1F4DD} Quiz</button><button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();dynTopicAction(\''+src+'\','+JSON.stringify(id).replace(/"/g,'&quot;')+',\'flash\')">\u{1F3B4} Flash</button>'
    +(src==='custom'?'<button class="btn btn-danger btn-sm" onclick="event.stopPropagation();dynTopicDelete('+id+')">\u{1F5D1}\u{FE0F}</button>':'')
    +'</div>'
    +'</div>';
}

window.dynTopicFilter=function(query){
  query=(query||'').toLowerCase();
  document.querySelectorAll('.topic-item').forEach(function(el){
    el.style.display=(el.dataset.title||'').indexOf(query)>=0?'':'none';
  });
};

window.dynTopicNew=function(){
  var name=prompt('T\u00ean ch\u1ee7 \u0111\u1ec1 m\u1edbi:');
  if(!name||!name.trim()) return;
  var desc=prompt('M\u00f4 t\u1ea3 (t\u00f9y ch\u1ecdn):','')||'';
  _tx('custom_topics','readwrite',function(st){
    st.add({name:name.trim(),desc:desc.trim(),ts:Date.now(),createdBy:(window.ST&&window.ST.currentUser)||'guest'});
  });
  if(window.toast) toast('\u0110\u00e3 t\u1ea1o','Ch\u1ee7 \u0111\u1ec1 "'+name+'"','success');
  if(window.awardXP) window.awardXP('topic_create',5,'T\u1ea1o ch\u1ee7 \u0111\u1ec1 m\u1edbi');
  setTimeout(window.dynTopicsRender,200);
};

window.dynTopicDelete=function(id){
  if(!confirm('Xo\u00e1 ch\u1ee7 \u0111\u1ec1 n\u00e0y?')) return;
  _tx('custom_topics','readwrite',function(st){st.delete(id); setTimeout(window.dynTopicsRender,200);});
};

window.dynTopicOpen=function(src,id){
  if(src==='sg' && window.sgOpen) window.sgOpen(id);
  else if(src==='faq' && window.faqOpen) window.faqOpen(id);
  else if(src==='tl' && window.tlOpen) window.tlOpen(id);
  else if(src==='mm3d' && window.mm3dOpen) window.mm3dOpen(id);
  else if(src==='library' && window.libOpenDoc) window.libOpenDoc(id);
  else if(src==='sm2'){ if(window.switchTab){var b=document.getElementById('tab-sm2');if(b) b.click();} }
  else if(src==='custom'){ if(window.toast) toast('Ch\u1ee7 \u0111\u1ec1','H\u00e3y t\u1ea1o quiz/flashcard t\u1eeb ch\u1ee7 \u0111\u1ec1 n\u00e0y','info'); }
};

window.dynTopicAction=function(src,id,action){
  // Move sang tab tuong ung + prefill
  _tx(src==='custom'?'custom_topics':src==='library'?'documents':src+'_docs','readonly',function(st){
    st.get(id).onsuccess=function(e){
      var item=e.target.result;
      if(!item) return;
      // Extract text
      var text='';
      if(src==='custom') text=item.name+'. '+item.desc;
      else if(src==='library') text=item.content||'';
      else if(src==='sg') text=item.sections?item.sections.map(function(s){return s.heading+'\n'+(s.points||[]).join('\n');}).join('\n\n'):'';
      else if(src==='faq') text=item.items?item.items.map(function(i){return i.q+' '+i.a;}).join('\n\n'):'';
      else if(src==='tl') text=item.events?item.events.map(function(e){return e.date+' '+e.title+' '+(e.desc||'');}).join('\n\n'):'';
      else if(src==='mm3d') text=item.nodes?item.nodes.map(function(n){return n.label;}).join('\n'):'';
      // Switch tab + set input
      if(action==='quiz'){
        var b=document.getElementById('tab-quiz')||document.querySelector('[onclick*="tabQuiz"]');
        if(b) b.click();
        setTimeout(function(){
          var ta=document.getElementById('qCtx')||document.getElementById('qContent')||document.getElementById('qSource');
          if(ta){ta.value=text.slice(0,3000);ta.dispatchEvent(new Event('input'));}
          if(window.ST){window.ST.sourceType='paste';}
          if(window.toast) toast('\u0110\u00e3 chuy\u1ec3n','Sang tab Tr\u1eafc nghi\u1ec7m v\u1edbi n\u1ed9i dung','success');
        },300);
      } else if(action==='flash'){
        var b=document.getElementById('tab-flash')||document.querySelector('[onclick*="tabFlash"]');
        if(b) b.click();
        setTimeout(function(){
          var ta=document.getElementById('fCtx')||document.getElementById('fContent')||document.getElementById('fSource');
          if(ta){ta.value=text.slice(0,3000);ta.dispatchEvent(new Event('input'));}
          if(window.toast) toast('\u0110\u00e3 chuy\u1ec3n','Sang tab Flashcard v\u1edbi n\u1ed9i dung','success');
        },300);
      }
    };
  });
};

function _esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

console.log('[v12 Module 16] Dynamic Topics loaded');
})();
