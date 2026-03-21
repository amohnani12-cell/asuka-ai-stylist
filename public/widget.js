/**
 * AI Asuka Stylist Widget v3
 * Voice, image upload, markdown, design images, discounts, Design Studio link
 */
(function () {
  "use strict";
  const API = document.currentScript?.src ? new URL(document.currentScript.src).origin : "https://asuka-ai-stylist.vercel.app";
  const B="#8B654D",BL="rgba(139,101,77,0.12)",CR="#F5F0E8",CD="#EDE6DA",CK="#E5DCCD",TD="#3A2A1D",TM="rgba(139,101,77,0.7)",TL="rgba(139,101,77,0.45)",W="#FFFDF9";
  const SP=["Wedding outfit ideas","Cocktail party look","Kurta sets for festive","Formal suits"];
  const DP=["Black kurta bundi for a Kashmir cocktail","Ivory sherwani with gold dori work","Modern bandhgala for a Goa sangeet"];

  let S={open:false,mode:"style",messages:[],input:"",loading:false,history:[],uploaded:null,recording:false};
  const host=document.createElement("div");host.id="asuka-ai-stylist";document.body.appendChild(host);
  const shadow=host.attachShadow({mode:"open"});

  function md(t){if(!t)return"";return esc(t).replace(/\*\*(.+?)\*\*/g,`<strong style="font-weight:600;color:${TD}">$1</strong>`).replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\n/g,"<br>");}
  function esc(s){return s?s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}

  async function send(text){
    S.loading=true;S.messages.push({role:"user",text});S.history.push({role:"user",text});render();
    try{
      const r=await fetch(`${API}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:S.history,mode:S.mode})});
      const d=await r.json();
      const m={role:"bot",text:d.reply,products:d.products||[],design:d.design||null,stores:d.stores||null};
      S.messages.push(m);S.history.push({role:"bot",text:d.reply,content:d.reply});
    }catch(e){S.messages.push({role:"bot",text:"I'm having trouble connecting. Please try again."});}
    S.loading=false;S.uploaded=null;render();scroll();
  }
  function scroll(){requestAnimationFrame(()=>{const m=shadow.querySelector(".msgs");if(m)m.scrollTop=m.scrollHeight;});}
  function sw(m){S.mode=m;S.messages=[];S.history=[];S.uploaded=null;render();}

  function render(){
    shadow.innerHTML=`<style>${css()}</style>${S.open?panel():""}${bubble()}`;
    bindEvents();
  }

  function bubble(){
    return `<button class="bbl">${S.open
      ?`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${CR}" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
      :`<span class="bbl-a">A</span><span class="bbl-ai">AI</span><span class="bbl-dot"></span>`
    }</button>${!S.open?`<div class="tip">Need styling help? <em>Ask Asuka AI</em></div>`:""}`;}

  function panel(){return `<div class="pnl">
    <div class="hdr">
      <div class="hdr-top">
        <div class="hdr-brand"><div class="hdr-ico">A</div><div><div class="hdr-title"><span class="ai-bdg">AI</span> Asuka Stylist</div><div class="hdr-sub"><span class="on-dot"></span> Style advisor & design creator</div></div></div>
        <button class="cls">&times;</button>
      </div>
      <div class="tabs">
        <button class="tab ${S.mode==="style"?"on":""}" data-m="style"><span class="tab-l">Style Me</span><span class="tab-s">Shop collection</span></button>
        <button class="tab ${S.mode==="design"?"on":""}" data-m="design"><span class="tab-l">Create Design</span><span class="tab-s">Design something new</span></button>
      </div>
    </div>
    <div class="msgs">${S.messages.length===0?welcome():S.messages.map(msg).join("")}${S.loading?typing():""}</div>
    <div class="inp-area">
      ${S.uploaded?`<div class="upload-tag">📎 ${esc(S.uploaded)} <button class="upload-rm">×</button></div>`:""}
      <div class="inp-row">
        <button class="inp-btn upload-btn" title="Upload reference image"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>
        <input type="file" class="file-inp" accept="image/*" style="display:none"/>
        <textarea class="ta" placeholder="${S.mode==="style"?"Tell me about your occasion...":"Describe your dream design..."}" rows="1">${S.input}</textarea>
        <button class="inp-btn voice-btn ${S.recording?"rec":""}" title="Voice input"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
        <button class="send ${S.input.trim()?"on":""}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
      </div>
      <div class="pwr">AI Asuka Stylist · Powered by Asuka Couture</div>
    </div>
  </div>`;}

  function welcome(){
    const ico=`<div class="w-ico">A</div>`;
    if(S.mode==="style") return `<div class="w">${ico}<div class="w-t">What's the occasion?</div><p class="w-s">Tell me and I'll find perfect pieces from the Asuka collection.</p><div class="pills">${SP.map(p=>`<button class="pill" data-p="${p}">${p}</button>`).join("")}</div></div>`;
    return `<div class="w">${ico}<div class="w-t">What do you <em>envision?</em></div><p class="w-s">Describe your dream outfit — I'll create an AI-generated visual concept for you.</p><div class="cards">${DP.map(p=>`<button class="card" data-p="${p}"><span class="star">✦</span> ${p}</button>`).join("")}</div><button class="studio-link" data-studio="1">Open full Design Studio page →</button></div>`;
  }

  function msg(m){
    if(m.role==="user") return `<div class="mr mu"><div class="mb ub">${esc(m.text)}</div></div>`;
    let x="";
    if(m.products?.length){
      x+=`<div class="ps">${m.products.map(p=>`
        <a href="${p.url}" target="_blank" class="pc">
          <div class="pi">${p.image?`<img src="${p.image}" alt="${esc(p.title)}" loading="lazy"/>`:`<span class="pe">👔</span>`}
            ${p.onSale?`<span class="sale-bdg">${p.discount}% OFF</span>`:""}
          </div>
          <div class="pf">
            <div class="pn">${esc(p.title)}</div>
            <div class="pp">${p.price} ${p.compareAtPrice?`<span class="pp-old">${p.compareAtPrice}</span>`:""}</div>
            <span class="pcta">View Product →</span>
          </div>
        </a>`).join("")}</div>
        <div class="bridge">Want something unique? <button class="br-link" data-sw="design">Create a custom design ✦</button></div>`;
    }
    if(m.design){
      x+=`<div class="dc">
        <div class="dp">${m.design.image_url
          ?`<img src="${m.design.image_url}" alt="AI Design" class="di" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
            <div class="di-ph" style="display:none"><div class="di-ico">✦</div><span class="di-lbl">Generating image...</span></div>
            <div class="di-ov"><span class="di-lbl">✦ AI Generated Design</span></div>`
          :`<div class="di-ph"><div class="di-ico">✦</div><span class="di-lbl">AI Design Concept</span></div>`}
        </div>
        <div class="dd">
          <div class="dd-t">${esc(m.design.garment_type)} — ${esc(m.design.occasion)}</div>
          <div class="dd-d">${esc(m.design.color_palette)}${m.design.fabric&&m.design.fabric!=="Not specified"?` · ${esc(m.design.fabric)}`:""}${m.design.embroidery_detail&&m.design.embroidery_detail!=="Not specified"?` · ${esc(m.design.embroidery_detail)}`:""}</div>
          <div class="dd-a">
            <a href="https://asukacouture.com/pages/book-an-appointment" target="_blank" class="da dp">Book Consultation</a>
            <button class="da ds" data-p="I'd like to refine this design">Refine Design</button>
          </div>
        </div>
      </div>`;
    }
    if(m.stores){
      const sl=m.stores.name?[m.stores]:Object.values(m.stores);
      x+=`<div class="sc">${sl.map(s=>`<div class="si"><div class="sn">${s.name}</div><div class="sa">${s.address}</div><div class="sh">${s.hours}</div><a href="${s.maps}" target="_blank" class="sml">Get Directions →</a></div>`).join("")}</div>`;
    }
    return `<div class="mr mb"><div class="av">A</div><div class="mc"><div class="mb bb">${md(m.text)}</div>${x}</div></div>`;
  }

  function typing(){return `<div class="mr mb"><div class="av">A</div><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>`;}

  function bindEvents(){
    shadow.querySelector(".bbl")?.addEventListener("click",()=>{S.open=!S.open;if(S.open&&!S.messages.length)S.mode="style";render();if(S.open)scroll();});
    shadow.querySelector(".cls")?.addEventListener("click",()=>{S.open=false;render();});
    shadow.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>sw(t.dataset.m)));
    shadow.querySelectorAll("[data-p]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.p)));
    shadow.querySelectorAll("[data-sw]").forEach(b=>b.addEventListener("click",()=>sw(b.dataset.sw)));
    shadow.querySelector("[data-studio]")?.addEventListener("click",()=>{window.open(`${API}/studio`,"_blank");});

    const ta=shadow.querySelector(".ta");
    if(ta){ta.value=S.input;
      ta.addEventListener("input",e=>{S.input=e.target.value;e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,80)+"px";const s=shadow.querySelector(".send");if(s)s.classList.toggle("on",S.input.trim().length>0);});
      ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(S.input.trim()){send(S.input.trim());S.input="";}}});
    }
    shadow.querySelector(".send")?.addEventListener("click",()=>{if(S.input.trim()){send(S.input.trim());S.input="";}});

    // Upload
    const fi=shadow.querySelector(".file-inp");
    shadow.querySelector(".upload-btn")?.addEventListener("click",()=>fi?.click());
    fi?.addEventListener("change",e=>{if(e.target.files?.[0]){S.uploaded=e.target.files[0].name;render();}});
    shadow.querySelector(".upload-rm")?.addEventListener("click",()=>{S.uploaded=null;render();});

    // Voice
    shadow.querySelector(".voice-btn")?.addEventListener("click",()=>{
      if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){alert("Voice not supported in this browser");return;}
      if(S.recording){S.recording=false;render();return;}
      const R=new(window.SpeechRecognition||window.webkitSpeechRecognition)();
      R.lang="en-IN";R.continuous=false;R.interimResults=false;
      R.onresult=e=>{const t=e.results[0][0].transcript;S.input=t;S.recording=false;render();};
      R.onerror=()=>{S.recording=false;render();};
      R.onend=()=>{S.recording=false;render();};
      R.start();S.recording=true;render();
    });
  }

  function css(){return `
:host{all:initial;font-family:'Outfit',-apple-system,sans-serif}
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.bbl{position:fixed;bottom:24px;right:24px;z-index:2147483647;width:58px;height:58px;border-radius:50%;background:${B};border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(139,101,77,0.35);transition:transform .2s}
.bbl:hover{transform:scale(1.05)}.bbl:active{transform:scale(.95)}
.bbl-a{font-family:'Playfair Display',serif;font-size:18px;color:${CR};font-weight:600;line-height:1}
.bbl-ai{font-size:6px;color:rgba(245,240,232,.6);letter-spacing:1px;font-weight:600}
.bbl-dot{position:absolute;top:-1px;right:-1px;width:14px;height:14px;border-radius:50%;background:#c0392b;border:2.5px solid #fff}
.tip{position:fixed;bottom:90px;right:24px;z-index:2147483646;background:#fff;border:1px solid ${CK};border-radius:10px;padding:10px 14px;box-shadow:0 2px 12px rgba(139,101,77,.1);font-size:12px;color:${TD};font-weight:500;white-space:nowrap;animation:fu .4s ease 2s both}
.tip em{font-family:'Playfair Display',serif;color:${B};font-style:italic}
.tip::after{content:'';position:absolute;bottom:-6px;right:24px;width:12px;height:12px;background:#fff;border:1px solid ${CK};border-top:none;border-left:none;transform:rotate(45deg)}
.pnl{position:fixed;bottom:94px;right:24px;z-index:2147483647;width:400px;max-width:calc(100vw - 32px);height:620px;max-height:78vh;background:${W};border-radius:18px;border:1px solid ${CK};box-shadow:0 8px 40px rgba(139,101,77,.14);display:flex;flex-direction:column;overflow:hidden;animation:si .3s cubic-bezier(.22,1,.36,1)}
.hdr{padding:16px 18px 14px;border-bottom:1px solid ${CK};background:linear-gradient(180deg,rgba(139,101,77,.04),transparent)}
.hdr-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.hdr-brand{display:flex;align-items:center;gap:10px}
.hdr-ico{width:36px;height:36px;border-radius:10px;background:${B};display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:16px;color:${CR};font-weight:600}
.hdr-title{font-size:14.5px;color:${TD};font-weight:600;display:flex;align-items:center;gap:7px}
.ai-bdg{font-size:8.5px;background:${B};color:${CR};padding:2px 6px;border-radius:4px;font-weight:700;letter-spacing:1px}
.hdr-sub{font-size:10px;color:${TL};margin-top:1px;display:flex;align-items:center;gap:4px}
.on-dot{width:5px;height:5px;border-radius:50%;background:#5a9a5a}
.cls{background:none;border:none;cursor:pointer;color:${TL};font-size:22px;line-height:1}
.tabs{display:flex;background:${CD};border-radius:9px;padding:3px}
.tab{flex:1;background:transparent;border:1px solid transparent;border-radius:7px;padding:8px 6px;cursor:pointer;text-align:center;transition:.25s}
.tab.on{background:${W};border-color:${CK};box-shadow:0 1px 3px rgba(139,101,77,.06)}
.tab-l{display:block;font-size:12px;color:${TM};font-weight:400}.tab.on .tab-l{color:${TD};font-weight:600}
.tab-s{display:block;font-size:9px;color:${TL};margin-top:1px}
.msgs{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px}
.msgs::-webkit-scrollbar{width:3px}.msgs::-webkit-scrollbar-thumb{background:rgba(139,101,77,.1);border-radius:3px}
.w{text-align:center;padding:8px 4px}
.w-ico{width:46px;height:46px;border-radius:12px;background:${BL};border:1.5px solid rgba(139,101,77,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-family:'Playfair Display',serif;font-size:20px;color:${B};font-weight:600}
.w-t{font-family:'Playfair Display',serif;font-size:17px;color:${TD};margin-bottom:6px}.w-t em{color:${B}}
.w-s{font-size:12px;color:${TM};line-height:1.6;font-weight:300;max-width:260px;margin:0 auto 16px}
.pills{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}
.pill{background:${CR};border:1px solid ${CK};border-radius:18px;padding:7px 14px;font-size:11.5px;color:${B};font-weight:500;cursor:pointer;font-family:'Outfit',sans-serif;transition:.2s}
.pill:hover{border-color:${B};background:${BL}}
.cards{display:flex;flex-direction:column;gap:7px}
.card{background:${CR};border:1px solid ${CK};border-radius:10px;padding:10px 12px;font-size:11.5px;color:${TD};cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px;font-family:'Outfit',sans-serif;transition:.2s}
.card:hover{border-color:${B}}.star{color:${B};font-weight:600}
.studio-link{margin-top:14px;background:none;border:none;font-size:11px;color:${B};cursor:pointer;text-decoration:underline;font-family:'Outfit',sans-serif;font-weight:500}
.mr{display:flex;animation:fu .3s ease}.mu{justify-content:flex-end}.mb{justify-content:flex-start}
.av{width:24px;height:24px;border-radius:7px;background:${B};display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:11px;color:${CR};font-weight:600;flex-shrink:0;margin-right:7px;margin-top:2px}
.mc{max-width:85%}
.mb.ub,.mb.bb{padding:10px 14px;font-size:13px;line-height:1.6;font-weight:300}
.ub{background:${B};color:${CR};border-radius:14px 14px 4px 14px;max-width:78%}
.bb{background:${CR};color:${TD};border-radius:14px 14px 14px 4px}
.ps{display:flex;gap:9px;overflow-x:auto;padding:8px 0 6px;margin-top:8px}.ps::-webkit-scrollbar{height:3px}.ps::-webkit-scrollbar-thumb{background:rgba(139,101,77,.1);border-radius:3px}
.pc{min-width:148px;background:${CR};border-radius:11px;border:1px solid ${CK};overflow:hidden;cursor:pointer;flex-shrink:0;text-decoration:none;color:inherit;transition:.2s}
.pc:hover{border-color:${B};transform:translateY(-2px);box-shadow:0 4px 12px rgba(139,101,77,.08)}
.pi{height:120px;background:${CD};display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.pi img{width:100%;height:100%;object-fit:cover}.pe{font-size:28px}
.sale-bdg{position:absolute;top:6px;left:6px;background:#c0392b;color:#fff;font-size:9px;letter-spacing:.5px;padding:3px 7px;border-radius:4px;font-weight:700}
.pf{padding:9px 10px}
.pn{font-size:11px;font-weight:500;color:${TD};margin-bottom:3px;line-height:1.35}
.pp{font-size:12px;font-weight:600;color:${B}}
.pp-old{font-size:10px;color:${TL};text-decoration:line-through;margin-left:4px;font-weight:400}
.pcta{display:inline-block;margin-top:6px;font-size:10px;color:${B};font-weight:600}
.bridge{margin-top:6px;font-size:11px;color:${TM}}
.br-link{background:none;border:none;color:${B};font-weight:600;cursor:pointer;font-size:11px;text-decoration:underline;padding:0;font-family:'Outfit',sans-serif}
.dc{margin-top:8px;background:${W};border:1px solid ${CK};border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(139,101,77,.06)}
.dp{position:relative;min-height:200px;background:linear-gradient(135deg,${CD},rgba(139,101,77,.08));display:flex;align-items:center;justify-content:center;overflow:hidden}
.di{width:100%;height:280px;object-fit:cover;display:block;animation:fi .8s ease}
.di-ov{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(14,13,11,.65));padding:16px 12px 10px;text-align:center}
.di-ph{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;width:100%}
.di-ico{width:56px;height:56px;border-radius:50%;background:rgba(139,101,77,.12);border:1.5px solid rgba(139,101,77,.2);display:flex;align-items:center;justify-content:center;font-size:22px;color:${B};animation:pulse 2s infinite}
.di-lbl{font-size:9px;color:${CR};letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-top:6px}
.dd{padding:12px 14px}
.dd-t{font-size:13px;font-weight:600;color:${TD};margin-bottom:4px;text-transform:capitalize}
.dd-d{font-size:11px;color:${TM};line-height:1.6;margin-bottom:10px;text-transform:capitalize}
.dd-a{display:flex;gap:7px}
.da{flex:1;border-radius:7px;padding:9px;font-size:10.5px;font-weight:600;cursor:pointer;text-align:center;text-decoration:none;font-family:'Outfit',sans-serif;transition:.2s}
.dp{background:${B};color:${CR};border:none}.dp:hover{background:#6B4A35}
.ds{background:none;color:${B};border:1px solid rgba(139,101,77,.25)}.ds:hover{background:${BL}}
.sc{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.si{background:${CR};border:1px solid ${CK};border-radius:10px;padding:12px 14px}
.sn{font-size:12px;font-weight:600;color:${TD};margin-bottom:4px}
.sa{font-size:11px;color:${TM};line-height:1.5;margin-bottom:2px}
.sh{font-size:10px;color:${TL};margin-bottom:6px}
.sml{font-size:11px;color:${B};font-weight:600;text-decoration:none}
.dots{background:${CR};border-radius:14px;padding:12px 18px;display:flex;gap:4px;align-items:center}
.dot{width:6px;height:6px;border-radius:50%;background:${B};opacity:.35;animation:td 1.2s infinite}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
.inp-area{padding:10px 14px 12px;border-top:1px solid ${CK}}
.upload-tag{display:inline-flex;align-items:center;gap:4px;background:${BL};border-radius:6px;padding:3px 10px;font-size:10px;color:${B};margin-bottom:6px;font-family:'Outfit',sans-serif}
.upload-rm{background:none;border:none;color:${B};cursor:pointer;font-size:13px;padding:0 0 0 4px}
.inp-row{display:flex;align-items:flex-end;gap:6px;background:${CR};border:1px solid ${CK};border-radius:11px;padding:7px 8px}
.inp-btn{background:none;border:none;cursor:pointer;color:${TL};padding:4px;flex-shrink:0;border-radius:6px;transition:.2s;display:flex;align-items:center;justify-content:center}
.inp-btn:hover{color:${B};background:${BL}}
.voice-btn.rec{color:${B};background:${BL};animation:pulse 1.5s infinite}
.ta{flex:1;background:none;border:none;outline:none;color:${TD};font-family:'Outfit',sans-serif;font-size:13px;resize:none;line-height:1.5;min-height:28px;max-height:72px}
.ta::placeholder{color:rgba(139,101,77,.35)}
.send{background:${BL};border:none;border-radius:7px;width:32px;height:32px;cursor:default;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.3s;color:${TL}}
.send.on{background:${B};color:${CR};cursor:pointer}
.pwr{text-align:center;margin-top:6px;font-size:9px;color:${TL};letter-spacing:.3px}
@keyframes si{from{opacity:0;transform:scale(.93) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes td{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@media(max-width:480px){.pnl{bottom:0;right:0;left:0;width:100%;height:100vh;max-height:100vh;border-radius:0}.bbl{bottom:16px;right:16px}.tip{display:none}}
`;}

  render();
})();
