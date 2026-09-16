// ================================================================
// YeahEdu-TDA v12 - Module 14: Mind Map 3D (Vietnamese)
// ================================================================
(function(){
'use strict';
var L=window.L.mm3d, C=window.L.common;
var STORE='mindmap_docs', DB_NAME='YeahEdu_v11';
var _graph=null;

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

function _loadLib(cb){
  if(window.ForceGraph3D){cb();return;}
  var s=document.createElement('script');
  s.src='https://unpkg.com/3d-force-graph@1.73.4/dist/3d-force-graph.min.js';
  s.onload=cb;
  s.onerror=function(){ if(window.toast) toast(C.error,L.libLoadFail,'error'); };
  document.head.appendChild(s);
}

function _buildPrompt(source,depth){
  var d=depth==='shallow'?'2 c\u1ea5p':depth==='deep'?'4-5 c\u1ea5p sau':'3 c\u1ea5p';
  return 'B\u1ea1n l\u00e0 chuy\u00ean gia ph\u00e2n t\u00edch tri th\u1ee9c. T\u1ea1o mindmap '+d+' ti\u1ebfng Vi\u1ec7t t\u1eeb t\u00e0i li\u1ec7u.\n\n'
    +'JSON: {"title":"...","nodes":[{"id":"root","label":"Chu de","group":0,"size":20},{"id":"n1","label":"Con","group":1,"size":12}],"links":[{"source":"root","target":"n1"}]}\n\n'
    +'T\u00c0I LI\u1ec6U:\n"""\n'+source+'\n"""\n\nCH\u1ec8 JSON.';
}

window.mm3dGenerate=async function(source,opts){
  opts=opts||{};
  if(!source||source.trim().length<50){ if(window.toast) toast(C.error,C.needMoreText,'error'); return; }
  if(typeof window.callAI!=='function'){ if(window.toast) toast(C.error,C.aiNotReady,'error'); return; }
  var el=document.getElementById('mm3dArea');
  if(el) el.innerHTML='<div class="spin-wrap"><div class="spinner"></div><div class="spin-text">\u{1F9D0} '+L.generating+'<span class="spin-dots"></span></div></div>';
  try{
    var prompt=_buildPrompt(source.slice(0,12000),opts.depth||'medium');
    var response=await window.callAI([{role:'system',content:'Ban la chuyen gia phan tich tri thuc, tra ve JSON hop le.'},{role:'user',content:prompt}]);
    var data=_parseJSON(response);
    if(!data||!data.nodes||!data.links) throw new Error(C.aiInvalidResp);
    data.ts=Date.now();
    _tx('readwrite',function(st){st.add(data);});
    window.mm3dRender(data);
    if(window.awardXP) window.awardXP('mm3d_create',25,'T\u1ea1o Mind Map 3D');
    if(window.toast) toast(C.success,L.created.replace('{n}',data.nodes.length),'success');
  }catch(err){
    console.error('MM3D',err);
    if(el) el.innerHTML='<div class="alert alert-error">'+_esc(err.message)+'</div><button class="btn btn-secondary" onclick="mm3dOpenDialog()">'+C.tryAgain+'</button>';
  }
};

function _parseJSON(text){if(!text) return null;text=text.replace(/```json\s*/gi,'').replace(/```\s*$/g,'').trim();var s=text.indexOf('{'),e=text.lastIndexOf('}');if(s<0||e<0) return null;try{return JSON.parse(text.slice(s,e+1));}catch(err){return null;}}

window.mm3dRender=function(data){
  var el=document.getElementById('mm3dArea');
  if(!el) return;
  window.__mm3dLastData=data;
  var html='<div class="card" style="background:linear-gradient(135deg,rgba(0,200,150,.08),rgba(121,40,202,.08));border-color:var(--c1);margin-bottom:14px">'
    +'<h1 style="font-size:1.4rem;color:var(--c1);margin-bottom:6px">\u{1F5FA}\u{FE0F} '+_esc(data.title||L.dashTitle)+'</h1>'
    +'<div style="color:var(--text2);font-size:.88rem">'+data.nodes.length+' '+L.nodes+' \u2022 '+data.links.length+' '+L.links+' \u2022 '+L.hint+'</div>'
    +'</div>'
    +'<div class="mm3d-container" id="mm3dGraph">'
    +'<div class="mm3d-controls">'
    +'<button onclick="mm3dZoomIn()">\u{1F50D}+</button>'
    +'<button onclick="mm3dZoomOut()">\u{1F50D}-</button>'
    +'<button onclick="mm3dFit()">\u{1F4D0} '+L.fit+'</button>'
    +'<button onclick="mm3dRotate()">\u{1F504} '+L.rotate+'</button>'
    +'</div>'
    +'<div class="mm3d-legend">'
    +'<div class="lgi" style="--dot:var(--c1)">'+L.legendRoot+'</div>'
    +'<div class="lgi" style="--dot:var(--c2)">'+L.legendChild+'</div>'
    +'<div class="lgi" style="--dot:var(--c5)">'+L.legendDetail+'</div>'
    +'</div></div>'
    +'<div style="margin-top:14px;text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
    +'<button class="btn btn-primary" onclick="mm3dExport(\'png\')">\u{1F4F8} '+L.snapPhoto+'</button>'
    +'<button class="btn btn-secondary" onclick="mm3dExport(\'json\')">\u{1F4C4} '+L.exportJson+'</button>'
    +'<button class="btn btn-secondary" onclick="mm3dHistory()">\u{1F4DC} '+C.history+'</button>'
    +'<button class="btn btn-secondary" onclick="mm3dOpenDialog()">\u2795 '+C.create+'</button>'
    +'</div>';
  el.innerHTML=html;
  _loadLib(function(){
    var container=document.getElementById('mm3dGraph');
    if(!container) return;
    var groupColors=['#00c896','#007cf0','#f7971e','#7928ca','#ff4d4d'];
    _graph=ForceGraph3D()(container)
      .graphData({nodes:data.nodes,links:data.links})
      .nodeLabel(function(n){return n.label;})
      .nodeColor(function(n){return groupColors[n.group||0]||'#00c896';})
      .nodeVal(function(n){return n.size||5;})
      .linkColor(function(){return 'rgba(255,255,255,0.35)';})
      .linkWidth(1.5)
      .linkDirectionalParticles(2)
      .linkDirectionalParticleSpeed(0.006)
      .backgroundColor('rgba(0,0,0,0)')
      .width(container.clientWidth)
      .height(container.clientHeight);
    setTimeout(function(){if(_graph) _graph.zoomToFit(400,60);},800);
  });
};

window.mm3dZoomIn=function(){if(_graph){var d=_graph.cameraPosition();_graph.cameraPosition({z:d.z*0.7});}};
window.mm3dZoomOut=function(){if(_graph){var d=_graph.cameraPosition();_graph.cameraPosition({z:d.z*1.4});}};
window.mm3dFit=function(){if(_graph) _graph.zoomToFit(400,60);};
var _rotating=false,_rotateInterval=null;
window.mm3dRotate=function(){
  _rotating=!_rotating;
  if(_rotating){
    var angle=0, distance=_graph?_graph.cameraPosition().z:300;
    _rotateInterval=setInterval(function(){angle+=Math.PI/300; if(_graph) _graph.cameraPosition({x:distance*Math.sin(angle),z:distance*Math.cos(angle)},{x:0,y:0,z:0},0);},30);
  } else if(_rotateInterval) clearInterval(_rotateInterval);
};

window.mm3dExport=function(fmt){
  if(fmt==='png'){
    var canvas=document.querySelector('#mm3dGraph canvas');
    if(!canvas){ if(window.toast) toast(C.error,'Ch\u01b0a c\u00f3 graph','error'); return; }
    try{var url=canvas.toDataURL('image/png');var a=document.createElement('a');a.href=url;a.download='mindmap-3d.png';a.click();}
    catch(e){ if(window.toast) toast(C.error,e.message,'error'); }
  } else if(fmt==='json'){
    var d=window.__mm3dLastData; if(!d) return;
    var blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');a.href=url;a.download='mindmap.json';a.click();
    URL.revokeObjectURL(url);
  }
};

window.mm3dOpenDialog=function(){
  var el=document.getElementById('mm3dArea');
  if(!el) return;
  var readerText=(window.ST&&window.ST.reader&&window.ST.reader.inputText)||'';
  el.innerHTML='<div class="card"><div class="card-title">\u{1F5FA}\u{FE0F} '+L.dialogTitle+'</div>'
    +'<div class="alert alert-info" style="margin-top:12px">'+L.intro+'</div>'
    +'<div class="fgroup" style="margin-top:12px"><label>'+C.depth+'</label>'
    +'<select id="mm3dDepth"><option value="shallow">'+L.depthShallow+'</option><option value="medium" selected>'+L.depthMedium+'</option><option value="deep">'+L.depthDeep+'</option></select></div>'
    +'<div class="fgroup" style="margin-top:12px"><label>'+C.source+'</label><textarea id="mm3dSource" style="min-height:220px" placeholder="'+C.sourceHint+'">'+_esc(readerText)+'</textarea></div>'
    +'<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">'
    +'<button class="btn btn-primary" onclick="mm3dRun()">\u{1F680} '+L.startBtn+'</button>'
    +'<button class="btn btn-secondary" onclick="mm3dHistory()">\u{1F4DC} '+C.history+'</button>'
    +'</div></div>';
};

window.mm3dRun=function(){window.mm3dGenerate(document.getElementById('mm3dSource').value,{depth:document.getElementById('mm3dDepth').value});};

window.mm3dHistory=function(){
  var el=document.getElementById('mm3dArea');
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
            +'<div><div style="font-weight:700">\u{1F5FA}\u{FE0F} '+_esc(it.title||'Mindmap')+'</div>'
            +'<div style="font-size:.8rem;color:var(--text2)">'+new Date(it.ts).toLocaleString('vi')+' \u2022 '+(it.nodes?it.nodes.length:0)+' '+L.nodes+'</div></div>'
            +'<div style="display:flex;gap:6px"><button class="btn btn-primary btn-sm" onclick="mm3dOpen('+it.id+')">'+C.open+'</button>'
            +'<button class="btn btn-danger btn-sm" onclick="mm3dDelete('+it.id+')">'+C.delete_btn+'</button></div></div></div>';
        });
        html+='</div><div style="margin-top:14px"><button class="btn btn-secondary" onclick="mm3dOpenDialog()">\u2795 '+C.create+'</button></div></div>';
        el.innerHTML=html;
      }
    };
  });
};
window.mm3dOpen=function(id){_tx('readonly',function(st){st.get(id).onsuccess=function(e){if(e.target.result) window.mm3dRender(e.target.result);};});};
window.mm3dDelete=function(id){if(!confirm(C.confirmDelete)) return; _tx('readwrite',function(st){st.delete(id); setTimeout(window.mm3dHistory,200);});};

function _esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
console.log('[v12 Module 14] Mind Map 3D Vietnamese loaded');
})();
