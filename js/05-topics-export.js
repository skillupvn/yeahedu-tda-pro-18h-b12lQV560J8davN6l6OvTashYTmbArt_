// ================================================================
// YeahEdu-TDA v11 "PhoenixEdu" - Module: 05-topics-export.js
// Auto-split from monolithic v10, ASCII-only, Live-Server safe
// ================================================================

// EXPORT (gi\u1eef nguy\u00ean 100% g\u1ed1c)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function exportQuiz(fmt){
  var q=ST.quiz;if(!q){toast('L\u1ed7i','Kh\u00f4ng c\u00f3 b\u00e0i','error');return;}SFX.click();
  var correct=q.questions.filter(function(item,i){return q.answers[i]===item.correct}).length;
  var pct=Math.round(correct/q.questions.length*100),letters=['A','B','C','D'];
  if(fmt==='md'){var md='# '+q.title+'\n\n**M\u00f4n:** '+q.subject+' | **L\u1edbp:** '+q.grade+' | **\u0110i\u1ec3m:** '+correct+'/'+q.questions.length+' ('+pct+'%)\n\n---\n\n';
    q.questions.forEach(function(item,i){var ok=q.answers[i]===item.correct;
      md+='### C\u00e2u '+(i+1)+' '+(ok?'\u2705':'\u274c')+': '+item.question+'\n\n';
      item.options.forEach(function(o,oi){md+='- '+letters[oi]+'. '+o+(oi===item.correct?' **(\u0110\u00fang)**':'')+'\n'});
      if(item.explanation)md+='\n> \ud83d\udca1 '+item.explanation+'\n';md+='\n'});
    download(md,'quiz-result.md','text/markdown');}
  else if(fmt==='html'){
    var html='<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>'+q.title+'</title><style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:20px;color:#1a1a2e;line-height:1.6}h1{color:#00c896}h3{color:#2c3e50;border-left:4px solid #00c896;padding-left:12px}.explain{background:#f0fff4;border-left:4px solid #27ae60;padding:10px 14px;margin:8px 0;border-radius:4px}.opt{padding:6px 10px;margin:4px 0;border-radius:6px;background:#f5f5f5}.correct-opt{background:#d4edda;color:#155724;font-weight:700}.wrong-opt{background:#f8d7da;color:#721c24;text-decoration:line-through}</style></head><body><h1>'+q.title+'</h1>'+q.questions.map(function(item,i){var ok=q.answers[i]===item.correct;return '<h3>'+(ok?'\u2705':'\u274c')+' C\u00e2u '+(i+1)+': '+item.question+'</h3><div>'+item.options.map(function(o,oi){return '<div class="opt '+(oi===item.correct?'correct-opt':(oi===q.answers[i]&&!ok?'wrong-opt':''))+'">'+letters[oi]+'. '+o+'</div>'}).join('')+'</div>'+(item.explanation?'<div class="explain">\ud83d\udca1 '+item.explanation+'</div>':'')}).join('\n')+'<footer style="margin-top:30px;color:#999;font-size:.8rem;border-top:1px solid #eee;padding-top:16px">YeahEdu-TDA \u00b7 '+new Date().toLocaleDateString('vi')+'</footer></body></html>';
    download(html,'quiz-result.html','text/html');}
  else if(fmt==='pdf'){var w=window.open('','_blank');
    w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+q.title+'</title><style>body{font-family:Arial;margin:30px;line-height:1.5}@media print{button{display:none}}</style></head><body><h1>'+q.title+'</h1><button onclick="window.print()">\ud83d\udda8\ufe0f In</button>'+q.questions.map(function(item,i){return '<p><strong>C\u00e2u '+(i+1)+':</strong> '+item.question+'</p><ul>'+item.options.map(function(o,oi){return '<li>'+o+(oi===item.correct?' \u2713':'')+'</li>'}).join('')+'</ul>'+(item.explanation?'<p><em>\ud83d\udca1 '+item.explanation+'</em></p>':'')}).join('<hr>')+'</body></html>');
    w.document.close();setTimeout(function(){w.print()},500)}
}

function exportFlash(fmt){
  var f=ST.flash;if(!f){toast('L\u1ed7i','Kh\u00f4ng c\u00f3 flashcard','error');return;}SFX.click();
  if(fmt==='md'){var md='# '+f.title+'\n\n**M\u00f4n:** '+f.subject+' | **L\u1edbp:** '+f.grade+' | **S\u1ed1 th\u1ebb:** '+f.cards.length+'\n\n---\n\n';
    f.cards.forEach(function(c,i){md+='## Th\u1ebb '+(i+1)+' '+(c.icon||'')+'\n\n**C\u00e2u h\u1ecfi:** '+c.front+'\n\n**Tr\u1ea3 l\u1eddi:** '+c.back+'\n'+(c.hint?'\n> \ud83d\udca1 '+c.hint+'\n':'')+'\n'});
    download(md,'flashcards.md','text/markdown');}
  else if(fmt==='html'){
    var html='<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>'+f.title+'</title><style>body{font-family:system-ui;max-width:900px;margin:40px auto;padding:20px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}.card{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:12px;padding:24px;cursor:pointer;min-height:180px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}.card .icon{font-size:2.5rem;margin-bottom:12px}.card .front{font-size:1.1rem;font-weight:700}.card .back{display:none;margin-top:10px;font-size:.95rem;opacity:.9}.card.show .back{display:block}.card.show .front{opacity:.7}h1{background:linear-gradient(90deg,#00c896,#007cf0);-webkit-background-clip:text;-webkit-text-fill-color:transparent}</style></head><body><h1>\ud83c\udfb4 '+f.title+'</h1><p>Click v\u00e0o th\u1ebb \u0111\u1ec3 l\u1eadt \u00b7 '+f.cards.length+' th\u1ebb</p><div class="grid">'+f.cards.map(function(c){return '<div class="card" onclick="this.classList.toggle(\'show\')"><div class="icon">'+(c.icon||'\u2753')+'</div><div class="front">'+c.front+'</div><div class="back">\u2705 '+c.back+(c.hint?'<br><small>\ud83d\udca1 '+c.hint+'</small>':'')+'</div></div>'}).join('')+'</div><footer style="margin-top:30px;color:#999;font-size:.8rem">YeahEdu-TDA \u00b7 '+new Date().toLocaleDateString('vi')+'</footer></body></html>';
    download(html,'flashcards.html','text/html');}
  else if(fmt==='pdf'){var w=window.open('','_blank');
    w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+f.title+'</title><style>body{font-family:Arial;margin:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:10px}th{background:#f0f0f0}@media print{button{display:none}}</style></head><body><h1>'+f.title+'</h1><button onclick="window.print()">\ud83d\udda8\ufe0f In</button><table><tr><th>#</th><th>C\u00e2u h\u1ecfi</th><th>Tr\u1ea3 l\u1eddi</th></tr>'+f.cards.map(function(c,i){return '<tr><td>'+(i+1)+' '+(c.icon||'')+'</td><td>'+c.front+'</td><td>'+c.back+'</td></tr>'}).join('')+'</table></body></html>');
    w.document.close();setTimeout(function(){w.print()},500)}
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// TH\u00caM M\u1edaI: XU\u1ea4T CHUY\u00caN NGHI\u1ec6P CHO QUIZ & FLASHCARD (c\u00f3 b\u00eca, m\u1ee5c l\u1ee5c, \u0111\u1eb9p)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function _proEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// CSS d\u00f9ng chung cho t\u00e0i li\u1ec7u xu\u1ea5t (t\u1ef1 ch\u1ee9a, kh\u00f4ng ph\u1ee5 thu\u1ed9c g\u00f3i kh\u00e1c)
function _proDocCSS(){
  return ''
  +'*{box-sizing:border-box}'
  +'body{font-family:"Segoe UI",Calibri,Arial,sans-serif;color:#1f2733;line-height:1.7;font-size:11.5pt;margin:0;background:#f4f6fb}'
  +'.doc-page{max-width:820px;margin:0 auto;background:#fff}'
  +'.doc-cover{background:linear-gradient(135deg,#00c896 0%,#007cf0 60%,#7928ca 100%);color:#fff;padding:66px 56px;position:relative}'
  +'.doc-cover .badge{display:inline-block;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);padding:6px 14px;border-radius:30px;font-size:10.5pt;font-weight:600}'
  +'.doc-cover h1{font-size:28pt;font-weight:800;margin:22px 0 8px;line-height:1.2}'
  +'.doc-cover .subtitle{font-size:13pt;opacity:.92}'
  +'.doc-cover .meta{margin-top:30px;font-size:10.5pt;opacity:.9;border-top:1px solid rgba(255,255,255,.3);padding-top:16px}'
  +'.doc-cover .brand{position:absolute;bottom:24px;right:56px;font-weight:800;font-size:12pt}'
  +'.doc-inner{padding:40px 56px}'
  +'.doc-stat{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:28px}'
  +'.doc-stat .box{flex:1;min-width:120px;background:#f0f9f6;border:1px solid #cdeee4;border-radius:12px;padding:16px;text-align:center}'
  +'.doc-stat .box .n{font-size:22pt;font-weight:800;color:#00a67a}'
  +'.doc-stat .box .l{font-size:9.5pt;color:#5a6b7b;margin-top:2px}'
  +'.q-item{margin-bottom:22px;padding:18px 20px;border:1px solid #e3e8f0;border-radius:12px;page-break-inside:avoid}'
  +'.q-head{font-weight:800;font-size:12pt;color:#0a2540;margin-bottom:10px}'
  +'.q-opt{padding:8px 14px;margin:6px 0;border-radius:8px;background:#f6f8fb;border:1px solid #eaeef4;font-size:11pt}'
  +'.q-opt.correct{background:#dcf7ec;border-color:#8fe0c2;color:#0a7a55;font-weight:700}'
  +'.q-opt.wrong{background:#fde4e4;border-color:#f4b3b3;color:#b02525;text-decoration:line-through}'
  +'.q-explain{background:#fff8e6;border-left:4px solid #f7971e;border-radius:8px;padding:11px 15px;margin-top:10px;font-size:10.5pt;color:#6b4f13}'
  +'.doc-footer{text-align:center;color:#94a3b8;font-size:9.5pt;border-top:1px solid #e2e8f0;padding:18px 56px}'
  +'@media print{body{background:#fff}.doc-page{max-width:100%}.doc-print-btn{display:none!important}.doc-cover{page-break-after:always}.q-item{page-break-inside:avoid}@page{margin:15mm}}';
}
function _proCover(o){
  var today=new Date().toLocaleDateString('vi-VN',{year:'numeric',month:'long',day:'numeric'});
  return '<div class="doc-cover"><span class="badge">'+_proEsc(o.badge||'')+'</span>'
    +'<h1>'+_proEsc(o.title||'')+'</h1>'
    +'<div class="subtitle">'+_proEsc(o.subtitle||'')+'</div>'
    +'<div class="meta">'+(o.metaHtml||'')+'<br>Ng\u00e0y t\u1ea1o: '+today+'</div>'
    +'<div class="brand">YeahEdu-TDA</div></div>';
}
function _proFooter(){
  var today=new Date().toLocaleDateString('vi-VN');
  return '<div class="doc-footer">T\u1ea1o b\u1edfi YeahEdu-TDA \u00b7 Tr\u1ee3 l\u00fd h\u1ecdc t\u1eadp th\u00f4ng minh \u00b7 '+today+'</div>';
}
// M\u1edf tab in ho\u1eb7c t\u1ea3i file theo \u0111\u1ecbnh d\u1ea1ng
function _proOutput(fmt, title, css, extraHeadCss, bodyInner){
  if(fmt==='pdf'){
    var w=window.open('','_blank');
    if(!w){ toast('B\u1ecb ch\u1eb7n popup','Cho ph\u00e9p popup \u0111\u1ec3 xu\u1ea5t PDF','warn'); return; }
    w.document.write('<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>'+_proEsc(title)+'</title><style>'+css
      +'.doc-print-btn{position:fixed;top:16px;right:16px;z-index:9;padding:11px 20px;background:#00c896;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700;box-shadow:0 6px 20px rgba(0,200,150,.4)}'
      +(extraHeadCss||'')+'</style></head><body><button class="doc-print-btn" onclick="window.print()">\ud83d\udda8\ufe0f In / L\u01b0u PDF</button>'
      +'<div class="doc-page">'+bodyInner+'</div></body></html>');
    w.document.close();
    toast('\u2705 S\u1eb5n s\u00e0ng in','Nh\u1ea5n n\u00fat In / L\u01b0u PDF trong tab m\u1edbi','success',4000);
    return;
  }
  if(fmt==='word'){
    var wHtml='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>'+_proEsc(title)+'</title>'
      +'<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->'
      +'<style>'+css+(extraHeadCss||'')+'</style></head><body><div class="doc-page">'+bodyInner+'</div></body></html>';
    download('\ufeff'+wHtml,(title.slice(0,40)||'tai-lieu')+'.doc','application/msword');
    toast('\u2705 \u0110\u00e3 t\u1ea3i Word','M\u1edf b\u1eb1ng Microsoft Word','success');
    return;
  }
  // html
  var html='<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+_proEsc(title)+'</title><style>'+css+(extraHeadCss||'')+'</style></head><body><div class="doc-page">'+bodyInner+'</div></body></html>';
  download(html,(title.slice(0,40)||'tai-lieu')+'.html','text/html');
  toast('\u2705 \u0110\u00e3 t\u1ea3i HTML','','success');
}

// \u2550\u2550\u2550 XU\u1ea4T QUIZ CHUY\u00caN NGHI\u1ec6P \u2550\u2550\u2550
function exportQuizPro(fmt){
  var q=ST.quiz;
  if(!q){ toast('Kh\u00f4ng c\u00f3 b\u00e0i','H\u00e3y t\u1ea1o b\u00e0i tr\u1eafc nghi\u1ec7m tr\u01b0\u1edbc','warn'); return; }
  SFX.click();
  var letters=['A','B','C','D','E','F'];
  var done=Array.isArray(q.answers)&&q.answers.some(function(a){return a!=null});
  var correct=done?q.questions.filter(function(item,i){return q.answers[i]===item.correct}).length:0;
  var total=q.questions.length;
  var pct=done?Math.round(correct/total*100):0;
  var stat=done
    ? '<div class="doc-stat"><div class="box"><div class="n">'+total+'</div><div class="l">T\u1ed5ng c\u00e2u</div></div>'
      +'<div class="box"><div class="n" style="color:#00a67a">'+correct+'</div><div class="l">\u0110\u00fang</div></div>'
      +'<div class="box"><div class="n" style="color:#d64545">'+(total-correct)+'</div><div class="l">Sai</div></div>'
      +'<div class="box"><div class="n">'+pct+'%</div><div class="l">Ch\u00ednh x\u00e1c</div></div></div>'
    : '<div class="doc-stat"><div class="box"><div class="n">'+total+'</div><div class="l">T\u1ed5ng c\u00e2u h\u1ecfi</div></div></div>';
  var items=q.questions.map(function(item,i){
    var ua=done?q.answers[i]:null;
    var ok=ua===item.correct;
    var opts=item.options.map(function(o,oi){
      var cls='q-opt';
      if(oi===item.correct) cls+=' correct';
      else if(done && oi===ua && !ok) cls+=' wrong';
      return '<div class="'+cls+'">'+letters[oi]+'. '+_proEsc(o)+(oi===item.correct?' \u2714':'')+'</div>';
    }).join('');
    return '<div class="q-item"><div class="q-head">'+(item.icon?item.icon+' ':'')+'C\u00e2u '+(i+1)+(done?(ok?' \u2705':' \u274c'):'')+': '+_proEsc(item.question)+'</div>'+opts
      +(item.explanation?'<div class="q-explain">\ud83d\udca1 '+_proEsc(item.explanation)+'</div>':'')+'</div>';
  }).join('');
  var meta='M\u00f4n: <strong>'+_proEsc(q.subject||'\u2014')+'</strong> \u00b7 L\u1edbp: <strong>'+_proEsc(q.grade||'\u2014')+'</strong>'
    +(done?' \u00b7 \u0110i\u1ec3m: <strong>'+correct+'/'+total+' ('+pct+'%)</strong>':'');
  var body=_proCover({badge:'\ud83d\udcdd B\u00e0i Tr\u1eafc Nghi\u1ec7m',title:q.title||'B\u00e0i tr\u1eafc nghi\u1ec7m',subtitle:(q.subject||'')+(q.grade?' \u00b7 '+q.grade:''),metaHtml:meta})
    +'<div class="doc-inner">'+stat+items+'</div>'+_proFooter();
  _proOutput(fmt, q.title||'Bai trac nghiem', _proDocCSS(), '', body);
}

// \u2550\u2550\u2550 XU\u1ea4T FLASHCARD CHUY\u00caN NGHI\u1ec6P \u2550\u2550\u2550
function exportFlashPro(fmt){
  var f=ST.flash;
  if(!f){ toast('Kh\u00f4ng c\u00f3 flashcard','H\u00e3y t\u1ea1o flashcard tr\u01b0\u1edbc','warn'); return; }
  SFX.click();
  var meta='M\u00f4n: <strong>'+_proEsc(f.subject||'\u2014')+'</strong> \u00b7 L\u1edbp: <strong>'+_proEsc(f.grade||'\u2014')+'</strong> \u00b7 S\u1ed1 th\u1ebb: <strong>'+f.cards.length+'</strong>';

  // HTML: b\u1ed9 h\u1ecdc t\u01b0\u01a1ng t\u00e1c l\u1eadt th\u1ebb 3D (\u0111\u1eb9p h\u01a1n NotebookLM)
  if(fmt==='html'){
    var cardsJson=JSON.stringify(f.cards.map(function(c){return {icon:c.icon||'\ud83d\udcd8',front:c.front||'',frontSub:c.frontSub||'',back:c.back||'',backSub:c.backSub||'',hint:c.hint||''}}));
    var html=_flashInteractiveHTML(f.title||'B\u1ed9 Flashcard', f.subject||'', f.grade||'', cardsJson);
    download(html,(f.title||'flashcards').slice(0,40)+'.html','text/html');
    toast('\u2705 \u0110\u00e3 t\u1ea3i Flashcard t\u01b0\u01a1ng t\u00e1c','M\u1edf file \u0111\u1ec3 h\u1ecdc & l\u1eadt th\u1ebb','success');
    return;
  }

  // PDF/Word: d\u1ea1ng th\u1ebb l\u01b0\u1edbi in \u0111\u1eb9p (m\u1eb7t tr\u01b0\u1edbc + m\u1eb7t sau)
  var gridCss='.fc-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}'
    +'.fc-cell{border:1px solid #dbe2ec;border-radius:12px;overflow:hidden;page-break-inside:avoid}'
    +'.fc-cell .top{background:linear-gradient(135deg,#00c896,#007cf0);color:#fff;padding:14px 16px}'
    +'.fc-cell .top .ic{font-size:1.6rem}.fc-cell .top .ft{font-weight:800;font-size:12pt;margin-top:4px}'
    +'.fc-cell .bot{padding:14px 16px;font-size:10.8pt;color:#26313f}'
    +'.fc-cell .bot .lbl{font-size:8.5pt;color:#00a67a;font-weight:700;text-transform:uppercase;letter-spacing:.5px}'
    +'.fc-cell .hint{margin-top:8px;font-size:9.5pt;color:#7a5b18;background:#fff8e6;border-radius:6px;padding:6px 10px}';
  var cells=f.cards.map(function(c,i){
    return '<div class="fc-cell"><div class="top"><div class="ic">'+(c.icon||'\ud83d\udcd8')+'</div><div class="ft">'+_proEsc(c.front)+'</div>'
      +(c.frontSub?'<div style="font-size:9.5pt;opacity:.85;margin-top:2px">'+_proEsc(c.frontSub)+'</div>':'')+'</div>'
      +'<div class="bot"><div class="lbl">Tr\u1ea3 l\u1eddi #'+(i+1)+'</div>'+_proEsc(c.back)
      +(c.backSub?'<div style="margin-top:4px;color:#5a6b7b">'+_proEsc(c.backSub)+'</div>':'')
      +(c.hint?'<div class="hint">\ud83d\udca1 '+_proEsc(c.hint)+'</div>':'')+'</div></div>';
  }).join('');
  var body=_proCover({badge:'\ud83c\udfb4 B\u1ed9 Flashcard',title:f.title||'B\u1ed9 Flashcard',subtitle:(f.subject||'')+(f.grade?' \u00b7 '+f.grade:''),metaHtml:meta})
    +'<div class="doc-inner"><div class="fc-grid">'+cells+'</div></div>'+_proFooter();
  _proOutput(fmt, f.title||'Flashcard', _proDocCSS(), gridCss, body);
}

// HTML flashcard t\u01b0\u01a1ng t\u00e1c: l\u1eadt 3D + ch\u1ebf \u0111\u1ed9 h\u1ecdc + ph\u00edm t\u1eaft + t\u00ecm ki\u1ebfm (self-contained)
function _flashInteractiveHTML(title, subject, grade, cardsJson){
  return '<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+_proEsc(title)+'</title>'
  +'<style>'
  +'*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Segoe UI",system-ui,Arial,sans-serif;background:radial-gradient(1200px 600px at 50% -10%,#16233f,#0c111c);color:#e8eef7;min-height:100vh;padding:24px 16px}'
  +'.wrap{max-width:960px;margin:0 auto}.head{text-align:center;margin-bottom:20px}'
  +'.head h1{font-size:1.7rem;background:linear-gradient(90deg,#00c896,#3aa0ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}'
  +'.head .sub{color:#9fb0c9;font-size:.9rem;margin-top:4px}'
  +'.bar{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;margin:16px 0}'
  +'.bar button,.bar input,.bar select{background:#1b2740;color:#e8eef7;border:1px solid #33456b;border-radius:10px;padding:9px 14px;font-size:.9rem;cursor:pointer}'
  +'.bar button:hover{background:#243356}.bar .pri{background:linear-gradient(135deg,#00c896,#007cf0);border:none;font-weight:700;color:#fff}'
  +'.stage{perspective:1600px;margin:18px auto;max-width:560px}'
  +'.card{position:relative;width:100%;min-height:300px;transform-style:preserve-3d;transition:transform .55s cubic-bezier(.4,0,.2,1);cursor:pointer}'
  +'.card.flip{transform:rotateY(180deg)}'
  +'.face{position:absolute;inset:0;backface-visibility:hidden;border-radius:20px;padding:32px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.5)}'
  +'.front{background:linear-gradient(135deg,#12203f,#1c2c52);border:1px solid rgba(0,124,240,.35)}'
  +'.back{background:linear-gradient(135deg,#0c2c20,#124030);border:1px solid rgba(0,200,150,.4);transform:rotateY(180deg)}'
  +'.ic{font-size:3rem;margin-bottom:14px}.lbl{font-size:.72rem;letter-spacing:2px;text-transform:uppercase;color:#7f93b3;margin-bottom:10px}'
  +'.txt{font-size:1.35rem;font-weight:700;line-height:1.4}.sub2{margin-top:10px;color:#9fb0c9;font-size:.95rem}'
  +'.hint{margin-top:14px;background:rgba(247,151,30,.14);border:1px solid rgba(247,151,30,.35);color:#ffcf8a;border-radius:10px;padding:8px 14px;font-size:.85rem}'
  +'.hintwrap{text-align:center;color:#7f93b3;font-size:.8rem;margin-top:10px}'
  +'.nav{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:16px}'
  +'.counter{font-weight:700;min-width:80px;text-align:center}'
  +'.prog{height:8px;background:#1b2740;border-radius:6px;overflow:hidden;max-width:560px;margin:14px auto 0}'
  +'.prog>i{display:block;height:100%;background:linear-gradient(90deg,#00c896,#007cf0);width:0;transition:width .3s}'
  +'.foot{text-align:center;color:#63748f;font-size:.75rem;margin-top:26px}'
  +'@media(max-width:520px){.txt{font-size:1.1rem}.card{min-height:260px}}'
  +'</style></head><body><div class="wrap">'
  +'<div class="head"><h1>\ud83c\udfb4 '+_proEsc(title)+'</h1><div class="sub">'+_proEsc(subject)+(grade?' \u00b7 '+_proEsc(grade):'')+'</div></div>'
  +'<div class="bar">'
  +'<button class="pri" onclick="flip()">\ud83d\udd04 L\u1eadt th\u1ebb (Space)</button>'
  +'<button onclick="go(-1)">\u2b05\ufe0f Tr\u01b0\u1edbc</button>'
  +'<button onclick="go(1)">Sau \u27a1\ufe0f</button>'
  +'<button onclick="shuf()">\ud83d\udd00 X\u00e1o tr\u1ed9n</button>'
  +'<button id="autoBtn" onclick="toggleAuto()">\u25b6\ufe0f T\u1ef1 ch\u1ea1y</button>'
  +'<input id="search" placeholder="\ud83d\udd0e T\u00ecm th\u1ebb..." oninput="doSearch()" style="min-width:150px">'
  +'</div>'
  +'<div class="stage"><div class="card" id="card" onclick="flip()">'
  +'<div class="face front"><div class="ic" id="ic">\ud83d\udcd8</div><div class="lbl">C\u00e2u h\u1ecfi</div><div class="txt" id="ft"></div><div class="sub2" id="fs"></div></div>'
  +'<div class="face back"><div class="lbl">Tr\u1ea3 l\u1eddi</div><div class="txt" id="bt"></div><div class="sub2" id="bs"></div><div class="hint" id="hn" style="display:none"></div></div>'
  +'</div></div>'
  +'<div class="hintwrap">Nh\u1ea5p th\u1ebb ho\u1eb7c ph\u00edm Space \u0111\u1ec3 l\u1eadt \u00b7 \u25c0 \u25b6 chuy\u1ec3n th\u1ebb</div>'
  +'<div class="nav"><button onclick="go(-1)">\u25c0</button><span class="counter" id="cnt">1 / 1</span><button onclick="go(1)">\u25b6</button></div>'
  +'<div class="prog"><i id="pf"></i></div>'
  +'<div class="foot">T\u1ea1o b\u1edfi YeahEdu-TDA \u00b7 Tr\u1ee3 l\u00fd h\u1ecdc t\u1eadp th\u00f4ng minh</div>'
  +'</div><script>'
  +'var ALL='+cardsJson+';var cards=ALL.slice();var idx=0,flipped=false,auto=null;'
  +'function render(){var c=cards[idx]||{};document.getElementById("card").classList.remove("flip");flipped=false;'
  +'document.getElementById("ic").textContent=c.icon||"\ud83d\udcd8";document.getElementById("ft").textContent=c.front||"";'
  +'document.getElementById("fs").textContent=c.frontSub||"";document.getElementById("bt").textContent=c.back||"";'
  +'document.getElementById("bs").textContent=c.backSub||"";var h=document.getElementById("hn");'
  +'if(c.hint){h.style.display="block";h.textContent="\ud83d\udca1 "+c.hint}else{h.style.display="none"}'
  +'document.getElementById("cnt").textContent=(idx+1)+" / "+cards.length;'
  +'document.getElementById("pf").style.width=Math.round((idx+1)/cards.length*100)+"%";}'
  +'function flip(){flipped=!flipped;document.getElementById("card").classList.toggle("flip",flipped)}'
  +'function go(d){var n=idx+d;if(n<0)n=cards.length-1;if(n>=cards.length)n=0;idx=n;render()}'
  +'function shuf(){for(var i=cards.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=cards[i];cards[i]=cards[j];cards[j]=t}idx=0;render()}'
  +'function doSearch(){var q=document.getElementById("search").value.toLowerCase().trim();if(!q){cards=ALL.slice()}else{cards=ALL.filter(function(c){return (c.front+" "+c.back).toLowerCase().indexOf(q)>-1})}if(!cards.length)cards=[{icon:"\ud83d\udd0d",front:"Kh\u00f4ng t\u00ecm th\u1ea5y",back:""}];idx=0;render()}'
  +'function toggleAuto(){var b=document.getElementById("autoBtn");if(auto){clearInterval(auto);auto=null;b.textContent="\u25b6\ufe0f T\u1ef1 ch\u1ea1y"}else{b.textContent="\u23f8\ufe0f D\u1eebng";auto=setInterval(function(){if(!flipped){flip()}else{go(1)}},2500)}}'
  +'document.addEventListener("keydown",function(e){if(e.target.tagName==="INPUT")return;if(e.key===" "){e.preventDefault();flip()}if(e.key==="ArrowLeft")go(-1);if(e.key==="ArrowRight")go(1)});'
  +'render();<\/script></body></html>';
}

function download(content,filename,type){
  var blob=new Blob([content],{type:type});var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);toast('\u0110\u00e3 t\u1ea3i',filename,'success');
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// UTILITIES (gi\u1eef nguy\u00ean g\u1ed1c)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function shuffle(arr){
  var a=[].concat(arr);for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=a[i];a[i]=a[j];a[j]=tmp}return a;
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550