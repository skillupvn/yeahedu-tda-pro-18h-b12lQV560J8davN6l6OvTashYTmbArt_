// Module 09-mindmap.js - Simple Mind Map & Kids View (from v10 script 3)


(function(){
  var LAYOUTS=[
    ['logicalStructure','S\u01a1 \u0111\u1ed3 logic (ph\u1ea3i)'],
    ['logicalStructureLeft','S\u01a1 \u0111\u1ed3 logic (tr\u00e1i)'],
    ['mindMap','T\u1ecfa hai b\u00ean (ki\u1ec3u b\u1ea3n \u0111\u1ed3 t\u01b0 duy)'],
    ['organizationStructure','S\u01a1 \u0111\u1ed3 t\u1ed5 ch\u1ee9c (c\u00e2y d\u1ecdc)'],
    ['catalogOrganization','S\u01a1 \u0111\u1ed3 m\u1ee5c l\u1ee5c'],
    ['timeline','D\u00f2ng th\u1eddi gian ngang'],
    ['timeline2','D\u00f2ng th\u1eddi gian ngang 2'],
    ['verticalTimeline','D\u00f2ng th\u1eddi gian d\u1ecdc'],
    ['verticalTimeline2','D\u00f2ng th\u1eddi gian d\u1ecdc 2'],
    ['verticalTimeline3','D\u00f2ng th\u1eddi gian d\u1ecdc 3'],
    ['fishbone','S\u01a1 \u0111\u1ed3 x\u01b0\u01a1ng c\u00e1'],
    ['fishbone2','S\u01a1 \u0111\u1ed3 x\u01b0\u01a1ng c\u00e1 2'],
    ['rightFishbone','S\u01a1 \u0111\u1ed3 x\u01b0\u01a1ng c\u00e1 (ph\u1ea3i)'],
    ['organizationStructure','S\u01a1 \u0111\u1ed3 t\u01b0 duy ti\u1ec3u h\u1ecdc (d\u1ec5 hi\u1ec3u + h\u01b0\u1edbng d\u1eabn)']
  ];
  var THEMES=[
    ['default','M\u1eb7c \u0111\u1ecbnh'],['classic','C\u1ed5 \u0111i\u1ec3n'],['classic2','C\u1ed5 \u0111i\u1ec3n 2'],
    ['classic3','C\u1ed5 \u0111i\u1ec3n 3'],['classic4','C\u1ed5 \u0111i\u1ec3n 4'],['minions','Vui nh\u1ed9n (v\u00e0ng)'],
    ['pinkGrape','Nho h\u1ed3ng'],['mint','B\u1ea1c h\u00e0'],['gold','V\u00e0ng kim'],
    ['vitalityOrange','Cam n\u0103ng \u0111\u1ed9ng'],['greenLeaf','L\u00e1 xanh'],['skyGreen','Xanh tr\u1eddi'],
    ['classicGreen','Xanh c\u1ed5 \u0111i\u1ec3n'],['classicBlue','Xanh d\u01b0\u01a1ng c\u1ed5 \u0111i\u1ec3n'],['blueSky','B\u1ea7u tr\u1eddi xanh'],
    ['brainImpairedPink','H\u1ed3ng pastel'],['dark2','T\u1ed1i'],['dark4','T\u1ed1i 2'],['dark5','T\u1ed1i 3'],
    ['autumn','M\u00f9a thu'],['coffee','C\u00e0 ph\u00ea'],['coffee2','C\u00e0 ph\u00ea 2'],
    ['redSpirit','\u0110\u1ecf r\u1ef1c'],['blackHumour','H\u00e0i \u0111en'],['lateNightOffice','V\u0103n ph\u00f2ng \u0111\u00eam'],
    ['blackGold','\u0110en v\u00e0ng'],['avocado','B\u01a1'],['freshRed','\u0110\u1ecf t\u01b0\u01a1i'],['freshGreen','Xanh t\u01b0\u01a1i']
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

  // Chuyen markdown -> cay du lieu cua simple-mind-map
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
    return root||node('So do tu duy');
  }

  // Lay markdown mindmap dang hien thi (tu the pre trong .mm-canvas)
  function getCurrentMD(){
    if(window.__mmLastMD) return window.__mmLastMD;
    var canvas=document.querySelector('.mm-canvas');
    if(canvas){ var pre=canvas.querySelector('pre'); if(pre) return pre.textContent; }
    return '';
  }

  window.openSmm=function(){
    if(!getSMM()){
      if(!window.__smmLoading){
        window.__smmLoading=true;
        if(typeof toast!=='undefined'){toast('Dang tai so do da phong cach','Vui long cho vai giay...','info',4000);}
        var s=document.createElement('script');
        s.src='https://cdn.jsdelivr.net/npm/simple-mind-map@0.14.0/dist/simpleMindMap.umd.min.js';
        s.onload=function(){window.__smmLoading=false;window.openSmm();};
        s.onerror=function(){window.__smmLoading=false;alert('Khong tai duoc thu vien so do. Kiem tra mang.');};
        document.head.appendChild(s);
      }
      return;
    }
    var md=getCurrentMD();
    if(!md||!md.trim()){ if(typeof toast!=='undefined'){toast('Chua co noi dung','Hay phan tich so do tu duy truoc','warn');} return; }
    window.__smmData=mdToTree(md);
    var modal=document.getElementById('smmModal');
    modal.style.display='flex';
    // Do dropdown
    var ls=document.getElementById('smmLayoutSel');
    if(!ls.options.length){ ls.innerHTML=LAYOUTS.map(function(p,i){return '<option value="'+i+'">'+p[1]+'</option>'}).join(''); }
    var ts=document.getElementById('smmThemeSel');
    if(!ts.options.length){ ts.innerHTML=THEMES.map(function(p){return '<option value="'+p[0]+'">'+p[1]+'</option>'}).join(''); }
    ls.onchange=render; ts.onchange=render;
    ls.value='2'; ts.value='classic4'; // mac dinh kieu toa hai ben, mau co dien
    setTimeout(render,60);
    if(typeof SFX!=='undefined'&&SFX.click) SFX.click();
  };

  function render(){
    var canvas=document.getElementById('smmCanvas');
    var layoutIdx=parseInt(document.getElementById('smmLayoutSel').value||'2',10);
    var pair=LAYOUTS[layoutIdx]||LAYOUTS[2];
    var layout=pair[0];
    var theme=document.getElementById('smmThemeSel').value||'classic4';
    window.__smmIsKids=(pair[1].indexOf('tieu hoc')>=0);
    // Neu kieu tieu hoc: ep theme vui nhon + layout toa hai ben cho de nhin
    if(window.__smmIsKids){ theme='minions'; layout='mindMap'; }
    canvas.innerHTML='';
    var _darkThemes=['dark2','dark4','dark5','blackGold','blackHumour','lateNightOffice','redSpirit','coffee','coffee2'];
    canvas.style.background=(_darkThemes.indexOf(theme)>=0?'#12161f':'#ffffff');
    var SMM=getSMM();
    if(!SMM){ canvas.innerHTML='<div style="padding:30px;color:#b02525">Thu vien chua san sang</div>'; return; }
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
        nodeNoteTooltipZIndex:99999
      });
    }catch(e){ canvas.innerHTML='<div style="padding:30px;color:#b02525">Loi ve so do: '+e.message+'</div>'; return; }
    // Bai giai thich tieu hoc
    var kidsBox=document.getElementById('smmKidsBox');
    if(window.__smmIsKids){ kidsBox.style.display='block'; kidsBox.innerHTML=buildKids(window.__smmData); }
    else { kidsBox.style.display='none'; }
  }

  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function buildKids(tree){
    var main=(tree.data&&tree.data.text)||'ki\u1ebfn th\u1ee9c n\u00e0y';
    var br=(tree.children||[]).slice(0,6);
    var emo=['\uD83C\uDF4E','\u2B50','\uD83D\uDE80','\uD83C\uDF88','\uD83D\uDC18','\uD83C\uDF08'];
    var h='<h3 style="color:#e67700;margin:0 0 8px;font-size:1.1rem">\uD83E\uDDD2 Gi\u1ea3i th\u00edch si\u00eau d\u1ec5 hi\u1ec3u cho em nh\u00e9!</h3>';
    h+='<p>H\u00f4m nay ch\u00fang m\u00ecnh c\u00f9ng t\u00ecm hi\u1ec3u v\u1ec1 <b>'+esc(main)+'</b> nha! H\u00e3y t\u01b0\u1edfng t\u01b0\u1ee3ng \u0111\u00e2y l\u00e0 m\u1ed9t <b>c\u00e1i c\u00e2y</b> \uD83C\uDF33: \u1edf gi\u1eefa l\u00e0 <b>g\u1ed1c c\u00e2y</b> (\u00fd ch\u00ednh), c\u00f2n c\u00e1c nh\u00e1nh t\u1ecfa ra l\u00e0 nh\u1eefng \u0111i\u1ec1u th\u00fa v\u1ecb c\u1ea7n nh\u1edb.</p>';
    if(br.length){
      h+='<p><b>C\u00e1i c\u00e2y c\u1ee7a ch\u00fang m\u00ecnh c\u00f3 '+br.length+' nh\u00e1nh l\u1edbn:</b></p><ol style="margin-left:18px;line-height:2">';
      br.forEach(function(b,i){
        var kids=(b.children||[]).slice(0,3).map(function(c){return esc(c.data&&c.data.text)});
        h+='<li>'+emo[i%emo.length]+' <b>'+esc(b.data&&b.data.text)+'</b>';
        if(kids.length) h+=' &mdash; g\u1ed3m c\u00f3: '+kids.join(', ')+'.';
        h+='</li>';
      });
      h+='</ol>';
    }
    h+='<div style="background:#fff;border-radius:10px;padding:10px 14px;margin-top:10px;border-left:4px solid #00c896">\uD83D\uDCA1 <b>M\u1eb9o nh\u1edb l\u00e2u:</b> Em h\u00e3y nh\u00ecn v\u00e0o s\u01a1 \u0111\u1ed3 m\u00e0u s\u1eafc ph\u00eda tr\u00ean, \u0111\u1ecdc to t\u1eebng nh\u00e1nh 1 l\u1ea7n, r\u1ed3i che l\u1ea1i v\u00e0 th\u1eed nh\u1edb xem c\u00e1i c\u00e2y c\u00f3 m\u1ea5y nh\u00e1nh nh\u00e9!</div>';
    h+='<div style="background:#fff;border-radius:10px;padding:10px 14px;margin-top:10px;border-left:4px solid #ff6b6b">\uD83C\uDFAF <b>C\u00e2u h\u1ecfi vui:</b> Em th\u1eed k\u1ec3 l\u1ea1i cho ba m\u1eb9 nghe v\u1ec1 <b>'+esc(main)+'</b> b\u1eb1ng l\u1eddi c\u1ee7a m\u00ecnh xem n\u00e0o!</div>';
    return h;
  }

  window.closeSmm=function(){
    document.getElementById('smmModal').style.display='none';
    if(window.__smmInstance){ try{window.__smmInstance.destroy()}catch(e){} window.__smmInstance=null; }
  };
  window.smmFit=function(){ if(window.__smmInstance){ try{window.__smmInstance.view.fit()}catch(e){} } };
  window.smmExport=function(type){
    if(!window.__smmInstance) return;
    try{
      window.__smmInstance.export(type,true,'so-do-tu-duy');
    }catch(e){ if(typeof toast!=='undefined'){toast('Loi xuat',e.message,'error');} }
  };

  // Tu dong chen nut "Xem da phong cach" vao thanh cong cu mindmap Markmap
  function injectBtn(){
    var toolbar=document.querySelector('.mm-toolbar');
    if(!toolbar||document.getElementById('smmOpenBtn')) return;
    var canvas=document.querySelector('.mm-canvas');
    if(canvas){ var pre=canvas.querySelector('pre'); if(pre&&pre.textContent.trim()) window.__mmLastMD=pre.textContent; }
    var b=document.createElement('button');
    b.id='smmOpenBtn';
    b.textContent='\uD83C\uDFA8 Xem da phong cach (14 kieu)';
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
