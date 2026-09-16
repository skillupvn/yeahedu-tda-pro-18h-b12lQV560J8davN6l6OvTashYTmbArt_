// ================================================================
// YeahEdu-TDA v11 "PhoenixEdu" - Module: 01-core.js
// Auto-split from monolithic v10, ASCII-only, Live-Server safe
// ================================================================


'use strict';

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// CONSTANTS \u2014 Danh s\u00e1ch AI Provider (C\u1eacP NH\u1eacT v2)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
const PROVIDERS = {
  gemini:{
    name:'Google Gemini',emoji:'\ud83d\udc8e',
    tier:'free',
    models:[
      {id:'gemini-2.5-flash',name:'Gemini 2.5 Flash',tag:'\u26a1 Free \u00b7 Khuy\u00ean d\u00f9ng',cost:0},
      {id:'gemini-2.5-flash-lite',name:'Gemini 2.5 Flash-Lite',tag:'\ud83e\udeb6 Free \u00b7 Nh\u1eb9 nh\u1ea5t',cost:0},
      {id:'gemini-2.0-flash',name:'Gemini 2.0 Flash',tag:'\ud83d\udd25 Free \u00b7 Ph\u1ed5 bi\u1ebfn',cost:0},
      {id:'gemini-2.0-flash-lite',name:'Gemini 2.0 Flash-Lite',tag:'\ud83d\udcb0 Free \u00b7 R\u1ebb',cost:0},
      {id:'gemini-2.5-pro',name:'Gemini 2.5 Pro',tag:'\ud83c\udfc6 M\u1ea1nh nh\u1ea5t \u00b7 50/ng\u00e0y',cost:1.25},
    ],
    endpoint:function(m,k){return 'https://generativelanguage.googleapis.com/v1beta/models/'+m+':generateContent?key='+k},
    buildBody:function(messages,temp,model){
      var contents=messages.filter(function(m){return m.role!=='system'}).map(function(m){return {role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}});
      var sys=messages.find(function(m){return m.role==='system'});
      var body={contents:contents,generationConfig:{temperature:parseFloat(temp)||0.7,maxOutputTokens:8192}};
      if(sys) body.system_instruction={parts:[{text:sys.content}]};
      return body;
    },
    parseResp:function(r){return r.candidates&&r.candidates[0]&&r.candidates[0].content&&r.candidates[0].content.parts&&r.candidates[0].content.parts[0]?r.candidates[0].content.parts[0].text:''},
  },
  openai:{
    name:'OpenAI',emoji:'\ud83d\udfe2',
    tier:'paid',
    models:[
      {id:'gpt-4o-mini',name:'GPT-4o Mini',tag:'\u26a1 C\u00e2n b\u1eb1ng \u00b7 $0.15/1M',cost:0.15},
      {id:'gpt-4.1-nano',name:'GPT-4.1 Nano',tag:'\ud83e\udeb6 R\u1ebb nh\u1ea5t \u00b7 $0.10/1M',cost:0.10},
      {id:'gpt-4o',name:'GPT-4o',tag:'\ud83c\udfc6 M\u1ea1nh \u00b7 $2.50/1M',cost:2.5},
      {id:'gpt-3.5-turbo',name:'GPT-3.5 Turbo',tag:'\ud83d\udcb0 C\u0169',cost:0.5},
    ],
    endpoint:function(){return 'https://api.openai.com/v1/chat/completions'},
    buildBody:function(messages,temp,model){return {model:model,messages:messages,temperature:parseFloat(temp)||0.7,max_tokens:8192}},
    parseResp:function(r){return r.choices&&r.choices[0]&&r.choices[0].message?r.choices[0].message.content:''},
    authHeader:function(k){return {'Authorization':'Bearer '+k}},
  },
  mistral:{
    name:'Mistral AI',emoji:'\ud83c\udf0a',
    tier:'paid',
    models:[
      {id:'mistral-small-latest',name:'Mistral Small',tag:'\u26a1 Free tier',cost:0},
      {id:'mistral-medium-latest',name:'Mistral Medium',tag:'\ud83c\udfaf $0.40/1M',cost:0.4},
      {id:'mistral-large-latest',name:'Mistral Large',tag:'\ud83c\udfc6 $2/1M',cost:2},
      {id:'open-mixtral-8x22b',name:'Mixtral 8x22B',tag:'M\u1ea1nh',cost:1},
    ],
    endpoint:function(){return 'https://api.mistral.ai/v1/chat/completions'},
    buildBody:function(messages,temp,model){return {model:model,messages:messages,temperature:parseFloat(temp)||0.7,max_tokens:8192}},
    parseResp:function(r){return r.choices&&r.choices[0]&&r.choices[0].message?r.choices[0].message.content:''},
    authHeader:function(k){return {'Authorization':'Bearer '+k}},
  },
  deepseek:{
    name:'DeepSeek',emoji:'\ud83d\udd35',
    tier:'cheap',
    models:[
      {id:'deepseek-chat',name:'DeepSeek V3.2 Chat',tag:'\ud83d\udcb0 $0.14/1M \u00b7 R\u1ebb nh\u1ea5t',cost:0.14},
      {id:'deepseek-reasoner',name:'DeepSeek R1',tag:'\ud83e\udde0 $0.55/1M \u00b7 L\u00fd lu\u1eadn',cost:0.55},
    ],
    endpoint:function(){return 'https://api.deepseek.com/v1/chat/completions'},
    buildBody:function(messages,temp,model){return {model:model,messages:messages,temperature:parseFloat(temp)||0.7,max_tokens:8192}},
    parseResp:function(r){return r.choices&&r.choices[0]&&r.choices[0].message?r.choices[0].message.content:''},
    authHeader:function(k){return {'Authorization':'Bearer '+k}},
  },
  openrouter:{
    name:'OpenRouter',emoji:'\ud83d\udd00',
    tier:'mixed',
    models:[
      {id:'deepseek/deepseek-chat-v3.1:free',name:'DeepSeek V3.1',tag:'\ud83c\udd93 Free \u00b7 T\u1ed1t nh\u1ea5t',cost:0},
      {id:'deepseek/deepseek-r1:free',name:'DeepSeek R1',tag:'\ud83c\udd93 Free \u00b7 Reasoning',cost:0},
      {id:'meta-llama/llama-3.3-70b-instruct:free',name:'Llama 3.3 70B',tag:'\ud83c\udd93 Free',cost:0},
      {id:'qwen/qwen3-coder:free',name:'Qwen3 Coder',tag:'\ud83c\udd93 Free \u00b7 Code',cost:0},
      {id:'google/gemini-2.0-flash-exp:free',name:'Gemini 2.0 Flash',tag:'\ud83c\udd93 Free',cost:0},
      {id:'mistralai/mistral-small-3.2-24b-instruct:free',name:'Mistral Small 3.2',tag:'\ud83c\udd93 Free',cost:0},
      {id:'openrouter/auto',name:'Auto Router',tag:'\ud83d\udd04 Auto',cost:0},
      {id:'deepseek/deepseek-chat',name:'DeepSeek V3 (paid)',tag:'\ud83d\udcb0 R\u1ebb',cost:0.1},
      {id:'anthropic/claude-3.5-sonnet',name:'Claude 3.5 Sonnet',tag:'\ud83d\udc8e Premium',cost:3},
      {id:'openai/gpt-4o',name:'GPT-4o',tag:'\ud83d\udc8e Premium',cost:3},
    ],
    endpoint:function(){return 'https://openrouter.ai/api/v1/chat/completions'},
    buildBody:function(messages,temp,model){return {model:model,messages:messages,temperature:parseFloat(temp)||0.7,max_tokens:8192}},
    parseResp:function(r){return r.choices&&r.choices[0]&&r.choices[0].message?r.choices[0].message.content:''},
    authHeader:function(k){return {'Authorization':'Bearer '+k,'HTTP-Referer':'https://yeahedu.app','X-Title':'YeahEdu-TDA'}},
  },
  groq:{
    name:'Groq (Mi\u1ec5n ph\u00ed)',emoji:'\u26a1',
    tier:'free',
    models:[
      {id:'llama-3.3-70b-versatile',name:'Llama 3.3 70B',tag:'\ud83c\udfc6 Free \u00b7 M\u1ea1nh nh\u1ea5t',cost:0},
      {id:'llama-3.1-8b-instant',name:'Llama 3.1 8B Instant',tag:'\u26a1 Free \u00b7 Si\u00eau nhanh',cost:0},
      {id:'meta-llama/llama-4-scout-17b-16e-instruct',name:'Llama 4 Scout 17B',tag:'\ud83c\udd95 Free \u00b7 M\u1edbi nh\u1ea5t',cost:0},
      {id:'meta-llama/llama-4-maverick-17b-128e-instruct',name:'Llama 4 Maverick',tag:'\ud83d\ude80 Free \u00b7 M\u1edbi',cost:0},
      {id:'qwen/qwen3-32b',name:'Qwen 3 32B',tag:'\ud83e\udde0 Free \u00b7 Reasoning',cost:0},
      {id:'deepseek-r1-distill-llama-70b',name:'DeepSeek R1 70B',tag:'\ud83d\udd2c Free \u00b7 Reasoning',cost:0},
      {id:'gemma2-9b-it',name:'Gemma 2 9B',tag:'Free \u00b7 Google',cost:0},
    ],
    endpoint:function(){return 'https://api.groq.com/openai/v1/chat/completions'},
    buildBody:function(messages,temp,model){return {model:model||'llama-3.3-70b-versatile',messages:messages,temperature:parseFloat(temp)||0.7,max_tokens:4096}},
    parseResp:function(r){return r.choices&&r.choices[0]&&r.choices[0].message?r.choices[0].message.content:''},
    authHeader:function(k){return {'Authorization':'Bearer '+k}},
  },
};


// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// TOPIC DATA \u2014 GI\u1eee NGUY\u00caN 100% G\u1ed0C
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
const TOPIC_DATA = {
  k2_toan:[
    {icon:'\ud83d\udd22',name:'S\u1ed1 tr\u00f2n tr\u0103m, tr\u00f2n ch\u1ee5c',grade:'2',sub:'To\u00e1n'},
    {icon:'\ud83d\udcaf',name:'So s\u00e1nh s\u1ed1 tr\u00f2n tr\u0103m',grade:'2',sub:'To\u00e1n'},
    {icon:'\ud83d\udd23',name:'C\u00e1c s\u1ed1 c\u00f3 ba ch\u1eef s\u1ed1',grade:'2',sub:'To\u00e1n'},
    {icon:'\ud83d\udcca',name:'So s\u00e1nh s\u1ed1 c\u00f3 ba ch\u1eef s\u1ed1',grade:'2',sub:'To\u00e1n'},
    {icon:'\u2699\ufe0f',name:'C\u1ea5u t\u1ea1o s\u1ed1 ba ch\u1eef s\u1ed1',grade:'2',sub:'To\u00e1n'},
    {icon:'\ud83d\udccf',name:'\u0110\u1ec1-xi-m\u00e9t',grade:'2',sub:'To\u00e1n'},
    {icon:'\ud83d\udd37',name:'H\u00ecnh t\u1ee9 gi\u00e1c',grade:'2',sub:'To\u00e1n'},
    {icon:'\ud83d\udce6',name:'\u00d4n t\u1eadp v\u1ec1 h\u00ecnh kh\u1ed1i',grade:'2',sub:'To\u00e1n'},
    {icon:'\ud83d\udcd0',name:'M\u00e9t',grade:'2',sub:'To\u00e1n'},
    {icon:'\ud83d\udcc5',name:'Ng\u00e0y, th\u00e1ng xem l\u1ecbch',grade:'2',sub:'To\u00e1n'},
    {icon:'\ud83d\udd50',name:'B\u00e0i to\u00e1n v\u1ec1 th\u1eddi gian',grade:'2',sub:'To\u00e1n'},
    {icon:'\u2795',name:'Ph\u00e9p c\u1ed9ng, tr\u1eeb trong 100',grade:'2',sub:'To\u00e1n'},
    {icon:'\u2716\ufe0f',name:'Ph\u00e9p nh\u00e2n',grade:'2',sub:'To\u00e1n'},
    {icon:'\u2797',name:'Th\u00e0nh ph\u1ea7n ph\u00e9p chia',grade:'2',sub:'To\u00e1n'},
  ],
  k2_viet_anh:[
    {icon:'\ud83d\udde3\ufe0f',name:'Ph\u00e2n bi\u1ec7t l/n, s/x, iu/\u01b0u...',grade:'2',sub:'Ti\u1ebfng Vi\u1ec7t'},
    {icon:'\ud83d\udcd6',name:'T\u1eadp \u0111\u1ecdc: C\u1ed9ng \u0111\u1ed3ng - X\u00e3 h\u1ed9i',grade:'2',sub:'Ti\u1ebfng Vi\u1ec7t'},
    {icon:'\ud83c\udf3f',name:'T\u1eadp \u0111\u1ecdc: Thi\u00ean nhi\u00ean',grade:'2',sub:'Ti\u1ebfng Vi\u1ec7t'},
    {icon:'\ud83d\udd24',name:'T\u1eeb ch\u1ec9 s\u1ef1 v\u1eadt & ho\u1ea1t \u0111\u1ed9ng',grade:'2',sub:'Ti\u1ebfng Vi\u1ec7t'},
    {icon:'\u2753',name:'\u0110\u1eb7t v\u00e0 tr\u1ea3 l\u1eddi "Khi n\u00e0o?"',grade:'2',sub:'Ti\u1ebfng Vi\u1ec7t'},
    {icon:'\ud83e\udd81',name:'Animals: zoo, zebra...',grade:'2',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83d\ude97',name:"They're driving cars",grade:'2',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83c\udf82',name:'The cake IS on the table',grade:'2',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83d\udd22',name:'Numbers 11-15',grade:'2',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83d\udc76',name:'How old is your brother?',grade:'2',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83d\udce3',name:'Phonics: li, Aa, Nn, er',grade:'2',sub:'Ti\u1ebfng Anh'},
  ],
  k3_toan:[
    {icon:'\ud83d\udd22',name:'S\u1ed1 c\u00f3 5 ch\u1eef s\u1ed1, S\u1ed1 100 000',grade:'3',sub:'To\u00e1n'},
    {icon:'\ud83d\udcca',name:'So s\u00e1nh s\u1ed1 trong ph\u1ea1m vi 100k',grade:'3',sub:'To\u00e1n'},
    {icon:'\u2795',name:'Ph\u00e9p c\u1ed9ng ph\u1ea1m vi 10 000',grade:'3',sub:'To\u00e1n'},
    {icon:'\u2796',name:'Ph\u00e9p tr\u1eeb ph\u1ea1m vi 10 000',grade:'3',sub:'To\u00e1n'},
    {icon:'\ud83d\udd0d',name:'T\u00ecm th\u00e0nh ph\u1ea7n ph\u00e9p t\u00ednh',grade:'3',sub:'To\u00e1n'},
    {icon:'\u2696\ufe0f',name:'\u0110i\u1ec3m \u1edf gi\u1eefa, trung \u0111i\u1ec3m',grade:'3',sub:'To\u00e1n'},
    {icon:'\u2b55',name:'T\u00e2m, b\u00e1n k\u00ednh, \u0111\u01b0\u1eddng k\u00ednh h\u00ecnh tr\u00f2n',grade:'3',sub:'To\u00e1n'},
    {icon:'\ud83d\udd22',name:'Numbers up to 10,000',grade:'3',sub:'To\u00e1n TA'},
    {icon:'\ud83d\udccd',name:'Place value up to 10,000',grade:'3',sub:'To\u00e1n TA'},
    {icon:'\ud83c\udfaf',name:'Rounding to Nearest Ten & Hundred',grade:'3',sub:'To\u00e1n TA'},
    {icon:'\ud83d\udca1',name:'Mixed operation word problems',grade:'3',sub:'To\u00e1n TA'},
  ],
  k3_viet_anh:[
    {icon:'\ud83d\udcda',name:'\u0110\u1ecdc hi\u1ec3u, m\u1edf r\u1ed9ng v\u1ed1n t\u1eeb',grade:'3',sub:'Ti\u1ebfng Vi\u1ec7t'},
    {icon:'\ud83d\udd24',name:'T\u1eeb \u0111\u1ed3ng ngh\u0129a / tr\u00e1i ngh\u0129a',grade:'3',sub:'Ti\u1ebfng Vi\u1ec7t'},
    {icon:'\u2696\ufe0f',name:'Bi\u1ec7n ph\u00e1p so s\u00e1nh',grade:'3',sub:'Ti\u1ebfng Vi\u1ec7t'},
    {icon:'\u270d\ufe0f',name:'Ch\u00ednh t\u1ea3: ph\u00e2n bi\u1ec7t v\u1ea7n',grade:'3',sub:'Ti\u1ebfng Vi\u1ec7t'},
    {icon:'\ud83d\udcdd',name:'Vi\u1ebft \u0111o\u1ea1n v\u0103n ng\u1eafn',grade:'3',sub:'Ti\u1ebfng Vi\u1ec7t'},
    {icon:'\ud83c\udfae',name:'Break time activities',grade:'3',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d\udc66',name:'Family members',grade:'3',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83d\udcbc',name:"Someone's job",grade:'3',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83c\udfe0',name:'House rooms & furniture',grade:'3',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83c\udf4e',name:'Food and drinks',grade:'3',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83d\udc36',name:'Pets vocabulary',grade:'3',sub:'Ti\u1ebfng Anh'},
    {icon:'\ud83d\udce3',name:'Phonics: /f/v/ /\u0259\u028a/ /\u0251\u02d0/ /e/',grade:'3',sub:'Ti\u1ebfng Anh'},
  ]
};

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// STATE \u2014 Gi\u1eef g\u1ed1c + th\u00eam field m\u1edbi v2
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
var ST = {
  provider:'gemini',
  model:'gemini-2.0-flash',
  apiKeys:[],
  currentKeyIdx:0,
  temp:'0.7',
  lang:'vi',
  soundEnabled:true,
  sourceType:'ai',
  sourceContext:'',
  // NEW v2: Reader state
  readerSourceType:'rai',
  readerSourceContext:'',
  readerContent:'',
  // NEW v2: Auto-select
  autoSelect:true,
  // Gi\u1eef nguy\u00ean g\u1ed1c
  quiz:null,
  flash:null,
  timerInterval:null,
  fcIndex:0,
  fcFlipped:false,
  stats:{
    totalQ:0,
    correctQ:0,
    sessions:0,
    fcLearned:0,
    history:[],
    achievements:[]
  }
};

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// PERSIST \u2014 L\u01b0u/t\u1ea3i d\u1eef li\u1ec7u localStorage (GI\u1eee G\u1ed0C + th\u00eam field)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function saveAll(){
  try{
    var s={};
    for(var k in ST){
      if(k==='quiz'||k==='flash'||k==='timerInterval') continue;
      s[k]=ST[k];
    }
    s.apiKeys=ST.apiKeys.map(function(k){return {provider:k.provider,key:btoa(k.key||''),status:k.status,label:k.label,quota:k.quota}});
    localStorage.setItem('yeahedu_v4',JSON.stringify(s));
  }catch(e){}
}

function loadAll(){
  try{
    var raw=localStorage.getItem('yeahedu_v4');
    if(!raw) return;
    var s=JSON.parse(raw);
    s.apiKeys=(s.apiKeys||[]).map(function(k){return {provider:k.provider,key:atob(k.key||''),status:k.status||'idle',label:k.label||'',quota:k.quota||''}});
    for(var k in s){
      if(k==='quiz'||k==='flash'||k==='timerInterval') continue;
      ST[k]=s[k];
    }
    ST.quiz=null;
    ST.flash=null;
    ST.timerInterval=null;
    // NEW v2: \u0110\u1ea3m b\u1ea3o field m\u1edbi c\u00f3 default
    if(typeof ST.autoSelect==='undefined') ST.autoSelect=true;
    if(typeof ST.readerSourceType==='undefined') ST.readerSourceType='rai';
    if(typeof ST.readerSourceContext==='undefined') ST.readerSourceContext='';
    if(typeof ST.readerContent==='undefined') ST.readerContent='';
  }catch(e){}
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// AUDIO ENGINE \u2014 GI\u1eee NGUY\u00caN 100% G\u1ed0C
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
var AC=null;
function getAC(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  if(AC&&AC.state==='suspended') AC.resume();
  return AC;
}

function playTone(freq,dur,type,vol,delay){
  if(typeof freq==='undefined') freq=520;
  if(typeof dur==='undefined') dur=0.12;
  if(typeof type==='undefined') type='sine';
  if(typeof vol==='undefined') vol=0.18;
  if(typeof delay==='undefined') delay=0;
  var ac=getAC();
  if(!ac||!ST.soundEnabled) return;
  var t=ac.currentTime+delay;
  var o=ac.createOscillator();
  var g=ac.createGain();
  o.connect(g);g.connect(ac.destination);
  o.type=type;
  o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(vol,t+0.01);
  g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.start(t);o.stop(t+dur+0.05);
}

var SFX={
  click:function(){playTone(800,.05,'sine',.10);playTone(1000,.04,'sine',.08,.03)},
  correct:function(){playTone(523,.12,'sine',.15);playTone(659,.12,'sine',.15,.1);playTone(784,.2,'sine',.18,.2);playTone(1568,.08,'sine',.06,.3)},
  wrong:function(){playTone(300,.15,'triangle',.1);playTone(250,.2,'triangle',.08,.12)},
  flip:function(){playTone(400,.04,'sine',.08);playTone(800,.06,'sine',.1,.03);playTone(1200,.04,'sine',.06,.06)},
  complete:function(){[523,587,659,698,784,880,988,1047].forEach(function(f,i){playTone(f,.12,'sine',.13,i*0.08)})},
  timerWarn:function(){playTone(600,.05,'sine',.08);playTone(500,.05,'sine',.08,.15)},
  timerDanger:function(){playTone(880,.06,'triangle',.12);playTone(880,.06,'triangle',.12,.12);playTone(1100,.08,'triangle',.14,.24)},
  start:function(){playTone(392,.1,'sine',.12);playTone(523,.1,'sine',.14,.1);playTone(659,.15,'sine',.16,.2)},
  nav:function(){playTone(800,.04,'sine',.08);playTone(1000,.04,'sine',.06,.04)},
  save:function(){playTone(660,.08,'sine',.10);playTone(880,.1,'sine',.12,.08);playTone(1100,.06,'sine',.08,.16)},
};

function toggleSound(){
  ST.soundEnabled=!ST.soundEnabled;
  document.getElementById('soundToggle').textContent=ST.soundEnabled?'\ud83d\udd0a':'\ud83d\udd07';
  saveAll();
  if(ST.soundEnabled) SFX.click();
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// UI HELPERS \u2014 Gi\u1eef g\u1ed1c + th\u00eam helper m\u1edbi v2
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function switchTab(btn,tabId){
  SFX.nav();
  document.querySelectorAll('.nav-tab').forEach(function(b){b.classList.remove('active')});
  document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active')});
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
  if(tabId==='tabStats') renderStats();
  if(tabId==='tabHome') renderHome();
}

function openModal(id){document.getElementById(id).classList.remove('hidden');SFX.click()}
function closeModal(id){document.getElementById(id).classList.add('hidden')}
function closeModalOut(e,id){if(e.target.id===id) closeModal(id)}

function toast(title,msg,type,dur){
  if(typeof type==='undefined') type='info';
  if(typeof dur==='undefined') dur=3500;
  SFX.click();
  var container=document.getElementById('toast-container');
  while(container.children.length>=5){container.firstChild.remove()}
  var icons={info:'\ud83d\udcac',success:'\u2705',error:'\u274c',warn:'\u26a0\ufe0f'};
  var el=document.createElement('div');
  el.className='toast';
  el.innerHTML='<span class="toast-icon">'+(icons[type]||'\ud83d\udcac')+'</span><div class="toast-content"><div class="toast-title">'+title+'</div>'+(msg?'<div class="toast-msg">'+msg+'</div>':'')+'</div>';
  container.appendChild(el);
  setTimeout(function(){el.classList.add('hide');setTimeout(function(){el.remove()},350)},dur);
}

function toggleToggle(id){
  var el=document.getElementById(id);
  if(!el) return;
  el.classList.toggle('on');
  SFX.click();
}

function isOn(id){
  var el=document.getElementById(id);
  return el?el.classList.contains('on'):false;
}

function togglePwd(inputId,btn){
  var inp=document.getElementById(inputId);
  if(!inp) return;
  if(inp.type==='password'){inp.type='text';btn.textContent='\ud83d\ude48';}
  else{inp.type='password';btn.textContent='\ud83d\udc41\ufe0f';}
}

function switchSource(el,src){
  document.querySelectorAll('.source-tab').forEach(function(t){t.classList.remove('active')});
  document.querySelectorAll('.source-panel').forEach(function(p){p.classList.remove('active')});
  el.classList.add('active');
  document.getElementById('src-'+src).classList.add('active');
  ST.sourceType=src;
  SFX.click();
  // NEW v2: hi\u1ec7n Google PSE field khi ch\u1ecdn google_pse
  var gf=document.getElementById('googlePseFields');
  if(gf){
    var sp=document.getElementById('searchProvider');
    gf.classList.toggle('hidden',!sp||sp.value!=='google_pse');
  }
}

// NEW v2: Switch source cho Reader tab
function switchReaderSource(el,src){
  document.querySelectorAll('#tabReader .source-tab').forEach(function(t){t.classList.remove('active')});
  document.querySelectorAll('#tabReader .source-panel').forEach(function(p){p.classList.remove('active')});
  el.classList.add('active');
  document.getElementById('rsrc-'+src).classList.add('active');
  ST.readerSourceType=src;
  SFX.click();
}

function addUrlField(){
  var list=document.getElementById('urlList');
  var div=document.createElement('div');
  div.className='url-item';
  div.innerHTML='<input type="url" style="background:var(--bg3);border:1.5px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);width:100%;font-family:var(--font)" placeholder="https://..."><button class="btn btn-secondary btn-sm" onclick="this.parentElement.remove()">\u2715</button>';
  list.appendChild(div);
  SFX.click();
}

function toggleCustomTimer(sel){
  document.getElementById('customTimerWrap').style.display=sel.value==='custom'?'flex':'none';
}

// \u2550\u2550\u2550 FIX: C\u00e1c h\u00e0m x\u1eed l\u00fd popup Prompt \u2014 cho ph\u00e9p xem, ch\u1ec9nh s\u1eeda, l\u01b0u, kh\u00f4i ph\u1ee5c \u2550\u2550\u2550

// M\u1edf popup v\u00e0 hi\u1ec3n th\u1ecb prompt hi\u1ec7n t\u1ea1i
function previewPrompt(){
  // Ki\u1ec3m tra c\u01a1 b\u1ea3n tr\u01b0\u1edbc khi build
  var isOpen = isOn('tOpenMode');
  var topic = '';
  if(isOpen){
    var t1 = document.getElementById('qOpenTopic');
    topic = t1 ? t1.value.trim() : '';
  } else {
    topic = document.getElementById('qTopic').value.trim();
  }

  var ta = document.getElementById('promptPreviewText');
  if(!ta) return;

  // N\u1ebfu user \u0111\u00e3 ch\u1ec9nh + l\u01b0u tr\u01b0\u1edbc \u0111\u00f3 \u2192 hi\u1ec7n \u0111\u00fang phi\u00ean b\u1ea3n \u0111\u00e3 l\u01b0u
  if(ST.customPrompt && ST.customPrompt.trim().length > 20){
    ta.value = ST.customPrompt;
    var hint = document.getElementById('promptSavedHint');
    if(hint) hint.innerHTML = '\u2705 \u0110ang hi\u1ec3n th\u1ecb <strong>Prompt \u0111\u00e3 ch\u1ec9nh s\u1eeda & l\u01b0u</strong>. B\u1ea5m "\ud83d\udd04 Kh\u00f4i ph\u1ee5c m\u1eb7c \u0111\u1ecbnh" \u0111\u1ec3 build l\u1ea1i t\u1eeb form.';
  } else {
    if(!topic){
      ta.value = '\u26a0\ufe0f Vui l\u00f2ng nh\u1eadp '+(isOpen?'"M\u00f4 t\u1ea3 chi ti\u1ebft y\u00eau c\u1ea7u"':'"Ch\u1ee7 \u0111\u1ec1 / N\u1ed9i dung \u00f4n t\u1eadp"')+' tr\u01b0\u1edbc khi xem Prompt.';
    } else {
      // T\u1ea1m th\u1eddi clear customPrompt \u0111\u1ec3 buildQuizPrompt build m\u1edbi
      var saved = ST.customPrompt;
      ST.customPrompt = '';
      ta.value = buildQuizPrompt();
      ST.customPrompt = saved; // restore (nh\u01b0ng \u0111ang tr\u1ed1ng)
    }
    var hint2 = document.getElementById('promptSavedHint');
    if(hint2) hint2.innerHTML = '\ud83d\udca1 \u0110\u00e2y l\u00e0 Prompt m\u1eb7c \u0111\u1ecbnh build t\u1eeb form. B\u1ea1n c\u00f3 th\u1ec3 ch\u1ec9nh t\u1ef1 do r\u1ed3i b\u1ea5m "\ud83d\udcbe L\u01b0u Prompt".';
  }
  openModal('promptModal');
  SFX.click();
}

// Copy n\u1ed9i dung textarea
function copyPrompt(){
  var ta = document.getElementById('promptPreviewText');
  if(!ta || !ta.value){ toast('Kh\u00f4ng c\u00f3 n\u1ed9i dung','','warn'); return; }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(ta.value).then(function(){
      toast('\ud83d\udccb \u0110\u00e3 copy','Prompt \u0111\u00e3 \u0111\u01b0\u1ee3c sao ch\u00e9p','success');
    }).catch(function(){
      ta.select();
      try{ document.execCommand('copy'); toast('\ud83d\udccb \u0110\u00e3 copy','','success'); }catch(e){}
    });
  } else {
    ta.select();
    try{ document.execCommand('copy'); toast('\ud83d\udccb \u0110\u00e3 copy','','success'); }catch(e){}
  }
  SFX.click();
}

// L\u01b0u prompt \u0111\u00e3 ch\u1ec9nh \u2014 s\u1ebd \u0111\u01b0\u1ee3c d\u00f9ng khi "T\u1ea1o b\u00e0i tr\u1eafc nghi\u1ec7m"
function saveCustomPrompt(){
  var ta = document.getElementById('promptPreviewText');
  if(!ta) return;
  var val = ta.value.trim();
  if(val.length < 20){
    toast('Prompt qu\u00e1 ng\u1eafn','C\u1ea7n \u00edt nh\u1ea5t 20 k\u00fd t\u1ef1','warn');
    return;
  }
  ST.customPrompt = val;
  saveAll();
  toast('\ud83d\udcbe \u0110\u00e3 l\u01b0u Prompt','Prompt \u0111\u00e3 ch\u1ec9nh s\u1ebd \u0111\u01b0\u1ee3c d\u00f9ng cho l\u1ea7n t\u1ea1o b\u00e0i ti\u1ebfp theo','success',4000);
  SFX.save();
  closeModal('promptModal');
}

// Kh\u00f4i ph\u1ee5c prompt m\u1eb7c \u0111\u1ecbnh (x\u00f3a b\u1ea3n \u0111\u00e3 ch\u1ec9nh)
function resetCustomPrompt(){
  ST.customPrompt = '';
  saveAll();
  // Build l\u1ea1i prompt m\u1eb7c \u0111\u1ecbnh v\u00e0 hi\u1ec3n th\u1ecb
  var ta = document.getElementById('promptPreviewText');
  if(ta){
    ta.value = buildQuizPrompt();
  }
  var hint = document.getElementById('promptSavedHint');
  if(hint) hint.innerHTML = '\u2705 \u0110\u00e3 kh\u00f4i ph\u1ee5c Prompt m\u1eb7c \u0111\u1ecbnh. B\u1ea1n c\u00f3 th\u1ec3 ch\u1ec9nh l\u1ea1i r\u1ed3i "\ud83d\udcbe L\u01b0u Prompt".';
  toast('\ud83d\udd04 \u0110\u00e3 kh\u00f4i ph\u1ee5c','Prompt \u0111\u00e3 reset v\u1ec1 m\u1eb7c \u0111\u1ecbnh','info');
  SFX.click();
}

// NEW v2: Toggle ch\u1ebf \u0111\u1ed9 m\u1edf (open mode) cho Quiz
function toggleOpenMode(){
  var isOpen=isOn('tOpenMode');
  document.getElementById('standardModeFields').classList.toggle('hidden',isOpen);
  document.getElementById('openModeFields').classList.toggle('hidden',!isOpen);
}

// NEW v2: Hi\u1ec7n th\u00f4ng b\u00e1o batch khi ch\u1ecdn s\u1ed1 l\u01b0\u1ee3ng flashcard l\u1edbn
function checkFcBatch(){
  var count=parseInt(document.getElementById('fcCount').value)||10;
  var info=document.getElementById('fcBatchInfo');
  if(info) info.classList.toggle('hidden',count<=20);
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// NEW v2: AUTO-SELECT ENGINE
// T\u1ef1 \u0111\u1ed9ng ch\u1ecdn provider + model t\u1ed1i \u01b0u chi ph\u00ed
// \u01afu ti\u00ean: free keys OK \u2192 cheap keys OK \u2192 paid keys OK
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
var AUTO_SELECT_PRIORITY = [
  // \u2500\u2500\u2500 FREE: \u01b0u ti\u00ean Groq (kh\u00f4ng gi\u1edbi h\u1ea1n ng\u00e0y) > OpenRouter free > Gemini free \u2500\u2500\u2500
  {tier:'free',  provider:'groq',       model:'llama-3.3-70b-versatile'},
  {tier:'free',  provider:'groq',       model:'meta-llama/llama-4-scout-17b-16e-instruct'},
  {tier:'free',  provider:'openrouter', model:'deepseek/deepseek-chat-v3.1:free'},
  {tier:'free',  provider:'openrouter', model:'meta-llama/llama-3.3-70b-instruct:free'},
  {tier:'free',  provider:'gemini',     model:'gemini-2.5-flash-lite'},
  {tier:'free',  provider:'gemini',     model:'gemini-2.5-flash'},
  {tier:'free',  provider:'gemini',     model:'gemini-2.0-flash'},
  {tier:'free',  provider:'mistral',    model:'mistral-small-latest'},
  // \u2500\u2500\u2500 CHEAP: tr\u1ea3 ph\u00ed c\u1ef1c r\u1ebb \u2500\u2500\u2500
  {tier:'cheap', provider:'deepseek',   model:'deepseek-chat'},
  {tier:'cheap', provider:'openai',     model:'gpt-4.1-nano'},
  {tier:'cheap', provider:'openai',     model:'gpt-4o-mini'},
  // \u2500\u2500\u2500 PAID: cao c\u1ea5p \u2500\u2500\u2500
  {tier:'paid',  provider:'gemini',     model:'gemini-2.5-pro'},
  {tier:'paid',  provider:'mistral',    model:'mistral-small-latest'},
  {tier:'paid',  provider:'openai',     model:'gpt-4o'},
];

function autoSelectBestProvider(){
  // Tr\u1ea3 v\u1ec1 {provider, model} t\u1ed1i \u01b0u d\u1ef1a tr\u00ean key c\u00f3 s\u1eb5n
  var validKeys=ST.apiKeys.filter(function(k){return k.key.trim()&&k.status!=='dead'});
  if(!validKeys.length) return null;

  // T\u1ea1o set provider c\u00f3 key
  var providerSet={};
  validKeys.forEach(function(k){providerSet[k.provider]=true});

  for(var i=0;i<AUTO_SELECT_PRIORITY.length;i++){
    var item=AUTO_SELECT_PRIORITY[i];
    if(providerSet[item.provider]){
      return {provider:item.provider, model:item.model};
    }
  }

  // Fallback: d\u00f9ng key \u0111\u1ea7u ti\u00ean
  var first=validKeys[0];
  var prov=PROVIDERS[first.provider];
  return {provider:first.provider, model:prov&&prov.models[0]?prov.models[0].id:'gemini-2.0-flash'};
}

// NEW v2: L\u1ea5y provider+model hi\u1ec7u qu\u1ea3 (k\u1ebft h\u1ee3p auto-select)
function getEffectiveProviderModel(){
  if(ST.autoSelect&&isOn('tAutoSelect')){
    var best=autoSelectBestProvider();
    if(best) return best;
  }
  return {provider:ST.provider, model:ST.model};
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// FILE HANDLERS \u2014 GI\u1eee NGUY\u00caN G\u1ed0C
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// \u2550\u2550\u2550 G\u00d3I 4: \u0110i\u1ec1u khi\u1ec3n Modal ti\u1ebfn tr\u00ecnh OCR \u2550\u2550\u2550
function ocrModalShow(title){
  var m=document.getElementById('ocrModal'); if(!m) return;
  document.getElementById('ocrTitle').textContent=title||'\ud83d\udcf7 \u0110ang nh\u1eadn d\u1ea1ng t\u00e0i li\u1ec7u';
  document.getElementById('ocrSub').textContent='\u0110ang chu\u1ea9n b\u1ecb\u2026';
  document.getElementById('ocrBarFill').style.width='0%';
  document.getElementById('ocrPct').textContent='0%';
  m.style.display='flex';
}
function ocrModalUpdate(pct,subText){
  var f=document.getElementById('ocrBarFill'), p=document.getElementById('ocrPct'), s=document.getElementById('ocrSub');
  if(f) f.style.width=Math.round(pct)+'%';
  if(p) p.textContent=Math.round(pct)+'%';
  if(s&&typeof subText==='string') s.textContent=subText;
}
function ocrModalHide(){
  var m=document.getElementById('ocrModal'); if(m) m.style.display='none';
}
// \u2550\u2550\u2550 G\u00d3I 3: OCR \u2014 nh\u1eadn d\u1ea1ng ch\u1eef trong PDF \u1ea3nh scan \u2550\u2550\u2550
async function ocrPdf(pdf,maxPages){
  if(!window.Tesseract) throw new Error('Th\u01b0 vi\u1ec7n OCR ch\u01b0a t\u1ea3i xong. Ki\u1ec3m tra m\u1ea1ng r\u1ed3i th\u1eed l\u1ea1i.');
  var limit=Math.min(maxPages,15); // OCR n\u1eb7ng, gi\u1edbi h\u1ea1n 15 trang
  ocrModalShow('\ud83d\udcf7 Nh\u1eadn d\u1ea1ng ch\u1eef (OCR)');
  ocrModalUpdate(2,'\u0110ang kh\u1edfi t\u1ea1o b\u1ed9 nh\u1eadn d\u1ea1ng\u2026');
  var worker=await Tesseract.createWorker(['vie','eng']);
  var text='';
  try{
    for(var p=1;p<=limit;p++){
      ocrModalUpdate((p-1)/limit*100,'\u0110ang x\u1eed l\u00fd trang '+p+' / '+limit+'\u2026');
      var page=await pdf.getPage(p);
      var viewport=page.getViewport({scale:2});
      var canvas=document.createElement('canvas');
      canvas.width=viewport.width; canvas.height=viewport.height;
      var ctx=canvas.getContext('2d');
      await page.render({canvasContext:ctx,viewport:viewport}).promise;
      var res=await worker.recognize(canvas);
      text+=(res.data.text||'')+'\n\n';
      ocrModalUpdate(p/limit*100,'Ho\u00e0n t\u1ea5t trang '+p+' / '+limit);
    }
  } finally {
    await worker.terminate();
    ocrModalUpdate(100,'Xong!');
    setTimeout(ocrModalHide,500);
  }
  return text.trim();
}
async function ocrImage(file){
  if(!window.Tesseract) throw new Error('Th\u01b0 vi\u1ec7n OCR ch\u01b0a t\u1ea3i xong.');
  ocrModalShow('\ud83d\udcf7 Nh\u1eadn d\u1ea1ng ch\u1eef trong \u1ea3nh');
  ocrModalUpdate(10,'\u0110ang ph\u00e2n t\u00edch \u1ea3nh\u2026');
  var worker=await Tesseract.createWorker(['vie','eng'],1,{
    logger:function(m){ if(m.status==='recognizing text'){ ocrModalUpdate(20+m.progress*75,'\u0110ang \u0111\u1ecdc ch\u1eef\u2026 '+Math.round(m.progress*100)+'%'); } }
  });
  var res=await worker.recognize(file);
  await worker.terminate();
  ocrModalUpdate(100,'Xong!'); setTimeout(ocrModalHide,500);
  return (res.data.text||'').trim();
}

// \u2550\u2550\u2550 G\u00d3I 2: B\u1ed9 \u0111\u1ecdc file \u0111a \u0111\u1ecbnh d\u1ea1ng (PDF/DOCX/TXT/MD/CSV) \u2550\u2550\u2550
async function extractFileText(file){
  var name=(file.name||'').toLowerCase();
  // PDF
  if(name.endsWith('.pdf') || file.type==='application/pdf'){
    if(!window.pdfjsLib) throw new Error('Th\u01b0 vi\u1ec7n PDF ch\u01b0a t\u1ea3i xong, th\u1eed l\u1ea1i sau v\u00e0i gi\u00e2y.');
    var buf=await file.arrayBuffer();
    var pdf=await pdfjsLib.getDocument({data:buf}).promise;
    var out='';
    var maxPages=Math.min(pdf.numPages,50);
    for(var p=1;p<=maxPages;p++){
      var page=await pdf.getPage(p);
      var tc=await page.getTextContent();
      out+=tc.items.map(function(it){return it.str}).join(' ')+'\n\n';
    }
    out=out.trim();
    // G\u00d3I 3: N\u1ebfu b\u00f3c ch\u1eef < 40 k\u00fd t\u1ef1 \u2192 PDF scan (\u1ea3nh) \u2192 t\u1ef1 \u0111\u1ed9ng OCR
    if(out.length<40){
      toast('\ud83d\udcf7 PDF d\u1ea1ng \u1ea3nh','\u0110ang nh\u1eadn d\u1ea1ng ch\u1eef (OCR), c\u00f3 th\u1ec3 m\u1ea5t 30-90 gi\u00e2y...','info',6000);
      out=await ocrPdf(pdf,maxPages);
    }
    return out.trim();
  }
  // Word .docx
  if(name.endsWith('.docx')){
    if(!window.mammoth) throw new Error('Th\u01b0 vi\u1ec7n Word ch\u01b0a t\u1ea3i xong, th\u1eed l\u1ea1i sau v\u00e0i gi\u00e2y.');
    var buf2=await file.arrayBuffer();
    var res=await mammoth.extractRawText({arrayBuffer:buf2});
    return (res.value||'').trim();
  }
  // .doc c\u0169 kh\u00f4ng h\u1ed7 tr\u1ee3
  if(name.endsWith('.doc')){
    throw new Error('File .doc c\u0169 kh\u00f4ng \u0111\u1ecdc \u0111\u01b0\u1ee3c. H\u00e3y m\u1edf b\u1eb1ng Word v\u00e0 l\u01b0u l\u1ea1i th\u00e0nh .docx.');
  }
  // \u1ea2nh JPG/PNG \u2192 OCR
  if(/\.(jpg|jpeg|png|webp|bmp)$/i.test(name) || (file.type||'').indexOf('image/')===0){
    return await ocrImage(file);
  }
  // TXT/MD/CSV v\u00e0 v\u0103n b\u1ea3n kh\u00e1c
  return await new Promise(function(resolve,reject){
    var r=new FileReader();
    r.onload=function(ev){
      var t=ev.target.result;
      if(typeof t!=='string'||t.indexOf('\x00')!==-1){reject(new Error('File kh\u00f4ng ph\u1ea3i v\u0103n b\u1ea3n.'));return;}
      resolve(t);
    };
    r.onerror=function(){reject(new Error('Kh\u00f4ng \u0111\u1ecdc \u0111\u01b0\u1ee3c file.'))};
    r.readAsText(file,'UTF-8');
  });
}

function handleFiles(e){
  var files=Array.from(e.target.files);
  var items=document.getElementById('fileItems');
  files.forEach(function(f){
    extractFileText(f).then(function(text){
      ST.sourceContext=(ST.sourceContext||'')+'\n\n=== '+f.name+' ===\n'+text.slice(0,8000);
      document.getElementById('sourceContext').style.display='block';
      document.getElementById('sourceContextText').textContent=(ST.sourceContext||'').slice(0,600)+'...';
      toast('\u2705 \u0110\u00e3 \u0111\u1ecdc file',f.name,'success');
    }).catch(function(err){
      toast('C\u1ea3nh b\u00e1o',f.name+': '+err.message,'warn',4000);
    });
    var div=document.createElement('div');
    div.className='file-item';
    div.innerHTML='<span>\ud83d\udcc4 '+f.name+' <span class="text-muted">('+((f.size/1024).toFixed(1))+'KB)</span></span><button class="btn btn-icon btn-sm" onclick="this.parentElement.remove()">\u2715</button>';
    items.appendChild(div);
  });
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// UTILITY FUNCTIONS \u2014 GI\u1eee NGUY\u00caN G\u1ed0C
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function shuffle(arr){
  var a=arr.slice();
  for(var i=a.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var tmp=a[i];a[i]=a[j];a[j]=tmp;
  }
  return a;
}

function extractJSON(raw){
  if(!raw||typeof raw!=='string') return '{}';
  var cleaned=raw;
  var cb=raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if(cb) cleaned=cb[1];
  cleaned=cleaned.replace(/,\s*}/g,'}').replace(/,\s*\]/g,']');
  try{JSON.parse(cleaned.trim());return cleaned.trim()}catch(ex){}
  var s=cleaned.indexOf('{'),e=cleaned.lastIndexOf('}');
  if(s!==-1&&e>s){var c=cleaned.slice(s,e+1);try{JSON.parse(c);return c}catch(ex2){}}
  var as=cleaned.indexOf('['),ae=cleaned.lastIndexOf(']');
  if(as!==-1&&ae>as){var c2=cleaned.slice(as,ae+1);try{JSON.parse(c2);return c2}catch(ex3){}}
  return cleaned.trim();
}

// FIX v2: validateQuizData \u2014 Ki\u1ec3m tra + s\u1eeda l\u1ed7i d\u1eef li\u1ec7u AI k\u1ef9 h\u01a1n
function validateQuizData(data){
  if(!data||!data.questions||!Array.isArray(data.questions)||!data.questions.length){
    throw new Error('AI kh\u00f4ng tr\u1ea3 v\u1ec1 c\u00e2u h\u1ecfi h\u1ee3p l\u1ec7. Th\u1eed l\u1ea1i.');
  }
  data.questions=data.questions.map(function(q,i){
    if(!q.question) throw new Error('C\u00e2u '+(i+1)+' thi\u1ebfu n\u1ed9i dung');
    if(!Array.isArray(q.options)||q.options.length<2) throw new Error('C\u00e2u '+(i+1)+' thi\u1ebfu \u0111\u00e1p \u00e1n');
    // \u0110\u1ea3m b\u1ea3o lu\u00f4n c\u00f3 4 options
    while(q.options.length<4){q.options.push('(ch\u01b0a c\u00f3 \u0111\u00e1p \u00e1n '+(q.options.length+1)+')')}
    if(typeof q.correct!=='number'||q.correct<0||q.correct>=q.options.length) q.correct=0;
    if(!q.icon) q.icon='\u2753';
    if(!q.explanation) q.explanation='';
    q.id=q.id||(i+1);
    return q;
  });
  return data;
}

// NEW v2: validateFlashData \u2014 Ki\u1ec3m tra d\u1eef li\u1ec7u flashcard
function validateFlashData(data){
  if(!data||!data.cards||!Array.isArray(data.cards)||!data.cards.length){
    throw new Error('AI kh\u00f4ng tr\u1ea3 v\u1ec1 flashcard h\u1ee3p l\u1ec7.');
  }
  data.cards=data.cards.map(function(c,i){
    if(!c.front) c.front='Th\u1ebb '+(i+1);
    if(!c.back) c.back='(ch\u01b0a c\u00f3 n\u1ed9i dung)';
    if(!c.icon) c.icon='\ud83d\udcdd';
    if(!c.id) c.id=i+1;
    if(!c.frontSub) c.frontSub='';
    if(!c.backSub) c.backSub='';
    if(!c.hint) c.hint='';
    return c;
  });
  return data;
}

// NEW v2: Markdown \u0111\u01a1n gi\u1ea3n \u2192 HTML (cho AI Reader)
function simpleMarkdownToHtml(md){
  if(!md) return '';
  var html=md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm,'<li>$2</li>')
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/\n\n/g,'</p><p>')
    .replace(/\n/g,'<br>');
  // Wrap li tags
  html=html.replace(/(<li>[\s\S]*?<\/li>)/g,'<ul>$1</ul>');
  html=html.replace(/<\/ul>\s*<ul>/g,'');
  return '<p>'+html+'</p>';
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550