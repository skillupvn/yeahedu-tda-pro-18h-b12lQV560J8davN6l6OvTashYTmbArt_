// ================================================================
// YeahEdu-TDA v11 "PhoenixEdu" - Module: 06-library-db.js
// Auto-split from monolithic v10, ASCII-only, Live-Server safe
// ================================================================

// BLOCK 6-LIB \u2014 INDEXEDDB: Th\u01b0 vi\u1ec7n t\u00e0i li\u1ec7u (G\u00f3i 5)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
var _lib_db=null;
function libOpen(){
  return new Promise(function(resolve,reject){
    if(_lib_db){resolve(_lib_db);return;}
    var req=indexedDB.open('yeahedu_library',1);
    req.onupgradeneeded=function(e){
      var db=e.target.result;
      if(!db.objectStoreNames.contains('docs')){
        var st=db.createObjectStore('docs',{keyPath:'id',autoIncrement:true});
        st.createIndex('ts','ts',{unique:false});
        st.createIndex('type','type',{unique:false});
      }
    };
    req.onsuccess=function(e){_lib_db=e.target.result;resolve(_lib_db);};
    req.onerror=function(e){reject(e.target.error);};
  });
}
async function libAdd(doc){
  var db=await libOpen();
  return new Promise(function(resolve,reject){
    var tx=db.transaction('docs','readwrite');
    doc.ts=doc.ts||Date.now();
    tx.objectStore('docs').add(doc);
    tx.oncomplete=function(){resolve(true)};
    tx.onerror=function(e){reject(e.target.error)};
  });
}
async function libGetAll(){
  var db=await libOpen();
  return new Promise(function(resolve,reject){
    var tx=db.transaction('docs','readonly');
    var req=tx.objectStore('docs').getAll();
    req.onsuccess=function(){resolve((req.result||[]).sort(function(a,b){return b.ts-a.ts}))};
    req.onerror=function(e){reject(e.target.error)};
  });
}
async function libDelete(id){
  var db=await libOpen();
  return new Promise(function(resolve,reject){
    var tx=db.transaction('docs','readwrite');
    tx.objectStore('docs').delete(id);
    tx.oncomplete=function(){resolve(true)};
    tx.onerror=function(e){reject(e.target.error)};
  });
}
// Render danh s\u00e1ch th\u01b0 vi\u1ec7n
var _libCache=[];
async function refreshLibrary(){
  try{ _libCache=await libGetAll(); renderLibrary(); }
  catch(e){ toast('L\u1ed7i th\u01b0 vi\u1ec7n',e.message,'error'); }
}
function renderLibrary(){
  var list=document.getElementById('libraryList'); if(!list) return;
  var kw=(document.getElementById('librarySearch')?.value||'').toLowerCase().trim();
  var items=_libCache.filter(function(d){
    if(!kw) return true;
    return (d.title||'').toLowerCase().indexOf(kw)!==-1 || (d.content||'').toLowerCase().indexOf(kw)!==-1;
  });
  if(!items.length){ list.innerHTML='<div class="text-muted" style="padding:16px;text-align:center">Ch\u01b0a c\u00f3 t\u00e0i li\u1ec7u n\u00e0o. H\u00e3y d\u00f9ng AI Reader ho\u1eb7c t\u1ea3i file l\u00ean.</div>'; return; }
  var typeIcon={reader:'\ud83d\udcd6',file:'\ud83d\udcc4',quiz:'\ud83d\udcdd',flash:'\ud83c\udfb4'};
  list.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">'+items.map(function(d){
    var icon=typeIcon[d.type]||'\ud83d\udcc4';
    var date=new Date(d.ts).toLocaleString('vi');
    var preview=(d.content||'').slice(0,140).replace(/</g,'&lt;');
    return '<div class="card" style="margin:0;padding:16px;display:flex;flex-direction:column;gap:8px">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'
      +'<div style="font-weight:700;font-size:.95rem">'+icon+' '+((d.title||'Kh\u00f4ng t\u00ean').replace(/</g,'&lt;'))+'</div>'
      +'<span class="badge badge-blue" style="white-space:nowrap">'+(d.type||'')+'</span></div>'
      +'<div class="text-muted" style="font-size:.75rem">'+date+' \u00b7 '+((d.content||'').length)+' k\u00fd t\u1ef1</div>'
      +'<div class="text-muted" style="font-size:.82rem;line-height:1.5;max-height:66px;overflow:hidden">'+preview+'\u2026</div>'
      +'<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">'
      +'<button class="btn btn-secondary btn-sm" onclick="libOpenDoc('+d.id+')">\ud83d\udc41\ufe0f Xem</button>'
      +'<button class="btn btn-primary btn-sm" onclick="libExportMenu('+d.id+')" title="Xu\u1ea5t PDF/Word/HTML \u0111\u1eb9p">\ud83d\udce4 Xu\u1ea5t \u0111\u1eb9p</button>'
      +'<button class="btn btn-secondary btn-sm" onclick="libToReader('+d.id+')">\ud83d\udcd6 M\u1edf trong Reader</button>'
      +'<button class="btn btn-icon btn-sm" style="color:var(--c4)" onclick="libRemove('+d.id+')">\ud83d\uddd1\ufe0f</button>'
      +'</div></div>';
  }).join('')+'</div>';
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// TH\u00caM M\u1edaI: XU\u1ea4T CHUY\u00caN NGHI\u1ec6P CHO T\u00c0I LI\u1ec6U TRONG TH\u01af VI\u1ec6N (1 c\u00fa nh\u1ea5p)
// T\u1ef1 ch\u1ee9a: b\u00eca gradient + m\u1ee5c l\u1ee5c t\u1ef1 \u0111\u1ed9ng + b\u1ea3ng/callout \u0111\u1eb9p
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function _libEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// Chuy\u1ec3n markdown \u2192 HTML gi\u00e0u (heading c\u00f3 id \u0111\u1ec3 l\u00e0m m\u1ee5c l\u1ee5c)
function _libMdToHtml(md){
  if(!md) return {html:'',toc:[]};
  var esc=_libEsc, lines=md.replace(/\r/g,'').split('\n'), out=[], toc=[], i=0, hIdx=0, inUL=false, inOL=false;
  var closeL=function(){ if(inUL){out.push('</ul>');inUL=false} if(inOL){out.push('</ol>');inOL=false} };
  function inl(s){return s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*]+?)\*/g,'$1<em>$2</em>').replace(/`([^`]+?)`/g,'<code>$1</code>')}
  while(i<lines.length){
    var l=lines[i];
    if(/^```/.test(l)){ closeL();i++;var c=[];while(i<lines.length&&!/^```/.test(lines[i])){c.push(esc(lines[i]));i++}i++;out.push('<pre class="doc-code">'+c.join('\n')+'</pre>');continue; }
    if(/^\s*\|.*\|\s*$/.test(l)&&i+1<lines.length&&/^\s*\|[\s:|-]+\|\s*$/.test(lines[i+1])){
      closeL();var hd=l.split('|').slice(1,-1).map(function(x){return x.trim()});i+=2;var rows=[];
      while(i<lines.length&&/^\s*\|.*\|\s*$/.test(lines[i])){rows.push(lines[i].split('|').slice(1,-1).map(function(x){return x.trim()}));i++}
      out.push('<table class="doc-table"><thead><tr>'+hd.map(function(h){return '<th>'+inl(esc(h))+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+inl(esc(c))+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table>');
      continue;
    }
    var hm=l.match(/^(#{1,4})\s+(.*)$/);
    if(hm){ closeL();var lv=hm[1].length;var tx=hm[2].trim();hIdx++;var id='ls-'+hIdx;toc.push({level:lv,text:tx.replace(/[*`_#]/g,''),id:id});out.push('<h'+lv+' id="'+id+'" class="doc-h doc-h'+lv+'">'+inl(esc(tx))+'</h'+lv+'>');i++;continue; }
    if(/^>\s?/.test(l)){ closeL();var q=[];while(i<lines.length&&/^>\s?/.test(lines[i])){q.push(lines[i].replace(/^>\s?/,''));i++}out.push('<div class="doc-callout">'+inl(esc(q.join(' ')))+'</div>');continue; }
    if(/^\s*---+\s*$/.test(l)){ closeL();out.push('<hr class="doc-hr">');i++;continue; }
    if(/^\s*[-*]\s+/.test(l)){ if(inOL){out.push('</ol>');inOL=false} if(!inUL){out.push('<ul class="doc-ul">');inUL=true} out.push('<li>'+inl(esc(l.replace(/^\s*[-*]\s+/,'')))+'</li>');i++;continue; }
    if(/^\s*\d+\.\s+/.test(l)){ if(inUL){out.push('</ul>');inUL=false} if(!inOL){out.push('<ol class="doc-ol">');inOL=true} out.push('<li>'+inl(esc(l.replace(/^\s*\d+\.\s+/,'')))+'</li>');i++;continue; }
    if(!l.trim()){ closeL();i++;continue; }
    closeL();out.push('<p class="doc-p">'+inl(esc(l))+'</p>');i++;
  }
  closeL();
  return {html:out.join('\n'),toc:toc};
}
function _libCSS(){
  return '*{box-sizing:border-box}body{font-family:"Segoe UI",Calibri,Arial,sans-serif;color:#1f2733;line-height:1.75;font-size:11.5pt;margin:0;background:#f4f6fb}'
  +'.doc-page{max-width:820px;margin:0 auto;background:#fff}'
  +'.doc-cover{background:linear-gradient(135deg,#00c896 0%,#007cf0 60%,#7928ca 100%);color:#fff;padding:70px 56px;position:relative}'
  +'.doc-cover .badge{display:inline-block;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);padding:6px 14px;border-radius:30px;font-size:10.5pt;font-weight:600}'
  +'.doc-cover h1{font-size:28pt;font-weight:800;margin:22px 0 10px;line-height:1.2}'
  +'.doc-cover .subtitle{font-size:13pt;opacity:.92}'
  +'.doc-cover .meta{margin-top:32px;font-size:10.5pt;opacity:.9;border-top:1px solid rgba(255,255,255,.3);padding-top:16px}'
  +'.doc-cover .brand{position:absolute;bottom:26px;right:56px;font-weight:800;font-size:12pt}'
  +'.doc-inner{padding:44px 56px}'
  +'.doc-toc{background:#f0f9f6;border:1px solid #cdeee4;border-left:5px solid #00c896;border-radius:10px;padding:22px 26px;margin-bottom:34px}'
  +'.doc-toc h2{margin:0 0 12px;font-size:15pt;color:#008a68}.doc-toc ul{list-style:none;padding:0;margin:0}.doc-toc li{padding:4px 0;font-size:11pt}'
  +'.doc-toc a{color:#1f2733;text-decoration:none;border-bottom:1px dotted #b7d8cd}'
  +'.doc-toc .l1{font-weight:700}.doc-toc .l2{padding-left:20px}.doc-toc .l3{padding-left:40px;font-size:10.5pt;color:#4a5568}.doc-toc .l4{padding-left:56px;font-size:10pt}'
  +'.doc-h{font-weight:800;page-break-after:avoid}.doc-h1{font-size:22pt;color:#0a2540;margin:34px 0 14px;padding-bottom:8px;border-bottom:3px solid #00c896}'
  +'.doc-h2{font-size:16pt;color:#005fbf;margin:28px 0 10px}.doc-h3{font-size:13pt;color:#7928ca;margin:22px 0 8px}.doc-h4{font-size:11.5pt;color:#334155;margin:16px 0 6px}'
  +'.doc-p{margin:0 0 12px;text-align:justify}.doc-ul,.doc-ol{margin:0 0 14px;padding-left:26px}.doc-ul li,.doc-ol li{margin-bottom:6px}.doc-ul li::marker{color:#00c896}'
  +'.doc-callout{background:#fff8e6;border-left:5px solid #f7971e;border-radius:8px;padding:14px 18px;margin:16px 0;color:#6b4f13}'
  +'.doc-code{background:#0f1729;color:#d6e2f0;border-radius:8px;padding:16px;overflow-x:auto;font-family:Consolas,monospace;font-size:10pt;line-height:1.6;margin:14px 0}'
  +'code{background:#eef2f9;color:#b5179e;padding:2px 6px;border-radius:5px;font-family:Consolas,monospace;font-size:.9em}'
  +'.doc-table{width:100%;border-collapse:collapse;margin:16px 0;font-size:10.5pt;box-shadow:0 2px 10px rgba(0,0,0,.06)}'
  +'.doc-table th{background:linear-gradient(135deg,#00c896,#007cf0);color:#fff;padding:11px 14px;text-align:left;font-weight:700}'
  +'.doc-table td{padding:10px 14px;border-bottom:1px solid #e3e8f0}.doc-table tbody tr:nth-child(even){background:#f7fafc}'
  +'.doc-hr{border:none;border-top:1px solid #e2e8f0;margin:22px 0}'
  +'.doc-footer{text-align:center;color:#94a3b8;font-size:9.5pt;border-top:1px solid #e2e8f0;padding:18px 56px}'
  +'@media print{body{background:#fff}.doc-page{max-width:100%}.doc-print-btn{display:none!important}.doc-cover{page-break-after:always}.doc-toc{page-break-after:always}.doc-table,.doc-callout,.doc-code{page-break-inside:avoid}@page{margin:16mm}}';
}
// Xu\u1ea5t m\u1ed9t t\u00e0i li\u1ec7u th\u01b0 vi\u1ec7n theo \u0111\u1ecbnh d\u1ea1ng
function libExportPro(id, fmt){
  var d=_libCache.find(function(x){return x.id===id});
  if(!d){ toast('Kh\u00f4ng t\u00ecm th\u1ea5y','T\u00e0i li\u1ec7u kh\u00f4ng t\u1ed3n t\u1ea1i','warn'); return; }
  SFX.click();
  var typeMap={reader:'\ud83d\udcd6 AI Reader',file:'\ud83d\udcc4 T\u00e0i li\u1ec7u t\u1ea3i l\u00ean',quiz:'\ud83d\udcdd Tr\u1eafc nghi\u1ec7m',flash:'\ud83c\udfb4 Flashcard',web:'\ud83c\udf10 N\u1ed9i dung web'};
  var badge=typeMap[d.type]||'\ud83d\udcda Th\u01b0 vi\u1ec7n';
  var title=d.title||'T\u00e0i li\u1ec7u';
  var r=_libMdToHtml(d.content||'');
  var tocItems=r.toc.filter(function(t){return t.level<=3});
  var toc = (tocItems.length>=2)
    ? '<div class="doc-toc"><h2>\ud83d\udcd1 M\u1ee5c l\u1ee5c</h2><ul>'+tocItems.map(function(t){return '<li class="l'+t.level+'"><a href="#'+t.id+'">'+_libEsc(t.text)+'</a></li>'}).join('')+'</ul></div>'
    : '';
  var today=new Date().toLocaleDateString('vi-VN',{year:'numeric',month:'long',day:'numeric'});
  var savedDate=d.ts?new Date(d.ts).toLocaleDateString('vi-VN'):today;
  var cover='<div class="doc-cover"><span class="badge">'+badge+'</span><h1>'+_libEsc(title)+'</h1>'
    +'<div class="subtitle">T\u00e0i li\u1ec7u l\u01b0u trong Th\u01b0 vi\u1ec7n YeahEdu-TDA</div>'
    +'<div class="meta">Lo\u1ea1i: <strong>'+badge+'</strong> \u00b7 \u0110\u00e3 l\u01b0u: '+savedDate+'<br>Xu\u1ea5t ng\u00e0y: '+today+' \u00b7 '+((d.content||'').length)+' k\u00fd t\u1ef1</div>'
    +'<div class="brand">YeahEdu-TDA</div></div>';
  var footer='<div class="doc-footer">Xu\u1ea5t t\u1eeb Th\u01b0 vi\u1ec7n YeahEdu-TDA \u00b7 Tr\u1ee3 l\u00fd h\u1ecdc t\u1eadp th\u00f4ng minh \u00b7 '+today+'</div>';
  var body=cover+toc+'<div class="doc-inner">'+r.html+'</div>'+footer;
  var fname=(title.replace(/[\\/:*?"<>|]/g,'').slice(0,40)||'tai-lieu');

  if(fmt==='pdf'){
    var w=window.open('','_blank');
    if(!w){ toast('B\u1ecb ch\u1eb7n popup','Cho ph\u00e9p popup \u0111\u1ec3 xu\u1ea5t PDF','warn'); return; }
    w.document.write('<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>'+_libEsc(title)+'</title><style>'+_libCSS()
      +'.doc-print-btn{position:fixed;top:16px;right:16px;z-index:9;padding:11px 20px;background:#00c896;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700;box-shadow:0 6px 20px rgba(0,200,150,.4)}'
      +'</style></head><body><button class="doc-print-btn" onclick="window.print()">\ud83d\udda8\ufe0f In / L\u01b0u PDF</button><div class="doc-page">'+body+'</div></body></html>');
    w.document.close();
    toast('\u2705 S\u1eb5n s\u00e0ng in','Nh\u1ea5n n\u00fat In / L\u01b0u PDF trong tab m\u1edbi','success',4000);
    return;
  }
  if(fmt==='word'){
    var wHtml='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>'+_libEsc(title)+'</title>'
      +'<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->'
      +'<style>'+_libCSS()+'</style></head><body><div class="doc-page">'+body+'</div></body></html>';
    download('\ufeff'+wHtml,fname+'.doc','application/msword');
    toast('\u2705 \u0110\u00e3 t\u1ea3i Word','M\u1edf b\u1eb1ng Microsoft Word','success');
    return;
  }
  // html
  var html='<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+_libEsc(title)+'</title><style>'+_libCSS()+'</style></head><body><div class="doc-page">'+body+'</div></body></html>';
  download(html,fname+'.html','text/html');
  toast('\u2705 \u0110\u00e3 t\u1ea3i HTML','','success');
}
// Menu ch\u1ecdn \u0111\u1ecbnh d\u1ea1ng cho 1 t\u00e0i li\u1ec7u (g\u1ecdn, 1 c\u00fa nh\u1ea5p)
function libExportMenu(id){
  var d=_libCache.find(function(x){return x.id===id});
  var title=d?(d.title||'T\u00e0i li\u1ec7u'):'T\u00e0i li\u1ec7u';
  var modal=document.getElementById('libExportModal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='libExportModal'; modal.className='modal-overlay hidden';
    modal.onclick=function(e){ if(e.target.id==='libExportModal') closeModal('libExportModal'); };
    modal.innerHTML='<div class="modal" style="max-width:420px"><div class="modal-header"><div class="modal-title">\ud83d\udce4 Xu\u1ea5t t\u00e0i li\u1ec7u \u0111\u1eb9p</div><button class="btn btn-icon btn-sm" onclick="closeModal(\'libExportModal\')">\u2716</button></div><div class="modal-body" id="libExportBody"></div></div>';
    document.body.appendChild(modal);
  }
  document.getElementById('libExportBody').innerHTML=
    '<div style="font-size:.9rem;color:var(--text2);margin-bottom:14px">T\u00e0i li\u1ec7u: <strong style="color:var(--text)">'+_libEsc(title.slice(0,50))+'</strong></div>'
    +'<div style="display:flex;flex-direction:column;gap:10px">'
    +'<button class="btn btn-primary" onclick="closeModal(\'libExportModal\');libExportPro('+id+',\'pdf\')">\ud83d\udcd5 PDF \u0111\u1eb9p (c\u00f3 b\u00eca + m\u1ee5c l\u1ee5c)</button>'
    +'<button class="btn btn-primary" onclick="closeModal(\'libExportModal\');libExportPro('+id+',\'word\')">\ud83d\udcd8 Word \u0111\u1eb9p (m\u1edf b\u1eb1ng MS Word)</button>'
    +'<button class="btn btn-secondary" onclick="closeModal(\'libExportModal\');libExportPro('+id+',\'html\')">\ud83c\udf10 HTML \u0111\u1eb9p (m\u1edf tr\u00ean tr\u00ecnh duy\u1ec7t)</button>'
    +'</div>';
  openModal('libExportModal'); SFX.click();
}

function libOpenDoc(id){
  var d=_libCache.find(function(x){return x.id===id}); if(!d) return;
  var w=window.open('','_blank');
  w.document.write('<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>'+(d.title||'T\u00e0i li\u1ec7u')+'</title><style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:20px;line-height:1.7;white-space:pre-wrap}h1{color:#00c896}</style></head><body><h1>'+(d.title||'T\u00e0i li\u1ec7u')+'</h1><div>'+((d.content||'').replace(/</g,'&lt;'))+'</div></body></html>');
  w.document.close();
}
function libToReader(id){
  var d=_libCache.find(function(x){return x.id===id}); if(!d) return;
  ST.reader.inputText=(d.content||'').slice(0,READER_MAX_INPUT);
  ST.reader.inputSource='paste';
  var tabBtn=document.querySelector('.nav-tab[data-tab="tabReader"]');
  if(tabBtn) switchTab(tabBtn,'tabReader');
  setTimeout(function(){
    var pa=document.getElementById('readerPasteArea'); if(pa) pa.value=d.content||'';
    if(typeof _showReaderLoaded==='function') _showReaderLoaded('\u0110\u00e3 n\u1ea1p t\u1eeb Th\u01b0 vi\u1ec7n \u00b7 '+((d.content||'').length)+' k\u00fd t\u1ef1');
  },200);
  toast('\ud83d\udcd6 \u0110\u00e3 n\u1ea1p','N\u1ed9i dung \u0111\u01b0a v\u00e0o AI Reader','success');
}
async function libRemove(id){
  if(!confirm('X\u00f3a t\u00e0i li\u1ec7u n\u00e0y kh\u1ecfi Th\u01b0 vi\u1ec7n?')) return;
  await libDelete(id); await refreshLibrary();
  toast('\ud83d\uddd1\ufe0f \u0110\u00e3 x\u00f3a','','info');
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550