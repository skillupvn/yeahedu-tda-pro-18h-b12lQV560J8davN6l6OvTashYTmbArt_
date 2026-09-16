// ================================================================
// YeahEdu-TDA v11 "PhoenixEdu" - Module: 04-flashcard.js
// Auto-split from monolithic v10, ASCII-only, Live-Server safe
// ================================================================

function retryQuiz(){
  if(!ST.quiz)return;
  ST.quiz.current=0;ST.quiz.answers=[];ST.quiz.startTime=Date.now();
  if(ST.quiz.timerMins)ST.quiz.timerLeft=ST.quiz.timerMins*60;
  if(isOn('tRandom'))ST.quiz.questions=shuffle(ST.quiz.questions);
  if(isOn('tShuffleOpts'))ST.quiz.questions=ST.quiz.questions.map(function(q){
    var arr=[].concat(q.options);var ct=arr[q.correct];var sh=shuffle(arr);q.options=sh;q.correct=sh.indexOf(ct);return q;
  });
  document.getElementById('quizResult').classList.add('hidden');
  document.getElementById('quizPlay').classList.remove('hidden');
  startTimer();renderQuestion();SFX.start();
  toast('\ud83d\udd01 L\u00e0m l\u1ea1i','B\u00e0i tr\u1eafc nghi\u1ec7m \u0111\u00e3 reset','info');
}

function backToQuizConfig(){
  document.getElementById('quizConfig').classList.remove('hidden');
  document.getElementById('quizPlay').classList.add('hidden');
  document.getElementById('quizResult').classList.add('hidden');
  document.getElementById('quizLoadingArea').innerHTML='';SFX.click();
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// TIMER (gi\u1eef nguy\u00ean 100% g\u1ed1c)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function startTimer(){
  clearInterval(ST.timerInterval);
  var q=ST.quiz;
  if(!q.timerMins){document.getElementById('timerDisplay').textContent='\u221e';return;}
  q.timerEnd=Date.now()+q.timerMins*60*1000;
  ST.timerInterval=setInterval(function(){
    var remaining=Math.round((q.timerEnd-Date.now())/1000);
    q.timerLeft=remaining;
    var el=document.getElementById('timerDisplay');
    if(!el){clearInterval(ST.timerInterval);return;}
    el.textContent=fmtTime(Math.max(0,remaining));
    var pct=remaining/(q.timerMins*60);
    el.className='timer-display';
    if(pct<=0.2&&pct>0.1){el.classList.add('warn');if(remaining%30===0)SFX.timerWarn()}
    if(pct<=0.1){el.classList.add('danger');if(remaining%10===0)SFX.timerDanger()}
    if(remaining===60)toast('\u23f0 C\u00f2n 1 ph\u00fat!','H\u00e3y nhanh l\u00ean!','warn',2000);
    if(remaining===30)toast('\u26a0\ufe0f C\u00f2n 30 gi\u00e2y!','','warn',2000);
    if(remaining<=10&&remaining>0)SFX.timerDanger();
    if(remaining<=0){clearInterval(ST.timerInterval);toast('\u23f0 H\u1ebft gi\u1edd!','B\u00e0i n\u1ed9p t\u1ef1 \u0111\u1ed9ng','warn');setTimeout(finishQuiz,1500)}
  },1000);
}
function stopTimer(){clearInterval(ST.timerInterval)}
function fmtTime(s){
  var m=Math.floor(Math.abs(s)/60).toString().padStart(2,'0');
  var ss=(Math.abs(s)%60).toString().padStart(2,'0');
  return m+':'+ss;
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// FLASHCARD ENGINE (FIX v2: Batch cho >20 th\u1ebb)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
var FC_BATCH_THRESHOLD = 20; // \u2550\u2550\u2550 NEW v2: Ng\u01b0\u1ee1ng batch flashcard \u2550\u2550\u2550

var FC_COLORS={
  blue:{front:'linear-gradient(135deg,#0d1b45,#1a2456)',border:'rgba(0,124,240,.3)',back:'linear-gradient(135deg,#0a2d1a,#1a4530)',borderB:'rgba(0,200,150,.3)'},
  green:{front:'linear-gradient(135deg,#0a2d1a,#1a3d28)',border:'rgba(0,200,150,.3)',back:'linear-gradient(135deg,#1a2456,#2a3a6a)',borderB:'rgba(0,124,240,.3)'},
  purple:{front:'linear-gradient(135deg,#1a0a2e,#2d1a4a)',border:'rgba(121,40,202,.4)',back:'linear-gradient(135deg,#2d0a1a,#4a1a2d)',borderB:'rgba(255,77,77,.3)'},
  orange:{front:'linear-gradient(135deg,#2d1a0a,#4a2d1a)',border:'rgba(247,151,30,.3)',back:'linear-gradient(135deg,#0d1b45,#1a2456)',borderB:'rgba(0,124,240,.3)'},
  pink:{front:'linear-gradient(135deg,#2d0a1a,#4a1a2d)',border:'rgba(255,100,150,.3)',back:'linear-gradient(135deg,#0a2d1a,#1a3d28)',borderB:'rgba(0,200,150,.3)'}
};

// TH\u00caM M\u1edaI: Xem tr\u01b0\u1edbc flashcard d\u1ea1ng l\u01b0\u1edbi + \u0111\u1ed5i m\u00e0u tr\u1ef1c ti\u1ebfp
function previewFlashGrid(){
  var f = ST.flash;
  if(!f || !f.cards || !f.cards.length){ toast('Ch\u01b0a c\u00f3 th\u1ebb','H\u00e3y t\u1ea1o flashcard tr\u01b0\u1edbc','warn'); return; }
  var col = FC_COLORS[f.color] || FC_COLORS.blue;
  var colorBtns = Object.keys(FC_COLORS).map(function(c){
    var cc = FC_COLORS[c];
    return '<button onclick="changeFlashGridColor(\''+c+'\')" title="'+c+'" style="width:34px;height:34px;border-radius:8px;border:2px solid '+(c===f.color?'var(--c1)':'var(--border2)')+';background:'+cc.front+';cursor:pointer"></button>';
  }).join('');
  var cards = f.cards.map(function(card,i){
    return '<div style="background:'+col.front+';border:1.5px solid '+col.border+';border-radius:12px;padding:16px;min-height:120px;display:flex;flex-direction:column">'
      +'<div style="font-size:1.4rem;margin-bottom:6px">'+(card.icon||'\ud83d\udcd8')+'</div>'
      +'<div style="font-weight:700;font-size:.95rem;margin-bottom:6px">'+card.front+'</div>'
      +'<div style="font-size:.82rem;color:var(--text3);border-top:1px dashed rgba(255,255,255,.15);padding-top:6px;margin-top:auto">'+String(card.back).slice(0,90)+(String(card.back).length>90?'\u2026':'')+'</div>'
      +'</div>';
  }).join('');
  var modal = document.getElementById('fcGridModal');
  if(!modal){
    modal = document.createElement('div');
    modal.id='fcGridModal'; modal.className='modal-overlay hidden';
    modal.onclick=function(e){ if(e.target.id==='fcGridModal') closeModal('fcGridModal'); };
    modal.innerHTML='<div class="modal" style="max-width:900px"><div class="modal-header"><div class="modal-title">\ud83c\udfb4 Xem tr\u01b0\u1edbc Flashcard (l\u01b0\u1edbi)</div><button class="btn btn-icon btn-sm" onclick="closeModal(\'fcGridModal\')">\u2716</button></div><div class="modal-body" id="fcGridBody"></div></div>';
    document.body.appendChild(modal);
  }
  document.getElementById('fcGridBody').innerHTML =
    '<div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap"><span style="font-size:.85rem;font-weight:600;color:var(--text2)">\ud83c\udfa8 Ch\u1ecdn m\u00e0u th\u1ebb:</span>'+colorBtns+'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">'+cards+'</div>';
  openModal('fcGridModal'); SFX.click();
}
function changeFlashGridColor(c){
  if(ST.flash){ ST.flash.color=c; var sel=document.getElementById('fcColor'); if(sel) sel.value=c; renderFC(); previewFlashGrid(); saveAll(); }
}

async function startFlashcards(){
  SFX.start();
  var topic=document.getElementById('fcTopic').value.trim();
  if(!topic){toast('Thi\u1ebfu ch\u1ee7 \u0111\u1ec1','Nh\u1eadp ch\u1ee7 \u0111\u1ec1 flashcard','warn');return;}
  if(!ST.apiKeys.filter(function(k){return k.key.trim()}).length){toast('Ch\u01b0a c\u00f3 API key','V\u00e0o C\u00e0i \u0111\u1eb7t th\u00eam','error');openSettings();return;}

  var totalCount = parseInt(document.getElementById('fcCount').value) || 10;
  var area=document.getElementById('flashLoadingArea');
  var useBatch = totalCount > FC_BATCH_THRESHOLD;
  var batchInfo = useBatch ? ' (chia '+Math.ceil(totalCount/FC_BATCH_THRESHOLD)+' batch)' : '';

  area.innerHTML='<div class="card"><div class="spin-wrap"><div class="spinner"></div><div class="spin-text">AI \u0111ang t\u1ea1o '+totalCount+' flashcards'+batchInfo+'<span class="spin-dots"></span></div>'
    + (useBatch ? '<div class="batch-progress" style="margin-top:12px;width:100%"><div class="progress-bar"><div class="progress-fill" id="fcBatchFill" style="width:0%"></div></div><div class="text-muted" style="font-size:.78rem;margin-top:4px" id="fcBatchText">Chu\u1ea9n b\u1ecb batch 1...</div></div>' : '')
    + '</div></div>';

  try{
    var sysMsg={role:'system',content:'B\u1ea1n l\u00e0 h\u1ec7 th\u1ed1ng t\u1ea1o flashcard gi\u00e1o d\u1ee5c. LU\u00d4N tr\u1ea3 v\u1ec1 JSON h\u1ee3p l\u1ec7, KH\u00d4NG d\u00f9ng markdown code block.'};
    var fcData = null;

    if(useBatch){
      // \u2550\u2550\u2550 NEW v2: BATCH MODE cho flashcard \u2550\u2550\u2550
      var chunks = Math.ceil(totalCount / FC_BATCH_THRESHOLD);
      var allCards = [];

      for(var batchIdx=0; batchIdx < chunks; batchIdx++){
        var batchCount = Math.min(FC_BATCH_THRESHOLD, totalCount - batchIdx*FC_BATCH_THRESHOLD);
        var batchNum   = batchIdx + 1;

        var fillEl = document.getElementById('fcBatchFill');
        var textEl = document.getElementById('fcBatchText');
        if(fillEl) fillEl.style.width = Math.round(batchNum/chunks*100) + '%';
        if(textEl) textEl.textContent = '\ud83d\udce6 Batch ' + batchNum + '/' + chunks + ' \u2014 \u0111ang t\u1ea1o ' + batchCount + ' th\u1ebb...';

        var batchPrompt = buildFlashPrompt(batchCount);
        if(chunks > 1){
          batchPrompt += '\n\n[BATCH ' + batchNum + '/' + chunks + ': T\u1ea1o th\u1ebb ID t\u1eeb ' + (batchIdx*FC_BATCH_THRESHOLD+1) + '. N\u1ed9i dung KH\u00d4NG tr\u00f9ng batch tr\u01b0\u1edbc.]';
        }

        var batchCards = null;
        for(var attempt=0; attempt<2; attempt++){
          try{
            var prompt = batchPrompt + (attempt>0?'\n\nCH\u1ec8 tr\u1ea3 JSON thu\u1ea7n.':'');
            var raw = await callAI([sysMsg, {role:'user', content:prompt}]);
            var parsed = JSON.parse(extractJSON(raw));
            batchCards = validateFlashData(parsed);
            break;
          }catch(parseErr){
            if(attempt===0) toast('\u23f3 Batch '+batchNum+' th\u1eed l\u1ea1i...','','warn',1500);
          }
        }
        if(batchCards && batchCards.cards){
          allCards = allCards.concat(batchCards.cards);
        } else {
          toast('\u26a0\ufe0f FC Batch '+batchNum+' th\u1ea5t b\u1ea1i','Ti\u1ebfp t\u1ee5c...','warn');
        }

        if(batchIdx < chunks-1){
          await new Promise(function(res){setTimeout(res,1500)});
        }
      }

      if(!allCards.length) throw new Error('Kh\u00f4ng t\u1ea1o \u0111\u01b0\u1ee3c flashcard n\u00e0o t\u1eeb t\u1ea5t c\u1ea3 batches.');
      allCards.forEach(function(c,idx){c.id=idx+1});
      fcData = {title: 'Flashcard', cards: allCards};
      toast('\u2705 \u0110\u00e3 t\u1ea1o '+allCards.length+'/'+totalCount+' th\u1ebb','','success');

    } else {
      // \u2550\u2550\u2550 SINGLE MODE \u2014 Logic g\u1ed1c \u2550\u2550\u2550
      var lastFcErr=null;
      for(var attempt=0;attempt<2;attempt++){
        try{
          var prompt=buildFlashPrompt()+(attempt>0?'\n\nCH\u1ec8 tr\u1ea3 JSON thu\u1ea7n.':'');
          var raw=await callAI([sysMsg,{role:'user',content:prompt}]);
          fcData=JSON.parse(extractJSON(raw));
          fcData=validateFlashData(fcData);
          break;
        }catch(e2){
          lastFcErr=e2;
          if(attempt===0)toast('\u23f3 Th\u1eed l\u1ea1i...','','warn',1500);
        }
      }
      if(!fcData||!fcData.cards||!fcData.cards.length)throw lastFcErr;
    }

    var color=document.getElementById('fcColor').value;
    ST.flash={title:fcData.title||'Flashcard',cards:fcData.cards,index:0,flipped:false,color:color,memRatings:{},
      subject:document.getElementById('fcSubject').value,grade:document.getElementById('fcGrade').value};
    ST.stats.fcLearned+=fcData.cards.length;saveAll();
    area.innerHTML='';
    document.getElementById('flashConfig').classList.add('hidden');
    document.getElementById('flashPlay').classList.remove('hidden');
    renderFC();
  }catch(e){
    area.innerHTML='<div class="alert alert-error">\u274c '+e.message+'</div>';
    toast('L\u1ed7i t\u1ea1o flashcard',e.message,'error');
  }
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// FLASHCARD RENDER + INTERACTION (gi\u1eef nguy\u00ean 100% g\u1ed1c)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function renderFC(){
  var f=ST.flash;if(!f)return;
  var card=f.cards[f.index],col=FC_COLORS[f.color]||FC_COLORS.blue,total=f.cards.length;
  document.getElementById('fcFront').style.background=col.front;
  document.getElementById('fcFront').style.borderColor=col.border;
  document.getElementById('fcBack').style.background=col.back;
  document.getElementById('fcBack').style.borderColor=col.borderB;
  document.getElementById('fcIcon').textContent=card.icon||'\u2753';
  document.getElementById('fcFrontText').textContent=card.front;
  document.getElementById('fcFrontSub').textContent=card.frontSub||'';
  document.getElementById('fcBackText').textContent=card.back;
  document.getElementById('fcBackSub').textContent=card.backSub||(card.hint?'\ud83d\udca1 '+card.hint:'');
  document.getElementById('fcCounter').textContent=(f.index+1)+' / '+total;
  document.getElementById('fcProgressFill').style.width=Math.round((f.index+1)/total*100)+'%';
  document.getElementById('fcCard').classList.remove('flipped');
  document.getElementById('fcMemBtns').classList.add('hidden');
  f.flipped=false;
  document.getElementById('fcPrev').disabled=f.index===0;
  document.getElementById('fcNext').disabled=f.index===total-1;
}
function flipCard(){
  var f=ST.flash;if(!f)return;
  document.getElementById('fcCard').classList.toggle('flipped');
  f.flipped=!f.flipped;
  if(f.flipped){SFX.flip();document.getElementById('fcMemBtns').classList.remove('hidden')}
}
function fcNav(dir){
  var f=ST.flash;if(!f)return;
  var n=f.index+dir;if(n<0||n>=f.cards.length)return;
  f.index=n;f.flipped=false;SFX.nav();renderFC();
}
function memRate(level){
  var f=ST.flash;if(!f)return;
  f.memRatings[f.index]=level;SFX.click();
  if(f.index<f.cards.length-1)setTimeout(function(){fcNav(1)},300);
  else{SFX.complete();
    var hard=Object.values(f.memRatings).filter(function(r){return r==='hard'}).length;
    var easy=Object.values(f.memRatings).filter(function(r){return r==='easy'}).length;
    toast('\ud83c\udf89 Ho\u00e0n th\u00e0nh!','D\u1ec5: '+easy+' \u00b7 Kh\u00f3: '+hard,'success',5000)}
}
function resetFlash(){var f=ST.flash;if(!f)return;f.index=0;f.flipped=false;f.memRatings={};SFX.start();renderFC()}
function backToFlashConfig(){
  document.getElementById('flashConfig').classList.remove('hidden');
  document.getElementById('flashPlay').classList.add('hidden');
  document.getElementById('flashLoadingArea').innerHTML='';SFX.click();
}
function shuffleFlash(){var f=ST.flash;if(!f)return;f.cards=shuffle(f.cards);f.index=0;f.memRatings={};SFX.click();renderFC();toast('\u0110\u00e3 x\u00e1o tr\u1ed9n','','info')}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// TOPICS (gi\u1eef nguy\u00ean 100% g\u1ed1c)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
var selectedTopic=null;
function renderTopics(){
  var render=function(id,data){var el=document.getElementById(id);if(!el)return;
    el.innerHTML=data.map(function(t){return '<div class="topic-card" onclick="selectTopic(this,\''+t.sub+'\',\''+t.grade+'\',\''+t.name.replace(/'/g,"\\'")+'\')">'
      +'<div class="tc-icon">'+t.icon+'</div><div class="tc-name">'+t.name+'</div><div class="tc-grade">'+t.sub+' \u00b7 L\u1edbp '+t.grade+'</div></div>'}).join('')};
  render('topics2Toan',TOPIC_DATA.k2_toan);render('topics2VietAnh',TOPIC_DATA.k2_viet_anh);
  render('topics3Toan',TOPIC_DATA.k3_toan);render('topics3VietAnh',TOPIC_DATA.k3_viet_anh);
}
function selectTopic(el,sub,grade,name){
  SFX.click();document.querySelectorAll('.topic-card').forEach(function(t){t.classList.remove('sel')});el.classList.add('sel');
  selectedTopic={sub:sub,grade:grade,name:name};
  document.getElementById('topicChosenName').textContent=name+' ('+sub+' L\u1edbp '+grade+')';
  document.getElementById('topicActionBox').style.display='block';
  document.getElementById('topicActionBox').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function topicGoQuiz(){
  if(!selectedTopic)return;
  document.getElementById('qSubject').value=selectedTopic.sub;
  document.getElementById('qGrade').value=selectedTopic.grade;
  document.getElementById('qTopic').value=selectedTopic.name;
  document.querySelectorAll('.nav-tab').forEach(function(b){b.classList.remove('active')});
  document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active')});
  document.querySelector('[data-tab="tabQuiz"]').classList.add('active');
  document.getElementById('tabQuiz').classList.add('active');
  SFX.start();toast('\u0110\u00e3 ch\u1ecdn ch\u1ee7 \u0111\u1ec1',selectedTopic.name,'success');
}
function topicGoFlash(){
  if(!selectedTopic)return;
  document.getElementById('fcSubject').value=selectedTopic.sub;
  document.getElementById('fcGrade').value=selectedTopic.grade;
  document.getElementById('fcTopic').value=selectedTopic.name;
  document.querySelectorAll('.nav-tab').forEach(function(b){b.classList.remove('active')});
  document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active')});
  document.querySelector('[data-tab="tabFlash"]').classList.add('active');
  document.getElementById('tabFlash').classList.add('active');
  SFX.start();toast('\u0110\u00e3 ch\u1ecdn ch\u1ee7 \u0111\u1ec1',selectedTopic.name,'success');
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// STATS (gi\u1eef nguy\u00ean 100% g\u1ed1c)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function renderStats(){
  var s=ST.stats,acc=s.totalQ>0?Math.round(s.correctQ/s.totalQ*100):0;
  document.getElementById('statsGrid').innerHTML=
    '<div class="stat-card"><div class="stat-n">'+s.sessions+'</div><div class="stat-lbl">\ud83d\udcdd B\u00e0i l\u00e0m</div></div>'
    +'<div class="stat-card"><div class="stat-n">'+s.totalQ+'</div><div class="stat-lbl">\u2753 C\u00e2u h\u1ecfi</div></div>'
    +'<div class="stat-card"><div class="stat-n">'+s.correctQ+'</div><div class="stat-lbl">\u2705 C\u00e2u \u0111\u00fang</div></div>'
    +'<div class="stat-card"><div class="stat-n">'+acc+'%</div><div class="stat-lbl">\ud83c\udfaf Ch\u00ednh x\u00e1c</div></div>'
    +'<div class="stat-card"><div class="stat-n">'+s.fcLearned+'</div><div class="stat-lbl">\ud83c\udfb4 Flashcard</div></div>';
  var achievements=[];
  if(s.sessions>=1)achievements.push({icon:'\ud83c\udfaf',name:'Ng\u01b0\u1eddi h\u1ecdc \u0111\u1ea7u ti\u00ean',desc:'Ho\u00e0n th\u00e0nh b\u00e0i \u0111\u1ea7u ti\u00ean'});
  if(s.totalQ>=50)achievements.push({icon:'\ud83d\udcaf',name:'H\u1ecdc gi\u1ea3',desc:'L\u00e0m 50+ c\u00e2u h\u1ecfi'});
  if(acc>=90&&s.totalQ>=10)achievements.push({icon:'\ud83c\udf1f',name:'Xu\u1ea5t s\u1eafc',desc:'Ch\u00ednh x\u00e1c \u2265 90%'});
  if(s.sessions>=10)achievements.push({icon:'\ud83c\udfc6',name:'Chi\u1ebfn binh',desc:'10+ b\u00e0i l\u00e0m'});
  if(s.fcLearned>=30)achievements.push({icon:'\ud83c\udfb4',name:'B\u1eadc th\u1ea7y FC',desc:'30+ flashcards'});
  document.getElementById('achievementList').innerHTML=achievements.length?
    '<div class="grid-cards">'+achievements.map(function(a){return '<div class="ach-card"><span class="ach-icon">'+a.icon+'</span><div><div style="font-weight:800">'+a.name+'</div><div style="font-size:.8rem;color:var(--text2);margin-top:2px">'+a.desc+'</div></div></div>'}).join('')+'</div>':
    '<div class="text-muted" style="padding:10px">Ch\u01b0a c\u00f3 th\u00e0nh t\u00edch. H\u00e3y b\u1eaft \u0111\u1ea7u h\u1ecdc!</div>';
  document.getElementById('historyList').innerHTML=s.history.length?
    '<div style="overflow-x:auto"><table class="pro-table"><thead><tr><th>\ud83d\udcc5 Ng\u00e0y</th><th>\ud83d\udcda B\u00e0i</th><th style="text-align:center">K\u1ebft qu\u1ea3</th><th style="text-align:center">Ch\u00ednh x\u00e1c</th></tr></thead><tbody>'
    +s.history.map(function(h){return '<tr><td>'+h.date+'</td><td style="color:var(--text3)">'+h.title+'</td><td style="text-align:center;font-weight:700">'+h.correct+'/'+h.total+'</td><td style="text-align:center"><span class="badge '+(h.pct>=70?'badge-green':'badge-red')+'">'+h.pct+'%</span></td></tr>'}).join('')+'</tbody></table></div>':
    '<div class="text-muted" style="padding:10px">Ch\u01b0a c\u00f3 l\u1ecbch s\u1eed.</div>';
}
function confirmResetStats(){
  if(confirm('X\u00f3a to\u00e0n b\u1ed9 th\u1ed1ng k\u00ea?')){ST.stats={totalQ:0,correctQ:0,sessions:0,fcLearned:0,history:[],achievements:[]};saveAll();renderStats();toast('\u0110\u00e3 x\u00f3a','','info')}
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// HOME (gi\u1eef nguy\u00ean 100% g\u1ed1c)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function renderHome(){
  var s=ST.stats,acc=s.totalQ>0?Math.round(s.correctQ/s.totalQ*100):0;
  document.getElementById('homeStats').innerHTML=
    '<div class="stat-card"><div class="stat-n">'+s.sessions+'</div><div class="stat-lbl">B\u00e0i l\u00e0m</div></div>'
    +'<div class="stat-card"><div class="stat-n">'+acc+'%</div><div class="stat-lbl">Ch\u00ednh x\u00e1c</div></div>'
    +'<div class="stat-card"><div class="stat-n">'+s.fcLearned+'</div><div class="stat-lbl">Flashcard</div></div>'
    +'<div class="stat-card"><div class="stat-n">'+s.totalQ+'</div><div class="stat-lbl">C\u00e2u h\u1ecfi</div></div>';
  var allTopics=[].concat(TOPIC_DATA.k2_toan,TOPIC_DATA.k3_toan,TOPIC_DATA.k2_viet_anh,TOPIC_DATA.k3_viet_anh).slice(0,8);
  document.getElementById('quickTopics').innerHTML=allTopics.map(function(t){
    return '<div class="topic-card" onclick="quickStart(\''+t.sub+'\',\''+t.grade+'\',\''+t.name.replace(/'/g,"\\'")+'\')">'
      +'<div class="tc-icon">'+t.icon+'</div><div class="tc-name">'+t.name+'</div><div class="tc-grade">'+t.sub+' \u00b7 L\u1edbp '+t.grade+'</div></div>'}).join('');
  var prov=PROVIDERS[ST.provider],hasKey=ST.apiKeys.filter(function(k){return k.provider===ST.provider&&k.key.trim()}).length;
  document.getElementById('homeProviderInfo').innerHTML=
    '<div class="flex-between flex-wrap" style="gap:12px"><div>'
    +'<div style="font-size:1.1rem;font-weight:700">'+prov.emoji+' '+prov.name+'</div>'
    +'<div style="color:var(--text2);font-size:.85rem;margin-top:4px">Model: <code>'+ST.model+'</code></div>'
    +'<div style="margin-top:8px"><span class="badge '+(hasKey?'badge-green':'badge-red')+'">'+(hasKey?hasKey+' key \u0111\u00e3 c\u1ea5u h\u00ecnh':'\u26a0\ufe0f Ch\u01b0a c\u00f3 API key')+'</span></div>'
    +'</div><button class="btn btn-secondary btn-sm" onclick="openSettings()">\u2699\ufe0f Thay \u0111\u1ed5i</button></div>'
    +(!hasKey?'<div class="alert alert-warn" style="margin-top:12px">\u26a0\ufe0f C\u1ea7n th\u00eam API key \u0111\u1ec3 d\u00f9ng AI. Nh\u1ea5n \u2699\ufe0f C\u00e0i \u0111\u1eb7t.</div>':'');
}
function quickStart(sub,grade,name){
  SFX.start();
  document.getElementById('qSubject').value=sub;document.getElementById('qGrade').value=grade;document.getElementById('qTopic').value=name;
  document.querySelectorAll('.nav-tab').forEach(function(b){b.classList.remove('active')});
  document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active')});
  document.querySelector('[data-tab="tabQuiz"]').classList.add('active');
  document.getElementById('tabQuiz').classList.add('active');
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550