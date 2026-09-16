// ================================================================
// YeahEdu-TDA v11 "PhoenixEdu" - Module: 03-web-quiz.js
// Auto-split from monolithic v10, ASCII-only, Live-Server safe
// ================================================================

// PH\u1ea6N 5/6 \u2014 JS: WEB SEARCH + QUIZ/FLASHCARD ENGINE + EXPORT
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2550\u2550\u2550 FIX v2: doWebSearch \u2014 Th\u00eam Google PSE, c\u1ea3i ti\u1ebfn pipeline, d\u00f9ng cho c\u1ea3 Quiz l\u1eabn Reader \u2550\u2550\u2550
async function doWebSearch(targetTopicEl, targetGradeEl, targetSubjectEl, targetPreviewEl){
  // \u2550\u2550\u2550 NEW v2: H\u1ed7 tr\u1ee3 g\u1ecdi t\u1eeb c\u1ea3 Quiz tab L\u1eaaN Reader tab \u2550\u2550\u2550
  var topicEl  = targetTopicEl   || document.getElementById('qTopic');
  var gradeEl  = targetGradeEl   || document.getElementById('qGrade');
  var subjectEl= targetSubjectEl || document.getElementById('qSubject');
  var previewId= targetPreviewEl || 'webSearchPreview';

  var topic   = topicEl.value ? topicEl.value.trim() : '';
  var grade   = gradeEl ? (gradeEl.value||'') : '';
  var subject = subjectEl ? (subjectEl.value||'') : '';

  if(!topic){toast('Nh\u1eadp ch\u1ee7 \u0111\u1ec1','H\u00e3y nh\u1eadp ch\u1ee7 \u0111\u1ec1 tr\u01b0\u1edbc khi t\u00ecm ki\u1ebfm','warn');return '';}

  var query = (subject ? subject+' ' : '') + (grade ? 'l\u1edbp '+grade+' ' : '') + topic + ' b\u00e0i h\u1ecdc \u00f4n t\u1eadp';
  var preview = document.getElementById(previewId);
  if(preview) preview.innerHTML = '<div class="spin-wrap" style="padding:20px"><div class="spinner" style="width:30px;height:30px;border-width:3px"></div><div class="spin-text">\u0110ang t\u00ecm ki\u1ebfm t\u1eeb nhi\u1ec1u ngu\u1ed3n<span class="spin-dots"></span></div></div>';

  var context = '';
  var sourceUsed = '';
  // \u2550\u2550\u2550 NEW v2: Track sources tried for debugging \u2550\u2550\u2550
  var sourcesTried = [];

  // \u0110\u1ecdc search provider & key t\u1eeb UI
  var searchProviderEl = document.getElementById('searchProvider');
  var searchApiKeyEl   = document.getElementById('searchApiKey');
  var googleCxEl       = document.getElementById('googleCx');
  var searchProvider   = searchProviderEl ? searchProviderEl.value : 'auto';
  var searchApiKey     = searchApiKeyEl   ? searchApiKeyEl.value.trim() : '';
  var googleCx         = googleCxEl       ? googleCxEl.value.trim() : '';

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // B\u01af\u1edaC 1: Ngu\u1ed3n mi\u1ec5n ph\u00ed KH\u00d4NG C\u1ea6N API KEY
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

  // \u2550\u2550\u2550 NEW v2: 1A \u2014 Google PSE (Custom Search JSON API, mi\u1ec5n ph\u00ed 100 req/ng\u00e0y) \u2550\u2550\u2550
  if((!context || context.length < 100) && (searchProvider === 'auto' || searchProvider === 'google_pse')){
    if(searchApiKey && googleCx){
      sourcesTried.push('Google PSE');
      try {
        var gUrl = 'https://www.googleapis.com/customsearch/v1?key='+encodeURIComponent(searchApiKey)
          +'&cx='+encodeURIComponent(googleCx)
          +'&q='+encodeURIComponent(query)
          +'&num=5&lr=lang_vi&hl=vi';
        var r = await fetch(gUrl);
        if(r.ok){
          var d = await r.json();
          var items = d.items || [];
          if(items.length){
            context = items.map(function(it){
              return '\ud83d\udccc ' + (it.title||'') + '\n' + (it.snippet||'') + (it.pagemap?.metatags?.[0]?.['og:description'] ? '\n'+it.pagemap.metatags[0]['og:description'] : '');
            }).join('\n\n').slice(0, 4000);
            sourceUsed = 'Google PSE';
          }
        }
      } catch(e){ console.log('Google PSE:', e.message); }
    }
  }

  // 1B: DuckDuckGo Instant Answer
  if((!context || context.length < 100) && (searchProvider === 'auto' || searchProvider === 'google_pse')){
    sourcesTried.push('DuckDuckGo');
    try {
      var ddgUrl = 'https://api.duckduckgo.com/?q='+encodeURIComponent(query)+'&format=json&no_html=1&skip_disambig=1';
      var r = await fetch(ddgUrl);
      if(r.ok){
        var d = await r.json();
        var ddgText = '';
        if(d.Abstract) ddgText += d.Abstract + '\n';
        if(d.Answer) ddgText += d.Answer + '\n';
        if(d.RelatedTopics && d.RelatedTopics.length){
          ddgText += d.RelatedTopics.slice(0, 8).map(function(t){return t.Text||''}).filter(Boolean).join('\n');
        }
        if(ddgText.length > 80){ context = ddgText.slice(0, 4000); sourceUsed = 'DuckDuckGo'; }
      }
    } catch(e){ console.log('DDG search:', e.message); }
  }

  // 1C: Wikipedia ti\u1ebfng Vi\u1ec7t
  if(!context || context.length < 100){
    sourcesTried.push('Wikipedia VI');
    try {
      var wikiQuery = (subject||'') + ' ' + topic + (grade ? ' l\u1edbp '+grade : '');
      var wUrl = 'https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch='+encodeURIComponent(wikiQuery)+'&format=json&origin=*&srlimit=5&utf8=1';
      var r = await fetch(wUrl);
      if(r.ok){
        var d = await r.json();
        var snippets = (d.query && d.query.search ? d.query.search : []).map(function(s){
          var clean = s.snippet.replace(/<[^>]+>/g, '');
          return '\ud83d\udccc ' + s.title + ': ' + clean;
        }).join('\n\n');
        if(snippets.length > 100){
          var topTitle = d.query.search[0] ? d.query.search[0].title : null;
          if(topTitle){
            try {
              var pageUrl = 'https://vi.wikipedia.org/w/api.php?action=query&titles='+encodeURIComponent(topTitle)+'&prop=extracts&exintro=0&explaintext=1&format=json&origin=*&exchars=3000';
              var r2 = await fetch(pageUrl);
              if(r2.ok){
                var d2 = await r2.json();
                var pages = d2.query && d2.query.pages ? d2.query.pages : {};
                var pageText = Object.values(pages)[0] ? (Object.values(pages)[0].extract||'') : '';
                if(pageText.length > 100){
                  context = pageText.slice(0, 4000) + '\n\n' + snippets;
                  sourceUsed = 'Wikipedia Ti\u1ebfng Vi\u1ec7t';
                }
              }
            } catch(e2){}
          }
          if(!context || context.length < 100){
            context = snippets.slice(0, 4000);
            sourceUsed = 'Wikipedia Search';
          }
        }
      }
    } catch(e){ console.log('Wiki search:', e.message); }
  }

  // 1D: Wikipedia ti\u1ebfng Anh (fallback)
  if(!context || context.length < 100){
    sourcesTried.push('Wikipedia EN');
    try {
      var enQuery = (subject||'') + ' grade ' + (grade||'') + ' ' + topic;
      var wUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch='+encodeURIComponent(enQuery)+'&format=json&origin=*&srlimit=3&utf8=1';
      var r = await fetch(wUrl);
      if(r.ok){
        var d = await r.json();
        var topTitle = d.query && d.query.search && d.query.search[0] ? d.query.search[0].title : null;
        if(topTitle){
          var pageUrl = 'https://en.wikipedia.org/w/api.php?action=query&titles='+encodeURIComponent(topTitle)+'&prop=extracts&exintro=0&explaintext=1&format=json&origin=*&exchars=3000';
          var r2 = await fetch(pageUrl);
          if(r2.ok){
            var d2 = await r2.json();
            var pages = d2.query && d2.query.pages ? d2.query.pages : {};
            var pageText = Object.values(pages)[0] ? (Object.values(pages)[0].extract||'') : '';
            if(pageText.length > 100){ context = pageText.slice(0, 4000); sourceUsed = 'Wikipedia EN'; }
          }
        }
      }
    } catch(e){ console.log('Wiki EN:', e.message); }
  }

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // B\u01af\u1edaC 2: Jina AI (mi\u1ec5n ph\u00ed, kh\u00f4ng c\u1ea7n key)
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  if(!context || context.length < 100){
    sourcesTried.push('Jina AI');
    try {
      var searchUrl = 'https://s.jina.ai/'+encodeURIComponent(query);
      var ctrl = new AbortController();
      var tmt = setTimeout(function(){ctrl.abort()}, 12000);
      var r = await fetch(searchUrl, {
        headers: {'Accept':'application/json','X-Return-Format':'markdown'},
        signal: ctrl.signal
      });
      clearTimeout(tmt);
      if(r.ok){
        var text = await r.text();
        if(text.length > 100){ context = text.slice(0, 4000); sourceUsed = 'Jina AI Search'; }
      }
    } catch(e){ console.log('Jina search:', e.message); }
  }

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // B\u01af\u1edaC 3: Paid search API (n\u1ebfu user c\u1ea5u h\u00ecnh)
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  if((!context || context.length < 100) && searchApiKey && searchProvider !== 'google_pse'){
    sourcesTried.push(searchProvider);
    try {
      if(searchProvider === 'tavily' || (searchProvider === 'auto' && searchApiKey)){
        var r = await fetch('https://api.tavily.com/search', {
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+searchApiKey},
          body:JSON.stringify({query:query, search_depth:'basic', include_answer:true, max_results:5})
        });
        if(r.ok){
          var d = await r.json();
          context = (d.answer||'') + (d.results||[]).map(function(x){return '\n'+x.title+'\n'+x.content}).join('\n').slice(0,3000);
          sourceUsed = 'Tavily';
        }
      } else if(searchProvider === 'serper'){
        var r = await fetch('https://google.serper.dev/search', {
          method:'POST',
          headers:{'Content-Type':'application/json','X-API-KEY':searchApiKey},
          body:JSON.stringify({q:query, gl:'vn', hl:'vi', num:5})
        });
        if(r.ok){
          var d = await r.json();
          context = (d.organic||[]).map(function(x){return x.title+': '+x.snippet}).join('\n\n').slice(0,3000);
          sourceUsed = 'Serper';
        }
      } else if(searchProvider === 'brave'){
        var r = await fetch('https://api.search.brave.com/res/v1/web/search?q='+encodeURIComponent(query)+'&count=5&lang=vi', {
          headers:{'Accept':'application/json','X-Subscription-Token':searchApiKey}
        });
        if(r.ok){
          var d = await r.json();
          context = (d.web && d.web.results ? d.web.results : []).map(function(x){return x.title+': '+x.description}).join('\n\n').slice(0,3000);
          sourceUsed = 'Brave';
        }
      }
    } catch(e){ console.log('Paid search:', e.message); }
  }

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // B\u01af\u1edaC 4: Gemini Grounding
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  if(!context || context.length < 100){
    sourcesTried.push('Gemini Grounding');
    try {
      context = await searchViaGeminiGrounding('', subject, grade, topic);
      if(context && context.length > 100) sourceUsed = 'Gemini Grounding';
    } catch(e){ console.log('Gemini grounding:', e.message); }
  }

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // B\u01af\u1edaC 5: Fallback \u2014 AI knowledge
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  if(!context || context.length < 100){
    sourcesTried.push('AI Knowledge');
    try {
      context = await searchViaAIKnowledge(subject, grade, topic);
      if(context && context.length > 100) sourceUsed = 'AI Knowledge';
    } catch(e){ console.log('AI knowledge:', e.message); }
  }

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // HI\u1ec2N TH\u1eca K\u1ebeT QU\u1ea2
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  console.log('\ud83d\udd0d Web search tried:', sourcesTried.join(' \u2192 '), '| Used:', sourceUsed, '| Length:', (context||'').length);

  if(context && context.length > 80){
    ST.sourceContext = context;
    document.getElementById('sourceContext').style.display = 'block';
    document.getElementById('sourceContextText').textContent = context.slice(0, 600) + '...';
    if(preview) preview.innerHTML = '<div class="alert alert-success">\u2705 T\u00ecm th\u1ea5y ' + context.length + ' k\u00fd t\u1ef1 t\u1eeb <strong>' + sourceUsed + '</strong>. AI s\u1ebd d\u00f9ng ngu\u1ed3n n\u00e0y t\u1ea1o c\u00e2u h\u1ecfi.</div>';
    toast('T\u00ecm ki\u1ebfm xong', context.length + ' k\u00fd t\u1ef1 t\u1eeb ' + sourceUsed, 'success');
  } else {
    ST.sourceContext = '[AI s\u1ebd t\u1ef1 sinh n\u1ed9i dung cho "' + (subject||'') + ' l\u1edbp ' + (grade||'') + '" - "' + topic + '"]';
    if(preview) preview.innerHTML = '<div class="alert alert-warn">\u26a0\ufe0f Kh\u00f4ng t\u00ecm \u0111\u01b0\u1ee3c ngu\u1ed3n ngo\u00e0i. AI s\u1ebd d\u00f9ng ki\u1ebfn th\u1ee9c n\u1ed9i b\u1ed9.</div>';
    toast('T\u00ecm ki\u1ebfm', 'D\u00f9ng ki\u1ebfn th\u1ee9c AI n\u1ed9i b\u1ed9', 'info');
  }
  // \u2550\u2550\u2550 NEW v2: Tr\u1ea3 context cho caller (d\u00f9ng cho Reader) \u2550\u2550\u2550
  return context || '';
}

// Gi\u1eef nguy\u00ean searchViaGeminiGrounding + searchViaAIKnowledge t\u1eeb g\u1ed1c
async function searchViaGeminiGrounding(apiKey, subject, grade, topic){
  var gemKeys = ST.apiKeys.filter(function(k){
    return k.provider === 'gemini' && k.key.trim() && k.status !== 'dead' && !_isKeyCooling(k.key);
  });
  if(!gemKeys.length){ console.log('Gemini grounding: t\u1ea5t c\u1ea3 key \u0111ang cooldown, b\u1ecf qua'); return ''; }
  var keyObj = gemKeys[0];
  try {
    var ep = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+keyObj.key;
    var ctrl = new AbortController();
    var timeout = setTimeout(function(){ctrl.abort()}, 15000);
    var r = await fetch(ep, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        contents:[{parts:[{text:'T\u00ecm v\u00e0 t\u00f3m t\u1eaft ki\u1ebfn th\u1ee9c: '+subject+' l\u1edbp '+grade+' - '+topic+'. Vi\u1ebft 400 t\u1eeb, ch\u00ednh x\u00e1c.'}]}],
        generationConfig:{temperature:0.3,maxOutputTokens:1200},
        tools:[{google_search:{}}]
      }),
      signal:ctrl.signal
    });
    clearTimeout(timeout);
    if(r.ok){
      var d = await r.json();
      var txt = d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts && d.candidates[0].content.parts[0] ? d.candidates[0].content.parts[0].text : '';
      if(txt.length > 100) return txt.slice(0, 3500);
    } else if(r.status === 429 || r.status === 503){
      _coolKey(keyObj.key, 60);
      keyObj.status = 'ratelimit';
    }
  } catch(e){ console.log('Gemini grounding:', e.message); }
  return '';
}

async function searchViaAIKnowledge(subject, grade, topic){
  try {
    var msgs = [{role:'user', content:'T\u00f3m t\u1eaft ng\u1eafn (300 t\u1eeb) ki\u1ebfn th\u1ee9c "'+subject+' l\u1edbp '+grade+'" v\u1ec1 "'+topic+'". Ghi c\u00e1c \u0111i\u1ec3m ch\u00ednh, c\u00f4ng th\u1ee9c, v\u00ed d\u1ee5.'}];
    var res = await callAI(msgs);
    return (res && res.length > 80) ? res.slice(0, 3000) : '';
  } catch(e){ console.log('AI knowledge:', e); return ''; }
}

// \u2550\u2550\u2550 NEW v2: doReaderWebSearch \u2014 Web search cho tab AI Reader \u2550\u2550\u2550
async function doReaderWebSearch(){
  var promptEl = document.getElementById('readerPrompt');
  // T\u1ea1o fake elements cho doWebSearch
  var fakeGrade = {value:''};
  var fakeSubject = {value:''};
  var result = await doWebSearch(promptEl, fakeGrade, fakeSubject, 'readerWebPreview');
  // L\u01b0u v\u00e0o reader source context
  ST.readerSourceContext = result || '';
  return result;
}
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// FETCH URLs + FILE HANDLING (gi\u1eef nguy\u00ean g\u1ed1c)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
async function fetchUrls(){
  var inputs=document.querySelectorAll('#urlList input[type="url"]');
  var urls=Array.from(inputs).map(function(i){return i.value.trim()}).filter(Boolean);
  if(!urls.length){toast('L\u1ed7i','Nh\u1eadp \u00edt nh\u1ea5t 1 URL','error');return;}
  var btn=document.getElementById('btnFetchUrls');
  btn.disabled=true;btn.textContent='\u23f3 \u0110ang t\u1ea3i...';
  var preview=document.getElementById('urlPreview'); preview.innerHTML=''; var allText='';
  for(var ui=0;ui<urls.length;ui++){
    var url=urls[ui];
    try{
      var r=await fetch('https://r.jina.ai/'+url,{headers:{'Accept':'text/plain'}});
      if(r.ok){var t=await r.text();allText+='\n\n=== '+url+' ===\n'+t.slice(0,2000);
        preview.innerHTML+='<div class="alert alert-success" style="margin-top:6px">\u2705 '+url.slice(0,60)+'... ('+t.length+' k\u00fd t\u1ef1)</div>'}
    }catch(e){preview.innerHTML+='<div class="alert alert-error" style="margin-top:6px">\u274c '+url.slice(0,60)+': '+e.message+'</div>'}
  }
  if(allText){ST.sourceContext=allText.slice(0,6000);
    document.getElementById('sourceContext').style.display='block';
    document.getElementById('sourceContextText').textContent=ST.sourceContext.slice(0,500)+'...';
    toast('\u0110\u00e3 t\u1ea3i URL','N\u1ed9i dung s\u1eb5n s\u00e0ng','success')}
  btn.disabled=false;btn.textContent='\ud83d\udce5 T\u1ea3i n\u1ed9i dung URL';
}

function handleFiles(e){
  var files=Array.from(e.target.files);
  var items=document.getElementById('fileItems');
  files.forEach(function(f){
    var reader=new FileReader();
    reader.onload=function(ev){
      var text=ev.target.result;
      if(typeof text!=='string'||text.indexOf('\x00')!==-1||text.indexOf('%PDF')!==-1){
        toast('C\u1ea3nh b\u00e1o',f.name+' kh\u00f4ng \u0111\u1ecdc \u0111\u01b0\u1ee3c. Ch\u1ec9 h\u1ed7 tr\u1ee3 TXT/MD/CSV.','warn');return}
      ST.sourceContext=(ST.sourceContext||'')+'\n\n=== '+f.name+' ===\n'+text.slice(0,3000);
      document.getElementById('sourceContext').style.display='block';
      document.getElementById('sourceContextText').textContent=(ST.sourceContext||'').slice(0,600)+'...';
      toast('\u0110\u00e3 \u0111\u1ecdc file',f.name,'success');
    };
    reader.readAsText(f,'UTF-8');
    var div=document.createElement('div');
    div.className='file-item';
    div.innerHTML='<span>\ud83d\udcc4 '+f.name+' <span class="text-muted">('+((f.size/1024).toFixed(1))+'KB)</span></span><button class="btn btn-icon btn-sm" onclick="this.parentElement.remove()">\u2715</button>';
    items.appendChild(div);
  });
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// BUILD PROMPT (FIX v2: H\u1ed7 tr\u1ee3 Open Mode + batch count)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2550\u2550\u2550 FIX: H\u00e0m toggleOpenMode \u2014 \u1ea8n/hi\u1ec7n c\u00e1c \u00f4 t\u01b0\u01a1ng \u1ee9ng khi b\u1eadt/t\u1eaft Ch\u1ebf \u0111\u1ed9 m\u1edf \u2550\u2550\u2550
function toggleOpenMode(){
  var isOpen   = isOn('tOpenMode');
  var stdBox   = document.getElementById('standardModeFields');
  var openBox  = document.getElementById('openModeFields');
  if(isOpen){
    if(stdBox)  stdBox.classList.add('hidden');
    if(openBox) openBox.classList.remove('hidden');
  } else {
    if(stdBox)  stdBox.classList.remove('hidden');
    if(openBox) openBox.classList.add('hidden');
  }
  // \u2550\u2550\u2550 Khi \u0111\u1ed5i ch\u1ebf \u0111\u1ed9, x\u00f3a prompt t\u00f9y ch\u1ec9nh \u0111\u00e3 l\u01b0u (v\u00ec context \u0111\u00e3 thay \u0111\u1ed5i) \u2550\u2550\u2550
  ST.customPrompt = '';
  SFX.click();
}

// \u2550\u2550\u2550 FIX v3: buildQuizPrompt \u2014 \u0110\u1ecdc \u0111\u00fang ID Open Mode (qOpen*), prompt n\u00e9n gi\u1ea3m token \u2550\u2550\u2550
function buildQuizPrompt(overrideCount){
  // N\u1ebfu user \u0111\u00e3 ch\u1ec9nh & l\u01b0u prompt t\u00f9y ch\u1ec9nh trong popup \u2192 d\u00f9ng lu\u00f4n
  if(ST.customQuizPrompt && ST.customQuizPrompt.trim()) return ST.customQuizPrompt;

  var isOpenMode = isOn('tOpenMode');
  var subject, grade, topic, count, difficultyLine;

  var hasEmoji   = isOn('tEmoji');
  var hasExplain = isOn('tExplain');
  var lang       = ST.lang==='vi' ? 'Ti\u1ebfng Vi\u1ec7t' : 'English';

  if(isOpenMode){
    // \u2550\u2550\u2550 FIX v3: \u0110\u1ecdc \u0110\u00daNG ID \u2014 qOpenSubject / qOpenCount / qOpenTopic / qOpenLevel \u2550\u2550\u2550
    subject = (document.getElementById('qOpenSubject').value||'').trim() || 'T\u1ed5ng h\u1ee3p';
    grade   = ''; // Ch\u1ebf \u0111\u1ed9 m\u1edf: b\u1ecf tr\u01b0\u1eddng l\u1edbp
    topic   = (document.getElementById('qOpenTopic').value||'').trim();
    count   = overrideCount || document.getElementById('qOpenCount').value;
    var lv  = document.getElementById('qOpenLevel').value;
    var lvMap = {beginner:'C\u01a1 b\u1ea3n',intermediate:'Trung b\u00ecnh',advanced:'N\u00e2ng cao',expert:'Chuy\u00ean gia'};
    difficultyLine = '- Tr\u00ecnh \u0111\u1ed9: ' + (lvMap[lv]||'Trung b\u00ecnh');
  } else {
    subject = document.getElementById('qSubject').value;
    grade   = document.getElementById('qGrade').value;
    topic   = document.getElementById('qTopic').value;
    count   = overrideCount || document.getElementById('qCount').value;
    difficultyLine = '- \u0110\u1ed9 kh\u00f3: t\u0103ng d\u1ea7n';
  }
  // Source context \u2014 pass-through gi\u1eef nguy\u00ean g\u1ed1c
  var contextBlock = '';
  if(ST.sourceType==='paste'){
    var pasteEl = document.getElementById('pasteContent');
    var paste = pasteEl ? pasteEl.value.trim() : '';
    if(paste) contextBlock = '\n\nNG\u1eee LI\u1ec6U THAM KH\u1ea2O:\n---\n' + paste.slice(0,3000) + '\n---\n';
  } else if(ST.sourceContext && ST.sourceType!=='ai'){
    contextBlock = '\n\nNG\u1eee LI\u1ec6U NGU\u1ed2N NGO\u00c0I:\n---\n' + ST.sourceContext.slice(0,3000) + '\n---\n';
  }

  // \u2550\u2550\u2550 FIX v3: Prompt N\u00c9N gi\u1ea3m ~40% token, gi\u1eef JSON schema r\u00f5 r\u00e0ng \u2550\u2550\u2550
  var lines = [];
  lines.push('B\u1ea1n l\u00e0 chuy\u00ean gia gi\u00e1o d\u1ee5c. T\u1ea1o CH\u00cdNH X\u00c1C '+count+' c\u00e2u tr\u1eafc nghi\u1ec7m b\u1eb1ng '+lang+'.');
  lines.push('- L\u0129nh v\u1ef1c: '+subject);
  if(grade) lines.push('- L\u1edbp: '+grade);
  lines.push('- Ch\u1ee7 \u0111\u1ec1/Y\u00eau c\u1ea7u: '+topic);
  lines.push(difficultyLine);
  lines.push(hasEmoji ? '- M\u1ed7i c\u00e2u c\u00f3 1 emoji ph\u00f9 h\u1ee3p \u1edf field "icon"' : '- icon: "\u2753"');
  lines.push(hasExplain ? '- "explanation" ng\u1eafn g\u1ecdn \u226430 t\u1eeb, d\u1ec5 hi\u1ec3u' : '- "explanation": ""');
  lines.push('- M\u1ed7i c\u00e2u \u0110\u00daNG 4 \u0111\u00e1p \u00e1n, "correct" l\u00e0 index 0-3, kh\u00f4ng tr\u00f9ng l\u1eb7p.');
  lines.push(contextBlock);
  lines.push('CH\u1ec8 tr\u1ea3 JSON thu\u1ea7n (kh\u00f4ng markdown, kh\u00f4ng text ngo\u00e0i JSON):');
  lines.push('{"title":"...","questions":[{"id":1,"icon":"\u2753","question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]}');

  return lines.join('\n');
}


// \u2550\u2550\u2550 FIX v3: buildFlashPrompt \u2014 n\u00e9n prompt + h\u1ed7 tr\u1ee3 custom prompt \u2550\u2550\u2550
function buildFlashPrompt(overrideCount){
  if(ST.customFlashPrompt && ST.customFlashPrompt.trim()) return ST.customFlashPrompt;

  var subject = document.getElementById('fcSubject').value;
  var grade   = document.getElementById('fcGrade').value;
  var topic   = document.getElementById('fcTopic').value;
  var count   = overrideCount || document.getElementById('fcCount').value;
  var lang    = ST.lang==='vi' ? 'Ti\u1ebfng Vi\u1ec7t' : 'English';

  var contextBlock = '';
  if(ST.sourceContext){
    contextBlock = '\n\nNG\u1eee LI\u1ec6U:\n---\n' + ST.sourceContext.slice(0,3000) + '\n---\n';
  }

  var lines = [];
  lines.push('T\u1ea1o CH\u00cdNH X\u00c1C '+count+' flashcard b\u1eb1ng '+lang+'.');
  lines.push('- M\u00f4n: '+subject+' \u00b7 L\u1edbp: '+grade);
  lines.push('- Ch\u1ee7 \u0111\u1ec1: '+topic);
  lines.push('- "front" ng\u1eafn g\u1ecdn (t\u1eeb/kh\u00e1i ni\u1ec7m), "back" \u0111\u1ecbnh ngh\u0129a \u226440 t\u1eeb.');
  lines.push('- "icon" l\u00e0 1 emoji ph\u00f9 h\u1ee3p.');
  lines.push('- "frontSub"/"backSub"/"hint" c\u00f3 th\u1ec3 b\u1ecf tr\u1ed1ng.');
  lines.push(contextBlock);
  lines.push('CH\u1ec8 tr\u1ea3 JSON thu\u1ea7n:');
  lines.push('{"title":"...","cards":[{"id":1,"icon":"\ud83d\udcdd","front":"...","frontSub":"","back":"...","backSub":"","hint":""}]}');

  return lines.join('\n');
}

function previewPrompt(){document.getElementById('promptPreviewText').textContent=buildQuizPrompt();openModal('promptModal')}
function copyPrompt(){navigator.clipboard.writeText(document.getElementById('promptPreviewText').textContent).then(function(){toast('\u0110\u00e3 copy','Prompt \u0111\u00e3 sao ch\u00e9p','success')})}

// \u2550\u2550\u2550 FIX v3: Open Mode toggle + Prompt customization \u2550\u2550\u2550
function toggleOpenMode(){
  var openFields = document.getElementById('openModeFields');
  var stdFields  = document.getElementById('standardModeFields');
  if(!openFields || !stdFields) return;
  var isOn_ = isOn('tOpenMode');
  if(isOn_){
    openFields.classList.remove('hidden');
    stdFields.classList.add('hidden');
  } else {
    openFields.classList.add('hidden');
    stdFields.classList.remove('hidden');
  }
  // Reset prompt t\u00f9y ch\u1ec9nh khi \u0111\u1ed5i mode
  ST.customQuizPrompt = '';
  SFX.click();
}

function previewPrompt(){
  var topicQ  = (document.getElementById('qTopic').value||'').trim();
  var topicO  = (document.getElementById('qOpenTopic').value||'').trim();
  if(!topicQ && !topicO){
    toast('Thi\u1ebfu ch\u1ee7 \u0111\u1ec1','Nh\u1eadp ch\u1ee7 \u0111\u1ec1 tr\u01b0\u1edbc khi xem prompt','warn');
    return;
  }
  var p = ST.customQuizPrompt && ST.customQuizPrompt.trim() ? ST.customQuizPrompt : buildQuizPrompt();
  document.getElementById('promptPreviewText').value = p;
  openModal('promptModal');
}

function copyPrompt(){
  var t = document.getElementById('promptPreviewText').value || '';
  if(!t){ toast('Tr\u1ed1ng','Kh\u00f4ng c\u00f3 prompt \u0111\u1ec3 copy','warn'); return; }
  navigator.clipboard.writeText(t).then(function(){
    toast('\ud83d\udccb \u0110\u00e3 copy','Prompt \u0111\u00e3 sao ch\u00e9p','success'); SFX.save();
  }).catch(function(){
    var ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    toast('\ud83d\udccb \u0110\u00e3 copy','','success');
  });
}

function saveCustomPrompt(){
  var t = (document.getElementById('promptPreviewText').value||'').trim();
  if(!t){ toast('Tr\u1ed1ng','Prompt kh\u00f4ng th\u1ec3 r\u1ed7ng','warn'); return; }
  ST.customQuizPrompt = t;
  saveAll();
  toast('\ud83d\udcbe \u0110\u00e3 l\u01b0u','Prompt t\u00f9y ch\u1ec9nh s\u1ebd \u0111\u01b0\u1ee3c d\u00f9ng cho l\u1ea7n t\u1ea1o b\u00e0i t\u1edbi','success');
  closeModal('promptModal'); SFX.save();
}

function resetCustomPrompt(){
  ST.customQuizPrompt = '';
  saveAll();
  document.getElementById('promptPreviewText').value = buildQuizPrompt();
  toast('\ud83d\udd04 \u0110\u00e3 kh\u00f4i ph\u1ee5c','Prompt tr\u1edf v\u1ec1 m\u1eb7c \u0111\u1ecbnh','info');
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// QUIZ ENGINE (FIX v2: Batch support cho >15 c\u00e2u)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
var QUIZ_BATCH_THRESHOLD = 15; // \u2550\u2550\u2550 NEW v2: Ng\u01b0\u1ee1ng chia batch \u2550\u2550\u2550

async function startQuiz(){
  SFX.start();

  // \u2550\u2550\u2550 FIX: H\u1ed7 tr\u1ee3 c\u1ea3 Ch\u1ebf \u0111\u1ed9 th\u01b0\u1eddng V\u00c0 Ch\u1ebf \u0111\u1ed9 m\u1edf \u2550\u2550\u2550
  var isOpen = isOn('tOpenMode');
  var topic = '';
  if(isOpen){
    // Ch\u1ebf \u0111\u1ed9 m\u1edf: ch\u1ee7 \u0111\u1ec1 l\u1ea5y t\u1eeb \u00f4 "M\u00f4 t\u1ea3 chi ti\u1ebft y\u00eau c\u1ea7u" (qOpenTopic)
    var openTopicEl = document.getElementById('qOpenTopic');
    topic = openTopicEl ? openTopicEl.value.trim() : '';
    if(!topic){
      toast('Thi\u1ebfu m\u00f4 t\u1ea3 y\u00eau c\u1ea7u','H\u00e3y nh\u1eadp "M\u00f4 t\u1ea3 chi ti\u1ebft y\u00eau c\u1ea7u" tr\u01b0\u1edbc khi t\u1ea1o b\u00e0i','warn');
      return;
    }
  } else {
    // Ch\u1ebf \u0111\u1ed9 th\u01b0\u1eddng: l\u1ea5y t\u1eeb \u00f4 qTopic
    topic = document.getElementById('qTopic').value.trim();
    if(!topic){
      toast('Thi\u1ebfu ch\u1ee7 \u0111\u1ec1','Nh\u1eadp ch\u1ee7 \u0111\u1ec1 \u00f4n t\u1eadp','warn');
      return;
    }
  }

  if(!ST.apiKeys.filter(function(k){return k.key.trim()}).length){
    toast('Ch\u01b0a c\u00f3 API key','V\u00e0o C\u00e0i \u0111\u1eb7t th\u00eam','error');
    openSettings();
    return;
  }

  var totalCount = parseInt(document.getElementById('qCount').value) || 10;
  // \u2550\u2550\u2550 FIX: Open Mode d\u00f9ng ID qOpenCount (\u0111\u00fang v\u1edbi HTML) \u2550\u2550\u2550
  if(isOpen){
    var openCountEl = document.getElementById('qOpenCount');
    if(openCountEl && openCountEl.value) totalCount = parseInt(openCountEl.value) || totalCount;
  }

  var area=document.getElementById('quizLoadingArea');
  var useBatch = totalCount > QUIZ_BATCH_THRESHOLD;
  var batchInfo = useBatch ? ' (chia '+Math.ceil(totalCount/QUIZ_BATCH_THRESHOLD)+' batch)' : '';

  area.innerHTML='<div class="card"><div class="spin-wrap"><div class="spinner"></div><div class="spin-text">AI \u0111ang t\u1ea1o '+ totalCount +' c\u00e2u h\u1ecfi'+batchInfo+'<span class="spin-dots"></span></div><div class="text-muted" style="font-size:.8rem;margin-top:8px">Provider: '+PROVIDERS[ST.provider].name+' \u00b7 '+ST.model+'</div>'
    + (useBatch ? '<div class="batch-progress" id="quizBatchProgress" style="margin-top:12px"><div class="progress-bar"><div class="progress-fill" id="quizBatchFill" style="width:0%"></div></div><div class="text-muted" style="font-size:.78rem;margin-top:4px" id="quizBatchText">Chu\u1ea9n b\u1ecb batch 1...</div></div>' : '')
    + '</div></div>';
  document.getElementById('btnStartQuiz').disabled=true;

  try{
    var sysMsg={role:'system',content:'B\u1ea1n l\u00e0 h\u1ec7 th\u1ed1ng t\u1ea1o c\u00e2u h\u1ecfi gi\u00e1o d\u1ee5c. LU\u00d4N tr\u1ea3 v\u1ec1 JSON h\u1ee3p l\u1ec7, KH\u00d4NG d\u00f9ng markdown code block, KH\u00d4NG th\u00eam text ngo\u00e0i JSON. M\u1ed7i c\u00e2u c\u00f3 \u0110\u00daNG 4 \u0111\u00e1p \u00e1n. "correct" l\u00e0 INDEX (0-3).'};
    var quizData = null;

    if(useBatch){
      // \u2550\u2550\u2550 NEW v2: BATCH MODE \u2014 Chia nh\u1ecf request \u2550\u2550\u2550
      var chunks = Math.ceil(totalCount / QUIZ_BATCH_THRESHOLD);
      var allQuestions = [];

      for(var batchIdx=0; batchIdx < chunks; batchIdx++){
        var batchCount = Math.min(QUIZ_BATCH_THRESHOLD, totalCount - batchIdx*QUIZ_BATCH_THRESHOLD);
        var batchNum   = batchIdx + 1;

        // C\u1eadp nh\u1eadt progress
        var fillEl = document.getElementById('quizBatchFill');
        var textEl = document.getElementById('quizBatchText');
        if(fillEl) fillEl.style.width = Math.round(batchNum/chunks*100) + '%';
        if(textEl) textEl.textContent = '\ud83d\udce6 Batch ' + batchNum + '/' + chunks + ' \u2014 \u0111ang t\u1ea1o ' + batchCount + ' c\u00e2u...';

        var batchPrompt = buildQuizPrompt(batchCount);
        if(chunks > 1){
          batchPrompt += '\n\n[BATCH ' + batchNum + '/' + chunks + ': T\u1ea1o c\u00e2u ID t\u1eeb ' + (batchIdx*QUIZ_BATCH_THRESHOLD+1) + ' \u0111\u1ebfn ' + (batchIdx*QUIZ_BATCH_THRESHOLD+batchCount) + '. KH\u00d4NG tr\u00f9ng v\u1edbi batch tr\u01b0\u1edbc.]';
        }

        var batchData = null;
        for(var attempt=0; attempt<2; attempt++){
          try{
            var promptText = batchPrompt + (attempt>0?'\n\nQUAN TR\u1eccNG: CH\u1ec8 tr\u1ea3 JSON thu\u1ea7n.':'');
            var raw = await callAI([sysMsg, {role:'user', content:promptText}]);
            batchData = validateQuizData(JSON.parse(extractJSON(raw)));
            break;
          }catch(parseErr){
            if(attempt===0) toast('\u23f3 Batch '+batchNum+' th\u1eed l\u1ea1i...','','warn',1500);
          }
        }
        if(batchData && batchData.questions){
          allQuestions = allQuestions.concat(batchData.questions);
        } else {
          toast('\u26a0\ufe0f Batch '+batchNum+' th\u1ea5t b\u1ea1i','Ti\u1ebfp t\u1ee5c...','warn');
        }

        // Delay gi\u1eefa batches
        if(batchIdx < chunks-1){
          await new Promise(function(res){setTimeout(res,1500)});
        }
      }

      if(!allQuestions.length) throw new Error('Kh\u00f4ng t\u1ea1o \u0111\u01b0\u1ee3c c\u00e2u h\u1ecfi n\u00e0o t\u1eeb t\u1ea5t c\u1ea3 batches.');
      // Re-index
      allQuestions.forEach(function(q,idx){q.id=idx+1});
      quizData = {
        title: (allQuestions[0] && allQuestions[0].title) || document.getElementById('qSubject').value + ' L\u1edbp ' + document.getElementById('qGrade').value,
        questions: allQuestions
      };
      toast('\u2705 \u0110\u00e3 t\u1ea1o '+allQuestions.length+'/'+totalCount+' c\u00e2u','','success');

    } else {
      // \u2550\u2550\u2550 SINGLE MODE \u2014 Logic g\u1ed1c \u2550\u2550\u2550
      var lastParseErr=null;
      for(var attempt=0;attempt<2;attempt++){
        try{
          var promptText=buildQuizPrompt()+(attempt>0?'\n\nQUAN TR\u1eccNG: CH\u1ec8 tr\u1ea3 JSON thu\u1ea7n, TUY\u1ec6T \u0110\u1ed0I KH\u00d4NG c\u00f3 text kh\u00e1c ngo\u00e0i JSON.':'');
          var raw=await callAI([sysMsg,{role:'user',content:promptText}]);
          quizData=validateQuizData(JSON.parse(extractJSON(raw)));
          break;
        }catch(parseErr){
          lastParseErr=parseErr;
          if(attempt===0)toast('\u23f3 AI tr\u1ea3 sai format, th\u1eed l\u1ea1i...','','warn',2000);
        }
      }
      if(!quizData)throw lastParseErr;
    }

    var qs=quizData.questions;
    if(isOn('tRandom'))qs=shuffle(qs);
    if(isOn('tShuffleOpts'))qs=qs.map(function(q){
      var arr=[].concat(q.options);var ct=arr[q.correct];var sh=shuffle(arr);q.options=sh;q.correct=sh.indexOf(ct);return q;
    });
    var timerVal=document.getElementById('qTimer').value;
    var timerMins=timerVal==='custom'?parseInt(document.getElementById('qTimerCustom').value)||10:parseInt(timerVal)||0;
    ST.quiz={title:quizData.title||document.getElementById('qSubject').value+' L\u1edbp '+document.getElementById('qGrade').value,
      subject:document.getElementById('qSubject').value,grade:document.getElementById('qGrade').value,
      questions:qs,current:0,answers:[],startTime:Date.now(),
      answerMode:document.getElementById('qAnswerMode').value,
      timerMins:timerMins,timerLeft:timerMins*60};
    area.innerHTML='';document.getElementById('btnStartQuiz').disabled=false;
    document.getElementById('quizConfig').classList.add('hidden');
    document.getElementById('quizPlay').classList.remove('hidden');
    document.getElementById('quizResult').classList.add('hidden');
    document.getElementById('qMeta').textContent=ST.quiz.subject+' \u00b7 L\u1edbp '+ST.quiz.grade;
    startTimer();renderQuestion();
  }catch(e){
    var hint='Ki\u1ec3m tra API key v\u00e0 k\u1ebft n\u1ed1i m\u1ea1ng';
    if(String(e.message).indexOf('Failed to fetch')!==-1)hint='L\u1ed7i k\u1ebft n\u1ed1i. Th\u1eed \u0111\u1ed5i provider (OpenRouter h\u1ed7 tr\u1ee3 t\u1ed1t).';
    else if(String(e.message).indexOf('401')!==-1||String(e.message).indexOf('403')!==-1)hint='API key kh\u00f4ng h\u1ee3p l\u1ec7. Ki\u1ec3m tra l\u1ea1i trong C\u00e0i \u0111\u1eb7t.';
    else if(String(e.message).indexOf('429')!==-1)hint='API h\u1ebft l\u01b0\u1ee3t d\u00f9ng. \u0110\u1ee3i 1-2 ph\u00fat ho\u1eb7c th\u00eam key kh\u00e1c.';
    area.innerHTML='<div class="alert alert-error">\u274c '+e.message+'<br><small>'+hint+'</small></div>';
    document.getElementById('btnStartQuiz').disabled=false;
    toast('L\u1ed7i t\u1ea1o b\u00e0i',hint,'error');
  }
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// QUIZ RENDER + INTERACTION (gi\u1eef nguy\u00ean 100% g\u1ed1c)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function renderQuestion(){
  var q=ST.quiz;if(!q)return;
  var idx=q.current,total=q.questions.length,pct=Math.round(idx/total*100);
  document.getElementById('qProgressLabel').textContent='C\u00e2u '+(idx+1)+' / '+total;
  document.getElementById('qProgressFill').style.width=pct+'%';
  var item=q.questions[idx],letters=['A','B','C','D'];
  document.getElementById('questionArea').innerHTML=
    '<div class="q-card">'
    +'<div class="q-num">C\u00e2u '+(idx+1)+' / '+total+'</div>'
    +(item.icon?'<span class="q-emoji">'+item.icon+'</span>':'')
    +'<p class="q-text">'+item.question+'</p>'
    +'<div class="q-options" id="optList">'
    +item.options.map(function(opt,i){return '<div class="q-opt" data-i="'+i+'" onclick="pickOption(this,'+i+')"><span class="opt-letter">'+letters[i]+'</span><span>'+opt+'</span></div>'}).join('')
    +'</div>'
    +'<div id="explainBox"></div>'
    +'</div>'
    +'<div class="q-actions">'
    +'<button class="btn btn-primary hidden" id="btnNext" onclick="nextQuestion()">'
    +(idx===total-1?'\u2705 Ho\u00e0n th\u00e0nh':'C\u00e2u ti\u1ebfp theo \u2192')+'</button>'
    +'</div>';
}

function pickOption(el,idx){
  if(el.classList.contains('disabled'))return;SFX.click();
  var q=ST.quiz,item=q.questions[q.current],mode=q.answerMode;
  q.answers[q.current]=idx;
  document.querySelectorAll('.q-opt').forEach(function(o){o.classList.remove('picked')});
  el.classList.add('picked');
  if(mode==='each'){
    document.querySelectorAll('.q-opt').forEach(function(o,i){
      o.classList.add('disabled');
      if(i===item.correct)o.classList.add('correct');
      if(i===idx&&idx!==item.correct)o.classList.add('wrong');
    });
    if(idx===item.correct)SFX.correct();else SFX.wrong();
    if(item.explanation)document.getElementById('explainBox').innerHTML='<div class="q-explain"><strong>\ud83d\udca1 Gi\u1ea3i th\u00edch:</strong> '+item.explanation+'</div>';
  }
  document.getElementById('btnNext').classList.remove('hidden');
}

function nextQuestion(){
  SFX.click();var q=ST.quiz;
  if(q.answers[q.current]===undefined)q.answers[q.current]=-1;
  if(q.current<q.questions.length-1){q.current++;renderQuestion()}else finishQuiz();
}

function endQuizEarly(){if(confirm('K\u1ebft th\u00fac b\u00e0i s\u1edbm?'))finishQuiz()}

function finishQuiz(){
  stopTimer();SFX.complete();
  var q=ST.quiz,total=q.questions.length;
  var correct=q.questions.filter(function(item,i){return q.answers[i]===item.correct}).length;
  var pct=Math.round(correct/total*100);
  var elapsed=Math.round((Date.now()-q.startTime)/1000);
  var grade=pct>=90?'\ud83c\udf1f Xu\u1ea5t s\u1eafc':pct>=80?'\ud83c\udfc6 Gi\u1ecfi':pct>=65?'\ud83d\udc4d Kh\u00e1':pct>=50?'\ud83d\udcd6 Trung b\u00ecnh':'\ud83d\udcaa C\u1ea7n c\u1ed1 g\u1eafng';
  var stars=pct>=90?'\u2b50\u2b50\u2b50':pct>=70?'\u2b50\u2b50':'\u2b50';
  ST.stats.totalQ+=total;ST.stats.correctQ+=correct;ST.stats.sessions++;
  ST.stats.history.unshift({date:new Date().toLocaleDateString('vi'),title:q.title,subject:q.subject,grade:q.grade,correct:correct,total:total,pct:pct,elapsed:elapsed});
  if(ST.stats.history.length>20)ST.stats.history=ST.stats.history.slice(0,20);
  saveAll();
  var letters=['A','B','C','D'];
  var reviewHtml=q.questions.map(function(item,i){
    var userAns=q.answers[i],isOk=userAns===item.correct;
    return '<div class="q-card" style="margin-bottom:12px">'
      +'<div class="q-num">'+(isOk?'\u2705':'\u274c')+' C\u00e2u '+(i+1)+'</div>'
      +(item.icon?'<span style="font-size:1.5rem">'+item.icon+'</span> ':'')
      +'<p class="q-text" style="font-size:.95rem">'+item.question+'</p>'
      +'<div style="margin-top:10px;font-size:.88rem">'
      +item.options.map(function(opt,oi){
        var cls='';
        if(oi===item.correct)cls='color:var(--c1);font-weight:700';
        else if(oi===userAns&&!isOk)cls='color:var(--c4);text-decoration:line-through';
        return '<div style="'+cls+';padding:4px 0">'+letters[oi]+'. '+opt+' '+(oi===item.correct?'\u2713':(oi===userAns&&!isOk?'\u2717':''))+'</div>';
      }).join('')
      +'</div>'
      +(item.explanation?'<div class="q-explain">\ud83d\udca1 '+item.explanation+'</div>':'')
      +'</div>';
  }).join('');
  document.getElementById('quizPlay').classList.add('hidden');
  var result=document.getElementById('quizResult');result.classList.remove('hidden');
  result.innerHTML=
    '<div class="result-hero"><div class="result-stars">'+stars+'</div><div class="result-score">'+pct+'%</div><div class="result-grade">'+grade+'</div>'
    +'<div class="result-stats"><div class="rstat"><div class="rstat-n" style="color:var(--c1)">'+correct+'</div><div class="rstat-l">C\u00e2u \u0111\u00fang</div></div>'
    +'<div class="rstat"><div class="rstat-n" style="color:var(--c4)">'+(total-correct)+'</div><div class="rstat-l">C\u00e2u sai</div></div>'
    +'<div class="rstat"><div class="rstat-n" style="color:var(--c2)">'+Math.floor(elapsed/60)+':'+(elapsed%60).toString().padStart(2,'0')+'</div><div class="rstat-l">Th\u1eddi gian</div></div></div></div>'
    +'<div class="export-bar" style="margin-bottom:20px"><span style="font-size:.85rem;font-weight:600;color:var(--text2)">\ud83d\udce4 Xu\u1ea5t k\u1ebft qu\u1ea3:</span>'
    +'<button class="btn btn-primary btn-sm" onclick="exportQuizPro(\'pdf\')" title="Xu\u1ea5t PDF c\u00f3 trang b\u00eca">\ud83d\udcd5 PDF \u0111\u1eb9p</button>'
    +'<button class="btn btn-primary btn-sm" onclick="exportQuizPro(\'word\')" title="Xu\u1ea5t Word c\u00f3 trang b\u00eca">\ud83d\udcd8 Word \u0111\u1eb9p</button>'
    +'<button class="btn btn-secondary btn-sm" onclick="exportQuizPro(\'html\')" title="Xu\u1ea5t HTML \u0111\u1eb9p">\ud83c\udf10 HTML \u0111\u1eb9p</button>'
    +'<button class="btn btn-secondary btn-sm" onclick="exportQuiz(\'md\')">\ud83d\udcc4 Markdown</button>'
    +'<button class="btn btn-secondary btn-sm" onclick="exportQuiz(\'html\')">\ud83c\udf10 HTML</button>'
    +'<button class="btn btn-secondary btn-sm" onclick="exportQuiz(\'pdf\')">\ud83d\udda8\ufe0f In/PDF</button></div>'
    +'<div id="quizChartArea"></div>'
    +'<div class="sec-title">\ud83d\udccb Chi ti\u1ebft t\u1eebng c\u00e2u</div>'
    +reviewHtml
    +'<div style="text-align:center;margin-top:20px">'
    +'<button class="btn btn-secondary" onclick="retryQuiz()">\ud83d\udd01 L\u00e0m l\u1ea1i b\u00e0i n\u00e0y</button> '
    +'<button class="btn btn-primary" onclick="backToQuizConfig()">\ud83d\udcdd L\u00e0m b\u00e0i m\u1edbi</button></div>';
  // TH\u00caM M\u1edaI: v\u1ebd b\u1ea3ng t\u1ed5ng k\u1ebft nhi\u1ec1u c\u1ed9t + bi\u1ec3u \u0111\u1ed3 \u0111\u00fang/sai
  renderQuizSummaryChart(q, correct, total, pct);
}

// TH\u00caM M\u1edaI: B\u1ea3ng t\u1ed5ng k\u1ebft + bi\u1ec3u \u0111\u1ed3 t\u1ec9 l\u1ec7 \u0111\u00fang/sai tr\u1ef1c quan
function renderQuizSummaryChart(q, correct, total, pct){
  var wrong = total - correct;
  var area = document.getElementById('quizChartArea');
  if(!area) return;
  var letters=['A','B','C','D'];
  // B\u1ea3ng nhi\u1ec1u c\u1ed9t
  var rows = q.questions.map(function(item,i){
    var ua = q.answers[i];
    var ok = ua===item.correct;
    var uaTxt = (ua===undefined||ua===-1) ? '\u2014' : letters[ua];
    return '<tr>'
      +'<td style="text-align:center;font-weight:700">'+(i+1)+'</td>'
      +'<td>'+(item.icon?item.icon+' ':'')+String(item.question).slice(0,60)+(String(item.question).length>60?'\u2026':'')+'</td>'
      +'<td style="text-align:center;font-weight:700;color:'+(ok?'var(--c1)':'var(--c4)')+'">'+uaTxt+'</td>'
      +'<td style="text-align:center;font-weight:700;color:var(--c1)">'+letters[item.correct]+'</td>'
      +'<td style="text-align:center">'+(ok?'<span class="badge badge-green">\u0110\u00fang</span>':'<span class="badge badge-red">Sai</span>')+'</td>'
      +'</tr>';
  }).join('');
  // Bi\u1ec3u \u0111\u1ed3 donut b\u1eb1ng conic-gradient (kh\u00f4ng c\u1ea7n th\u01b0 vi\u1ec7n)
  var deg = Math.round(pct*3.6);
  var donut = '<div style="width:150px;height:150px;border-radius:50%;background:conic-gradient(var(--c1) 0deg '+deg+'deg, var(--c4) '+deg+'deg 360deg);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
    +'<div style="width:100px;height:100px;border-radius:50%;background:var(--bg2);display:flex;flex-direction:column;align-items:center;justify-content:center">'
    +'<div style="font-size:1.5rem;font-weight:900;color:var(--c1)">'+pct+'%</div>'
    +'<div style="font-size:.7rem;color:var(--text2)">Ch\u00ednh x\u00e1c</div></div></div>';
  // Bar chart \u0111\u01a1n gi\u1ea3n
  var bars = '<div style="flex:1;min-width:180px">'
    +'<div style="margin-bottom:12px"><div style="font-size:.82rem;margin-bottom:4px"><span style="color:var(--c1);font-weight:700">\u2705 \u0110\u00fang: '+correct+'</span></div>'
    +'<div style="height:14px;background:var(--bg4);border-radius:7px;overflow:hidden"><div style="height:100%;width:'+Math.round(correct/total*100)+'%;background:linear-gradient(90deg,var(--c1),#2ecc71);border-radius:7px"></div></div></div>'
    +'<div><div style="font-size:.82rem;margin-bottom:4px"><span style="color:var(--c4);font-weight:700">\u274c Sai: '+wrong+'</span></div>'
    +'<div style="height:14px;background:var(--bg4);border-radius:7px;overflow:hidden"><div style="height:100%;width:'+Math.round(wrong/total*100)+'%;background:linear-gradient(90deg,#c0392b,var(--c4));border-radius:7px"></div></div></div></div>';
  area.innerHTML =
    '<div class="sec-title">\ud83d\udcca T\u1ed5ng k\u1ebft tr\u1ef1c quan</div>'
    +'<div class="card" style="margin-bottom:16px"><div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;justify-content:center">'+donut+bars+'</div></div>'
    +'<div class="sec-title">\ud83d\udcd1 B\u1ea3ng t\u1ed5ng k\u1ebft chi ti\u1ebft</div>'
    +'<div style="overflow-x:auto;margin-bottom:20px"><table class="pro-table">'
    +'<thead><tr><th style="text-align:center">C\u00e2u</th><th>N\u1ed9i dung</th><th style="text-align:center">B\u1ea1n ch\u1ecdn</th><th style="text-align:center">\u0110\u00e1p \u00e1n</th><th style="text-align:center">K\u1ebft qu\u1ea3</th></tr></thead>'
    +'<tbody>'+rows+'</tbody></table></div>';
}

// \u2550\u2550\u2550 FIX v2: retryQuiz \u2014 X\u00f3a duplicate, g\u1ed9p shuffle opts \u2550\u2550\u2550