/**
 * AI Asuka Stylist Widget v4
 * Chat/Form toggle, image loading, voice, upload, discounts, Design Studio
 */
(function(){
"use strict";
const API=document.currentScript?.src?new URL(document.currentScript.src).origin:"https://asuka-ai-stylist.vercel.app";
const STORE="https://asukacouture.com";
const B="#8B654D",BL="rgba(139,101,77,0.12)",CR="#F5F0E8",CD="#EDE6DA",CK="#E5DCCD",TD="#3A2A1D",TM="rgba(139,101,77,0.7)",TL="rgba(139,101,77,0.45)",W="#FFFDF9";
const SP=["Wedding outfit ideas","Cocktail party look","Kurta sets for festive","Any ongoing sales?"];
const DP=["Black kurta bundi for a Kashmir cocktail","Ivory sherwani with gold dori for baraat","Modern bandhgala for a Goa sangeet"];

let S={open:false,mode:"style",designMode:"chat",messages:[],input:"",loading:false,history:[],uploaded:null,recording:false,form:{occasion:"",garment:"",color:"",fabric:"",embroidery:"",details:""}};
const host=document.createElement("div");host.id="asuka-ai-stylist";document.body.appendChild(host);
const shadow=host.attachShadow({mode:"open"});

function md(t){if(!t)return"";return esc(t).replace(/\*\*(.+?)\*\*/g,`<strong style="font-weight:600;color:${TD}">$1</strong>`).replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\n/g,"<br>");}
function esc(s){return s?s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}

async function send(text){
  S.loading=true;S.messages.push({role:"user",text});S.history.push({role:"user",text});render();
  try{
    const r=await fetch(`${API}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:S.history,mode:S.mode})});
    const d=await r.json();
    S.messages.push({role:"bot",text:d.reply,products:d.products||[],design:d.design||null,stores:d.stores||null});
    S.history.push({role:"bot",text:d.reply,content:d.reply});
  }catch(e){S.messages.push({role:"bot",text:"I'm having trouble connecting. Please try again."});}
  S.loading=false;S.uploaded=null;render();scr();
}

function sendForm(){
  const f=S.form;
  const text=`I want a ${f.garment||"outfit"} for a ${f.occasion||"special occasion"}. Color: ${f.color||"your suggestion"}. Fabric: ${f.fabric||"your choice"}. ${f.embroidery?"Embroidery: "+f.embroidery+". ":""}${f.details||""}`.trim();
  S.designMode="chat";
  send(text);
}

function scr(){requestAnimationFrame(()=>{const m=shadow.querySelector(".msgs");if(m)m.scrollTop=m.scrollHeight;});}
function sw(m){S.mode=m;S.messages=[];S.history=[];S.uploaded=null;S.designMode="chat";render();}

function render(){shadow.innerHTML=`<style>${css()}</style>${S.open?panel():""}${bubble()}`;bindEvents();}

function bubble(){return `<button class="bbl">${S.open?`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${CR}" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`:`<span class="ba">A</span><span class="bai">AI</span><span class="bd"></span>`}</button>${!S.open?`<div class="tip">Need styling help? <em>Ask Asuka AI</em></div>`:""}`;}

function panel(){return `<div class="pnl">
<div class="hdr">
  <div class="ht"><div class="hb"><div class="hi">A</div><div><div class="htl"><span class="ab">AI</span> Asuka Stylist</div><div class="hs"><span class="od"></span> Style advisor & design creator</div></div></div><button class="cls">&times;</button></div>
  <div class="tabs"><button class="tab ${S.mode==="style"?"on":""}" data-m="style"><span class="tl">Style Me</span><span class="ts">Shop collection</span></button><button class="tab ${S.mode==="design"?"on":""}" data-m="design"><span class="tl">Create Design</span><span class="ts">Design something new</span></button></div>
</div>
<div class="msgs">${S.messages.length===0?welcome():S.messages.map(msg).join("")}${S.loading?typing():""}</div>
<div class="ia">
  ${S.uploaded?`<div class="ut">📎 ${esc(S.uploaded)} <button class="ur">×</button></div>`:""}
  <div class="ir">
    <button class="ib ub-btn" title="Upload image"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>
    <input type="file" class="fi" accept="image/*" style="display:none"/>
    <textarea class="ta" placeholder="${S.mode==="style"?"Tell me about your occasion...":"Describe your dream design..."}" rows="1">${S.input}</textarea>
    <button class="ib vb ${S.recording?"rec":""}" title="Voice input"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
    <button class="sn ${S.input.trim()?"on":""}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
  </div>
  <div class="pw">AI Asuka Stylist · Powered by Asuka Couture</div>
</div></div>`;}

function welcome(){
  const ic=`<div class="wi">A</div>`;
  if(S.mode==="style") return `<div class="w">${ic}<div class="wt">What's the occasion?</div><p class="ws">Tell me and I'll find perfect pieces from the Asuka collection.</p><div class="pls">${SP.map(p=>`<button class="pl" data-p="${p}">${p}</button>`).join("")}</div></div>`;
  
  // Design mode with chat/form toggle
  return `<div class="w">${ic}
    <div class="wt">What do you <em>envision?</em></div>
    <p class="ws">Describe your dream outfit or fill out a brief — I'll create an AI-generated design.</p>
    <div class="dm-tabs">
      <button class="dm-tab ${S.designMode==="chat"?"on":""}" data-dm="chat">💬 Chat it</button>
      <button class="dm-tab ${S.designMode==="form"?"on":""}" data-dm="form">📋 Fill a brief</button>
    </div>
    ${S.designMode==="chat"?`
      <div class="cds">${DP.map(p=>`<button class="cd" data-p="${p}"><span class="st">✦</span> ${p}</button>`).join("")}</div>
    `:`
      <div class="frm">
        <div class="fg"><label class="fl">Occasion</label><select class="fs" data-f="occasion"><option value="">Select...</option><option>Wedding</option><option>Sangeet / Mehendi</option><option>Cocktail / Reception</option><option>Festive / Puja</option><option>Formal Event</option><option>Casual</option></select></div>
        <div class="fg"><label class="fl">Garment Type</label><select class="fs" data-f="garment"><option value="">Select...</option><option>Sherwani</option><option>Kurta Bundi Set</option><option>Kurta Set</option><option>Bandhgala</option><option>Tuxedo</option><option>Suit Set</option><option>Co-ord Set</option><option>Indo-Western</option></select></div>
        <div class="fg"><label class="fl">Color Palette</label><input class="fx" data-f="color" placeholder="e.g. Black with gold, Ivory, Maroon..."/></div>
        <div class="fg"><label class="fl">Fabric</label><select class="fs" data-f="fabric"><option value="">Select...</option><option>Silk</option><option>Velvet</option><option>Linen</option><option>Brocade</option><option>Cotton</option><option>Wool</option></select></div>
        <div class="fg"><label class="fl">Embroidery / Detail</label><input class="fx" data-f="embroidery" placeholder="e.g. Dori, Zardozi, Mirror, Minimal..."/></div>
        <div class="fg"><label class="fl">Additional Details</label><input class="fx" data-f="details" placeholder="Weather, personal style, references..."/></div>
        <button class="fb">Generate Design ✦</button>
      </div>
    `}
    <button class="sl">Open full Design Studio page →</button>
  </div>`;
}

function msg(m){
  if(m.role==="user") return `<div class="mr mu"><div class="mb ub">${esc(m.text)}</div></div>`;
  let x="";
  if(m.products?.length){
    x+=`<div class="ps">${m.products.map(p=>`<a href="${p.url}" target="_blank" class="pc"><div class="pi">${p.image?`<img src="${p.image}" alt="${esc(p.title)}" loading="lazy"/>`:`<span class="pe">👔</span>`}${p.onSale?`<span class="sb">${p.discount}% OFF</span>`:""}</div><div class="pf"><div class="pn">${esc(p.title)}</div><div class="pp">${p.price}${p.compareAtPrice?` <span class="po">${p.compareAtPrice}</span>`:""}</div><span class="ct">View Product →</span></div></a>`).join("")}</div><div class="br">Want something unique? <button class="bl" data-sw="design">Create a custom design ✦</button></div>`;
  }
  if(m.design){
    const imgId="di-"+Math.random().toString(36).substr(2,6);
    x+=`<div class="dc">
      <div class="dp">
        <div class="dl" id="load-${imgId}"><div class="di-spin"></div><span class="dl-t">Generating your design...</span></div>
        ${m.design.image_url?`<img src="${m.design.image_url}" alt="AI Design" class="dim" id="${imgId}" loading="eager" onload="this.style.display='block';document.getElementById('load-${imgId}').style.display='none'" onerror="document.getElementById('load-${imgId}').querySelector('.dl-t').textContent='Image is rendering — may take 15-30s. Refresh to check.'" style="display:none"/>`:""}
        <div class="dov"><span class="dlb">✦ AI Generated Design</span></div>
      </div>
      <div class="dd"><div class="ddt">${esc(m.design.garment_type)} — ${esc(m.design.occasion)}</div><div class="ddd">${esc(m.design.color_palette)}${m.design.fabric&&m.design.fabric!=="Not specified"?` · ${esc(m.design.fabric)}`:""}${m.design.embroidery_detail&&m.design.embroidery_detail!=="Not specified"?` · ${esc(m.design.embroidery_detail)}`:""}</div>
      <div class="dda"><a href="${STORE}/pages/book-an-appointment" target="_blank" class="da dap">Book Consultation</a><button class="da das" data-p="Refine this design — I want to adjust it">Refine Design</button></div></div>
    </div>`;
  }
  if(m.stores){const sl=m.stores.name?[m.stores]:Object.values(m.stores);x+=`<div class="sc">${sl.map(s=>`<div class="si"><div class="sn">${s.name}</div><div class="sa">${s.address}</div><div class="sh">${s.hours}</div><a href="${s.maps}" target="_blank" class="sm">Get Directions →</a></div>`).join("")}</div>`;}
  return `<div class="mr mb-r"><div class="av">A</div><div class="mc"><div class="mb bb">${md(m.text)}</div>${x}</div></div>`;
}

function typing(){return `<div class="mr mb-r"><div class="av">A</div><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>`;}

function bindEvents(){
  shadow.querySelector(".bbl")?.addEventListener("click",()=>{S.open=!S.open;if(S.open&&!S.messages.length)S.mode="style";render();if(S.open)scr();});
  shadow.querySelector(".cls")?.addEventListener("click",()=>{S.open=false;render();});
  shadow.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>sw(t.dataset.m)));
  shadow.querySelectorAll("[data-p]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.p)));
  shadow.querySelectorAll("[data-sw]").forEach(b=>b.addEventListener("click",()=>sw(b.dataset.sw)));
  shadow.querySelector(".sl")?.addEventListener("click",()=>window.open(`${STORE}/pages/design-studio`,"_blank"));

  // Design mode chat/form toggle
  shadow.querySelectorAll("[data-dm]").forEach(b=>b.addEventListener("click",()=>{S.designMode=b.dataset.dm;render();}));

  // Form fields
  shadow.querySelectorAll("[data-f]").forEach(el=>{
    const key=el.dataset.f;
    if(el.tagName==="SELECT") el.value=S.form[key]||"";
    else el.value=S.form[key]||"";
    el.addEventListener("change",e=>{S.form[key]=e.target.value;});
    el.addEventListener("input",e=>{S.form[key]=e.target.value;});
  });
  shadow.querySelector(".fb")?.addEventListener("click",()=>sendForm());

  const ta=shadow.querySelector(".ta");
  if(ta){ta.value=S.input;
    ta.addEventListener("input",e=>{S.input=e.target.value;e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,80)+"px";const s=shadow.querySelector(".sn");if(s)s.classList.toggle("on",S.input.trim().length>0);});
    ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(S.input.trim()){send(S.input.trim());S.input="";}}});
  }
  shadow.querySelector(".sn")?.addEventListener("click",()=>{if(S.input.trim()){send(S.input.trim());S.input="";}});

  const fi=shadow.querySelector(".fi");
  shadow.querySelector(".ub-btn")?.addEventListener("click",()=>fi?.click());
  fi?.addEventListener("change",e=>{if(e.target.files?.[0]){S.uploaded=e.target.files[0].name;render();}});
  shadow.querySelector(".ur")?.addEventListener("click",()=>{S.uploaded=null;render();});

  shadow.querySelector(".vb")?.addEventListener("click",()=>{
    if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){alert("Voice not supported");return;}
    if(S.recording){S.recording=false;render();return;}
    const R=new(window.SpeechRecognition||window.webkitSpeechRecognition)();
    R.lang="en-IN";R.continuous=false;R.interimResults=false;
    R.onresult=e=>{S.input=e.results[0][0].transcript;S.recording=false;render();};
    R.onerror=()=>{S.recording=false;render();};
    R.onend=()=>{S.recording=false;render();};
    R.start();S.recording=true;render();
  });
}

function css(){return `
:host{all:initial;font-family:'Outfit',-apple-system,sans-serif}
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.bbl{position:fixed;bottom:24px;right:24px;z-index:2147483647;width:58px;height:58px;border-radius:50%;background:${B};border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(139,101,77,.35);transition:transform .2s}.bbl:hover{transform:scale(1.05)}
.ba{font-family:'Playfair Display',serif;font-size:18px;color:${CR};font-weight:600;line-height:1}.bai{font-size:6px;color:rgba(245,240,232,.6);letter-spacing:1px;font-weight:600}.bd{position:absolute;top:-1px;right:-1px;width:14px;height:14px;border-radius:50%;background:#c0392b;border:2.5px solid #fff}
.tip{position:fixed;bottom:90px;right:24px;z-index:2147483646;background:#fff;border:1px solid ${CK};border-radius:10px;padding:10px 14px;box-shadow:0 2px 12px rgba(139,101,77,.1);font-size:12px;color:${TD};font-weight:500;white-space:nowrap;animation:fu .4s ease 2s both}.tip em{font-family:'Playfair Display',serif;color:${B}}.tip::after{content:'';position:absolute;bottom:-6px;right:24px;width:12px;height:12px;background:#fff;border:1px solid ${CK};border-top:none;border-left:none;transform:rotate(45deg)}
.pnl{position:fixed;bottom:94px;right:24px;z-index:2147483647;width:400px;max-width:calc(100vw - 32px);height:620px;max-height:78vh;background:${W};border-radius:18px;border:1px solid ${CK};box-shadow:0 8px 40px rgba(139,101,77,.14);display:flex;flex-direction:column;overflow:hidden;animation:si .3s cubic-bezier(.22,1,.36,1)}
.hdr{padding:16px 18px 14px;border-bottom:1px solid ${CK};background:linear-gradient(180deg,rgba(139,101,77,.04),transparent)}
.ht{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.hb{display:flex;align-items:center;gap:10px}
.hi{width:36px;height:36px;border-radius:10px;background:${B};display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:16px;color:${CR};font-weight:600}
.htl{font-size:14.5px;color:${TD};font-weight:600;display:flex;align-items:center;gap:7px}.ab{font-size:8.5px;background:${B};color:${CR};padding:2px 6px;border-radius:4px;font-weight:700;letter-spacing:1px}
.hs{font-size:10px;color:${TL};margin-top:1px;display:flex;align-items:center;gap:4px}.od{display:inline-block;width:5px;height:5px;border-radius:50%;background:#5a9a5a}.cls{background:none;border:none;cursor:pointer;color:${TL};font-size:22px;line-height:1}
.tabs{display:flex;background:${CD};border-radius:9px;padding:3px}.tab{flex:1;background:transparent;border:1px solid transparent;border-radius:7px;padding:8px 6px;cursor:pointer;text-align:center;transition:.25s}.tab.on{background:${W};border-color:${CK};box-shadow:0 1px 3px rgba(139,101,77,.06)}
.tl{display:block;font-size:12px;color:${TM}}.tab.on .tl{color:${TD};font-weight:600}.ts{display:block;font-size:9px;color:${TL};margin-top:1px}
.msgs{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px}.msgs::-webkit-scrollbar{width:3px}.msgs::-webkit-scrollbar-thumb{background:rgba(139,101,77,.1);border-radius:3px}
.w{text-align:center;padding:8px 4px}.wi{width:46px;height:46px;border-radius:12px;background:${BL};border:1.5px solid rgba(139,101,77,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-family:'Playfair Display',serif;font-size:20px;color:${B};font-weight:600}
.wt{font-family:'Playfair Display',serif;font-size:17px;color:${TD};margin-bottom:6px}.wt em{color:${B}}.ws{font-size:12px;color:${TM};line-height:1.6;font-weight:300;max-width:280px;margin:0 auto 14px}
.pls{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}.pl{background:${CR};border:1px solid ${CK};border-radius:18px;padding:7px 14px;font-size:11.5px;color:${B};font-weight:500;cursor:pointer;font-family:'Outfit',sans-serif;transition:.2s}.pl:hover{border-color:${B};background:${BL}}
.dm-tabs{display:flex;background:${CD};border-radius:8px;padding:2px;margin-bottom:14px;gap:2px}
.dm-tab{flex:1;background:transparent;border:1px solid transparent;border-radius:6px;padding:7px 8px;cursor:pointer;font-size:11.5px;color:${TM};font-family:'Outfit',sans-serif;font-weight:400;transition:.2s}
.dm-tab.on{background:${W};border-color:${CK};font-weight:600;color:${TD};box-shadow:0 1px 3px rgba(139,101,77,.06)}
.cds{display:flex;flex-direction:column;gap:7px}.cd{background:${CR};border:1px solid ${CK};border-radius:10px;padding:10px 12px;font-size:11.5px;color:${TD};cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px;font-family:'Outfit',sans-serif;transition:.2s}.cd:hover{border-color:${B}}.st{color:${B};font-weight:600}
.frm{text-align:left;display:flex;flex-direction:column;gap:10px}
.fg{display:flex;flex-direction:column;gap:3px}
.fl{font-size:10.5px;font-weight:600;color:${TD};letter-spacing:.3px}
.fs,.fx{width:100%;padding:8px 10px;background:${CR};border:1px solid ${CK};border-radius:7px;font-size:12px;color:${TD};outline:none;font-family:'Outfit',sans-serif;appearance:none;-webkit-appearance:none}
.fs{background-image:url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%238B654D' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center}
.fx::placeholder{color:rgba(139,101,77,.35)}.fs:focus,.fx:focus{border-color:${B}}
.fb{width:100%;background:${B};color:${CR};border:none;border-radius:8px;padding:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;letter-spacing:.5px;margin-top:4px;transition:.2s}.fb:hover{background:#6B4A35}
.sl{margin-top:14px;background:none;border:none;font-size:11px;color:${B};cursor:pointer;text-decoration:underline;font-family:'Outfit',sans-serif;font-weight:500}
.mr{display:flex;animation:fu .3s ease}.mu{justify-content:flex-end}.mb-r{justify-content:flex-start}
.av{width:24px;height:24px;border-radius:7px;background:${B};display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:11px;color:${CR};font-weight:600;flex-shrink:0;margin-right:7px;margin-top:2px}
.mc{max-width:85%}
.mb{padding:10px 14px;font-size:13px;line-height:1.6;font-weight:300}
.ub{background:${B};color:${CR};border-radius:14px 14px 4px 14px;max-width:78%}
.bb{background:${CR};color:${TD};border-radius:14px 14px 14px 4px}
.ps{display:flex;gap:9px;overflow-x:auto;padding:8px 0 6px;margin-top:8px}.ps::-webkit-scrollbar{height:3px}.ps::-webkit-scrollbar-thumb{background:rgba(139,101,77,.1);border-radius:3px}
.pc{min-width:148px;background:${CR};border-radius:11px;border:1px solid ${CK};overflow:hidden;cursor:pointer;flex-shrink:0;text-decoration:none;color:inherit;transition:.2s}.pc:hover{border-color:${B};transform:translateY(-2px);box-shadow:0 4px 12px rgba(139,101,77,.08)}
.pi{height:120px;background:${CD};display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.pi img{width:100%;height:100%;object-fit:cover}.pe{font-size:28px}
.sb{position:absolute;top:6px;left:6px;background:#c0392b;color:#fff;font-size:9px;letter-spacing:.5px;padding:3px 7px;border-radius:4px;font-weight:700}
.pf{padding:9px 10px}.pn{font-size:11px;font-weight:500;color:${TD};margin-bottom:3px;line-height:1.35}.pp{font-size:12px;font-weight:600;color:${B}}.po{font-size:10px;color:${TL};text-decoration:line-through;margin-left:4px;font-weight:400}.ct{display:inline-block;margin-top:6px;font-size:10px;color:${B};font-weight:600}
.br{margin-top:6px;font-size:11px;color:${TM}}.bl{background:none;border:none;color:${B};font-weight:600;cursor:pointer;font-size:11px;text-decoration:underline;padding:0;font-family:'Outfit',sans-serif}
.dc{margin-top:8px;background:${W};border:1px solid ${CK};border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(139,101,77,.06)}
.dp{position:relative;min-height:220px;background:linear-gradient(135deg,${CD},rgba(139,101,77,.08));display:flex;align-items:center;justify-content:center;overflow:hidden}
.dl{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:2;background:linear-gradient(135deg,${CD},rgba(139,101,77,.06))}
.di-spin{width:40px;height:40px;border:2.5px solid rgba(139,101,77,.15);border-top-color:${B};border-radius:50%;animation:spin 1s linear infinite}
.dl-t{font-size:11px;color:${B};margin-top:10px;font-weight:500;letter-spacing:.5px}
.dim{width:100%;height:280px;object-fit:cover;display:none}
.dov{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(14,13,11,.6));padding:14px 12px 8px;text-align:center;z-index:1}
.dlb{font-size:9px;color:${CR};letter-spacing:2px;text-transform:uppercase;font-weight:600}
.dd{padding:12px 14px}.ddt{font-size:13px;font-weight:600;color:${TD};margin-bottom:4px;text-transform:capitalize}.ddd{font-size:11px;color:${TM};line-height:1.6;margin-bottom:10px;text-transform:capitalize}
.dda{display:flex;gap:7px}.da{flex:1;border-radius:7px;padding:9px;font-size:10.5px;font-weight:600;cursor:pointer;text-align:center;text-decoration:none;font-family:'Outfit',sans-serif;transition:.2s}
.dap{background:${B};color:${CR};border:none}.dap:hover{background:#6B4A35}.das{background:none;color:${B};border:1px solid rgba(139,101,77,.25)}.das:hover{background:${BL}}
.sc{display:flex;flex-direction:column;gap:8px;margin-top:8px}.si{background:${CR};border:1px solid ${CK};border-radius:10px;padding:12px 14px}.sn{font-size:12px;font-weight:600;color:${TD};margin-bottom:4px}.sa{font-size:11px;color:${TM};line-height:1.5;margin-bottom:2px}.sh{font-size:10px;color:${TL};margin-bottom:6px}.sm{font-size:11px;color:${B};font-weight:600;text-decoration:none}
.dots{background:${CR};border-radius:14px;padding:12px 18px;display:flex;gap:4px;align-items:center}.dot{width:6px;height:6px;border-radius:50%;background:${B};opacity:.35;animation:td 1.2s infinite}.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
.ia{padding:10px 14px 12px;border-top:1px solid ${CK}}
.ut{display:inline-flex;align-items:center;gap:4px;background:${BL};border-radius:6px;padding:3px 10px;font-size:10px;color:${B};margin-bottom:6px;font-family:'Outfit',sans-serif}.ur{background:none;border:none;color:${B};cursor:pointer;font-size:13px;padding:0 0 0 4px}
.ir{display:flex;align-items:flex-end;gap:6px;background:${CR};border:1px solid ${CK};border-radius:11px;padding:7px 8px}
.ib{background:none;border:none;cursor:pointer;color:${TL};padding:4px;flex-shrink:0;border-radius:6px;transition:.2s;display:flex;align-items:center;justify-content:center}.ib:hover{color:${B};background:${BL}}
.vb.rec{color:${B};background:${BL};animation:pulse 1.5s infinite}
.ta{flex:1;background:none;border:none;outline:none;color:${TD};font-family:'Outfit',sans-serif;font-size:13px;resize:none;line-height:1.5;min-height:28px;max-height:72px}.ta::placeholder{color:rgba(139,101,77,.35)}
.sn{background:${BL};border:none;border-radius:7px;width:32px;height:32px;cursor:default;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.3s;color:${TL}}.sn.on{background:${B};color:${CR};cursor:pointer}
.pw{text-align:center;margin-top:6px;font-size:9px;color:${TL};letter-spacing:.3px}
@keyframes si{from{opacity:0;transform:scale(.93) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes td{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@media(max-width:480px){.pnl{bottom:0;right:0;left:0;width:100%;height:100vh;max-height:100vh;border-radius:0}.bbl{bottom:16px;right:16px}.tip{display:none}}
`;}

render();
})();
