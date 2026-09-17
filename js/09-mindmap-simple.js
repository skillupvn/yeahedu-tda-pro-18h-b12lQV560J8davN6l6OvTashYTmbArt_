// ================================================================
// YeahEdu-TDA v12.5 - Module 09: Simple Mind Map (Multi-style)
// FIX v12.5:
//  - Mobile/tablet responsive: toolbar cuộn ngang trên hẹp, chip button
//  - Export PNG/SVG có padding rộng để KHÔNG bị cắt
//  - Kids view redesign: câu chuyện + card nhánh + tip ôn tập
//  - Layout mặc định "Tòa hai bên" giờ có scale nhỏ để hiện full
// ================================================================
(function(){
  var LAYOUTS=[
    ['logicalStructure','Sơ đồ logic (phải)'],
    ['logicalStructureLeft','Sơ đồ logic (trái)'],
    ['mindMap','Tòa hai bên (bản đồ tư duy)'],
    ['organizationStructure','Sơ đồ tổ chức (cây dọc)'],
    ['catalogOrganization','Sơ đồ mục lục'],
    ['timeline','Dòng thời gian ngang'],
    ['timeline2','Dòng thời gian ngang 2'],
    ['verticalTimeline','Dòng thời gian dọc'],
    ['verticalTimeline2','Dòng thời gian dọc 2'],
    ['verticalTimeline3','Dòng thời gian dọc 3'],
    ['fishbone','Sơ đồ xương cá'],
    ['fishbone2','Sơ đồ xương cá 2'],
    ['rightFishbone','Sơ đồ xương cá (phải)'],
    ['__kids__','\u{1F9D2} Mindmap Tiểu học (dễ hiểu)']
  ];
  var THEMES=[
    ['classic4','Cổ điển 4 (khuyên dùng)'],
    ['default','Mặc định'],['classic','Cổ điển'],['classic2','Cổ điển 2'],
    ['classic3','Cổ điển 3'],['minions','Vui nhộn (vàng)'],
    ['pinkGrape','Nho hồng'],['mint','Bạc hà'],['gold','Vàng kim'],
    ['vitalityOrange','Cam năng động'],['greenLeaf','Lá xanh'],['skyGreen','Xanh trời'],
    ['classicGreen','Xanh cổ điển'],['classicBlue','Xanh dương cổ điển'],['blueSky','Bầu trời xanh'],
    ['brainImpairedPink','Hồng pastel'],['dark2','Tối'],['dark4','Tối 2'],['dark5','Tối 3'],
    ['autumn','Mùa thu'],['coffee','Cà phê'],['coffee2','Cà phê 2'],
    ['redSpirit','Đỏ rực'],['blackHumour','Hài đen'],['lateNightOffice','Văn phòng đêm'],
    ['blackGold','Đen vàng'],['avocado','Bơ'],['freshRed','Đỏ tươi'],['freshGreen','Xanh tươi']
  ];
  if(typeof window.externalPublicPath==='undefined'){ window.externalPublicPath=''; }
  function getSMM(){
    var s=window.simpleMindMap;
    if(!s) return null;
    return s.default||s.MindMap||s;
  }
  window.__smmInstance=null;
  window.__smmData=null;
  window.__smmIsKids=false;

  // ============================================================
  // Convert markdown -> tree of simple-mind-map
  // ============================================================
  function mdToTree(md){
    var lines=(md||'').replace(/\r/g,'').split('\n');
    var root=null, stack=[];
    function node(text){return {data:{text:text},children:[]};}
    lines.forEach(function(l){
      var h=l.match(/^(#{1,6})\s+(.+)$/);
      if(h){
        var lv=h[1].length, txt=h[2].replace(/[*`]/g,'').trim();
        var n=node(txt);
        if(lv===1||!root){ if(!root){root=n; stack=[{lv:lv,n:n}]; return;} }
        while(stack.length && stack[stack.length-1].lv>=lv) stack.pop();
        if(stack.length){ stack[stack.length-1].n.children.push(n); }
        else if(root){ root.children.push(n); }
        stack.push({lv:lv,n:n});
        return;
      }
      var li=l.match(/^(\s*)[-*]\s+(.+)$/);
      if(li){
        var indent=li[1].length, txt2=li[2].replace(/[*`]/g,'').trim();
        var n2=node(txt2), baseLv=100+indent;
        if(!root){ root=n2; stack=[{lv:baseLv,n:n2}]; return; }
        while(stack.length && stack[stack.length-1].lv>=baseLv) stack.pop();
        if(stack.length){ stack[stack.length-1].n.children.push(n2); }
        else { root.children.push(n2); }
        stack.push({lv:baseLv,n:n2});
      }
    });
    return root||node('Sơ đồ tư duy');
  }

  function getCurrentMD(){
    if(window.__mmLastMD) return window.__mmLastMD;
    var canvas=document.querySelector('.mm-canvas');
    if(canvas){ var pre=canvas.querySelector('pre'); if(pre) return pre.textContent; }
    return '';
  }

  // ============================================================
  // Open Multi-Style Mindmap modal
  // ============================================================
  window.openSmm=function(){
    if(!getSMM()){
      if(!window.__smmLoading){
        window.__smmLoading=true;
        if(typeof toast!=='undefined'){toast('Đang tải sơ đồ đa phong cách','Vui lòng chờ vài giây...','info',4000);}
        var s=document.createElement('script');
        s.src='https://cdn.jsdelivr.net/npm/simple-mind-map@0.14.0/dist/simpleMindMap.umd.min.js';
        s.onload=function(){window.__smmLoading=false;window.openSmm();};
        s.onerror=function(){window.__smmLoading=false;alert('Không tải được thư viện sơ đồ. Kiểm tra mạng.');};
        document.head.appendChild(s);
      }
      return;
    }
    var md=getCurrentMD();
    if(!md||!md.trim()){ if(typeof toast!=='undefined'){toast('Chưa có nội dung','Hãy phân tích sơ đồ tư duy trước','warn');} return; }
    window.__smmData=mdToTree(md);
    var modal=document.getElementById('smmModal');
    modal.style.display='flex';
    var ls=document.getElementById('smmLayoutSel');
    if(!ls.options.length){ ls.innerHTML=LAYOUTS.map(function(p,i){return '<option value="'+i+'">'+p[1]+'</option>'}).join(''); }
    var ts=document.getElementById('smmThemeSel');
    if(!ts.options.length){ ts.innerHTML=THEMES.map(function(p){return '<option value="'+p[0]+'">'+p[1]+'</option>'}).join(''); }
    ls.onchange=render; ts.onchange=render;
    ls.value='2'; ts.value='classic4';
    setTimeout(render,80);
    if(typeof SFX!=='undefined'&&SFX.click) SFX.click();
  };

  function render(){
    var canvas=document.getElementById('smmCanvas');
    var layoutIdx=parseInt(document.getElementById('smmLayoutSel').value||'2',10);
    var pair=LAYOUTS[layoutIdx]||LAYOUTS[2];
    var layout=pair[0];
    var theme=document.getElementById('smmThemeSel').value||'classic4';
    window.__smmIsKids=(layout==='__kids__');
    // If kids mode: force fun theme + easy layout
    if(window.__smmIsKids){ theme='minions'; layout='mindMap'; }
    canvas.innerHTML='';
    var _darkThemes=['dark2','dark4','dark5','blackGold','blackHumour','lateNightOffice','redSpirit','coffee','coffee2'];
    canvas.style.background=(_darkThemes.indexOf(theme)>=0?'#12161f':'#ffffff');
    var SMM=getSMM();
    if(!SMM){ canvas.innerHTML='<div style="padding:30px;color:#b02525">Thư viện chưa sẵn sàng</div>'; return; }
    try{
      window.__smmInstance=new SMM({
        el:canvas,
        data:JSON.parse(JSON.stringify(window.__smmData)),
        layout:layout,
        theme:theme,
        fit:true,
        readonly:false,
        mousewheelAction:'zoom',
        nodeTextEditZIndex:99999,
        nodeNoteTooltipZIndex:99999,
        // v12.5: Extra padding so tree không sát mép
        viewPadding: 50
      });
      // v12.5: Auto fit sau khi render xong
      setTimeout(function(){
        try{ if(window.__smmInstance) window.__smmInstance.view.fit(); }catch(e){}
      }, 300);
    }catch(e){ canvas.innerHTML='<div style="padding:30px;color:#b02525">Lỗi vẽ sơ đồ: '+e.message+'</div>'; return; }
    var kidsBox=document.getElementById('smmKidsBox');
    if(window.__smmIsKids){ kidsBox.style.display='block'; kidsBox.innerHTML=buildKidsV2(window.__smmData); }
    else { kidsBox.style.display='none'; }
  }

  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

  // ============================================================
  // v12.5 KIDS VIEW REDESIGN — Story-first + colored branch cards
  // ============================================================
  function buildKidsV2(tree){
    var main=(tree.data&&tree.data.text)||'kiến thức này';
    var branches=(tree.children||[]);
    var emo=['\u{1F34E}','\u2B50','\u{1F680}','\u{1F388}','\u{1F418}','\u{1F308}','\u{1F337}','\u{1F984}'];
    var colors=[
      ['#ff6b6b','#fff5f5'],['#4dabf7','#e7f5ff'],['#51cf66','#ebfbee'],
      ['#f7971e','#fff7e6'],['#7928ca','#f8f3ff'],['#20c997','#e6fcf5'],
      ['#e64980','#fff0f6'],['#3bc9db','#e3fafc']
    ];
    var h='';
    // Story intro
    h+='<div style="text-align:center;margin-bottom:14px">'
      +'<div style="font-size:2rem;margin-bottom:4px">\u{1F31F}\u{1F4DA}\u{1F31F}</div>'
      +'<h3 style="color:#e67700;margin:0;font-size:1.2rem;font-weight:800">Cùng khám phá: '+esc(main)+'</h3>'
      +'<div style="color:#5a5a5a;font-size:.88rem;margin-top:4px">Sơ đồ này giúp em nhớ nhanh và học vui!</div>'
      +'</div>';

    // Story-style intro
    h+='<div style="background:#fff;border-radius:12px;padding:12px 16px;margin-bottom:12px;border-left:5px solid #4dabf7">'
      +'<div style="font-weight:700;margin-bottom:6px">\u{1F4D6} Câu chuyện nhỏ:</div>'
      +'<p style="margin:0;line-height:1.7">Em hãy tưởng tượng <b>'+esc(main)+'</b> giống như một <b>cái cây to</b> \u{1F333}. '
      +'Ở <b>giữa là gốc cây</b> (điều chính), và mỗi <b>cành cây</b> mở ra là một điều thú vị cần nhớ. '
      +'Cây của chúng ta có <b>'+branches.length+' cành</b> chính đấy!</p>'
      +'</div>';

    // Branch cards - grid layout for easy scanning
    if(branches.length){
      h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin-bottom:12px">';
      branches.slice(0,8).forEach(function(b,i){
        var color=colors[i%colors.length];
        var kidsList=(b.children||[]).slice(0,4);
        h+='<div style="background:'+color[1]+';border:2px solid '+color[0]+';border-radius:14px;padding:12px 14px">'
          +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
          +'<div style="font-size:1.6rem">'+emo[i%emo.length]+'</div>'
          +'<div style="font-weight:800;color:'+color[0]+';font-size:1rem">Cành '+(i+1)+': '+esc(b.data&&b.data.text)+'</div>'
          +'</div>';
        if(kidsList.length){
          h+='<ul style="margin:0 0 0 20px;padding:0;list-style:disc;line-height:1.65;font-size:.88rem">';
          kidsList.forEach(function(c){
            h+='<li>'+esc(c.data&&c.data.text)+'</li>';
          });
          h+='</ul>';
        } else {
          h+='<div style="color:#666;font-size:.85rem;font-style:italic">Nhánh nhỏ chưa có chi tiết</div>';
        }
        h+='</div>';
      });
      h+='</div>';
    }

    // Tips + game
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">'
      +'<div style="background:linear-gradient(135deg,#e6fff3,#fff);border-radius:12px;padding:12px 14px;border-left:5px solid #00c896">'
      +'<div style="font-weight:800;color:#00845f;margin-bottom:4px">\u{1F4A1} Mẹo nhớ lâu</div>'
      +'<div style="font-size:.88rem;line-height:1.6">Nhìn sơ đồ 30 giây \u2192 nhắm mắt \u2192 kể lại số cành nào em nhớ được.</div>'
      +'</div>'
      +'<div style="background:linear-gradient(135deg,#fff0f5,#fff);border-radius:12px;padding:12px 14px;border-left:5px solid #ff6b6b">'
      +'<div style="font-weight:800;color:#c0245e;margin-bottom:4px">\u{1F3AF} Thử thách vui</div>'
      +'<div style="font-size:.88rem;line-height:1.6">Kể lại cho ba mẹ về <b>'+esc(main)+'</b> bằng lời của em xem sao!</div>'
      +'</div>'
      +'</div>';

    return h;
  }

  window.closeSmm=function(){
    document.getElementById('smmModal').style.display='none';
    if(window.__smmInstance){ try{window.__smmInstance.destroy()}catch(e){} window.__smmInstance=null; }
  };
  window.smmFit=function(){ if(window.__smmInstance){ try{window.__smmInstance.view.fit()}catch(e){} } };

  // ============================================================
  // v12.5 EXPORT — Fit + padding trước khi export để KHÔNG bị cắt
  // ============================================================
  window.smmExport=function(type){
    if(!window.__smmInstance){
      if(typeof toast!=='undefined') toast('Chưa có sơ đồ','Hãy mở sơ đồ trước','warn');
      return;
    }
    try{
      // Fit toàn bộ cây vào view TRƯỚC khi export
      window.__smmInstance.view.fit();
      // Đợi 200ms cho fit xong
      setTimeout(function(){
        try{
          // v0.14 signature: export(type, isDownload, name, withConfig, paddingX, paddingY)
          window.__smmInstance.export(type, true, 'so-do-tu-duy', false);
          if(typeof toast!=='undefined') toast('Đã tải','File '+type.toUpperCase()+' đã lưu','success');
        }catch(e2){
          // Fallback for older sig
          try{
            window.__smmInstance.export(type, true, 'so-do-tu-duy');
          }catch(e3){
            if(typeof toast!=='undefined') toast('Lỗi xuất',e3.message,'error');
          }
        }
      }, 250);
    }catch(e){ if(typeof toast!=='undefined'){toast('Lỗi xuất',e.message,'error');} }
  };

  // ============================================================
  // Auto-inject "Xem đa phong cách" button into Markmap toolbar
  // ============================================================
  function injectBtn(){
    var toolbar=document.querySelector('.mm-toolbar');
    if(!toolbar||document.getElementById('smmOpenBtn')) return;
    var canvas=document.querySelector('.mm-canvas');
    if(canvas){ var pre=canvas.querySelector('pre'); if(pre&&pre.textContent.trim()) window.__mmLastMD=pre.textContent; }
    var b=document.createElement('button');
    b.id='smmOpenBtn';
    b.textContent='\u{1F3A8} Xem đa phong cách (14 kiểu)';
    b.style.cssText='background:linear-gradient(135deg,#7928ca,#ff4d4d);color:#fff;border:none;border-radius:8px;padding:7px 12px;font-weight:700;cursor:pointer;font-size:.8rem;margin-right:6px';
    b.onclick=window.openSmm;
    var btns=toolbar.querySelector('.mm-tool-btns');
    if(btns){ btns.insertBefore(b, btns.firstChild); } else { toolbar.appendChild(b); }
  }
  function boot(){
    new MutationObserver(injectBtn).observe(document.body,{childList:true,subtree:true});
    setInterval(injectBtn,1200);
    setInterval(function(){
      var canvas=document.querySelector('.mm-canvas');
      if(canvas){ var pre=canvas.querySelector('pre'); if(pre&&pre.textContent.trim()) window.__mmLastMD=pre.textContent; }
    },1500);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
