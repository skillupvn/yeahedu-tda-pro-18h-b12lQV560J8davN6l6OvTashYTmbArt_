// ================================================================
// YeahEdu-TDA v12 - Module 12: FAQ Generator (Vietnamese)
// ================================================================
(function(){
'use strict';
var L=window.L.faq, C=window.L.common;
var STORE='faq_docs', DB_NAME='YeahEdu_v11';

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

function _buildPrompt(source,count,level){
  var lvlMap={basic:'C\u01a1 b\u1ea3n - dinh nghia, khai niem',medium:'Trung binh - ap dung, so sanh',advanced:'Nang cao - phan tich sau, van dung',mixed:'Tron lan tu co ban den nang cao'};
  return 'B\u1ea1n l\u00e0 gi\u00e1o vi\u00ean chuy\u00ean so\u1ea1n FAQ. T\u1ea1o \u0111\u00fang '+count+' c\u00e2u h\u1ecfi + tr\u1ea3 l\u1eddi tieng Viet t\u1eeb t\u00e0i li\u1ec7u. \u0110\u1ed9 kh\u00f3: '+lvlMap[level]+'\n\n'
    +'JSON: {"title":"...","items":[{"q":"...","a":"...","level":"basic|medium|advanced","topic":"...","tags":["..."]}]}\n\n'
    +'T\u00c0I LI\u1ec6U:\n"""\n'+source+'\n"""\n\nCH\u1ec8 JSON.';
}

window.faqGenerate=async function(source,opts){
  opts=opts||{};
  if(!source||source.trim().length<50){ if(window.toast) toast(C.error,C.needMoreText,'error'); return; }
  if(typeof window.callAI!=='function'){ if(window.toast) toast(C.error,C.aiNotReady,'error'); return; }
  var count=opts.count||15, level=opts.level||'mixed';
  var el=document.getElementById('faqArea');
  if(el) el.innerHTML='<div class="spin-wrap"><div class="spinner"></div><div class="spin-text">\u{1F9D0} '+L.generating.replace('{n}',count)+'<span class="spin-dots"></span></div></div>';
  try{
    var prompt=_buildPrompt(source.slice(0,12000),count,level);
    var response=await window.callAI([{role:'system',content:'Ban la chuyen gia giao duc, tra ve JSON hop le.'},{role:'user',content:prompt}]);
    var data=_parseJSON(response);
    if(!data||!data.items) throw new Error(C.aiInvalidResp);
    data.ts=Date.now(); data.sourcePreview=source.slice(0,200);
    _tx('readwrite',function(st){st.add(data);});
    window.faqRender(data);
    if(window.awardXP) window.awardXP('faq_create',15,'T\u1ea1o FAQ');
    if(window.toast) toast(C.success,L.created.replace('{n}',data.items.length),'success');
  }catch(err){
    console.error('FAQ',err);
    if(el) el.innerHTML='<div class="alert alert-error">'+_esc(err.message)+'</div><button class="btn btn-secondary" onclick="faqOpenDialog()">'+C.tryAgain+'</button>';
  }
};

function _parseJSON(text){if(!text) return null; text=text.replace(/```json\s*/gi,'').replace(/```\s*$/g,'').trim(); var s=text.indexOf('{'),e=text.lastIndexOf('}'); if(s<0||e<0) return null; try{return JSON.parse(text.slice(s,e+1));}catch(err){return null;}}

window.faqRender=function(data){
  var el=document.getElementById('faqArea');
  if(!el) return;
  if(!data){ el.innerHTML='<div class="alert alert-info">'+L.empty+'</div>'; return; }
  window.__faqLastData=data;
  var lvlColors={basic:'var(--c1)',medium:'var(--c2)',advanced:'var(--c3)'};
  var lvlNames={basic:L.levelBasic,medium:L.levelMedium,advanced:L.levelAdvanced};
  var html='<div class="faq-container">'
    +'<div class="card" style="background:linear-gradient(135deg,rgba(0,200,150,.08),rgba(0,124,240,.08))">'
    +'<h1 style="font-size:1.4rem;color:var(--c1);margin-bottom:8px">\u2753 '+_esc(data.title||L.dashTitle)+'</h1>'
    +'<div style="color:var(--text2);font-size:.9rem">'+data.items.length+' '+L.questions+' \u2022 '+L.createdAt+' '+new Date(data.ts||Date.now()).toLocaleString('vi')+'</div>'
    +'<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">';
  ['all','basic','medium','advanced'].forEach(function(l){
    var label=l==='all'?C.filterAll:lvlNames[l];
    var cnt=l==='all'?data.items.length:data.items.filter(function(i){return i.level===l;}).length;
    html+='<button class="chip" onclick="faqFilter(\''+l+'\')" data-lvl="'+l+'">'+label+' ('+cnt+')</button>';
  });
  html+='</div></div><div id="faqList">';
  data.items.forEach(function(item,i){
    var color=lvlColors[item.level]||'var(--text2)';
    html+='<div class="faq-item" data-level="'+(item.level||'medium')+'" onclick="faqToggle(this)">'
      +'<div class="faq-question">'
      +'<div style="display:flex;align-items:center;flex:1;min-width:0"><span class="faq-num">'+(i+1)+'</span><span>'+_esc(item.q)+'</span></div>'
      +'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:.7rem;padding:2px 8px;border-radius:10px;background:'+color+'20;color:'+color+';font-weight:700">'+(lvlNames[item.level]||L.levelMedium)+'</span><span class="faq-toggle">+</span></div>'
      +'</div><div class="faq-answer">'+_esc(item.a);
    if(item.topic||(item.tags&&item.tags.length)){
      html+='<div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--border)">';
      if(item.topic) html+='<span class="faq-tag" style="background:'+color+'30;color:'+color+'">'+C.topic+': '+_esc(item.topic)+'</span>';
      (item.tags||[]).forEach(function(t){html+='<span class="faq-tag">#'+_esc(t)+'</span>';});
      html+='</div>';
    }
    html+='</div></div>';
  });
  html+='</div><div style="margin-top:20px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
    +'<button class="btn btn-primary" onclick="faqExport(\'html\')">\u{1F4C4} '+C.export_html+'</button>'
    +'<button class="btn btn-secondary" onclick="faqExport(\'md\')">\u{1F4DD} '+C.export_md+'</button>'
    +'<button class="btn btn-secondary" onclick="faqExport(\'pdf\')">\u{1F5A8}\u{FE0F} '+C.print_pdf+'</button>'
    +'<button class="btn btn-secondary" onclick="faqHistory()">\u{1F4DC} '+C.history+'</button>'
    +'<button class="btn btn-secondary" onclick="faqOpenDialog()">\u2795 '+C.create+'</button>'
    +'</div></div>';
  el.innerHTML=html;
};

window.faqToggle=function(el){el.classList.toggle('open');};
window.faqFilter=function(level){
  document.querySelectorAll('#faqList .faq-item').forEach(function(el){el.style.display=(level==='all'||el.dataset.level===level)?'':'none';});
  document.querySelectorAll('.faq-container .chip').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-lvl')===level);});
};

window.faqOpenDialog=function(){
  var el=document.getElementById('faqArea');
  if(!el) return;
  var readerText=(window.ST&&window.ST.reader&&window.ST.reader.inputText)||'';
  el.innerHTML='<div class="card"><div class="card-title">\u2753 '+L.dialogTitle+'</div>'
    +'<div class="form-row cols-2" style="margin-top:14px">'
    +'<div class="fgroup"><label>'+C.count+'</label><select id="faqCount"><option>10</option><option selected>15</option><option>20</option><option>30</option></select></div>'
    +'<div class="fgroup"><label>'+C.difficulty+'</label>'
    +'<select id="faqLevel"><option value="basic">'+L.levelBasic+'</option><option value="medium">'+L.levelMedium+'</option><option value="advanced">'+L.levelAdvanced+'</option><option value="mixed" selected>'+L.levelMixed+'</option></select>'
    +'</div></div>'
    +'<div class="fgroup" style="margin-top:12px"><label>'+C.source+'</label><textarea id="faqSource" style="min-height:220px" placeholder="'+C.sourceHint+'">'+_esc(readerText)+'</textarea></div>'
    +'<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">'
    +'<button class="btn btn-primary" onclick="faqRun()">\u{1F680} '+L.startBtn+'</button>'
    +'<button class="btn btn-secondary" onclick="faqHistory()">\u{1F4DC} '+C.history+'</button>'
    +'</div></div>';
};

window.faqRun=function(){window.faqGenerate(document.getElementById('faqSource').value,{count:parseInt(document.getElementById('faqCount').value)||15,level:document.getElementById('faqLevel').value});};

window.faqHistory=function(){
  var el=document.getElementById('faqArea');
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
          html+='<div class="card" style="margin-bottom:10px;padding:12px 14px"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">'
            +'<div><div style="font-weight:700">\u2753 '+_esc(it.title||'FAQ')+'</div>'
            +'<div style="font-size:.8rem;color:var(--text2)">'+new Date(it.ts).toLocaleString('vi')+' \u2022 '+(it.items?it.items.length:0)+' '+L.questions+'</div></div>'
            +'<div style="display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="faqOpen('+it.id+')">'+C.open+'</button>'
            +'<button class="btn btn-danger btn-sm" onclick="faqDelete('+it.id+')">'+C.delete_btn+'</button></div></div></div>';
        });
        html+='</div><div style="margin-top:14px"><button class="btn btn-secondary" onclick="faqOpenDialog()">\u2795 '+C.create+'</button></div></div>';
        el.innerHTML=html;
      }
    };
  });
};

window.faqOpen=function(id){_tx('readonly',function(st){st.get(id).onsuccess=function(e){if(e.target.result) window.faqRender(e.target.result);};});};
window.faqDelete=function(id){if(!confirm(C.confirmDelete)) return; _tx('readwrite',function(st){st.delete(id); setTimeout(window.faqHistory,200);});};

window.faqExport=function(fmt){
  var d=window.__faqLastData;
  if(!d){ if(window.toast) toast(C.error,'Ch\u01b0a c\u00f3 FAQ','error'); return; }
  var safeName=(d.title||'faq').replace(/[^\w\u00c0-\u1EF9\s-]/g,'').replace(/\s+/g,'-').slice(0,60);
  if(fmt==='md'){
    var md='# '+(d.title||'FAQ')+'\n\n';
    d.items.forEach(function(it,i){md+='## '+(i+1)+'. '+it.q+'\n\n'+it.a+'\n\n---\n\n';});
    _download(md,safeName+'.md','text/markdown');
    return;
  }
  // v12.5 template shared đẹp
  var lvlLabels = {basic:'Cơ bản',medium:'Trung bình',advanced:'Nâng cao'};
  var body = '';
  // Group by level
  var byLevel = {basic:[],medium:[],advanced:[],other:[]};
  d.items.forEach(function(it){
    if(byLevel[it.level]) byLevel[it.level].push(it);
    else byLevel.other.push(it);
  });
  ['basic','medium','advanced','other'].forEach(function(lvl){
    var items = byLevel[lvl];
    if(!items.length) return;
    if(lvl !== 'other') body += '<h2>' + (lvl==='basic'?'🌱 ':lvl==='medium'?'📘 ':'🎓 ') + lvlLabels[lvl] + ' (' + items.length + ' câu)</h2>';
    else body += '<h2>❓ Khác</h2>';
    items.forEach(function(it, i){
      body += '<div class="faq-q">'
        + '<h3>' + (i+1) + '. ' + _esc(it.q) + '</h3>'
        + '<p>' + _esc(it.a) + '</p>';
      if(it.topic || (it.tags && it.tags.length)){
        body += '<div style="margin-top:8px;font-size:.82rem;color:#666">';
        if(it.topic) body += '<b>Chủ đề:</b> ' + _esc(it.topic) + ' &nbsp;·&nbsp; ';
        if(it.tags && it.tags.length) body += '<b>Tags:</b> ' + it.tags.map(_esc).join(', ');
        body += '</div>';
      }
      body += '</div>';
    });
  });
  var html = window.yeExportDoc ? window.yeExportDoc({
    title: d.title || 'FAQ - Câu hỏi thường gặp',
    subtitle: d.items.length + ' câu hỏi được AI sinh tự động',
    badge: 'CÂU HỎI THƯỜNG GẶP',
    body: body,
    showPrint: fmt !== 'pdf'
  }) : ('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FAQ</title></head><body>' + body + '</body></html>');
  if(fmt==='html'){ window.yeDownloadDoc ? window.yeDownloadDoc(html, safeName+'.html') : _download(html, safeName+'.html','text/html'); }
  else if(fmt==='pdf'){ window.yePrintDoc ? window.yePrintDoc(html) : (function(){var w=window.open('','_blank');w.document.write(html);w.document.close();setTimeout(function(){w.print();},500);})(); }
};

function _download(c,n,t){var b=new Blob([c],{type:t});var u=URL.createObjectURL(b);var a=document.createElement('a');a.href=u;a.download=n;a.click();URL.revokeObjectURL(u);}
function _esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
console.log('[v12 Module 12] FAQ Vietnamese loaded');
})();
