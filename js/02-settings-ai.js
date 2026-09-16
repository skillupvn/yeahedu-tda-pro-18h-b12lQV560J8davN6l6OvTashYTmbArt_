// ================================================================
// YeahEdu-TDA v11 "PhoenixEdu" - Module: 02-settings-ai.js
// Auto-split from monolithic v10, ASCII-only, Live-Server safe
// ================================================================

// PH\u1ea6N 4/6 \u2014 JS: SETTINGS + API KEY + callAI ENGINE
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// SETTINGS
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
function onProviderChange(){ renderModelSelect(document.getElementById('setProvider').value) }

function renderModelSelect(prov){
  const sel=document.getElementById('setModel'); sel.innerHTML='';
  (PROVIDERS[prov]||PROVIDERS.gemini).models.forEach(m=>{
    const o=document.createElement('option');
    o.value=m.id; o.textContent=m.name+(m.tag?` [${m.tag}]`:'');
    if(m.id===ST.model)o.selected=true; sel.appendChild(o);
  });
}

function renderApiKeyList(){
  const list=document.getElementById('apikeyList'); list.innerHTML='';
  if(!ST.apiKeys.length){list.innerHTML='<div class="alert alert-warn">\u26a0\ufe0f Ch\u01b0a c\u00f3 API key n\u00e0o. H\u00e3y th\u00eam \u0111\u1ec3 b\u1eaft \u0111\u1ea7u d\u00f9ng AI.</div>';return;}
  ST.apiKeys.forEach((k,i)=>{
    const div=document.createElement('div');
    div.className='apikey-item'+(i===ST.currentKeyIdx?' active-key':'');
    // \u2550\u2550\u2550 FIX v2: Th\u00eam hi\u1ec3n th\u1ecb cooldown status + quota chi ti\u1ebft \u2550\u2550\u2550
    const coolUntil = _keyCooldown[k.key] || 0;
    const isCooling = Date.now() < coolUntil;
    const coolBadge = isCooling
      ? `<span class="badge badge-red" style="margin-left:6px">\u23f3 ${Math.ceil((coolUntil-Date.now())/1000)}s</span>`
      : '';
    const statusTitle = k.status==='ok'?'OK':k.status==='fail'?'L\u1ed7i':k.status==='dead'?'Key h\u1ebft h\u1ea1n':k.status==='ratelimit'?'Rate limited':'Ch\u01b0a test';
    div.innerHTML=`
      <select class="apikey-provider" onchange="ST.apiKeys[${i}].provider=this.value;saveAll()">
        ${Object.keys(PROVIDERS).map(p=>`<option value="${p}"${p===k.provider?' selected':''}>${PROVIDERS[p].emoji} ${PROVIDERS[p].name}</option>`).join('')}
      </select>
      <div class="apikey-input-wrap" style="flex:1">
        <input type="password" class="apikey-field" id="apikey_field_${i}" value="${k.key}" placeholder="Nh\u1eadp API key..."
          onchange="ST.apiKeys[${i}].key=this.value;ST.apiKeys[${i}].status='idle';saveAll()">
        <button class="apikey-eye" onclick="togglePwd('apikey_field_${i}',this)">\ud83d\udc41\ufe0f</button>
      </div>
      <div class="fgroup" style="width:140px;min-width:80px">
        <input type="text" style="background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:8px;color:var(--text);font-size:.8rem;width:100%"
          value="${k.label||''}" placeholder="Ghi ch\u00fa" onchange="ST.apiKeys[${i}].label=this.value;saveAll()">
      </div>
      <div class="apikey-status ${k.status||'idle'}" title="${statusTitle}"></div>
      ${coolBadge}
      <span class="apikey-quota">${k.quota||''}</span>
      <button class="btn btn-icon btn-sm" onclick="testKey(${i})" title="Test key">\ud83d\udd0c</button>
      <button class="btn btn-icon btn-sm" style="color:var(--c4)" onclick="removeApiKey(${i})" title="X\u00f3a key">\ud83d\uddd1\ufe0f</button>`;
    list.appendChild(div);
  });
}

function addApiKey(){
  ST.apiKeys.push({provider:document.getElementById('setProvider').value,key:'',status:'idle',label:'',quota:'',lastUsed:0,reqCount:0});
  renderApiKeyList(); saveAll(); SFX.click();
}

function removeApiKey(i){
  // \u2550\u2550\u2550 FIX v2: Clear cooldown khi x\u00f3a key \u2550\u2550\u2550
  if(ST.apiKeys[i]) delete _keyCooldown[ST.apiKeys[i].key];
  ST.apiKeys.splice(i,1);
  if(ST.currentKeyIdx>=ST.apiKeys.length)ST.currentKeyIdx=0;
  renderApiKeyList(); saveAll(); SFX.click();
}
// \u2550\u2550\u2550 FIX v2: testKey \u2014 C\u1ea3i ti\u1ebfn timeout, th\u00eam chi ti\u1ebft quota \u2550\u2550\u2550
async function testKey(i){
  const k=ST.apiKeys[i];
  if(!k||!k.key.trim()){toast('L\u1ed7i','Ch\u01b0a nh\u1eadp API key!','error');return;}
  toast('\u0110ang test...','Vui l\u00f2ng ch\u1edd','info',2000);
  try{
    const prov=PROVIDERS[k.provider];
    let ok=false;
    if(k.provider==='gemini'){
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${k.key}`);
      ok=r.ok;
      if(r.ok){
        try{
          const d=await r.json();
          const gemModels=(d.models||[]).filter(m=>m.name.includes('gemini'));
          const cnt=gemModels.length;
          // \u2550\u2550\u2550 NEW v2: Hi\u1ec3n th\u1ecb chi ti\u1ebft h\u01a1n \u2550\u2550\u2550
          const hasFlash=gemModels.some(m=>m.name.includes('flash'));
          const hasPro=gemModels.some(m=>m.name.includes('pro'));
          ST.apiKeys[i].quota=`${cnt} models${hasPro?' (c\u00f3 Pro)':''}${hasFlash?' (c\u00f3 Flash)':''}`;
        }catch(e){}
      } else if(r.status===400||r.status===403){
        ST.apiKeys[i].quota='\u274c Key kh\u00f4ng h\u1ee3p l\u1ec7';
      }
        }else if(k.provider==='groq'){
      // \u2550\u2550\u2550 FIX v3: Groq \u2014 d\u00f9ng /models endpoint (ch\u1ec9 c\u1ea7n GET, kh\u00f4ng t\u1ed1n token) \u2550\u2550\u2550
      const ctrl=new AbortController();
      const timeout=setTimeout(()=>ctrl.abort(),12000);
      try{
        const r=await fetch('https://api.groq.com/openai/v1/models',{
          headers:{'Authorization':'Bearer '+k.key},
          signal:ctrl.signal
        });
        clearTimeout(timeout);
        if(r.ok){
          const d=await r.json();
          const cnt=(d.data||[]).filter(m=>m.active!==false).length;
          ok=true;
          ST.apiKeys[i].quota='\u2705 '+cnt+' models';
        } else if(r.status===401){
          ok=false; ST.apiKeys[i].quota='\u274c Key sai';
        } else if(r.status===403){
          ok=false; ST.apiKeys[i].quota='\u274c Key b\u1ecb t\u1eeb ch\u1ed1i';
        } else if(r.status===429){
          ok=true; ST.apiKeys[i].quota='\u26a0\ufe0f Rate limited';
        } else {
          ok=false; ST.apiKeys[i].quota='\u274c HTTP '+r.status;
        }
      }catch(fetchErr){
        clearTimeout(timeout);
        if(fetchErr.name==='AbortError'){
          ST.apiKeys[i].status='fail'; ST.apiKeys[i].quota='\u23f1\ufe0f Timeout';
          toast('\u23f1\ufe0f Timeout','Groq kh\u00f4ng ph\u1ea3n h\u1ed3i (12s)','warn');
          renderApiKeyList(); saveAll(); return;
        }
        throw fetchErr;
      }
    }else if(k.provider==='openrouter'){
      // \u2550\u2550\u2550 FIX v3: OpenRouter \u2014 d\u00f9ng /models (free, kh\u00f4ng t\u1ed1n credit) \u2550\u2550\u2550
      const ctrl=new AbortController();
      const timeout=setTimeout(()=>ctrl.abort(),12000);
      try{
        const r=await fetch('https://openrouter.ai/api/v1/models',{
          headers:{'Authorization':'Bearer '+k.key},
          signal:ctrl.signal
        });
        clearTimeout(timeout);
        if(r.ok){
          const d=await r.json();
          ok=true;
          ST.apiKeys[i].quota='\u2705 '+(d.data||[]).length+' models';
        } else if(r.status===401||r.status===403){
          ok=false; ST.apiKeys[i].quota='\u274c Key sai/h\u1ebft h\u1ea1n';
        } else {
          ok=false; ST.apiKeys[i].quota='\u274c HTTP '+r.status;
        }
      }catch(fetchErr){
        clearTimeout(timeout);
        if(fetchErr.name==='AbortError'){
          ST.apiKeys[i].status='fail'; ST.apiKeys[i].quota='\u23f1\ufe0f Timeout';
          renderApiKeyList(); saveAll(); return;
        }
        throw fetchErr;
      }
    }else if(k.provider==='openai'){
      // \u2550\u2550\u2550 FIX v3: OpenAI \u2014 d\u00f9ng /models \u2550\u2550\u2550
      const ctrl=new AbortController();
      const timeout=setTimeout(()=>ctrl.abort(),12000);
      try{
        const r=await fetch('https://api.openai.com/v1/models',{
          headers:{'Authorization':'Bearer '+k.key},
          signal:ctrl.signal
        });
        clearTimeout(timeout);
        if(r.ok){
          const d=await r.json();
          const cnt=(d.data||[]).filter(m=>m.id.startsWith('gpt-')).length;
          ok=true; ST.apiKeys[i].quota='\u2705 '+cnt+' GPT models';
        } else if(r.status===401||r.status===403){
          ok=false; ST.apiKeys[i].quota='\u274c Key sai/h\u1ebft h\u1ea1n';
        } else if(r.status===429){
          ok=true; ST.apiKeys[i].quota='\u26a0\ufe0f Rate limited';
        } else {
          ok=false; ST.apiKeys[i].quota='\u274c HTTP '+r.status;
        }
      }catch(fetchErr){
        clearTimeout(timeout);
        if(fetchErr.name==='AbortError'){
          ST.apiKeys[i].status='fail'; ST.apiKeys[i].quota='\u23f1\ufe0f Timeout';
          renderApiKeyList(); saveAll(); return;
        }
        throw fetchErr;
      }
    }else if(k.provider==='mistral'){
      // \u2550\u2550\u2550 FIX v3: Mistral \u2014 d\u00f9ng /models \u2550\u2550\u2550
      const ctrl=new AbortController();
      const timeout=setTimeout(()=>ctrl.abort(),12000);
      try{
        const r=await fetch('https://api.mistral.ai/v1/models',{
          headers:{'Authorization':'Bearer '+k.key},
          signal:ctrl.signal
        });
        clearTimeout(timeout);
        if(r.ok){
          const d=await r.json();
          ok=true; ST.apiKeys[i].quota='\u2705 '+(d.data||[]).length+' models';
        } else if(r.status===401||r.status===403){
          ok=false; ST.apiKeys[i].quota='\u274c Key sai/h\u1ebft h\u1ea1n';
        } else {
          ok=false; ST.apiKeys[i].quota='\u274c HTTP '+r.status;
        }
      }catch(fetchErr){
        clearTimeout(timeout);
        if(fetchErr.name==='AbortError'){
          ST.apiKeys[i].status='fail'; ST.apiKeys[i].quota='\u23f1\ufe0f Timeout';
          renderApiKeyList(); saveAll(); return;
        }
        throw fetchErr;
      }
    }else{
      // \u2550\u2550\u2550 FIX v3: DeepSeek + provider kh\u00e1c \u2014 fallback d\u00f9ng chat completion v\u1edbi model h\u1ee3p l\u1ec7 \u2550\u2550\u2550
      // DeepSeek kh\u00f4ng c\u00f3 /models GET endpoint chu\u1ea9n n\u00ean ph\u1ea3i d\u00f9ng chat
      const safeModel = prov.models[0]?.id; // lu\u00f4n d\u00f9ng model \u0110\u1ea6U TI\u00caN (m\u1edbi nh\u1ea5t, \u0111\u1ea3m b\u1ea3o c\u00f2n s\u1ed1ng)
      const ep = prov.endpoint(safeModel, k.key);
      const testBody = prov.buildBody([{role:'user',content:'hi'}], '0.1', safeModel);
      testBody.max_tokens = 5; // \u2550\u2550\u2550 FIX v3: T\u0103ng t\u1eeb 3 l\u00ean 5 \u0111\u1ec3 tr\u00e1nh response r\u1ed7ng \u2550\u2550\u2550
      const headers = {'Content-Type':'application/json'};
      if(prov.authHeader) Object.assign(headers, prov.authHeader(k.key));
      const ctrl = new AbortController();
      const timeout = setTimeout(()=>ctrl.abort(), 15000);
      try{
        const r = await fetch(ep, {method:'POST', headers, body:JSON.stringify(testBody), signal:ctrl.signal});
        clearTimeout(timeout);
        if(r.ok){ ok=true; ST.apiKeys[i].quota='\u2705 Ho\u1ea1t \u0111\u1ed9ng'; }
        else if(r.status===401||r.status===403){ ok=false; ST.apiKeys[i].quota='\u274c Key sai/h\u1ebft h\u1ea1n'; }
        else if(r.status===402){ ok=true; ST.apiKeys[i].quota='\u26a0\ufe0f \u00cdt credit'; }
        else if(r.status===429){ ok=true; ST.apiKeys[i].quota='\u26a0\ufe0f Rate limited'; }
        else if(r.status===400){
          // \u2550\u2550\u2550 FIX v3: 400 th\u01b0\u1eddng l\u00e0 model deprecated \u2014 v\u1eabn coi key h\u1ee3p l\u1ec7 \u2550\u2550\u2550
          let errMsg='';
          try{ const ej=await r.json(); errMsg=(ej.error?.message||ej.error?.code||'').toString().toLowerCase(); }catch(_){}
          if(errMsg.includes('model') || errMsg.includes('decommission')){
            ok=true; ST.apiKeys[i].quota='\u26a0\ufe0f Model c\u0169 \u2014 Key OK';
          } else {
            ok=false; ST.apiKeys[i].quota='\u274c '+errMsg.slice(0,40);
          }
        }
        else { ok=false; ST.apiKeys[i].quota='\u274c HTTP '+r.status; }
      }catch(fetchErr){
        clearTimeout(timeout);
        if(fetchErr.name==='AbortError'){
          ST.apiKeys[i].status='fail'; ST.apiKeys[i].quota='\u23f1\ufe0f Timeout';
          toast('\u23f1\ufe0f Timeout', prov.name+' kh\u00f4ng ph\u1ea3n h\u1ed3i','warn');
          renderApiKeyList(); saveAll(); return;
        }
        throw fetchErr;
      }
    }

    ST.apiKeys[i].status=ok?'ok':'fail';
    // \u2550\u2550\u2550 NEW v2: Clear cooldown khi test ok \u2550\u2550\u2550
    if(ok){ _clearCool(k.key); }
    if(ok)toast('\u2705 Th\u00e0nh c\u00f4ng',`Key "${k.label||prov.name}" ho\u1ea1t \u0111\u1ed9ng!`,'success');
    else toast('\u274c Th\u1ea5t b\u1ea1i','Key kh\u00f4ng h\u1ee3p l\u1ec7','error');
  }catch(e){
    ST.apiKeys[i].status='fail';
    ST.apiKeys[i].quota='\u274c L\u1ed7i k\u1ebft n\u1ed1i';
    toast('\u274c L\u1ed7i',e.message.slice(0,100),'error');
  }
  renderApiKeyList();saveAll();
}

async function testConnection(){
  const v=ST.apiKeys.filter(k=>k.key.trim());
  if(!v.length){toast('L\u1ed7i','Ch\u01b0a c\u00f3 API key!','error');return;}
  toast('\ud83d\udd04 Test t\u1ea5t c\u1ea3 keys...','','info',2000);
  for(let i=0;i<ST.apiKeys.length;i++){if(ST.apiKeys[i].key.trim())await testKey(i)}
  toast('\u2705 Ho\u00e0n t\u1ea5t','Test xong t\u1ea5t c\u1ea3 keys','success');
}
// \u2550\u2550\u2550 FIX v2: fetchModels \u2014 H\u1ed7 tr\u1ee3 T\u1ea4T C\u1ea2 providers (kh\u00f4ng ch\u1ec9 Gemini/OpenRouter) \u2550\u2550\u2550
async function fetchModels(){
  const statusEl=document.getElementById('modelUpdateStatus');
  statusEl.textContent='\u23f3 \u0110ang t\u00ecm models m\u1edbi nh\u1ea5t...';
  const prov=document.getElementById('setProvider').value;
  const key=ST.apiKeys.find(k=>k.provider===prov&&k.key.trim())?.key;

  // \u2550\u2550\u2550 FIX v2: GEMINI \u2014 gi\u1eef nguy\u00ean logic g\u1ed1c, c\u1ea3i ti\u1ebfn sort \u2550\u2550\u2550
  if(prov==='gemini'&&key){
    try{
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      if(r.ok){
        const d=await r.json();
        const models=(d.models||[])
          .filter(m=>m.name.includes('gemini')&&m.supportedGenerationMethods?.includes('generateContent'))
          .map(m=>{
            const id=m.name.replace('models/','');
            const name=m.displayName||id;
            let tag='';
            if(id.includes('2.5-pro'))tag='\ud83c\udfc6 M\u1ea1nh nh\u1ea5t';
            else if(id.includes('2.5-flash'))tag='\u26a1 Nhanh+R\u1ebb';
            else if(id.includes('2.0-flash-lite'))tag='\ud83d\udcb0 R\u1ebb nh\u1ea5t';
            else if(id.includes('2.0-flash'))tag='\ud83d\udd25 Ph\u1ed5 bi\u1ebfn';
            else if(id.includes('1.5-pro'))tag='Pro';
            else if(id.includes('1.5-flash'))tag='Flash';
            // \u2550\u2550\u2550 NEW v2: Th\u00eam tag cho model m\u1edbi \u2550\u2550\u2550
            else if(id.includes('2.5-flash'))tag='\u26a1 Flash 2.5';
            return {id,name,tag};
          })
          .sort((a,b)=>{
            const order=['2.5-pro','2.5-flash','2.0-flash','2.0-flash-lite','1.5-pro','1.5-flash'];
            const ai=order.findIndex(x=>a.id.includes(x));
            const bi=order.findIndex(x=>b.id.includes(x));
            return (ai===-1?99:ai)-(bi===-1?99:bi);
          });
        if(models.length){
          PROVIDERS.gemini.models=models;
          renderModelSelect('gemini');
          statusEl.innerHTML=`\u2705 ${models.length} models \u00b7 <span style="color:var(--c1);cursor:pointer" onclick="showModelRecommendation('gemini')">\ud83d\udca1 Xem g\u1ee3i \u00fd</span>`;
          toast('C\u1eadp nh\u1eadt OK',`${models.length} Gemini models`,'success');
          // \u2550\u2550\u2550 NEW v2: Auto-select t\u1ed1i \u01b0u n\u1ebfu b\u1eadt \u2550\u2550\u2550
          if(ST.autoSelect) _autoApplyBestModel('gemini', models);
          return;
        }
      }
    }catch(e){console.warn('Fetch Gemini models:',e)}
  }

  // \u2550\u2550\u2550 FIX v2: OPENROUTER \u2014 gi\u1eef nguy\u00ean + c\u1ea3i ti\u1ebfn \u2550\u2550\u2550
  if(prov==='openrouter'&&key){
    try{
      const r=await fetch('https://openrouter.ai/api/v1/models',{
        headers:{'Authorization':`Bearer ${key}`}
      });
      if(r.ok){
        const d=await r.json();
        const popular=['openai/gpt-4o','openai/gpt-4o-mini','anthropic/claude-3.5-sonnet','anthropic/claude-3-haiku','google/gemini-2.0-flash-001','google/gemini-2.5-pro-preview','meta-llama/llama-3.3-70b-instruct','deepseek/deepseek-chat','deepseek/deepseek-r1','mistralai/mistral-large','qwen/qwen-2.5-72b-instruct'];
        const models=(d.data||[])
          .filter(m=>popular.some(p=>m.id.includes(p))||m.id.includes('free'))
          .slice(0,25) // \u2550\u2550\u2550 FIX v2: T\u0103ng t\u1eeb 20\u219225 \u2550\u2550\u2550
          .map(m=>{
            let tag='';
            const price=parseFloat(m.pricing?.prompt||0)*1000000;
            if(price===0)tag='\ud83c\udd93 Free';
            else if(price<1)tag='\ud83d\udcb0 R\u1ebb';
            else if(price<10)tag='\ud83d\udcb5 V\u1eeba';
            else tag='\ud83d\udc8e Premium';
            if(m.id.includes('free'))tag='\ud83c\udd93 Free';
            return {id:m.id,name:m.name||m.id,tag};
          })
          .sort((a,b)=>{
            if(a.tag.includes('Free')&&!b.tag.includes('Free'))return -1;
            if(!a.tag.includes('Free')&&b.tag.includes('Free'))return 1;
            return 0;
          });
        if(models.length){
          PROVIDERS.openrouter.models=models;
          renderModelSelect('openrouter');
          statusEl.innerHTML=`\u2705 ${models.length} models \u00b7 <span style="color:var(--c1);cursor:pointer" onclick="showModelRecommendation('openrouter')">\ud83d\udca1 Xem g\u1ee3i \u00fd</span>`;
          toast('C\u1eadp nh\u1eadt OK',`${models.length} OpenRouter models`,'success');
          if(ST.autoSelect) _autoApplyBestModel('openrouter', models);
          return;
        }
      }
    }catch(e){console.warn('Fetch OpenRouter models:',e)}
  }

  // \u2550\u2550\u2550 NEW v2: OPENAI \u2014 L\u1ea5y model list t\u1eeb API \u2550\u2550\u2550
  if(prov==='openai'&&key){
    try{
      const r=await fetch('https://api.openai.com/v1/models',{
        headers:{'Authorization':`Bearer ${key}`}
      });
      if(r.ok){
        const d=await r.json();
        const gptModels=(d.data||[])
          .filter(m=>m.id.startsWith('gpt-'))
          .map(m=>{
            let tag='';
            if(m.id.includes('gpt-4o-mini'))tag='\u26a1 Nhanh+R\u1ebb';
            else if(m.id==='gpt-4o')tag='\ud83c\udfc6 T\u1ed1t nh\u1ea5t';
            else if(m.id.includes('gpt-4-turbo'))tag='\ud83d\udcaa M\u1ea1nh';
            else if(m.id.includes('gpt-3.5'))tag='\ud83d\udcb0 R\u1ebb';
            else tag='';
            return {id:m.id,name:m.id,tag};
          })
          .sort((a,b)=>{
            const order=['gpt-4o','gpt-4o-mini','gpt-4-turbo','gpt-3.5-turbo'];
            const ai=order.findIndex(x=>a.id.includes(x));
            const bi=order.findIndex(x=>b.id.includes(x));
            return (ai===-1?99:ai)-(bi===-1?99:bi);
          })
          .slice(0,10);
        if(gptModels.length){
          PROVIDERS.openai.models=gptModels;
          renderModelSelect('openai');
          statusEl.innerHTML=`\u2705 ${gptModels.length} models \u00b7 <span style="color:var(--c1);cursor:pointer" onclick="showModelRecommendation('openai')">\ud83d\udca1 Xem g\u1ee3i \u00fd</span>`;
          toast('C\u1eadp nh\u1eadt OK',`${gptModels.length} OpenAI models`,'success');
          if(ST.autoSelect) _autoApplyBestModel('openai', gptModels);
          return;
        }
      }
    }catch(e){console.warn('Fetch OpenAI models:',e)}
  }

  // \u2550\u2550\u2550 NEW v2: MISTRAL \u2014 L\u1ea5y model list t\u1eeb API \u2550\u2550\u2550
  if(prov==='mistral'&&key){
    try{
      const r=await fetch('https://api.mistral.ai/v1/models',{
        headers:{'Authorization':`Bearer ${key}`}
      });
      if(r.ok){
        const d=await r.json();
        const models=(d.data||[])
          .filter(m=>m.id && !m.id.includes('embed'))
          .map(m=>{
            let tag='';
            if(m.id.includes('large'))tag='\ud83c\udfc6 M\u1ea1nh nh\u1ea5t';
            else if(m.id.includes('medium'))tag='\u26a1 C\u00e2n b\u1eb1ng';
            else if(m.id.includes('small'))tag='\ud83d\udcb0 Nhanh';
            else if(m.id.includes('mixtral'))tag='\ud83d\udcaa Open';
            else tag='';
            return {id:m.id,name:m.id,tag};
          })
          .slice(0,10);
        if(models.length){
          PROVIDERS.mistral.models=models;
          renderModelSelect('mistral');
          statusEl.innerHTML=`\u2705 ${models.length} models \u00b7 <span style="color:var(--c1);cursor:pointer" onclick="showModelRecommendation('mistral')">\ud83d\udca1 Xem g\u1ee3i \u00fd</span>`;
          toast('C\u1eadp nh\u1eadt OK',`${models.length} Mistral models`,'success');
          if(ST.autoSelect) _autoApplyBestModel('mistral', models);
          return;
        }
      }
    }catch(e){console.warn('Fetch Mistral models:',e)}
  }

  // \u2550\u2550\u2550 NEW v2: GROQ \u2014 L\u1ea5y model list t\u1eeb API \u2550\u2550\u2550
  if(prov==='groq'&&key){
    try{
      const r=await fetch('https://api.groq.com/openai/v1/models',{
        headers:{'Authorization':`Bearer ${key}`}
      });
      if(r.ok){
        const d=await r.json();
        const models=(d.data||[])
          .filter(m=>m.id && m.active!==false)
          .map(m=>{
            let tag='';
            if(m.id.includes('llama-3.3-70b'))tag='\ud83c\udfc6 M\u1ea1nh+Nhanh';
            else if(m.id.includes('llama-4'))tag='\ud83c\udd95 M\u1edbi nh\u1ea5t';
            else if(m.id.includes('qwen'))tag='\u26a1 T\u1ed1t';
            else if(m.id.includes('8b'))tag='\ud83d\udcb0 Si\u00eau nhanh';
            else tag='';
            return {id:m.id,name:m.id,tag};
          })
          .slice(0,10);
        if(models.length){
          PROVIDERS.groq.models=models;
          renderModelSelect('groq');
          statusEl.innerHTML=`\u2705 ${models.length} models \u00b7 <span style="color:var(--c1);cursor:pointer" onclick="showModelRecommendation('groq')">\ud83d\udca1 Xem g\u1ee3i \u00fd</span>`;
          toast('C\u1eadp nh\u1eadt OK',`${models.length} Groq models`,'success');
          if(ST.autoSelect) _autoApplyBestModel('groq', models);
          return;
        }
      }
    }catch(e){console.warn('Fetch Groq models:',e)}
  }

  // \u2550\u2550\u2550 NEW v2: DEEPSEEK \u2014 Kh\u00f4ng c\u00f3 model list API, d\u00f9ng m\u1eb7c \u0111\u1ecbnh \u2550\u2550\u2550
  // DeepSeek ch\u1ec9 c\u00f3 2 model (deepseek-chat, deepseek-reasoner), kh\u00f4ng c\u1ea7n fetch

  // Fallback: d\u00f9ng danh s\u00e1ch m\u1eb7c \u0111\u1ecbnh
  renderModelSelect(prov);
  statusEl.innerHTML=`\u2705 M\u1eb7c \u0111\u1ecbnh \u00b7 <span style="color:var(--c1);cursor:pointer" onclick="showModelRecommendation('${prov}')">\ud83d\udca1 Xem g\u1ee3i \u00fd</span>`;
}

// \u2550\u2550\u2550 NEW v2: Auto-select model t\u1ed1i \u01b0u nh\u1ea5t khi fetchModels xong \u2550\u2550\u2550
function _autoApplyBestModel(provKey, modelList){
  if(!modelList||!modelList.length) return;
  // \u01afu ti\u00ean: Free > R\u1ebb > C\u00e2n b\u1eb1ng, theo AUTO_SELECT_PRIORITY
  const priority = AUTO_SELECT_PRIORITY.filter(p=>p.provider===provKey);
  if(priority.length){
    for(const p of priority){
      const found = modelList.find(m=>m.id===p.model);
      if(found){
        document.getElementById('setModel').value=found.id;
        ST.model=found.id;
        toast('\ud83e\udd16 Auto-select',`\u0110\u00e3 ch\u1ecdn ${found.name||found.id}`,'info',2000);
        return;
      }
    }
  }
  // Fallback: ch\u1ecdn model \u0111\u1ea7u ti\u00ean
  document.getElementById('setModel').value=modelList[0].id;
  ST.model=modelList[0].id;
}
function showModelRecommendation(prov){
  const recs={
    gemini:{
      best:'gemini-2.5-pro-preview-03-25',bestDesc:'Ch\u1ea5t l\u01b0\u1ee3ng cao nh\u1ea5t, t\u1ea1o c\u00e2u h\u1ecfi ch\u00ednh x\u00e1c, gi\u1ea3i th\u00edch t\u1ed1t.',
      balanced:'gemini-2.0-flash',balancedDesc:'Nhanh, mi\u1ec5n ph\u00ed, \u0111\u1ee7 t\u1ed1t cho h\u1ea7u h\u1ebft b\u00e0i t\u1eadp.',
      cheap:'gemini-2.0-flash-lite',cheapDesc:'R\u1ebb nh\u1ea5t, nhanh nh\u1ea5t, ph\u00f9 h\u1ee3p b\u00e0i \u0111\u01a1n gi\u1ea3n.',
      tip:'\ud83d\udca1 Khuy\u1ebfn ngh\u1ecb: D\u00f9ng <b>gemini-2.0-flash</b> cho s\u1eed d\u1ee5ng h\u00e0ng ng\u00e0y (mi\u1ec5n ph\u00ed, nhanh). Chuy\u1ec3n sang <b>2.5 Pro</b> khi c\u1ea7n c\u00e2u h\u1ecfi ch\u1ea5t l\u01b0\u1ee3ng cao.'
    },
    openrouter:{
      best:'openai/gpt-4o',bestDesc:'Ch\u1ea5t l\u01b0\u1ee3ng t\u1ed1t nh\u1ea5t nh\u01b0ng t\u1ed1n credit.',
      balanced:'deepseek/deepseek-chat',balancedDesc:'R\u1ebb, nhanh, ch\u1ea5t l\u01b0\u1ee3ng t\u1ed1t.',
      cheap:'meta-llama/llama-3.3-70b-instruct:free',cheapDesc:'Mi\u1ec5n ph\u00ed tr\u00ean nhi\u1ec1u plan.',
      tip:'\ud83d\udca1 Khuy\u1ebfn ngh\u1ecb: D\u00f9ng <b>deepseek-chat</b> (r\u1ebb, t\u1ed1t). N\u1ebfu h\u1ebft credit, ch\u1ecdn model c\u00f3 tag \ud83c\udd93 Free.'
    },
    openai:{
      best:'gpt-4o',bestDesc:'T\u1ed1t nh\u1ea5t c\u1ee7a OpenAI.',
      balanced:'gpt-4o-mini',balancedDesc:'Nhanh, r\u1ebb h\u01a1n 10x.',
      cheap:'gpt-3.5-turbo',cheapDesc:'R\u1ebb nh\u1ea5t.',
      tip:'\ud83d\udca1 Khuy\u1ebfn ngh\u1ecb: D\u00f9ng <b>gpt-4o-mini</b> cho s\u1eed d\u1ee5ng h\u00e0ng ng\u00e0y.'
    },
    deepseek:{
      best:'deepseek-chat',bestDesc:'DeepSeek V3 \u2014 t\u1ed1t, r\u1ea5t r\u1ebb.',
      balanced:'deepseek-chat',balancedDesc:'Ch\u1ec9 c\u00f3 2 model, d\u00f9ng chat l\u00e0 \u0111\u1ee7.',
      cheap:'deepseek-chat',cheapDesc:'R\u1ebb nh\u1ea5t trong c\u00e1c AI ch\u1ea5t l\u01b0\u1ee3ng cao.',
      tip:'\ud83d\udca1 Khuy\u1ebfn ngh\u1ecb: D\u00f9ng <b>deepseek-chat</b>. Gi\u00e1 r\u1ea5t r\u1ebb, ch\u1ea5t l\u01b0\u1ee3ng ngang GPT-4.'
    },
    mistral:{
      best:'mistral-large-latest',bestDesc:'M\u1ea1nh nh\u1ea5t c\u1ee7a Mistral.',
      balanced:'mistral-small-latest',balancedDesc:'Nhanh, ph\u00f9 h\u1ee3p b\u00e0i t\u1eadp.',
      cheap:'mistral-small-latest',cheapDesc:'R\u1ebb nh\u1ea5t.',
      tip:'\ud83d\udca1 L\u01b0u \u00fd: Mistral hay b\u1ecb timeout t\u1eeb Vi\u1ec7t Nam. N\u1ebfu g\u1eb7p l\u1ed7i, th\u1eed d\u00f9ng Gemini ho\u1eb7c DeepSeek.'
    },
    groq:{
      best:'llama-3.3-70b-versatile',bestDesc:'M\u1ea1nh + nhanh nh\u1ea5t tr\u00ean Groq.',
      balanced:'llama-3.3-70b-versatile',balancedDesc:'T\u1ed1c \u0111\u1ed9 si\u00eau nhanh, mi\u1ec5n ph\u00ed.',
      cheap:'llama-3.1-8b-instant',cheapDesc:'Nhanh nh\u1ea5t, token nh\u1ecf.',
      tip:'\ud83d\udca1 Khuy\u1ebfn ngh\u1ecb: D\u00f9ng <b>llama-3.3-70b-versatile</b>. Groq mi\u1ec5n ph\u00ed nh\u01b0ng c\u00f3 rate limit.'
    }
  };
  const rec=recs[prov]||recs.gemini;
  const html=`
    <div style="padding:16px">
      <div style="font-size:1rem;font-weight:700;margin-bottom:14px">\ud83d\udca1 G\u1ee3i \u00fd Model cho ${PROVIDERS[prov]?.name||prov}</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.3);border-radius:8px;padding:12px;cursor:pointer" onclick="document.getElementById('setModel').value='${rec.best}';closeModal('recModal');toast('\u0110\u00e3 ch\u1ecdn','${rec.best}','success')">
          <div style="font-weight:700;color:var(--c1)">\ud83c\udfc6 Ch\u1ea5t l\u01b0\u1ee3ng cao: <code>${rec.best}</code></div>
          <div style="font-size:.85rem;color:var(--text2);margin-top:4px">${rec.bestDesc}</div>
        </div>
        <div style="background:rgba(0,124,240,.1);border:1px solid rgba(0,124,240,.3);border-radius:8px;padding:12px;cursor:pointer" onclick="document.getElementById('setModel').value='${rec.balanced}';closeModal('recModal');toast('\u0110\u00e3 ch\u1ecdn','${rec.balanced}','success')">
          <div style="font-weight:700;color:var(--c2)">\u26a1 C\u00e2n b\u1eb1ng (khuy\u1ebfn ngh\u1ecb): <code>${rec.balanced}</code></div>
          <div style="font-size:.85rem;color:var(--text2);margin-top:4px">${rec.balancedDesc}</div>
        </div>
        <div style="background:rgba(247,151,30,.1);border:1px solid rgba(247,151,30,.3);border-radius:8px;padding:12px;cursor:pointer" onclick="document.getElementById('setModel').value='${rec.cheap}';closeModal('recModal');toast('\u0110\u00e3 ch\u1ecdn','${rec.cheap}','success')">
          <div style="font-weight:700;color:var(--c5)">\ud83d\udcb0 Ti\u1ebft ki\u1ec7m: <code>${rec.cheap}</code></div>
          <div style="font-size:.85rem;color:var(--text2);margin-top:4px">${rec.cheapDesc}</div>
        </div>
      </div>
      <div style="margin-top:14px;padding:10px 14px;background:var(--bg4);border-radius:8px;font-size:.85rem;color:var(--text3);line-height:1.6">${rec.tip}</div>
      <div style="margin-top:12px">
        <div style="font-size:.82rem;color:var(--text2);margin-bottom:6px">Ho\u1eb7c nh\u1eadp Model ID t\u00f9y ch\u1ec9nh:</div>
        <div style="display:flex;gap:8px">
          <input type="text" id="customModelInput" placeholder="VD: gemini-2.5-flash-preview-04-17" style="flex:1;background:var(--bg3);border:1.5px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);font-size:.88rem;font-family:monospace">
          <button class="btn btn-primary btn-sm" onclick="applyCustomModel()">\u00c1p d\u1ee5ng</button>
        </div>
      </div>
    </div>`;

  let modal=document.getElementById('recModal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='recModal';
    modal.className='modal-overlay hidden';
    modal.onclick=function(e){if(e.target.id==='recModal')closeModal('recModal')};
    modal.innerHTML=`<div class="modal" style="max-width:500px"><div class="modal-header"><div class="modal-title">\ud83d\udca1 G\u1ee3i \u00fd Model AI</div><button class="btn btn-icon btn-sm" onclick="closeModal('recModal')">\u2715</button></div><div class="modal-body" id="recModalBody"></div></div>`;
    document.body.appendChild(modal);
  }
  document.getElementById('recModalBody').innerHTML=html;
  openModal('recModal');
}

// \u2550\u2550\u2550 NEW v3: Smart Pick \u2014 Ch\u1ecdn nhanh provider/model theo m\u1ee5c ti\u00eau \u2550\u2550\u2550
function smartPick(tier){
  var presets = {
    free:  {provider:'groq',     model:'llama-3.3-70b-versatile', hint:'\u26a1 Groq Llama 3.3 70B \u2014 Free, kh\u00f4ng gi\u1edbi h\u1ea1n ng\u00e0y, ~280 tok/s. L\u1ea5y key t\u1ea1i console.groq.com'},
    cheap: {provider:'deepseek', model:'deepseek-chat',           hint:'\ud83d\udd2c DeepSeek V3.2 \u2014 $0.14/1M token, r\u1ebb nh\u1ea5t, ch\u1ea5t l\u01b0\u1ee3ng GPT-4 class'},
    best:  {provider:'gemini',   model:'gemini-2.5-pro',          hint:'\ud83d\udc8e Gemini 2.5 Pro \u2014 M\u1ea1nh nh\u1ea5t, free 50 req/ng\u00e0y, l\u00fd t\u01b0\u1edfng \u0111\u1ec1 kh\u00f3'}
  };
  var p = presets[tier]; if(!p) return;
  ST.provider = p.provider;
  ST.model    = p.model;
  ST.autoSelect = false; // T\u1eaft auto khi user ch\u1ee7 \u0111\u1ed9ng ch\u1ecdn
  document.getElementById('setProvider').value = p.provider;
  renderModelSelect(p.provider);
  // \u0110\u1ea3m b\u1ea3o model c\u00f3 trong list (n\u1ebfu ch\u01b0a th\u00ec th\u00eam)
  var sel = document.getElementById('setModel');
  if(!Array.from(sel.options).some(function(o){return o.value===p.model})){
    var opt=document.createElement('option'); opt.value=p.model; opt.textContent=p.model+' [\u270f\ufe0f \u0110\u00e3 ch\u1ecdn]';
    sel.appendChild(opt);
  }
  sel.value = p.model;
  // T\u1eaft auto-select toggle
  var autoEl=document.getElementById('tAutoSelect'); if(autoEl) autoEl.classList.remove('on');
  saveAll();
  toast('\u2705 \u0110\u00e3 ch\u1ecdn', p.hint, 'success', 5000); SFX.click();
}

// \u2550\u2550\u2550 FIX v2: saveSettings \u2014 Th\u00eam l\u01b0u autoSelect \u2550\u2550\u2550
function saveSettings(){
  ST.provider=document.getElementById('setProvider').value;
  ST.model=document.getElementById('setModel').value;
  ST.temp=document.getElementById('setTemp').value;
  ST.lang=document.getElementById('setLang').value;
  // \u2550\u2550\u2550 NEW v2: L\u01b0u auto-select toggle \u2550\u2550\u2550
  const autoEl=document.getElementById('tAutoSelect');
  if(autoEl) ST.autoSelect=autoEl.classList.contains('on');
  ST.apiKeys.forEach((k,i)=>{const inp=document.getElementById(`apikey_field_${i}`);if(inp)k.key=inp.value});
  saveAll(); closeModal('settingsModal'); SFX.save();
  toast('\u0110\u00e3 l\u01b0u','C\u00e0i \u0111\u1eb7t AI \u0111\u00e3 \u0111\u01b0\u1ee3c l\u01b0u','success'); renderHome();
}
// \u2550\u2550\u2550 FIX v2: openSettings \u2014 Kh\u00f4i ph\u1ee5c autoSelect toggle \u2550\u2550\u2550
function openSettings(){
  document.getElementById('setProvider').value=ST.provider;
  renderModelSelect(ST.provider);
  document.getElementById('setModel').value=ST.model;
  document.getElementById('setTemp').value=ST.temp;
  document.getElementById('tempVal').textContent=ST.temp;
  document.getElementById('setLang').value=ST.lang;
  // \u2550\u2550\u2550 NEW v2: Kh\u00f4i ph\u1ee5c auto-select toggle \u2550\u2550\u2550
  const autoEl=document.getElementById('tAutoSelect');
  if(autoEl){
    if(ST.autoSelect) autoEl.classList.add('on');
    else autoEl.classList.remove('on');
  }
  renderApiKeyList(); openModal('settingsModal');
}
// \u2550\u2550\u2550 FIX v2: getApiKey \u2014 Smart rotation: \u01b0u ti\u00ean key \u00edt d\u00f9ng, kh\u00f4ng cooldown \u2550\u2550\u2550
function getApiKey(preferProvider){
  const prov=preferProvider||ST.provider;
  let pool=ST.apiKeys.filter(k=>k.provider===prov&&k.key.trim()&&k.status!=='dead');
  if(!pool.length){pool=ST.apiKeys.filter(k=>k.key.trim()&&k.status!=='dead');}
  if(!pool.length)throw new Error('Ch\u01b0a c\u1ea5u h\u00ecnh API key! V\u00e0o \u2699\ufe0f C\u00e0i \u0111\u1eb7t \u0111\u1ec3 th\u00eam key.');

  // \u2550\u2550\u2550 NEW v2: S\u1eafp x\u1ebfp th\u00f4ng minh: kh\u00f4ng cooldown > \u00edt request > status ok \u2550\u2550\u2550
  pool.sort((a,b)=>{
    const aCool=_isKeyCooling(a.key)?1:0;
    const bCool=_isKeyCooling(b.key)?1:0;
    if(aCool!==bCool) return aCool-bCool;
    const aPri={'ok':0,'idle':1,'ratelimit':2,'fail':3};
    const statusDiff=(aPri[a.status]||1)-(aPri[b.status]||1);
    if(statusDiff!==0) return statusDiff;
    return (a.reqCount||0)-(b.reqCount||0);
  });

  if(ST.currentKeyIdx>=pool.length)ST.currentKeyIdx=0;
  const key=pool[ST.currentKeyIdx];
  ST.currentKeyIdx=(ST.currentKeyIdx+1)%pool.length;
  // \u2550\u2550\u2550 NEW v2: Track request count \u2550\u2550\u2550
  key.reqCount=(key.reqCount||0)+1;
  key.lastUsed=Date.now();
  return key;
}

// \u2550\u2550\u2550 FIX v2: resolveModel \u2014 X\u00e1c \u0111\u1ecbnh model \u0111\u00fang cho provider th\u1ef1c t\u1ebf \u2550\u2550\u2550
function resolveModel(keyObj){
  const prov=PROVIDERS[keyObj.provider];
  if(keyObj.provider===ST.provider)return ST.model;
  return prov.models[0]?.id||ST.model;
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// CALL AI ENGINE \u2014 v2: Smart Routing + Exponential Backoff + Chunked Requests
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
var _keyCooldown = {};
function _isKeyCooling(keyStr){ var until=_keyCooldown[keyStr]; return until && Date.now()<until; }
function _coolKey(keyStr,seconds){ _keyCooldown[keyStr]=Date.now()+seconds*1000; }
function _clearCool(keyStr){ delete _keyCooldown[keyStr]; }
// \u2550\u2550\u2550 FIX v3: Provider-level cooldown \u2014 b\u1ecf qua c\u1ea3 provider khi li\u00ean t\u1ee5c 429 \u2550\u2550\u2550
var _providerCooldown = {};
function _isProviderCool(prov){ return _providerCooldown[prov] && _providerCooldown[prov] > Date.now(); }
function _coolProvider(prov, sec){ _providerCooldown[prov] = Date.now() + sec*1000; }


// \u2550\u2550\u2550 NEW v2: Request rate tracking \u2014 tr\u00e1nh spam c\u00f9ng 1 key \u2550\u2550\u2550
var _keyLastRequest = {};
var _MIN_REQUEST_GAP = 500; // 500ms gi\u1eefa c\u00e1c request c\u00f9ng key

function _canRequestKey(keyStr){
  var last = _keyLastRequest[keyStr] || 0;
  return Date.now() - last >= _MIN_REQUEST_GAP;
}
function _markRequested(keyStr){
  _keyLastRequest[keyStr] = Date.now();
}

// \u2550\u2550\u2550 FIX v2: callAI \u2014 C\u1ea3i ti\u1ebfn to\u00e0n di\u1ec7n \u2550\u2550\u2550
async function callAI(messages){
  var activeModel = ST.model;

  // B\u01af\u1edaC 1: X\u00e2y pool key \u2014 l\u1ecdc dead + \u0111ang cooldown
  var allKeys = ST.apiKeys.filter(function(k){
    return k.key.trim() && k.status !== 'dead' && !_isKeyCooling(k.key) && !_isProviderCool(k.provider);
  });

  // N\u1ebfu h\u1ebft key s\u1ea1ch \u2192 \u0111\u1ee3i key s\u1edbm nh\u1ea5t h\u1ebft cooldown
  if(!allKeys.length){
    var recoverable = ST.apiKeys.filter(function(k){ return k.key.trim() && k.status !== 'dead'; });
    if(recoverable.length){
      var soonest = recoverable[0];
      for(var ri=1;ri<recoverable.length;ri++){
        if((_keyCooldown[recoverable[ri].key]||0) < (_keyCooldown[soonest.key]||0)) soonest=recoverable[ri];
      }
      var waitTime = Math.max(0, (_keyCooldown[soonest.key]||0) - Date.now());
      if(waitTime <= 30000){
        toast('\u23f3 \u0110ang ch\u1edd...','API h\u1ebft gi\u1edbi h\u1ea1n, ch\u1edd '+Math.ceil(waitTime/1000)+'s','warn',waitTime+1000);
        await new Promise(function(res){setTimeout(res, waitTime+500)});
        _clearCool(soonest.key);
        allKeys.push(soonest);
      }
    }
    if(!allKeys.length) throw new Error('T\u1ea5t c\u1ea3 API keys \u0111ang b\u1ecb gi\u1edbi h\u1ea1n (429). Vui l\u00f2ng \u0111\u1ee3i 1-2 ph\u00fat r\u1ed3i th\u1eed l\u1ea1i.');
  }

  // B\u01af\u1edaC 2: S\u1eafp x\u1ebfp \u01b0u ti\u00ean \u2014 provider hi\u1ec7n t\u1ea1i tr\u01b0\u1edbc, status ok tr\u01b0\u1edbc, \u00edt request tr\u01b0\u1edbc
  var pri = {'ok':0,'idle':1,'ratelimit':2,'fail':3};
  allKeys.sort(function(a,b){
    // \u2550\u2550\u2550 FIX v2: \u01afu ti\u00ean provider hi\u1ec7n t\u1ea1i + kh\u00f4ng cooling + \u00edt d\u00f9ng \u2550\u2550\u2550
    if(a.provider===ST.provider && b.provider!==ST.provider) return -1;
    if(b.provider===ST.provider && a.provider!==ST.provider) return 1;
    var statusDiff = (pri[a.status]||1) - (pri[b.status]||1);
    if(statusDiff!==0) return statusDiff;
    return (a.reqCount||0) - (b.reqCount||0); // \u2550\u2550\u2550 NEW v2: \u00cdt request \u2192 \u01b0u ti\u00ean \u2550\u2550\u2550
  });

  var lastErr;

  // B\u01af\u1edaC 3: Th\u1eed t\u1eebng key v\u1edbi Exponential Backoff
  for(var i=0; i<allKeys.length; i++){
    var keyObj = allKeys[i];
    var prov = PROVIDERS[keyObj.provider];
    if(!prov) continue;

    // \u2550\u2550\u2550 NEW v2: \u0110\u1ee3i n\u1ebfu request qu\u00e1 nhanh \u2550\u2550\u2550
    if(!_canRequestKey(keyObj.key)){
      var gap = _MIN_REQUEST_GAP - (Date.now() - (_keyLastRequest[keyObj.key]||0));
      if(gap > 0) await new Promise(function(res){setTimeout(res, gap)});
    }

    // Ch\u1ecdn model ph\u00f9 h\u1ee3p provider
    var model = activeModel;
    if(keyObj.provider !== ST.provider){
      model = prov.models[0] ? prov.models[0].id : activeModel;
    }
    var modelBelongs = false;
    for(var mi=0;mi<prov.models.length;mi++){
      if(prov.models[mi].id === model){ modelBelongs = true; break; }
    }
    if(!modelBelongs) model = prov.models[0] ? prov.models[0].id : model;

    var ep = prov.endpoint(model, keyObj.key);
    var body = prov.buildBody(messages, ST.temp, model);
    var headers = {'Content-Type':'application/json'};
    if(prov.authHeader){
      var authH = prov.authHeader(keyObj.key);
      for(var hk in authH) headers[hk] = authH[hk];
    }

    // \u2550\u2550\u2550 FIX v2: Th\u1eed t\u1ed1i \u0111a 3 l\u1ea7n (t\u0103ng t\u1eeb 2) cho m\u1ed7i key, delay t\u0103ng d\u1ea7n \u2550\u2550\u2550
    var maxRetries = 3;
    for(var attempt=0; attempt<maxRetries; attempt++){
      try {
        _markRequested(keyObj.key);
        var ctrl = new AbortController();
        // \u2550\u2550\u2550 FIX v2: Timeout t\u0103ng d\u1ea7n m\u1ed7i retry: 35s \u2192 45s \u2192 60s \u2550\u2550\u2550
        var timeoutMs = 35000 + attempt * 10000;
        var timeout = setTimeout(function(){ctrl.abort()}, timeoutMs);
        var r = await fetch(ep, {method:'POST', headers:headers, body:JSON.stringify(body), signal:ctrl.signal});
        clearTimeout(timeout);

        if(r.ok){
          var d = await r.json();
          var txt = prov.parseResp(d);
          if(txt && txt.trim().length > 5){
            keyObj.status = 'ok';
            _clearCool(keyObj.key);
            return txt; // \u2190 TH\u00c0NH C\u00d4NG
          }
          // \u2550\u2550\u2550 NEW v2: Response r\u1ed7ng \u2014 retry 1 l\u1ea7n n\u1eefa \u2550\u2550\u2550
          if(attempt < maxRetries-1){
            console.warn('\u26a0\ufe0f Response r\u1ed7ng t\u1eeb '+keyObj.provider+', retry #'+(attempt+1));
            await new Promise(function(res){setTimeout(res, 1000 * (attempt+1))});
            continue;
          }
        }

        // === X\u1eec L\u00dd L\u1ed6I ===
        if(r.status === 429){
          var retryAfter = parseInt(r.headers.get('retry-after')) || 0;
          if(!retryAfter){
            retryAfter = 30 * Math.pow(2, (keyObj._429count||0));
            keyObj._429count = (keyObj._429count||0) + 1;
          } else {
            keyObj._429count = 0;
          }
          retryAfter = Math.min(retryAfter, 300);
          _coolKey(keyObj.key, retryAfter);
          keyObj.status = 'ratelimit';
          // \u2550\u2550\u2550 FIX v3: Cooldown provider 30s \u2014 bu\u1ed9c switch sang provider kh\u00e1c \u2550\u2550\u2550
          _coolProvider(keyObj.provider, 30);
          console.warn('\ud83d\udd11 '+keyObj.provider+' 429 \u2192 key cool '+retryAfter+'s, provider cool 30s');
          break;
        }

        if(r.status === 503){
          _coolKey(keyObj.key, 30);
          if(attempt < maxRetries-1){
            await new Promise(function(res){setTimeout(res, 3000 * (attempt+1))});
            continue;
          }
          break;
        }
        if(r.status === 402){
          _coolKey(keyObj.key, 600);
          keyObj.status = 'ratelimit';
          keyObj.quota = '\u26a0\ufe0f H\u1ebft credit';
          break;
        }
        if(r.status === 401 || r.status === 403){
          keyObj.status = 'dead';
          keyObj.quota = '\u274c Key sai/h\u1ebft h\u1ea1n';
          saveAll();
          break;
        }
        // \u2550\u2550\u2550 NEW v2: Handle 500 \u2014 server error, retry \u2550\u2550\u2550
        if(r.status === 500 && attempt < maxRetries-1){
          console.warn('\u26a0\ufe0f Server error 500, retry #'+(attempt+1));
          await new Promise(function(res){setTimeout(res, 2000 * (attempt+1))});
          continue;
        }

        var errText = '';
        try { errText = await r.text(); } catch(te){}
        lastErr = new Error(prov.name+' '+r.status+': '+errText.slice(0,120));
        break;

      } catch(fetchErr){
        if(fetchErr.name === 'AbortError'){
          _coolKey(keyObj.key, 15);
          lastErr = new Error(prov.name+' timeout ('+Math.round(timeoutMs/1000)+'s)');
          break;
        }
        lastErr = fetchErr;
        if(attempt < maxRetries-1){
          // \u2550\u2550\u2550 FIX v2: Exponential backoff delay \u2550\u2550\u2550
          await new Promise(function(res){setTimeout(res, 1500 * Math.pow(2, attempt))});
        }
      }
    }
  }

  // \u2550\u2550\u2550 FIX v3: Th\u00f4ng b\u00e1o c\u1ee5 th\u1ec3 h\u01a1n \u0111\u1ec3 user bi\u1ebft ph\u1ea3i l\u00e0m g\u00ec \u2550\u2550\u2550
  var hint = 'T\u1ea5t c\u1ea3 API keys \u0111\u1ec1u th\u1ea5t b\u1ea1i.';
  if(_isProviderCool(ST.provider)){
    hint += ' Provider "'+PROVIDERS[ST.provider].name+'" \u0111ang qu\u00e1 t\u1ea3i. H\u00e3y th\u00eam key Groq (mi\u1ec5n ph\u00ed, kh\u00f4ng gi\u1edbi h\u1ea1n ng\u00e0y) t\u1ea1i console.groq.com';
  }
  throw lastErr || new Error(hint);
}

// \u2550\u2550\u2550 NEW v2: callAI_chunked \u2014 G\u1ecdi AI chia batch cho n\u1ed9i dung d\u00e0i \u2550\u2550\u2550
async function callAI_chunked(systemMsg, userPromptTemplate, totalCount, chunkSize){
  // Chia request l\u1edbn th\u00e0nh nhi\u1ec1u chunk nh\u1ecf
  // systemMsg: {role:'system', content:'...'}
  // userPromptTemplate: function(startIdx, count) => string
  // totalCount: t\u1ed5ng s\u1ed1 item c\u1ea7n t\u1ea1o
  // chunkSize: s\u1ed1 item m\u1ed7i chunk (m\u1eb7c \u0111\u1ecbnh 10)

  chunkSize = chunkSize || 10;
  if(totalCount <= chunkSize){
    // Kh\u00f4ng c\u1ea7n chia batch
    return await callAI([systemMsg, {role:'user', content: userPromptTemplate(0, totalCount)}]);
  }

  var allResults = [];
  var chunks = Math.ceil(totalCount / chunkSize);

  for(var c = 0; c < chunks; c++){
    var start = c * chunkSize;
    var count = Math.min(chunkSize, totalCount - start);
    var chunkNum = c + 1;

    toast('\ud83d\udce6 Batch '+chunkNum+'/'+chunks, '\u0110ang t\u1ea1o '+count+' items...','info',3000);

    var prompt = userPromptTemplate(start, count);
    // \u2550\u2550\u2550 NEW v2: Th\u00eam h\u01b0\u1edbng d\u1eabn batch v\u00e0o prompt \u2550\u2550\u2550
    if(chunks > 1){
      prompt += `\n\n[\u0110\u00c2Y L\u00c0 BATCH ${chunkNum}/${chunks}: T\u1ea1o ${count} items, b\u1eaft \u0111\u1ea7u t\u1eeb ID ${start+1}]`;
    }

    try{
      var raw = await callAI([systemMsg, {role:'user', content: prompt}]);
      allResults.push({raw: raw, chunkIdx: c, start: start, count: count});
    }catch(e){
      console.warn('Batch '+chunkNum+' failed:', e.message);
      // \u2550\u2550\u2550 NEW v2: Retry batch b\u1ecb l\u1ed7i 1 l\u1ea7n \u2550\u2550\u2550
      try{
        await new Promise(function(res){setTimeout(res, 2000)});
        var raw2 = await callAI([systemMsg, {role:'user', content: prompt}]);
        allResults.push({raw: raw2, chunkIdx: c, start: start, count: count});
      }catch(e2){
        toast('\u26a0\ufe0f Batch '+chunkNum+' th\u1ea5t b\u1ea1i', e2.message, 'warn');
        // Ti\u1ebfp t\u1ee5c v\u1edbi c\u00e1c batch c\u00f2n l\u1ea1i
      }
    }

    // \u2550\u2550\u2550 NEW v2: Delay gi\u1eefa c\u00e1c batch \u0111\u1ec3 tr\u00e1nh 429 \u2550\u2550\u2550
    if(c < chunks - 1){
      await new Promise(function(res){setTimeout(res, 1500)});
    }
  }

  return allResults;
}
// \u2550\u2550\u2550 FIX v2: extractJSON \u2014 C\u1ea3i ti\u1ebfn x\u1eed l\u00fd nhi\u1ec1u format h\u01a1n \u2550\u2550\u2550
function extractJSON(raw){
  if(!raw||typeof raw!=='string')return '{}';
  var cleaned=raw;
  // T\u00ecm JSON trong code block
  var cb=raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if(cb) cleaned=cb[1];
  // \u2550\u2550\u2550 NEW v2: X\u00f3a trailing comma \u2550\u2550\u2550
  cleaned=cleaned.replace(/,\s*}/g,'}').replace(/,\s*\]/g,']');
  // \u2550\u2550\u2550 NEW v2: X\u00f3a BOM + whitespace l\u1ea1 \u2550\u2550\u2550
  cleaned=cleaned.replace(/^\uFEFF/,'').trim();
  // Th\u1eed parse tr\u1ef1c ti\u1ebfp
  try{JSON.parse(cleaned);return cleaned}catch(ex){}
  // T\u00ecm object {...}
  var s=cleaned.indexOf('{'),e=cleaned.lastIndexOf('}');
  if(s!==-1&&e>s){var c=cleaned.slice(s,e+1);try{JSON.parse(c);return c}catch(ex2){}}
  // T\u00ecm array [...]
  var as=cleaned.indexOf('['),ae=cleaned.lastIndexOf(']');
  if(as!==-1&&ae>as){var c2=cleaned.slice(as,ae+1);try{JSON.parse(c2);return c2}catch(ex3){}}
  // \u2550\u2550\u2550 NEW v2: Th\u1eed s\u1eeda JSON b\u1ecb l\u1ed7i nh\u1ecf \u2550\u2550\u2550
  try{
    var fixed = cleaned
      .replace(/'/g, '"')  // Single quotes \u2192 double quotes
      .replace(/(\w+)\s*:/g, '"$1":')  // Unquoted keys
      .replace(/,\s*([\]}])/g, '$1');  // Trailing commas
    if(s!==-1&&e>s){
      var c3=fixed.slice(s,e+1);
      try{JSON.parse(c3);return c3}catch(ex4){}
    }
  }catch(ex5){}
  return cleaned;
}

// \u2550\u2550\u2550 FIX v2: validateQuizData \u2014 Th\u00eam validation chi ti\u1ebft h\u01a1n \u2550\u2550\u2550
function validateQuizData(data){
  if(!data||!data.questions||!Array.isArray(data.questions)||!data.questions.length)
    throw new Error('AI kh\u00f4ng tr\u1ea3 v\u1ec1 c\u00e2u h\u1ecfi h\u1ee3p l\u1ec7. Th\u1eed l\u1ea1i.');
  data.questions=data.questions.map((q,i)=>{
    if(!q.question)throw new Error(`C\u00e2u ${i+1} thi\u1ebfu n\u1ed9i dung`);
    if(!Array.isArray(q.options)||q.options.length<2)throw new Error(`C\u00e2u ${i+1} thi\u1ebfu \u0111\u00e1p \u00e1n`);
    // \u2550\u2550\u2550 FIX v2: \u0110\u1ea3m b\u1ea3o lu\u00f4n c\u00f3 4 \u0111\u00e1p \u00e1n \u2550\u2550\u2550
    while(q.options.length < 4) q.options.push('(Kh\u00f4ng c\u00f3 \u0111\u00e1p \u00e1n)');
    if(q.options.length > 4) q.options = q.options.slice(0,4);
    if(typeof q.correct!=='number'||q.correct<0||q.correct>=q.options.length)q.correct=0;
    if(!q.icon)q.icon='\u2753'; if(!q.explanation)q.explanation='';
    q.id=q.id||(i+1);
    // \u2550\u2550\u2550 NEW v2: Sanitize HTML entities trong question/options \u2550\u2550\u2550
    q.question = q.question.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    q.options = q.options.map(o => typeof o === 'string' ? o : String(o));
    return q;
  });
  return data;
}

// \u2550\u2550\u2550 NEW v2: validateFlashData \u2014 Ki\u1ec3m tra flashcard data \u2550\u2550\u2550
function validateFlashData(data){
  if(!data||!data.cards||!Array.isArray(data.cards)||!data.cards.length)
    throw new Error('AI kh\u00f4ng tr\u1ea3 v\u1ec1 flashcard h\u1ee3p l\u1ec7. Th\u1eed l\u1ea1i.');
  data.cards=data.cards.map((c,i)=>{
    if(!c.front) throw new Error(`Th\u1ebb ${i+1} thi\u1ebfu m\u1eb7t tr\u01b0\u1edbc`);
    if(!c.back) throw new Error(`Th\u1ebb ${i+1} thi\u1ebfu m\u1eb7t sau`);
    c.id = c.id || (i+1);
    c.icon = c.icon || '\ud83d\udcdd';
    c.frontSub = c.frontSub || '';
    c.backSub = c.backSub || '';
    c.hint = c.hint || '';
    return c;
  });
  return data;
}

// \u2550\u2550\u2550 NEW v2: mergeChunkedQuizData \u2014 G\u1ed9p k\u1ebft qu\u1ea3 batch quiz \u2550\u2550\u2550
function mergeChunkedQuizData(chunks, title){
  var allQuestions = [];
  for(var i=0; i<chunks.length; i++){
    try{
      var parsed = JSON.parse(extractJSON(chunks[i].raw));
      var validated = validateQuizData(parsed);
      allQuestions = allQuestions.concat(validated.questions);
    }catch(e){
      console.warn('Chunk '+i+' parse error:', e.message);
    }
  }
  if(!allQuestions.length) throw new Error('Kh\u00f4ng parse \u0111\u01b0\u1ee3c c\u00e2u h\u1ecfi t\u1eeb b\u1ea5t k\u1ef3 batch n\u00e0o.');
  // Reindex IDs
  allQuestions.forEach((q,idx) => { q.id = idx+1; });
  return { title: title || 'B\u00e0i tr\u1eafc nghi\u1ec7m', questions: allQuestions };
}

// \u2550\u2550\u2550 NEW v2: mergeChunkedFlashData \u2014 G\u1ed9p k\u1ebft qu\u1ea3 batch flashcard \u2550\u2550\u2550
function mergeChunkedFlashData(chunks, title){
  var allCards = [];
  for(var i=0; i<chunks.length; i++){
    try{
      var parsed = JSON.parse(extractJSON(chunks[i].raw));
      var validated = validateFlashData(parsed);
      allCards = allCards.concat(validated.cards);
    }catch(e){
      console.warn('Chunk '+i+' parse error:', e.message);
    }
  }
  if(!allCards.length) throw new Error('Kh\u00f4ng parse \u0111\u01b0\u1ee3c flashcard t\u1eeb b\u1ea5t k\u1ef3 batch n\u00e0o.');
  allCards.forEach((c,idx) => { c.id = idx+1; });
  return { title: title || 'Flashcard', cards: allCards };
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550