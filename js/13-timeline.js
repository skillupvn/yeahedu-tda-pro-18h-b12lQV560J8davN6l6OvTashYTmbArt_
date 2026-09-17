// ================================================================
// YeahEdu-TDA v12 - Module 13: Timeline (Vietnamese)
// ================================================================
(function(){
'use strict';
var L=window.L.tl, C=window.L.common;
var STORE='timeline_docs', DB_NAME='YeahEdu_v11';

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

function _buildPrompt(source,kind){
  return 'B\u1ea1n l\u00e0 chuy\u00ean gia r\u00fat tr\u00edch th\u00f4ng tin th\u1eddi gian. T\u1ea1o TIMELINE (d\u00f2ng th\u1eddi gian) c\u00e1c s\u1ef1 ki\u1ec7n quan tr\u1ecdng ti\u1ebfng Vi\u1ec7t. Lo\u1ea1i: '+kind+'\n\n'
    +'S\u1eafp x\u1ebfp theo thu tu tang dan.\n\n'
    +'JSON: {"title":"...","kind":"'+kind+'","events":[{"date":"1945","dateNum":1945,"title":"...","desc":"...","importance":"major|medium|minor","location":"...","figures":["..."]}]}\n\n'
    +'T\u00c0I LI\u1ec6U:\n"""\n'+source+'\n"""\n\nCH\u1ec8 JSON.';
}

window.tlGenerate=async function(source,opts){
  opts=opts||{};
  if(!source||source.trim().length<50){ if(window.toast) toast(C.error,C.needMoreText,'error'); return; }
  if(typeof window.callAI!=='function'){ if(window.toast) toast(C.error,C.aiNotReady,'error'); return; }
  var kind=opts.kind||'auto';
  var el=document.getElementById('tlArea');
  if(el) el.innerHTML='<div class="spin-wrap"><div class="spinner"></div><div class="spin-text">\u{1F9D0} '+L.generating+'<span class="spin-dots"></span></div></div>';
  try{
    var prompt=_buildPrompt(source.slice(0,12000),kind);
    var response=await window.callAI([{role:'system',content:'Ban la nha lich su/khoa hoc, tra ve JSON hop le.'},{role:'user',content:prompt}]);
    var data=_parseJSON(response);
    if(!data||!data.events) throw new Error(C.aiInvalidResp);
    data.events.sort(function(a,b){return (a.dateNum||0)-(b.dateNum||0);});
    data.ts=Date.now();
    _tx('readwrite',function(st){st.add(data);});
    window.tlRender(data);
    if(window.awardXP) window.awardXP('tl_create',15,'T\u1ea1o Timeline');
    if(window.toast) toast(C.success,L.created.replace('{n}',data.events.length),'success');
  }catch(err){
    console.error('TL',err);
    if(el) el.innerHTML='<div class="alert alert-error">'+_esc(err.message)+'</div><button class="btn btn-secondary" onclick="tlOpenDialog()">'+C.tryAgain+'</button>';
  }
};

function _parseJSON(text){if(!text) return null;text=text.replace(/```json\s*/gi,'').replace(/```\s*$/g,'').trim();var s=text.indexOf('{'),e=text.lastIndexOf('}');if(s<0||e<0) return null;try{return JSON.parse(text.slice(s,e+1));}catch(err){return null;}}

window.tlRender=function(data){
  var el=document.getElementById('tlArea');
  if(!el) return;
  if(!data||!data.events){ el.innerHTML='<div class="alert alert-info">'+L.empty+'</div>'; return; }
  window.__tlLastData=data;
  var impColors={major:'var(--c4)',medium:'var(--c5)',minor:'var(--c1)'};
  var impNames={major:L.impMajor,medium:L.impMedium,minor:L.impMinor};
  var html='<div style="max-width:900px;margin:0 auto">'
    +'<div class="card" style="background:linear-gradient(135deg,rgba(0,200,150,.08),rgba(0,124,240,.08));border-color:var(--c1)">'
    +'<h1 style="font-size:1.4rem;color:var(--c1);margin-bottom:6px">\u{1F4C5} '+_esc(data.title||L.dashTitle)+'</h1>'
    +'<div style="color:var(--text2);font-size:.88rem">'+data.events.length+' '+L.events+' \u2022 '+new Date(data.ts||Date.now()).toLocaleString('vi')+'</div>'
    +'<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">';
  ['all','major','medium','minor'].forEach(function(l){
    var label=l==='all'?C.filterAll:impNames[l];
    var cnt=l==='all'?data.events.length:data.events.filter(function(x){return x.importance===l;}).length;
    html+='<button class="chip" onclick="tlFilter(\''+l+'\')" data-imp="'+l+'">'+label+' ('+cnt+')</button>';
  });
  html+='</div></div><div class="timeline-wrap" id="tlList">';
  data.events.forEach(function(ev){
    var color=impColors[ev.importance]||'var(--c1)';
    html+='<div class="tl-event" data-imp="'+(ev.importance||'medium')+'" style="border-left:3px solid '+color+'">'
      +'<div class="tl-date" style="background:linear-gradient(135deg,'+color+','+color+')">'+_esc(ev.date||'?')+'</div>'
      +'<div class="tl-title">'+_esc(ev.title)+'</div>';
    if(ev.desc) html+='<div class="tl-desc">'+_esc(ev.desc)+'</div>';
    if(ev.location||(ev.figures&&ev.figures.length)){
      html+='<div style="margin-top:8px;font-size:.8rem;color:var(--text2)">';
      if(ev.location) html+='\u{1F4CD} '+L.location+': <b>'+_esc(ev.location)+'</b>';
      if(ev.figures&&ev.figures.length){ if(ev.location) html+=' \u2022 '; html+='\u{1F464} '+L.figures+': <b>'+ev.figures.map(_esc).join(', ')+'</b>'; }
      html+='</div>';
    }
    html+='</div>';
  });
  html+='</div><div style="margin-top:20px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
    +'<button class="btn btn-primary" onclick="tlExport(\'html\')">\u{1F4C4} '+C.export_html+'</button>'
    +'<button class="btn btn-secondary" onclick="tlExport(\'md\')">\u{1F4DD} '+C.export_md+'</button>'
    +'<button class="btn btn-secondary" onclick="tlExport(\'pdf\')">\u{1F5A8}\u{FE0F} '+C.print_pdf+'</button>'
    +'<button class="btn btn-secondary" onclick="tlHistory()">\u{1F4DC} '+C.history+'</button>'
    +'<button class="btn btn-secondary" onclick="tlOpenDialog()">\u2795 '+C.create+'</button>'
    +'</div></div>';
  el.innerHTML=html;
};

window.tlFilter=function(imp){
  document.querySelectorAll('#tlList .tl-event').forEach(function(el){el.style.display=(imp==='all'||el.dataset.imp===imp)?'':'none';});
  document.querySelectorAll('#tlArea .chip').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-imp')===imp);});
};

window.tlOpenDialog=function(){
  var el=document.getElementById('tlArea');
  if(!el) return;
  var readerText=(window.ST&&window.ST.reader&&window.ST.reader.inputText)||'';
  el.innerHTML='<div class="card"><div class="card-title">\u{1F4C5} '+L.dialogTitle+'</div>'
    +'<div class="fgroup" style="margin-top:12px"><label>'+L.kind+'</label>'
    +'<select id="tlKind">'
    +'<option value="auto" selected>'+L.kindAuto+'</option>'
    +'<option value="history">'+L.kindHistory+'</option>'
    +'<option value="science">'+L.kindScience+'</option>'
    +'<option value="biography">'+L.kindBio+'</option>'
    +'<option value="process">'+L.kindProcess+'</option>'
    +'<option value="story">'+L.kindStory+'</option>'
    +'</select></div>'
    +'<div class="fgroup" style="margin-top:12px"><label>'+C.source+'</label><textarea id="tlSource" style="min-height:220px" placeholder="'+L.sourcePh+'">'+_esc(readerText)+'</textarea></div>'
    +'<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">'
    +'<button class="btn btn-primary" onclick="tlRun()">\u{1F680} '+L.startBtn+'</button>'
    +'<button class="btn btn-secondary" onclick="tlHistory()">\u{1F4DC} '+C.history+'</button>'
    +'</div></div>';
};

window.tlRun=function(){window.tlGenerate(document.getElementById('tlSource').value,{kind:document.getElementById('tlKind').value});};

window.tlHistory=function(){
  var el=document.getElementById('tlArea');
  if(!el) return;
  _tx('readonly',function(st){
    var items=[];
    st.openCursor(null,'prev').onsuccess=function(e){
      var cur=e.target.result;
      if(cur){items.push(cur.value);cur.continue();}
      else{
        var html='<div class="card"><div class="card-title">\u{1F4DC} '+L.historyTitle.replace('{n}',items.length)+'</div><div style="margin-top:12px">';
        if(!items.length) html+='<div class="alert alert-info">'+L.empty+'</div>';
        else items.forEach(function(it){
          html+='<div class="card" style="margin-bottom:10px;padding:12px 14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">'
            +'<div><div style="font-weight:700">\u{1F4C5} '+_esc(it.title||'Timeline')+'</div>'
            +'<div style="font-size:.8rem;color:var(--text2)">'+new Date(it.ts).toLocaleString('vi')+' \u2022 '+(it.events?it.events.length:0)+' '+L.events+'</div></div>'
            +'<div style="display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="tlOpen('+it.id+')">'+C.open+'</button>'
            +'<button class="btn btn-danger btn-sm" onclick="tlDelete('+it.id+')">'+C.delete_btn+'</button></div></div></div>';
        });
        html+='</div><div style="margin-top:14px"><button class="btn btn-secondary" onclick="tlOpenDialog()">\u2795 '+C.create+'</button></div></div>';
        el.innerHTML=html;
      }
    };
  });
};

window.tlOpen=function(id){_tx('readonly',function(st){st.get(id).onsuccess=function(e){if(e.target.result) window.tlRender(e.target.result);};});};
window.tlDelete=function(id){if(!confirm(C.confirmDelete)) return; _tx('readwrite',function(st){st.delete(id); setTimeout(window.tlHistory,200);});};

window.tlExport=function(fmt){
  var d=window.__tlLastData;
  if(!d){ if(window.toast) toast(C.error,'Ch\u01b0a c\u00f3 timeline','error'); return; }
  var safeName=(d.title||'timeline').replace(/[^\w\u00c0-\u1EF9\s-]/g,'').replace(/\s+/g,'-').slice(0,60);
  if(fmt==='md'){
    var md='# '+(d.title||'Timeline')+'\n\n';
    d.events.forEach(function(ev){md+='## '+ev.date+' - '+ev.title+'\n'+(ev.desc||'')+'\n\n';});
    _download(md,safeName+'.md','text/markdown');
    return;
  }
  // v12.5 template shared đẹp
  var body='<div class="tl-wrap">';
  d.events.forEach(function(ev){
    body+='<div class="tl-event">'
      +'<div class="tl-date">'+_esc(ev.date||'?')+'</div>'
      +'<div class="tl-title">'+_esc(ev.title)+'</div>'
      +(ev.desc?'<div class="tl-desc">'+_esc(ev.desc)+'</div>':'');
    if(ev.location||(ev.figures&&ev.figures.length)){
      body+='<div style="margin-top:8px;font-size:.82rem;color:#666">';
      if(ev.location) body+='📍 <b>'+_esc(ev.location)+'</b>';
      if(ev.figures&&ev.figures.length){ if(ev.location) body+=' &nbsp;·&nbsp; '; body+='👥 '+ev.figures.map(_esc).join(', '); }
      body+='</div>';
    }
    body+='</div>';
  });
  body+='</div>';
  var html = window.yeExportDoc ? window.yeExportDoc({
    title: d.title || 'Timeline',
    subtitle: d.events.length + ' sự kiện được sắp xếp theo thời gian',
    badge: 'DÒNG THỜI GIAN',
    body: body,
    showPrint: fmt !== 'pdf'
  }) : ('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Timeline</title></head><body>'+body+'</body></html>');
  if(fmt==='html'){ window.yeDownloadDoc ? window.yeDownloadDoc(html, safeName+'.html') : _download(html, safeName+'.html','text/html'); }
  else if(fmt==='pdf'){ window.yePrintDoc ? window.yePrintDoc(html) : (function(){var w=window.open('','_blank');w.document.write(html);w.document.close();setTimeout(function(){w.print();},500);})(); }
};

function _download(c,n,t){var b=new Blob([c],{type:t});var u=URL.createObjectURL(b);var a=document.createElement('a');a.href=u;a.download=n;a.click();URL.revokeObjectURL(u);}
function _esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
console.log('[v12 Module 13] Timeline Vietnamese loaded');
})();
