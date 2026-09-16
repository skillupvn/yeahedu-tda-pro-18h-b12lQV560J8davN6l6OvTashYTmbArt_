// ================================================================
// YeahEdu-TDA v12 - Module 11: Study Guide (Vietnamese)
// ================================================================
(function(){
'use strict';
var L=window.L.sg, C=window.L.common;
var STORE='sg_docs', DB_NAME='YeahEdu_v11';

function _openDB(cb){ var r=indexedDB.open(DB_NAME,2); 
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
 r.onsuccess=function(){cb(null,r.result);}; r.onerror=function(){cb(r.error);}; }
function _tx(mode,fn){ _openDB(function(err,db){ if(err) return; try{var t=db.transaction([STORE],mode); fn(t.objectStore(STORE));}catch(e){console.warn(e);} }); }

function _buildPrompt(source,options){
  var opts=options||{};
  var grade=opts.grade||(window.ST&&window.ST.grade)||'10';
  var subject=opts.subject||(window.ST&&window.ST.subject)||'chung';
  var depth=opts.depth||'medium';
  var depthMap={brief:'3-5 m\u1ee5c ch\u00ednh, m\u1ed7i m\u1ee5c 2-3 \u00fd',medium:'5-8 m\u1ee5c ch\u00ednh, m\u1ed7i m\u1ee5c 3-5 \u00fd chi ti\u1ebft',deep:'8-12 m\u1ee5c ch\u00ednh, m\u1ed7i m\u1ee5c 5-8 \u00fd k\u00e8m v\u00ed d\u1ee5 v\u00e0 \u0111\u1ecbnh ngh\u0129a'};
  return 'B\u1ea1n l\u00e0 gi\u00e1o vi\u00ean chuy\u00ean so\u1ea1n \u0111\u1ec1 c\u01b0\u01a1ng \u00f4n t\u1eadp chuy\u00ean s\u00e2u. '
    +'Nhi\u1ec7m v\u1ee5: T\u1ea1o \u0111\u1ec1 c\u01b0\u01a1ng \u00f4n t\u1eadp ti\u1ebfng Vi\u1ec7t t\u1eeb t\u00e0i li\u1ec7u d\u01b0\u1edbi \u0111\u00e2y. '
    +'M\u00f4n: '+subject+' | L\u1edbp: '+grade+' | \u0110\u1ed9 s\u00e2u: '+depthMap[depth]+'\n\n'
    +'JSON d\u1ea7u ra (kh\u00f4ng markdown fence):\n'
    +'{"title":"...","objectives":["..."],"sections":[{"heading":"...","summary":"...","points":["..."],"keyTerms":[{"term":"...","def":"..."}],"keyIdea":"...","examples":["..."]}],"keyPoints":["..."],"practiceQuestions":["..."],"furtherReading":["..."]}\n\n'
    +'T\u00c0I LI\u1ec6U:\n"""\n'+source+'\n"""\n\nCH\u1ec8 tr\u1ea3 v\u1ec1 JSON.';
}

window.sgGenerate=async function(sourceText,options){
  if(!sourceText||sourceText.trim().length<50){ if(window.toast) toast(C.error,C.needMoreText,'error'); return; }
  if(typeof window.callAI!=='function'){ if(window.toast) toast(C.error,C.aiNotReady,'error'); return; }
  var el=document.getElementById('sgArea');
  if(el) el.innerHTML='<div class="spin-wrap"><div class="spinner"></div><div class="spin-text">\u{1F9D0} '+L.generating+'<span class="spin-dots"></span></div></div>';
  try{
    var prompt=_buildPrompt(sourceText.slice(0,12000),options||{});
    var response=await window.callAI([{role:'system',content:'Ban la chuyen gia giao duc, ket qua tra ve luon la JSON hop le.'},{role:'user',content:prompt}]);
    var data=_parseJSON(response);
    if(!data||!data.sections) throw new Error(C.aiInvalidResp);
    data.ts=Date.now(); data.sourcePreview=sourceText.slice(0,200);
    _tx('readwrite',function(st){st.add(data);});
    window.sgRender(data);
    if(window.awardXP) window.awardXP('sg_create',20,'T\u1ea1o \u0111\u1ec1 c\u01b0\u01a1ng');
    if(window.toast) toast(C.success,L.created.replace('{t}',data.title||''),'success');
  }catch(err){
    console.error('SG',err);
    if(el) el.innerHTML='<div class="alert alert-error">'+_esc(err.message)+'</div><button class="btn btn-secondary" onclick="sgOpenDialog()">'+C.tryAgain+'</button>';
  }
};

function _parseJSON(text){
  if(!text) return null;
  text=text.replace(/```json\s*/gi,'').replace(/```\s*$/g,'').trim();
  var s=text.indexOf('{'), e=text.lastIndexOf('}');
  if(s<0||e<0) return null;
  try{return JSON.parse(text.slice(s,e+1));}catch(err){return null;}
}

window.sgRender=function(data){
  var el=document.getElementById('sgArea');
  if(!el) return;
  if(!data){ el.innerHTML='<div class="alert alert-info">'+L.empty+'</div>'; return; }
  window.__sgLastData=data;
  var html='<div class="sg-container">'
    +'<div class="card" style="background:linear-gradient(135deg,rgba(0,200,150,.1),rgba(0,124,240,.1));border-color:var(--c1)">'
    +'<h1 style="font-size:1.5rem;color:var(--c1);margin-bottom:10px">\u{1F4D6} '+_esc(data.title||L.dashTitle)+'</h1>';
  if(data.objectives&&data.objectives.length){
    html+='<div style="margin-top:12px"><b>\u{1F3AF} '+L.objectives+'</b><ul style="margin-top:8px;margin-left:22px">';
    data.objectives.forEach(function(o){html+='<li>'+_esc(o)+'</li>';});
    html+='</ul></div>';
  }
  html+='</div>';
  if(data.sections&&data.sections.length){
    html+='<div class="sg-toc"><h3>\u{1F4D1} '+L.toc+'</h3><ol>';
    data.sections.forEach(function(sec,i){
      html+='<li><a href="#sg-sec-'+i+'"><span>'+(i+1)+'. '+_esc(sec.heading)+'</span><span style="color:var(--text2);font-size:.75rem">'+(sec.points?sec.points.length:0)+' \u00fd</span></a></li>';
    });
    html+='</ol></div>';
    data.sections.forEach(function(sec,i){
      html+='<div class="sg-section" id="sg-sec-'+i+'"><h2>'+(i+1)+'. '+_esc(sec.heading)+'</h2>';
      if(sec.summary) html+='<p style="color:var(--text2);font-style:italic;margin-bottom:12px">'+_esc(sec.summary)+'</p>';
      if(sec.points&&sec.points.length){ html+='<ul>'; sec.points.forEach(function(p){html+='<li>'+_esc(p)+'</li>';}); html+='</ul>'; }
      if(sec.keyIdea) html+='<div class="sg-key"><b>\u{1F4A1} '+L.keyIdea+'</b> '+_esc(sec.keyIdea)+'</div>';
      if(sec.keyTerms&&sec.keyTerms.length){ html+='<h3>\u{1F511} '+L.keyTerms+'</h3><ul>'; sec.keyTerms.forEach(function(kt){html+='<li><b>'+_esc(kt.term)+':</b> '+_esc(kt.def)+'</li>';}); html+='</ul>'; }
      if(sec.examples&&sec.examples.length){ html+='<h3>\u{1F4DD} '+L.examples+'</h3><ul>'; sec.examples.forEach(function(ex){html+='<li>'+_esc(ex)+'</li>';}); html+='</ul>'; }
      html+='</div>';
    });
  }
  if(data.keyPoints&&data.keyPoints.length){
    html+='<div class="sg-section" style="background:rgba(247,151,30,.08);border-color:var(--c5)"><h2 style="color:var(--c5)">\u2b50 '+L.keyPoints+'</h2><ul>';
    data.keyPoints.forEach(function(p){html+='<li>'+_esc(p)+'</li>';});
    html+='</ul></div>';
  }
  if(data.practiceQuestions&&data.practiceQuestions.length){
    html+='<div class="sg-section" style="background:rgba(0,124,240,.08);border-color:var(--c2)"><h2 style="color:var(--c2)">\u2753 '+L.practice+'</h2><ol>';
    data.practiceQuestions.forEach(function(q){html+='<li style="margin-bottom:8px">'+_esc(q)+'</li>';});
    html+='</ol></div>';
  }
  if(data.furtherReading&&data.furtherReading.length){
    html+='<div class="sg-section"><h2>\u{1F4DA} '+L.furtherRead+'</h2><ul>';
    data.furtherReading.forEach(function(f){html+='<li>'+_esc(f)+'</li>';});
    html+='</ul></div>';
  }
  html+='<div style="text-align:center;margin-top:20px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
    +'<button class="btn btn-primary" onclick="sgExport(\'html\')">\u{1F4C4} '+C.export_html+'</button>'
    +'<button class="btn btn-secondary" onclick="sgExport(\'md\')">\u{1F4DD} '+C.export_md+'</button>'
    +'<button class="btn btn-secondary" onclick="sgExport(\'pdf\')">\u{1F5A8}\u{FE0F} '+C.print_pdf+'</button>'
    +'<button class="btn btn-secondary" onclick="sgHistory()">\u{1F4DC} '+C.history+'</button>'
    +'<button class="btn btn-secondary" onclick="sgOpenDialog()">\u2795 '+C.create+'</button>'
    +'</div></div>';
  el.innerHTML=html;
};

window.sgOpenDialog=function(){
  var el=document.getElementById('sgArea');
  if(!el) return;
  var readerText=(window.ST&&window.ST.reader&&window.ST.reader.inputText)||'';
  el.innerHTML='<div class="card">'
    +'<div class="card-title">\u{1F4DD} '+L.dialogTitle+'</div>'
    +'<div class="form-row cols-3" style="margin-top:14px">'
    +'<div class="fgroup"><label>'+C.subject+'</label><input id="sgSubject" placeholder="'+L.subjectPh+'" value="'+_esc((window.ST&&window.ST.subject)||'')+'"></div>'
    +'<div class="fgroup"><label>'+C.grade+'</label><input id="sgGrade" placeholder="'+L.gradePh+'" value="'+_esc((window.ST&&window.ST.grade)||'10')+'"></div>'
    +'<div class="fgroup"><label>'+C.depth+'</label>'
    +'<select id="sgDepth"><option value="brief">'+L.depthBrief+'</option><option value="medium" selected>'+L.depthMedium+'</option><option value="deep">'+L.depthDeep+'</option></select>'
    +'</div></div>'
    +'<div class="fgroup" style="margin-top:12px"><label>'+C.source+'</label>'
    +'<textarea id="sgSource" style="min-height:220px" placeholder="'+C.sourceHint+'">'+_esc(readerText)+'</textarea></div>'
    +'<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">'
    +'<button class="btn btn-primary" onclick="sgRun()">\u{1F680} '+L.startBtn+'</button>'
    +'<button class="btn btn-secondary" onclick="sgHistory()">\u{1F4DC} '+C.history+'</button>'
    +'</div></div>';
};

window.sgRun=function(){
  window.sgGenerate(document.getElementById('sgSource').value,{
    subject:document.getElementById('sgSubject').value,
    grade:document.getElementById('sgGrade').value,
    depth:document.getElementById('sgDepth').value
  });
};

window.sgHistory=function(){
  var el=document.getElementById('sgArea');
  if(!el) return;
  _tx('readonly',function(st){
    var items=[];
    st.openCursor(null,'prev').onsuccess=function(e){
      var cur=e.target.result;
      if(cur){items.push(cur.value);cur.continue();}
      else{
        var html='<div class="card"><div class="card-title">\u{1F4DC} '+L.historyTitle.replace('{n}',items.length)+'</div>';
        if(!items.length) html+='<div class="alert alert-info" style="margin-top:12px">'+L.empty+'</div>';
        else{
          html+='<div style="margin-top:12px">';
          items.forEach(function(it){
            var d=new Date(it.ts).toLocaleString('vi');
            html+='<div class="card" style="margin-bottom:10px;padding:12px 14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">'
              +'<div><div style="font-weight:700">\u{1F4D6} '+_esc(it.title||L.dashTitle)+'</div>'
              +'<div style="font-size:.8rem;color:var(--text2)">'+d+' \u2022 '+(it.sections?it.sections.length:0)+' '+L.sections+'</div></div>'
              +'<div style="display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="sgOpen('+it.id+')">'+C.open+'</button>'
              +'<button class="btn btn-danger btn-sm" onclick="sgDelete('+it.id+')">'+C.delete_btn+'</button></div>'
              +'</div></div>';
          });
          html+='</div>';
        }
        html+='<div style="margin-top:14px"><button class="btn btn-secondary" onclick="sgOpenDialog()">\u2795 '+C.create+'</button></div></div>';
        el.innerHTML=html;
      }
    };
  });
};

window.sgOpen=function(id){ _tx('readonly',function(st){ st.get(id).onsuccess=function(e){ if(e.target.result) window.sgRender(e.target.result); }; }); };
window.sgDelete=function(id){ if(!confirm(C.confirmDelete)) return; _tx('readwrite',function(st){st.delete(id); setTimeout(window.sgHistory,200);}); };

window.sgExport=function(fmt){
  var d=window.__sgLastData;
  if(!d){ if(window.toast) toast(C.error,'Ch\u01b0a c\u00f3 \u0111\u1ec1 c\u01b0\u01a1ng','error'); return; }
  if(fmt==='md'){ _download(_toMd(d),(d.title||'de-cuong')+'.md','text/markdown'); }
  else if(fmt==='html'){ _download(_toHtml(d),(d.title||'de-cuong')+'.html','text/html'); }
  else if(fmt==='pdf'){ var w=window.open('','_blank'); w.document.write(_toHtml(d,true)); w.document.close(); setTimeout(function(){w.print();},500); }
};

function _toMd(d){
  var md='# '+(d.title||'\u0110\u1ec1 c\u01b0\u01a1ng')+'\n\n';
  if(d.objectives) md+='## '+L.objectives+'\n'+d.objectives.map(function(o){return '- '+o;}).join('\n')+'\n\n';
  (d.sections||[]).forEach(function(s,i){
    md+='## '+(i+1)+'. '+s.heading+'\n';
    if(s.summary) md+='_'+s.summary+'_\n\n';
    if(s.points) md+=s.points.map(function(p){return '- '+p;}).join('\n')+'\n\n';
    if(s.keyIdea) md+='> **'+L.keyIdea+'** '+s.keyIdea+'\n\n';
    if(s.keyTerms) md+='**'+L.keyTerms+':**\n'+s.keyTerms.map(function(k){return '- **'+k.term+':** '+k.def;}).join('\n')+'\n\n';
    if(s.examples) md+='**'+L.examples+':**\n'+s.examples.map(function(e){return '- '+e;}).join('\n')+'\n\n';
  });
  if(d.keyPoints) md+='## '+L.keyPoints+'\n'+d.keyPoints.map(function(p){return '- '+p;}).join('\n')+'\n\n';
  if(d.practiceQuestions) md+='## '+L.practice+'\n'+d.practiceQuestions.map(function(q,i){return (i+1)+'. '+q;}).join('\n')+'\n\n';
  return md;
}
function _toHtml(d,forPrint){
  var css='body{font-family:Georgia,serif;max-width:900px;margin:40px auto;padding:20px;color:#1a1a2e;line-height:1.7}h1{color:#00c896;border-bottom:3px solid #00c896;padding-bottom:8px}h2{color:#2c3e50;margin-top:24px;border-left:4px solid #00c896;padding-left:12px}blockquote{background:#f0fff4;border-left:4px solid #27ae60;padding:12px 16px;margin:12px 0}.print-btn{position:fixed;top:16px;right:16px;padding:10px 18px;background:#00c896;color:#fff;border:none;border-radius:8px;cursor:pointer}';
  var body='<h1>'+_esc(d.title||'\u0110\u1ec1 c\u01b0\u01a1ng')+'</h1>';
  if(!forPrint) body='<button class="print-btn" onclick="window.print()">\u{1F5A8}\u{FE0F} '+C.print_pdf+'</button>'+body;
  if(d.objectives){body+='<h2>'+L.objectives+'</h2><ul>'+d.objectives.map(function(o){return '<li>'+_esc(o)+'</li>';}).join('')+'</ul>';}
  (d.sections||[]).forEach(function(s,i){
    body+='<h2>'+(i+1)+'. '+_esc(s.heading)+'</h2>';
    if(s.summary) body+='<p><em>'+_esc(s.summary)+'</em></p>';
    if(s.points) body+='<ul>'+s.points.map(function(p){return '<li>'+_esc(p)+'</li>';}).join('')+'</ul>';
    if(s.keyIdea) body+='<blockquote><b>'+L.keyIdea+'</b> '+_esc(s.keyIdea)+'</blockquote>';
  });
  if(d.keyPoints) body+='<h2>'+L.keyPoints+'</h2><ul>'+d.keyPoints.map(function(p){return '<li>'+_esc(p)+'</li>';}).join('')+'</ul>';
  if(d.practiceQuestions) body+='<h2>'+L.practice+'</h2><ol>'+d.practiceQuestions.map(function(q){return '<li>'+_esc(q)+'</li>';}).join('')+'</ol>';
  return '<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>'+_esc(d.title||'\u0110\u1ec1 c\u01b0\u01a1ng')+'</title><style>'+css+'</style></head><body>'+body+'</body></html>';
}
function _download(content,name,type){ var b=new Blob([content],{type:type}); var u=URL.createObjectURL(b); var a=document.createElement('a'); a.href=u;a.download=name;a.click(); URL.revokeObjectURL(u); }
function _esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

console.log('[v12 Module 11] Study Guide Vietnamese loaded');
})();
