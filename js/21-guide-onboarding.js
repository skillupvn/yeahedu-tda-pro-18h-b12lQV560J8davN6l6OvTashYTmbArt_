// ================================================================
// YeahEdu-TDA v12 - Module 21: Guide Tab + Onboarding 5 Steps
// ================================================================
(function(){
'use strict';

var GUIDE_SECTIONS=[
  {
    id:'start', icon:'\u{1F680}', title:'B\u1eaft \u0111\u1ea7u nhanh',
    items:[
      {q:'L\u00e0m sao \u0111\u1ec3 t\u1ea1o Quiz \u0111\u1ea7u ti\u00ean?', a:'V\u00e0o tab <b>Luy\u1ec7n t\u1eadp \u2192 Tr\u1eafc nghi\u1ec7m</b>, dan noi dung tai lieu vao o van ban, chon so cau + do kho, r\u1ed3i b\u1ea5m <b>T\u1ea1o Quiz</b>. AI se sinh cau hoi trong 5-15 giay.'},
      {q:'Kh\u00f4ng c\u00f3 tai lieu, l\u00e0m sao?', a:'B\u1ea1n c\u00f3 th\u1ec3: (1) Ch\u1ecdn ch\u1ee7 \u0111\u1ec1 c\u00f3 s\u1eb5n \u1edf tab <b>Ch\u1ee7 \u0111\u1ec1</b>, (2) D\u00f9ng t\u00ednh n\u0103ng <b>T\u00ecm ki\u1ebfm web</b> \u0111\u1ec3 l\u1ea5y n\u1ed9i dung t\u1eeb Internet, (3) T\u1ef1 nh\u1eadp ch\u1ee7 \u0111\u1ec1 v\u00e0 AI s\u1ebd sinh n\u1ed9i dung t\u01b0\u01a1ng \u1ee9ng.'},
      {q:'C\u1ea7n API key AI \u1edf \u0111\u00e2u?', a:'V\u00e0o <b>\u2699\uFE0F C\u00e0i \u0111\u1eb7t</b>. Ch\u1ecdn <b>Free t\u1ed1t nh\u1ea5t</b> \u0111\u1ec3 xem c\u00e1c AI mi\u1ec5n ph\u00ed. Google Gemini v\u00e0 Groq \u0111\u1ec1u c\u00f3 g\u00f3i mi\u1ec5n ph\u00ed t\u1ed1t. L\u1ea5y key t\u1ea1i: <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com/apikey</a>'}
    ]
  },
  {
    id:'ai_studio', icon:'\u{1F9E0}', title:'AI Studio - 5 t\u00ednh n\u0103ng cao c\u1ea5p',
    items:[
      {q:'\u{1F9E0} SM-2 Spaced Repetition l\u00e0 g\u00ec?', a:'L\u00e0 h\u1ec7 th\u1ed1ng \u00f4n t\u1eadp d\u1ef1a tr\u00ean thu\u1eadt to\u00e1n Anki khoa h\u1ecdc. AI t\u1ef1 s\u1eafp x\u1ebfp l\u1ecbch \u00f4n: th\u1ebb b\u1ea1n bi\u1ebft r\u00f5 s\u1ebd \u0111\u01b0\u1ee3c \u00f4n c\u00e1ch xa nhau (v\u00e0i tu\u1ea7n), th\u1ebb qu\u00ean \u0111\u01b0\u1ee3c \u00f4n l\u1ea1i s\u1edbm h\u01a1n. Gi\u00fap ghi nh\u1edb l\u00e2u d\u00e0i.<br><br><b>C\u00e1ch d\u00f9ng:</b> T\u1ea1o Flashcard \u2192 B\u1ea5m "Th\u00eam v\u00e0o SM-2" \u2192 V\u00e0o tab SM-2 \u2192 \u00d4n theo l\u1ecbch.'},
      {q:'\u{1F4DD} \u0110\u1ec1 c\u01b0\u01a1ng t\u1ef1 sinh th\u1ebf n\u00e0o?', a:'AI \u0111\u1ecdc t\u00e0i li\u1ec7u c\u1ee7a b\u1ea1n v\u00e0 t\u1ea1o \u0111\u1ec1 c\u01b0\u01a1ng \u00f4n t\u1eadp c\u00f3 c\u1ea5u tr\u00fac: M\u1ee5c ti\u00eau, M\u1ee5c l\u1ee5c, T\u1eebng ph\u1ea7n (v\u1edbi t\u1eeb kh\u00f3a, v\u00ed d\u1ee5), \u0110i\u1ec3m tr\u1ecdng y\u1ebfu, C\u00e2u h\u1ecfi \u00f4n t\u1eadp.'},
      {q:'\u2753 FAQ Generator l\u00e0m g\u00ec?', a:'Sinh t\u1eeb 10-30 c\u00e2u h\u1ecfi + tr\u1ea3 l\u1eddi t\u1eeb t\u00e0i li\u1ec7u, ph\u00e2n theo \u0111\u1ed9 kh\u00f3 (c\u01a1 b\u1ea3n / trung b\u00ecnh / n\u00e2ng cao). H\u1eefu \u00edch cho on tap tr\u01b0\u1edbc thi.'},
      {q:'\u{1F4C5} Timeline d\u00f9ng khi n\u00e0o?', a:'Khi t\u00e0i li\u1ec7u c\u00f3 nhi\u1ec1u m\u1ed1c th\u1eddi gian (l\u1ecbch s\u1eed, ti\u1ec3u s\u1eed, quy tr\u00ecnh khoa h\u1ecdc). AI r\u00fat tr\u00edch t\u1ef1 \u0111\u1ed9ng v\u00e0 s\u1eafp x\u1ebfp theo th\u1ee9 t\u1ef1, ph\u00e2n \u0111\u1ed9 quan tr\u1ecdng.'},
      {q:'\u{1F5FA}\u{FE0F} Mind Map 3D c\u00f3 g\u00ec \u0111\u1eb7c bi\u1ec7t?', a:'C\u00e2y tri th\u1ee9c 3D t\u01b0\u01a1ng t\u00e1c. Xoay 360\u00b0, ph\u00f3ng to/thu nh\u1ecf b\u1eb1ng chu\u1ed9t. C\u00f3 3 c\u1ea5p \u0111\u1ed9 s\u00e2u \u0111\u1ec3 ch\u1ecdn: n\u00f4ng (t\u1ed5ng quan) / v\u1eeba / s\u00e2u (chi ti\u1ebft).'}
    ]
  },
  {
    id:'gamification', icon:'\u{1F3C6}', title:'H\u1ec7 th\u1ed1ng ph\u1ea7n th\u01b0\u1edfng',
    items:[
      {q:'XP v\u00e0 Level ho\u1ea1t \u0111\u1ed9ng nh\u01b0 th\u1ebf n\u00e0o?', a:'M\u1ed7i h\u00e0nh \u0111\u1ed9ng h\u1ecdc t\u1eadp \u0111\u1ec1u nh\u1eadn XP: Ho\u00e0n th\u00e0nh quiz (+15), \u00f4n th\u1ebb SM-2 (+5), T\u1ea1o \u0111\u1ec1 c\u01b0\u01a1ng (+20)... Level t\u0103ng theo c\u00f4ng th\u1ee9c: Lv.2 c\u1ea7n 100 XP, Lv.3 c\u1ea7n 300 XP, Lv.10 c\u1ea7n ~4500 XP...'},
      {q:'Streak \u0111\u1ebfm nh\u01b0 th\u1ebf n\u00e0o?', a:'M\u1ed7i ng\u00e0y b\u1ea1n m\u1edf app v\u00e0 h\u1ecdc \u00edt nh\u1ea5t 1 vi\u1ec7c \u2192 streak +1. B\u1ecf 1 ng\u00e0y \u2192 streak reset v\u1ec1 0. C\u00f3 huy hi\u1ec7u \u0111\u1eb7c bi\u1ec7t khi streak 3, 7, 30, 100 ng\u00e0y.'},
      {q:'C\u00f3 bao nhi\u00eau huy hi\u1ec7u?', a:'Hi\u1ec7n c\u00f3 <b>20 huy hi\u1ec7u</b>: \u0110\u0103ng nh\u1eadp l\u1ea7n \u0111\u1ea7u, quiz \u0111\u1ea7u ti\u00ean, streak c\u00e1c m\u1ed1c, level c\u00e1c m\u1ed1c, s\u1ed1 xu, s\u1eed d\u1ee5ng \u0111\u1ee7 t\u00ednh n\u0103ng...'},
      {q:'D\u00f9ng xu \u0111\u1ec3 mua g\u00ec?', a:'V\u00e0o <b>H\u1ed3 s\u01a1 \u2192 C\u1eeda h\u00e0ng xu</b>. C\u00f3: X2 XP 1h, B\u1ecf qua quest, \u0110\u00f4ng streak, Theme v\u00e0ng/sakura, G\u1ee3i \u00fd quiz...'},
      {q:'Nhi\u1ec7m v\u1ee5 h\u00e0ng ng\u00e0y?', a:'M\u1ed7i ng\u00e0y c\u00f3 3 nhi\u1ec7m v\u1ee5 ng\u1eabu nhi\u00ean. Ho\u00e0n th\u00e0nh nh\u1eadn XP + xu. Reset m\u1ed7i 00:00.'}
    ]
  },
  {
    id:'topics', icon:'\u{1F4DA}', title:'Ch\u1ee7 \u0111\u1ec1 v\u00e0 Th\u01b0 vi\u1ec7n',
    items:[
      {q:'Ch\u1ee7 \u0111\u1ec1 t\u1eeb \u0111\u00e2u m\u00e0 c\u00f3?', a:'Ch\u1ee7 \u0111\u1ec1 t\u1ef1 \u0111\u1ed9ng \u0111\u01b0\u1ee3c t\u1ea1o t\u1eeb: (1) T\u00e0i li\u1ec7u b\u1ea1n upload/AI Reader t\u1ea1o, (2) B\u1ed9 flashcard SM-2, (3) \u0110\u1ec1 c\u01b0\u01a1ng/FAQ/Timeline/Mind Map \u0111\u00e3 t\u1ea1o, (4) B\u1ea1n t\u1ef1 nh\u1eadp t\u1ea1o m\u1edbi. Kh\u00f4ng c\u00f2n code c\u1ee9ng nh\u01b0 v10/v11!'},
      {q:'L\u00e0m sao dung ch\u1ee7 \u0111\u1ec1 \u0111\u1ec3 t\u1ea1o quiz?', a:'B\u1ea5m v\u00e0o ch\u1ee7 \u0111\u1ec1 \u2192 ch\u1ecdn "\u{1F4DD} Quiz" ho\u1eb7c "\u{1F3B4} Flash". App s\u1ebd chuy\u1ec3n sang tab t\u01b0\u01a1ng \u1ee9ng v\u00e0 t\u1ef1 fill n\u1ed9i dung ngu\u1ed3n.'},
      {q:'Th\u01b0 vi\u1ec7n l\u01b0u \u1edf \u0111\u00e2u?', a:'M\u1ecdi d\u1eef li\u1ec7u l\u01b0u trong <b>IndexedDB</b> tr\u00ean tr\u00ecnh duy\u1ec7t c\u1ee7a b\u1ea1n. Kh\u00f4ng gi\u1edbi h\u1ea1n dung l\u01b0\u1ee3ng nh\u01b0 localStorage c\u0169. D\u1eef li\u1ec7u ri\u00eang cho m\u1ed7i domain.'}
    ]
  },
  {
    id:'api', icon:'\u{1F511}', title:'L\u1ea5y API key AI mi\u1ec5n ph\u00ed',
    items:[
      {q:'\u{1F48E} Google Gemini (kh\u00e1 t\u1ed1t)', a:'1. V\u00e0o <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com/apikey</a><br>2. \u0110\u0103ng nh\u1eadp Gmail<br>3. B\u1ea5m "Create API key"<br>4. Copy key, d\u00e1n v\u00e0o \u2699\uFE0F C\u00e0i \u0111\u1eb7t \u2192 Provider: Gemini'},
      {q:'\u26A1 Groq (SIEUsieu nhanh, mi\u1ec5n ph\u00ed)', a:'1. V\u00e0o <a href="https://console.groq.com/keys" target="_blank">console.groq.com/keys</a><br>2. \u0110\u0103ng nh\u1eadp<br>3. Create API Key<br>4. Copy, d\u00e1n v\u00e0o C\u00e0i \u0111\u1eb7t \u2192 Provider: Groq'},
      {q:'\u{1F310} OpenRouter (nhi\u1ec1u model mi\u1ec5n ph\u00ed)', a:'1. V\u00e0o <a href="https://openrouter.ai/keys" target="_blank">openrouter.ai/keys</a><br>2. \u0110\u0103ng nh\u1eadp Google<br>3. Create Key<br>4. Copy, d\u00e1n v\u00e0o C\u00e0i \u0111\u1eb7t. C\u00f3 nhi\u1ec1u model free: DeepSeek, Llama, Qwen...'},
      {q:'\u{1F30A} Mistral (Ch\u00e2u \u00c2u, mi\u1ec5n ph\u00ed)', a:'1. V\u00e0o <a href="https://console.mistral.ai" target="_blank">console.mistral.ai</a><br>2. \u0110\u0103ng nh\u1eadp<br>3. API Keys \u2192 Create'}
    ]
  },
  {
    id:'shortcuts', icon:'\u2328\uFE0F', title:'Ph\u00edm t\u1eaft',
    items:[
      {q:'C\u00e1c ph\u00edm t\u1eaft h\u1eefu \u00edch', a:'<div style="font-family:monospace;line-height:2"><kbd>Alt + 1-9</kbd> \u2014 Chuy\u1ec3n gi\u1eefa c\u00e1c tab<br><kbd>Alt + S</kbd> \u2014 M\u1edf C\u00e0i \u0111\u1eb7t<br><kbd>Ctrl + Enter</kbd> \u2014 B\u1eaft \u0111\u1ea7u quiz/flashcard<br><kbd>Space</kbd> \u2014 L\u1eadt flashcard<br><kbd>1-4</kbd> \u2014 Ch\u1ecdn \u0111\u00e1p \u00e1n quiz<br><kbd>\u2190 \u2192</kbd> \u2014 Chuy\u1ec3n th\u1ebb tr\u01b0\u1edbc/sau</div>'}
    ]
  },
  {
    id:'tips', icon:'\u{1F4A1}', title:'M\u1eb9o & Th\u1ee7 thu\u1eadt',
    items:[
      {q:'C\u00e1ch h\u1ecdc hi\u1ec7u qu\u1ea3 nh\u1ea5t v\u1edbi app n\u00e0y', a:'<b>Quy tr\u00ecnh v\u00e0ng:</b><br>1. \u{1F4C4} Upload t\u00e0i li\u1ec7u v\u00e0o AI Reader<br>2. \u{1F4DD} T\u1ea1o \u0111\u1ec1 c\u01b0\u01a1ng (Study Guide) \u2192 \u0110\u1ecdc t\u1ed5ng quan<br>3. \u{1F5FA}\u{FE0F} T\u1ea1o Mind Map 3D \u2192 Hi\u1ec3u c\u1ea5u tr\u00fac<br>4. \u2753 T\u1ea1o FAQ \u2192 Ki\u1ec3m tra \u0111\u1ed9 hi\u1ec3u<br>5. \u{1F3B4} T\u1ea1o Flashcard \u2192 Th\u00eam v\u00e0o SM-2<br>6. \u{1F9E0} \u00d4n SM-2 h\u00e0ng ng\u00e0y \u2192 Ghi nh\u1edb l\u00e2u d\u00e0i'},
      {q:'Ti\u1ebft ki\u1ec7m XP v\u00e0 xu?', a:'Ho\u00e0n th\u00e0nh <b>c\u1ea3 3 nhi\u1ec7m v\u1ee5 h\u00e0ng ng\u00e0y</b> tr\u01b0\u1edbc t\u1ea5t c\u1ea3! S\u1ebd nh\u1eadn ~70-100 XP + 30-50 xu m\u1ed7i ng\u00e0y. K\u1ebft h\u1ee3p Streak \u0111\u1ec3 nh\u1eadn huy hi\u1ec7u b\u1ed5 sung.'},
      {q:'C\u00f3 nhi\u1ec1u ng\u01b0\u1eddi d\u00f9ng chung m\u00e1y?', a:'M\u1ed7i ng\u01b0\u1eddi t\u1ea1o 1 h\u1ed3 s\u01a1 ri\u00eang. V\u00e0o \u{1F464} H\u1ed3 s\u01a1 \u2192 <b>Chuy\u1ec3n h\u1ed3 s\u01a1</b> \u0111\u1ec3 \u0111\u1ed5i ng\u01b0\u1eddi. XP/badge/friend c\u1ee7a m\u1ed7i ng\u01b0\u1eddi l\u01b0u ri\u00eang.'},
      {q:'Backup d\u1eef li\u1ec7u th\u1ebf n\u00e0o?', a:'V\u00e0o H\u1ed3 s\u01a1 \u2192 <b>Xu\u1ea5t d\u1eef li\u1ec7u</b> \u0111\u1ec3 t\u1ea3i JSON. Ho\u1eb7c c\u00e1c tab SM-2, \u0110\u1ec1 c\u01b0\u01a1ng, FAQ... \u0111\u1ec1u c\u00f3 n\u00fat Xu\u1ea5t ri\u00eang.'}
    ]
  }
];

window.guideRender=function(){
  var el=document.getElementById('tabGuide');
  if(!el) return;
  var html='<div class="sec-title">\u2753 H\u01b0\u1edbng d\u1eabn s\u1eed d\u1ee5ng</div>';
  html+='<div class="alert alert-info" style="margin-bottom:20px">\u{1F44B} Ch\u00e0o m\u1eebng \u0111\u1ebfn YeahEdu-TDA v12! B\u1ea5m v\u00e0o t\u1eebng m\u1ee5c d\u01b0\u1edbi \u0111\u00e2y \u0111\u1ec3 xem chi ti\u1ebft. B\u1ea5m <b>\u{1F393} Xem l\u1ea1i onboarding</b> \u1edf cu\u1ed1i \u0111\u1ec3 h\u1ecdc l\u1ea1i 5 b\u01b0\u1edbc c\u01a1 b\u1ea3n.</div>';
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">';
  GUIDE_SECTIONS.forEach(function(sec,i){
    html+='<div class="card" style="padding:0;overflow:hidden">'
      +'<div style="padding:16px 20px;background:linear-gradient(135deg,rgba(0,200,150,.1),rgba(0,124,240,.05));border-bottom:1px solid var(--border);cursor:pointer" onclick="guideToggleSection('+i+')">'
      +'<div style="font-size:1.5rem;margin-bottom:4px">'+sec.icon+'</div>'
      +'<div style="font-weight:800">'+sec.title+'</div>'
      +'<div style="color:var(--text2);font-size:.8rem">'+sec.items.length+' m\u1ee5c</div>'
      +'</div>'
      +'<div id="guide-sec-'+i+'" style="display:none;padding:14px 20px">';
    sec.items.forEach(function(item,j){
      html+='<details style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:600;padding:8px 0">'+item.q+'</summary>'
        +'<div style="padding:8px 0 4px 12px;color:var(--text3);border-left:2px solid var(--c1);line-height:1.7;font-size:.9rem">'+item.a+'</div>'
        +'</details>';
    });
    html+='</div></div>';
  });
  html+='</div>';
  // Onboarding button
  html+='<div style="text-align:center;margin-top:24px"><button class="btn btn-primary" onclick="startOnboarding(true)">\u{1F393} Xem l\u1ea1i h\u01b0\u1edbng d\u1eabn 5 b\u01b0\u1edbc</button></div>';
  el.innerHTML=html;
};

window.guideToggleSection=function(i){
  var el=document.getElementById('guide-sec-'+i);
  if(!el) return;
  el.style.display=(el.style.display==='none')?'block':'none';
};

// ========== ONBOARDING 5 STEPS ==========
var ONBOARDING_STEPS=[
  {
    title:'Ch\u00e0o m\u1eebng \u0111\u1ebfn YeahEdu-TDA! \u{1F389}',
    icon:'\u{1F44B}',
    body:'Tr\u1ee3 l\u00fd h\u1ecdc t\u1eadp AI to\u00e0n di\u1ec7n gi\u00fap b\u1ea1n:<br><br>\u2705 T\u1ea1o quiz + flashcard t\u1ef1 \u0111\u1ed9ng<br>\u2705 T\u1ea1o \u0111\u1ec1 c\u01b0\u01a1ng, FAQ, Timeline, Mind Map<br>\u2705 \u00d4n t\u1eadp khoa h\u1ecdc SM-2<br>\u2705 T\u00edch \u0111i\u1ec3m, huy hi\u1ec7u nh\u01b0 Duolingo<br><br>H\u00e3y \u0111i qua 5 b\u01b0\u1edbc \u0111\u1ec3 s\u1eb5n s\u00e0ng!'
  },
  {
    title:'B\u01b0\u1edbc 1: T\u1ea1o h\u1ed3 s\u01a1',
    icon:'\u{1F464}',
    body:'Nh\u1ea5n n\u00fat <b>\u{1F464} \u0110\u0103ng nh\u1eadp</b> \u1edf g\u00f3c ph\u1ea3i tr\u00ean c\u00f9ng \u0111\u1ec3 t\u1ea1o h\u1ed3 s\u01a1 c\u00e1 nh\u00e2n. Ch\u1ecdn avatar, nh\u1eadp t\u00ean, c\u1ea5p l\u1edbp. B\u1ea1n s\u1ebd t\u00edch l\u0169y XP, huy hi\u1ec7u, xu khi h\u1ecdc.'
  },
  {
    title:'B\u01b0\u1edbc 2: L\u1ea5y API key mi\u1ec5n ph\u00ed',
    icon:'\u{1F511}',
    body:'AI c\u1ea7n API key. L\u1ea5y Gemini mi\u1ec5n ph\u00ed t\u1ea1i:<br><a href="https://aistudio.google.com/apikey" target="_blank" style="color:var(--c1);font-weight:700">\u2192 aistudio.google.com/apikey</a><br><br>Copy key, v\u00e0o \u2699\uFE0F <b>C\u00e0i \u0111\u1eb7t</b>, d\u00e1n v\u00e0o \u00f4 API keys \u2192 L\u01b0u.'
  },
  {
    title:'B\u01b0\u1edbc 3: T\u1ea1o Quiz \u0111\u1ea7u ti\u00ean',
    icon:'\u{1F4DD}',
    body:'V\u00e0o tab <b>\u{1F9EA} Luy\u1ec7n t\u1eadp</b> \u2192 Tr\u1eafc nghi\u1ec7m. D\u00e1n b\u1ea5t k\u1ef3 v\u0103n b\u1ea3n (b\u00e0i h\u1ecdc, s\u00e1ch, tin t\u1ee9c...) v\u00e0o \u00f4 n\u1ed9i dung. Ch\u1ecdn s\u1ed1 c\u00e2u + \u0111\u1ed9 kh\u00f3. B\u1ea5m <b>T\u1ea1o Quiz</b> \u2192 AI sinh trong 5-15 gi\u00e2y.'
  },
  {
    title:'B\u01b0\u1edbc 4: Kh\u00e1m ph\u00e1 AI Studio',
    icon:'\u{1F9E0}',
    body:'V\u00e0o menu <b>\u{1F9E0} AI Studio</b> \u1edf tr\u00ean c\u00f9ng. 6 t\u00ednh n\u0103ng cao c\u1ea5p:<br>\u2022 AI Reader (\u0111\u1ecdc t\u00e0i li\u1ec7u)<br>\u2022 \u0110\u1ec1 c\u01b0\u01a1ng t\u1ef1 sinh<br>\u2022 FAQ Generator<br>\u2022 Timeline<br>\u2022 Mind Map 3D<br>\u2022 SM-2 Spaced Repetition'
  },
  {
    title:'B\u01b0\u1edbc 5: Theo d\u00f5i ti\u1ebfn \u0111\u1ed9 & nh\u1eadn th\u01b0\u1edfng',
    icon:'\u{1F3C6}',
    body:'V\u00e0o tab <b>\u{1F525} Ti\u1ebfn \u0111\u1ed9</b> \u0111\u1ec3 xem: XP, Level, Streak, Huy hi\u1ec7u, B\u1ea3ng x\u1ebfp h\u1ea1ng, Nhi\u1ec7m v\u1ee5 h\u00e0ng ng\u00e0y. H\u1ecdc \u0111\u1ec1u m\u1ed7i ng\u00e0y \u0111\u1ec3 kh\u00f4ng m\u1ea5t streak!<br><br>\u{1F680} <b>S\u1eb5n s\u00e0ng r\u1ed3i! Ch\u00fac b\u1ea1n h\u1ecdc vui!</b>'
  }
];

var _obStep=0;
var ONBOARDING_KEY='yeahedu_v12_onboarded';

window.startOnboarding=function(force){
  if(!force && localStorage.getItem(ONBOARDING_KEY)) return;
  _obStep=0;
  _showOnboardingStep();
};

function _showOnboardingStep(){
  var s=ONBOARDING_STEPS[_obStep];
  var existing=document.getElementById('obModal');
  if(existing) existing.remove();
  var wrap=document.createElement('div');
  wrap.id='obModal';
  wrap.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);animation:fadeIn .3s';
  var progress=Math.round(((_obStep+1)/ONBOARDING_STEPS.length)*100);
  wrap.innerHTML='<div style="background:var(--bg2);border:2px solid var(--c1);border-radius:20px;max-width:500px;width:90%;padding:0;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:slideUp .4s cubic-bezier(.34,1.56,.64,1)">'
    +'<div style="height:6px;background:var(--bg3)"><div style="height:100%;width:'+progress+'%;background:linear-gradient(90deg,var(--c1),var(--c2));transition:width .3s"></div></div>'
    +'<div style="padding:30px 30px 20px;text-align:center">'
    +'<div style="font-size:4rem;margin-bottom:14px">'+s.icon+'</div>'
    +'<h2 style="color:var(--c1);margin-bottom:16px">'+s.title+'</h2>'
    +'<div style="color:var(--text);line-height:1.75;text-align:left;background:var(--bg3);padding:16px;border-radius:12px;border-left:4px solid var(--c1)">'+s.body+'</div>'
    +'</div>'
    +'<div style="padding:14px 24px;background:var(--bg3);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">'
    +'<div style="color:var(--text2);font-size:.85rem">B\u01b0\u1edbc '+(_obStep+1)+' / '+ONBOARDING_STEPS.length+'</div>'
    +'<div style="display:flex;gap:8px">'
    +(_obStep>0?'<button class="btn btn-secondary btn-sm" onclick="obPrev()">\u2190 Tr\u01b0\u1edbc</button>':'<button class="btn btn-secondary btn-sm" onclick="obSkip()">B\u1ecf qua</button>')
    +'<button class="btn btn-primary btn-sm" onclick="obNext()">'+(_obStep<ONBOARDING_STEPS.length-1?'Ti\u1ebfp \u2192':'\u2705 B\u1eaft \u0111\u1ea7u h\u1ecdc!')+'</button>'
    +'</div>'
    +'</div>'
    +'</div>';
  document.body.appendChild(wrap);
}

window.obNext=function(){
  if(_obStep<ONBOARDING_STEPS.length-1){
    _obStep++; _showOnboardingStep();
  } else {
    obSkip();
    // Award XP for completing onboarding
    if(window.awardXP) window.awardXP('onboarding_done',30,'Ho\u00e0n th\u00e0nh onboarding');
  }
};
window.obPrev=function(){ if(_obStep>0){ _obStep--; _showOnboardingStep(); } };
window.obSkip=function(){
  var m=document.getElementById('obModal');
  if(m) m.remove();
  localStorage.setItem(ONBOARDING_KEY,'1');
};

// Auto-start onboarding on first visit
window.addEventListener('DOMContentLoaded',function(){
  setTimeout(function(){
    if(!localStorage.getItem(ONBOARDING_KEY)){
      // Delay to let account modal show first if new user
      setTimeout(function(){
        if(!localStorage.getItem(ONBOARDING_KEY)){
          window.startOnboarding();
        }
      },3500);
    }
  },1000);
});

console.log('[v12 Module 21] Guide + Onboarding loaded ('+GUIDE_SECTIONS.length+' guide sections, '+ONBOARDING_STEPS.length+' onboarding steps)');
})();
