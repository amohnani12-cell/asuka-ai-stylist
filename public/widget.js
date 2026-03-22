/**
 * AI Asuka Stylist Widget v6
 * CLIENT-SIDE product search (fixes Shopify blocking server requests)
 * WhatsApp design sharing, chat persistence, voice, upload, mobile
 */
(function () {
  "use strict";
  const API = document.currentScript?.src ? new URL(document.currentScript.src).origin : "https://asuka-ai-stylist.vercel.app";
  const WA = "919063356542";
  const STUDIO = "https://asukacouture.com/pages/design-studio";
  const B="#8B654D",BL="rgba(139,101,77,0.12)",CR="#F5F0E8",CD="#EDE6DA",CK="#E5DCCD",TD="#3A2A1D",TM="rgba(139,101,77,0.7)",TL="rgba(139,101,77,0.45)",W="#FFFDF9";
  const SP=["Wedding outfit ideas","Cocktail party look","Kurta sets for festive","Any current offers?"];
  const DP=["Black kurta bundi for a Kashmir cocktail","Ivory sherwani with gold dori work","Modern bandhgala for a Goa sangeet"];

  let S = loadState();
  function loadState() {
    try { const s = localStorage.getItem("asuka_chat"); if (s) { const p = JSON.parse(s); p.open=false;p.loading=false;p.recording=false;p.uploaded=null; return p; } } catch(e) {}
    return {open:false,mode:"style",messages:[],input:"",loading:false,history:[],uploaded:null,recording:false};
  }
  function saveState() { try { localStorage.setItem("asuka_chat", JSON.stringify({mode:S.mode,messages:S.messages.slice(-40),history:S.history.slice(-40)})); } catch(e) {} }

  const host=document.createElement("div");host.id="asuka-ai-stylist";document.body.appendChild(host);
  const shadow=host.attachShadow({mode:"open"});

  function md(t){if(!t)return"";return esc(t).replace(/\*\*(.+?)\*\*/g,`<strong style="font-weight:600;color:${TD}">$1</strong>`).replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\n/g,"<br>")}
  function esc(s){return s?s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}

  /* ─── CLIENT-SIDE PRODUCT SEARCH WITH SMART FALLBACKS ─── */
  const GARMENTS = ["sherwani","kurta bundi","kurta set","kurta","bandhgala","indo western","indo-western","tuxedo","suit","blazer","shirt","co-ord","co ord","jacket","stole","juttis","shoes"];
  const STOP = ["show","me","for","a","the","in","with","and","or","any","some","options","ideas","want","need","looking","please","can","you","find","get","have","best","good","nice","i","my","would","like","outfit","wear","something","dress"];

  async function doSearch(q, limit) {
    try {
      const r = await fetch(`/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=${limit}&resources[options][unavailable_products]=hide`);
      if (!r.ok) return [];
      const d = await r.json();
      return (d.resources?.results?.products || []).map(p => {
        const pr = parseFloat(p.price), cp = parseFloat(p.compare_at_price_max||p.compare_at_price||0), sale = cp>0&&cp>pr;
        return { title:p.title, handle:p.handle, price:`₹${pr.toLocaleString("en-IN")}`, priceRaw:pr, onSale:sale, discount:sale?Math.round(((cp-pr)/cp)*100):0, compareAtPrice:sale?`₹${cp.toLocaleString("en-IN")}`:null, image:p.image||p.featured_image?.url||null, url:`/products/${p.handle}` };
      });
    } catch(e) { return []; }
  }

  async function searchProductsLocal(query, limit) {
    limit = limit || 4;
    const q = query.toLowerCase().replace(/[?!.,]/g,"").trim();

    // Extract garment type from query
    let garment = "";
    for (const g of GARMENTS) { if (q.includes(g)) { garment = g; break; } }

    // Extract meaningful words (remove stop words)
    const meaningful = q.split(/\s+/).filter(w => w.length > 2 && !STOP.includes(w));

    // Strategy 1: Full meaningful query
    let results = await doSearch(meaningful.join(" "), limit);
    if (results.length) return results;

    // Strategy 2: Just garment type + color/fabric words
    if (garment) {
      const extras = meaningful.filter(w => w !== garment && !garment.includes(w));
      if (extras.length) {
        results = await doSearch(garment + " " + extras[0], limit);
        if (results.length) return results;
      }
      // Strategy 3: Just garment type alone
      results = await doSearch(garment, limit);
      if (results.length) return results;
    }

    // Strategy 4: Try each meaningful word individually
    for (const w of meaningful) {
      if (w.length > 3) {
        results = await doSearch(w, limit);
        if (results.length) return results;
      }
    }

    return [];
  }

  function waLink(d) {
    const m = `Hi Asuka! I designed this using AI Stylist:\n\n🎨 *${d.garment_type||"Custom Design"}* for *${d.occasion||"Special Occasion"}*\n🎨 Color: ${d.color_palette||"TBD"}\n${d.fabric&&d.fabric!=="Not specified"?"🧵 Fabric: "+d.fabric+"\n":""}${d.image_url?"📸 Design: "+d.image_url+"\n":""}\nI'd love to get this made!`;
    return `https://wa.me/${WA}?text=${encodeURIComponent(m)}`;
  }

  async function send(text) {
    S.loading=true; S.messages.push({role:"user",text}); S.history.push({role:"user",text}); S.input=""; render();

    // If style mode: search products from browser FIRST
    let localProducts = [];
    if (S.mode === "style") {
      const words = text.replace(/[?!.,]/g,"").trim();
      localProducts = await searchProductsLocal(words, 4);
    }

    try {
      const r = await fetch(`${API}/api/chat`, {method:"POST",headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages: S.history,
          mode: S.mode,
          clientProducts: localProducts.length ? localProducts : null
        })
      });
      const d = await r.json();
      // Use server products if available, otherwise use client-side products
      const products = (d.products && d.products.length) ? d.products : localProducts;
      const m = {role:"bot",text:d.reply,products:products,design:d.design||null,stores:d.stores||null};
      S.messages.push(m); S.history.push({role:"bot",text:d.reply,content:d.reply});
    } catch(e) {
      // Even if API fails, show products if we found them
      const fallbackText = localProducts.length
        ? "I found some pieces that might interest you! Take a look:"
        : "I'm having trouble connecting. Please try again.";
      S.messages.push({role:"bot",text:fallbackText,products:localProducts});
    }
    S.loading=false; S.uploaded=null; saveState(); render(); scroll();
  }

  function scroll(){requestAnimationFrame(()=>{const m=shadow.querySelector(".msgs");if(m)m.scrollTop=m.scrollHeight})}
  function sw(m){S.mode=m;S.messages=[];S.history=[];S.uploaded=null;saveState();render()}
  function clearChat(){S.messages=[];S.history=[];saveState();render()}

  function render(){shadow.innerHTML=`<style>${css()}</style>${S.open?panel():""}${bubble()}`;bindEvents();if(S.open)scroll()}

  function bubble(){return `<button class="bbl">${S.open?`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${CR}" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`:`<span class="ba">A</span><span class="bai">AI</span><span class="bd"></span>`}</button>${!S.open?`<div class="tip">Need styling help? <em>Ask Asuka AI</em></div>`:""}`}

  function panel(){return `<div class="pnl">
    <div class="hdr">
      <div class="ht"><div class="hb"><div class="hi">A</div><div><div class="htl"><span class="ab">AI</span> Asuka Stylist</div><div class="hs"><span class="od"></span> Style advisor & design creator</div></div></div>
        <div style="display:flex;align-items:center;gap:4px">${S.messages.length?`<button class="clr" title="Clear chat">🗑</button>`:""}<button class="cls">&times;</button></div>
      </div>
      <div class="tabs"><button class="tab ${S.mode==="style"?"on":""}" data-m="style"><span class="tl">Style Me</span><span class="ts">Shop collection</span></button><button class="tab ${S.mode==="design"?"on":""}" data-m="design"><span class="tl">Create Design</span><span class="ts">Design something new</span></button></div>
    </div>
    <div class="msgs">${S.messages.length===0?welcome():S.messages.map(msg).join("")}${S.loading?typing():""}</div>
    <div class="ia">
      ${S.uploaded?`<div class="ut">📎 ${esc(S.uploaded)} <button class="ur">×</button></div>`:""}
      <div class="ir">
        <button class="ib ubtn" title="Upload image"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></button>
        <input type="file" class="fi" accept="image/*" style="display:none"/>
        <textarea class="ta" placeholder="${S.mode==="style"?"Tell me about your occasion...":"Describe your dream design..."}" rows="1"></textarea>
        <button class="ib vb ${S.recording?"rec":""}" title="Voice"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
        <button class="sn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
      </div>
      <div class="pw">AI Asuka Stylist · Powered by Asuka Couture</div>
    </div></div>`}

  function welcome(){
    const i=`<div class="wi">A</div>`;
    if(S.mode==="style") return `<div class="w">${i}<div class="wt">What's the occasion?</div><p class="ws">Tell me and I'll find perfect pieces from the Asuka collection.</p><div class="pls">${SP.map(p=>`<button class="pl" data-p="${p}">${p}</button>`).join("")}</div></div>`;
    return `<div class="w">${i}<div class="wt">What do you <em>envision?</em></div><p class="ws">Describe your dream outfit — I'll create a photorealistic AI design for you.</p><div class="cds">${DP.map(p=>`<button class="cd" data-p="${p}"><span class="st">✦</span> ${p}</button>`).join("")}</div><button class="sl" data-studio="1">Open full Design Studio page →</button></div>`}

  function msg(m){
    if(m.role==="user") return `<div class="mr mu"><div class="mb ub">${esc(m.text)}</div></div>`;
    let x="";
    if(m.products?.length){
      x+=`<div class="ps">${m.products.map(p=>`<a href="${p.url}" target="_blank" rel="noopener" class="pc"><div class="pi">${p.image?`<img src="${p.image}" alt="${esc(p.title)}" loading="lazy"/>`:`<span class="pe">👔</span>`}${p.onSale?`<span class="sb">${p.discount}% OFF</span>`:""}</div><div class="pf"><div class="pn">${esc(p.title)}</div><div class="pp">${p.price}${p.compareAtPrice?` <span class="po">${p.compareAtPrice}</span>`:""}</div><span class="ct">View Product →</span></div></a>`).join("")}</div><div class="br">Want something unique? <button class="bl" data-sw="design">Create a custom design ✦</button></div>`}
    if(m.design){
      x+=`<div class="dc"><div class="dp">${m.design.image_url?`<img src="${m.design.image_url}" alt="AI Design" class="dim" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><div class="dph" style="display:none"><div class="dico">✦</div><span class="dlt">Image failed to load</span></div><div class="dov"><span class="dlb">✦ AI Generated Design</span></div>`:`<div class="dph"><div class="dico">✦</div><span class="dlt">Design Concept</span></div>`}</div><div class="dd"><div class="ddt">${esc(m.design.garment_type)} — ${esc(m.design.occasion)}</div><div class="ddd">${esc(m.design.color_palette)}${m.design.fabric&&m.design.fabric!=="Not specified"?` · ${esc(m.design.fabric)}`:""}${m.design.embroidery_detail&&m.design.embroidery_detail!=="Not specified"?` · ${esc(m.design.embroidery_detail)}`:""}</div><div class="dda"><a href="${waLink(m.design)}" target="_blank" rel="noopener" class="da daw">💬 WhatsApp This Design</a><button class="da das" data-p="I'd like to refine this design">Refine</button></div></div></div>`}
    if(m.stores){const sl=m.stores.name?[m.stores]:Object.values(m.stores);x+=`<div class="sc">${sl.map(s=>`<div class="si"><div class="sn2">${s.name}</div><div class="sa">${s.address}</div><div class="sh">${s.hours}</div><div style="display:flex;gap:10px"><a href="${s.maps}" target="_blank" rel="noopener" class="sm">Directions →</a><a href="https://wa.me/${WA}" target="_blank" rel="noopener" class="sm">WhatsApp →</a></div></div>`).join("")}</div>`}
    return `<div class="mr mbr"><div class="av">A</div><div class="mc"><div class="mb bb">${md(m.text)}</div>${x}</div></div>`}

  function typing(){return `<div class="mr mbr"><div class="av">A</div><div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>`}

  function bindEvents(){
    shadow.querySelector(".bbl")?.addEventListener("click",()=>{S.open=!S.open;render()});
    shadow.querySelector(".cls")?.addEventListener("click",()=>{S.open=false;render()});
    shadow.querySelector(".clr")?.addEventListener("click",clearChat);
    shadow.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>sw(t.dataset.m)));
    shadow.querySelectorAll("[data-p]").forEach(b=>b.addEventListener("click",()=>send(b.dataset.p)));
    shadow.querySelectorAll("[data-sw]").forEach(b=>b.addEventListener("click",()=>sw(b.dataset.sw)));
    shadow.querySelector("[data-studio]")?.addEventListener("click",()=>window.open(STUDIO,"_blank"));
    const ta=shadow.querySelector(".ta");
    if(ta){ta.value=S.input||"";
      ta.addEventListener("input",e=>{S.input=e.target.value;e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,80)+"px";const s=shadow.querySelector(".sn");if(s)s.classList.toggle("on",S.input.trim().length>0)});
      ta.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();const v=ta.value.trim();if(v){S.input="";send(v)}}});
    }
    shadow.querySelector(".sn")?.addEventListener("click",()=>{const ta=shadow.querySelector(".ta");const v=(ta?.value||"").trim();if(v){S.input="";send(v)}});
    const fi=shadow.querySelector(".fi");
    shadow.querySelector(".ubtn")?.addEventListener("click",()=>fi?.click());
    fi?.addEventListener("change",e=>{if(e.target.files?.[0]){S.uploaded=e.target.files[0].name;render()}});
    shadow.querySelector(".ur")?.addEventListener("click",()=>{S.uploaded=null;render()});
    shadow.querySelector(".vb")?.addEventListener("click",()=>{
      if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){alert("Voice not supported");return}
      if(S.recording){S.recording=false;render();return}
      const R=new(window.SpeechRecognition||window.webkitSpeechRecognition)();R.lang="en-IN";R.continuous=false;R.interimResults=false;
      R.onresult=e=>{S.input=e.results[0][0].transcript;S.recording=false;render()};
      R.onerror=()=>{S.recording=false;render()};R.onend=()=>{S.recording=false;render()};
      R.start();S.recording=true;render();
    });
  }

  function css(){return `
:host{all:initial;font-family:'Outfit',-apple-system,sans-serif;-webkit-text-size-adjust:100%}
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
.bbl{position:fixed;bottom:24px;right:24px;z-index:2147483647;width:58px;height:58px;border-radius:50%;background:${B};border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(139,101,77,.35);transition:transform .2s;-webkit-tap-highlight-color:transparent}.bbl:hover{transform:scale(1.05)}.bbl:active{transform:scale(.95)}
.ba{font-family:'Playfair Display',serif;font-size:18px;color:${CR};font-weight:600;line-height:1}.bai{font-size:6px;color:rgba(245,240,232,.6);letter-spacing:1px;font-weight:600}.bd{position:absolute;top:-1px;right:-1px;width:14px;height:14px;border-radius:50%;background:#c0392b;border:2.5px solid #fff}
.tip{position:fixed;bottom:90px;right:24px;z-index:2147483646;background:#fff;border:1px solid ${CK};border-radius:10px;padding:10px 14px;box-shadow:0 2px 12px rgba(139,101,77,.1);font-size:12px;color:${TD};font-weight:500;white-space:nowrap;animation:fu .4s ease 2s both}.tip em{font-family:'Playfair Display',serif;color:${B}}.tip::after{content:'';position:absolute;bottom:-6px;right:24px;width:12px;height:12px;background:#fff;border:1px solid ${CK};border-top:none;border-left:none;transform:rotate(45deg)}
.pnl{position:fixed;bottom:94px;right:24px;z-index:2147483647;width:400px;max-width:calc(100vw - 32px);height:620px;max-height:78vh;background:${W};border-radius:18px;border:1px solid ${CK};box-shadow:0 8px 40px rgba(139,101,77,.14);display:flex;flex-direction:column;overflow:hidden;animation:si .3s cubic-bezier(.22,1,.36,1)}
.hdr{padding:14px 16px 12px;border-bottom:1px solid ${CK};background:linear-gradient(180deg,rgba(139,101,77,.04),transparent);flex-shrink:0}
.ht{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.hb{display:flex;align-items:center;gap:10px}
.hi{width:34px;height:34px;border-radius:9px;background:${B};display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:15px;color:${CR};font-weight:600;flex-shrink:0}
.htl{font-size:14px;color:${TD};font-weight:600;display:flex;align-items:center;gap:6px}.ab{font-size:8px;background:${B};color:${CR};padding:2px 5px;border-radius:3px;font-weight:700;letter-spacing:1px}
.hs{font-size:9.5px;color:${TL};margin-top:1px;display:flex;align-items:center;gap:4px}.od{width:5px;height:5px;border-radius:50%;background:#5a9a5a;flex-shrink:0}
.clr{background:none;border:none;cursor:pointer;font-size:16px;padding:4px;opacity:.5;transition:.2s}.clr:hover{opacity:1}
.cls{background:none;border:none;cursor:pointer;color:${TL};font-size:22px;line-height:1;padding:4px}
.tabs{display:flex;background:${CD};border-radius:8px;padding:2px}.tab{flex:1;background:transparent;border:1px solid transparent;border-radius:6px;padding:7px 4px;cursor:pointer;text-align:center;transition:.25s;-webkit-tap-highlight-color:transparent}.tab.on{background:${W};border-color:${CK};box-shadow:0 1px 3px rgba(139,101,77,.06)}
.tl{display:block;font-size:11.5px;color:${TM};font-weight:400}.tab.on .tl{color:${TD};font-weight:600}.ts{display:block;font-size:8.5px;color:${TL};margin-top:1px}
.msgs{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px;-webkit-overflow-scrolling:touch}.msgs::-webkit-scrollbar{width:3px}.msgs::-webkit-scrollbar-thumb{background:rgba(139,101,77,.1);border-radius:3px}
.w{text-align:center;padding:6px 2px}.wi{width:42px;height:42px;border-radius:11px;background:${BL};border:1.5px solid rgba(139,101,77,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-family:'Playfair Display',serif;font-size:18px;color:${B};font-weight:600}
.wt{font-family:'Playfair Display',serif;font-size:16px;color:${TD};margin-bottom:5px}.wt em{color:${B}}.ws{font-size:11.5px;color:${TM};line-height:1.6;font-weight:300;max-width:260px;margin:0 auto 14px}
.pls{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.pl{background:${CR};border:1px solid ${CK};border-radius:16px;padding:6px 12px;font-size:11px;color:${B};font-weight:500;cursor:pointer;font-family:'Outfit',sans-serif;transition:.2s;-webkit-tap-highlight-color:transparent}.pl:hover,.pl:active{border-color:${B};background:${BL}}
.cds{display:flex;flex-direction:column;gap:6px}.cd{background:${CR};border:1px solid ${CK};border-radius:9px;padding:9px 11px;font-size:11px;color:${TD};cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px;font-family:'Outfit',sans-serif;transition:.2s;-webkit-tap-highlight-color:transparent}.cd:hover,.cd:active{border-color:${B}}.st{color:${B};font-weight:600}
.sl{margin-top:12px;background:none;border:none;font-size:11px;color:${B};cursor:pointer;text-decoration:underline;font-family:'Outfit',sans-serif;font-weight:500}
.mr{display:flex;animation:fu .3s ease}.mu{justify-content:flex-end}.mbr{justify-content:flex-start}
.av{width:22px;height:22px;border-radius:6px;background:${B};display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:10px;color:${CR};font-weight:600;flex-shrink:0;margin-right:6px;margin-top:2px}
.mc{max-width:88%;min-width:0}.mb{padding:9px 13px;font-size:12.5px;line-height:1.6;font-weight:300;word-wrap:break-word;overflow-wrap:break-word}
.ub{background:${B};color:${CR};border-radius:14px 14px 4px 14px;max-width:80%}.bb{background:${CR};color:${TD};border-radius:14px 14px 14px 4px}
.ps{display:flex;gap:8px;overflow-x:auto;padding:6px 0;margin-top:6px;-webkit-overflow-scrolling:touch}.ps::-webkit-scrollbar{height:3px}.ps::-webkit-scrollbar-thumb{background:rgba(139,101,77,.1);border-radius:3px}
.pc{min-width:135px;max-width:160px;background:${CR};border-radius:10px;border:1px solid ${CK};overflow:hidden;cursor:pointer;flex-shrink:0;text-decoration:none;color:inherit;transition:.2s}.pc:hover{border-color:${B};transform:translateY(-2px);box-shadow:0 4px 12px rgba(139,101,77,.08)}
.pi{height:110px;background:${CD};display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.pi img{width:100%;height:100%;object-fit:cover}.pe{font-size:26px}
.sb{position:absolute;top:5px;left:5px;background:#c0392b;color:#fff;font-size:8px;letter-spacing:.5px;padding:2px 6px;border-radius:3px;font-weight:700}
.pf{padding:8px 9px}.pn{font-size:10.5px;font-weight:500;color:${TD};margin-bottom:2px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pp{font-size:11px;font-weight:600;color:${B}}.po{font-size:9.5px;color:${TL};text-decoration:line-through;margin-left:3px;font-weight:400}.ct{display:inline-block;margin-top:5px;font-size:9.5px;color:${B};font-weight:600}
.br{margin-top:5px;font-size:10.5px;color:${TM}}.bl{background:none;border:none;color:${B};font-weight:600;cursor:pointer;font-size:10.5px;text-decoration:underline;padding:0;font-family:'Outfit',sans-serif}
.dc{margin-top:6px;background:${W};border:1px solid ${CK};border-radius:11px;overflow:hidden;box-shadow:0 2px 8px rgba(139,101,77,.05)}
.dp{position:relative;min-height:180px;background:linear-gradient(135deg,${CD},rgba(139,101,77,.08));display:flex;align-items:center;justify-content:center;overflow:hidden}
.dim{width:100%;height:260px;object-fit:cover;display:block;animation:fi .8s ease}
.dov{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(14,13,11,.6));padding:14px 12px 8px;text-align:center}
.dph{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:180px;width:100%}
.dico{width:50px;height:50px;border-radius:50%;background:rgba(139,101,77,.12);border:1.5px solid rgba(139,101,77,.2);display:flex;align-items:center;justify-content:center;font-size:20px;color:${B};animation:pulse 2s infinite}
.dlb{font-size:9px;color:${CR};letter-spacing:2px;text-transform:uppercase;font-weight:600}.dlt{font-size:9px;color:${B};letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-top:6px}
.dd{padding:10px 12px}.ddt{font-size:12.5px;font-weight:600;color:${TD};margin-bottom:3px;text-transform:capitalize}.ddd{font-size:10.5px;color:${TM};line-height:1.5;margin-bottom:8px;text-transform:capitalize}
.dda{display:flex;gap:6px}.da{flex:1;border-radius:6px;padding:8px;font-size:10px;font-weight:600;cursor:pointer;text-align:center;text-decoration:none;font-family:'Outfit',sans-serif;transition:.2s;-webkit-tap-highlight-color:transparent}
.daw{background:#25D366;color:#fff;border:none}.daw:hover{background:#1da851}.das{background:none;color:${B};border:1px solid rgba(139,101,77,.25)}.das:hover{background:${BL}}
.sc{display:flex;flex-direction:column;gap:6px;margin-top:6px}.si{background:${CR};border:1px solid ${CK};border-radius:9px;padding:10px 12px}
.sn2{font-size:11.5px;font-weight:600;color:${TD};margin-bottom:3px}.sa{font-size:10.5px;color:${TM};line-height:1.4;margin-bottom:2px}.sh{font-size:9.5px;color:${TL};margin-bottom:5px}.sm{font-size:10.5px;color:${B};font-weight:600;text-decoration:none}
.dots{background:${CR};border-radius:14px;padding:10px 16px;display:flex;gap:4px;align-items:center}.dot{width:6px;height:6px;border-radius:50%;background:${B};opacity:.35;animation:td 1.2s infinite}.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
.ia{padding:8px 12px 10px;border-top:1px solid ${CK};flex-shrink:0}
.ut{display:inline-flex;align-items:center;gap:4px;background:${BL};border-radius:6px;padding:3px 10px;font-size:10px;color:${B};margin-bottom:5px;font-family:'Outfit',sans-serif}.ur{background:none;border:none;color:${B};cursor:pointer;font-size:13px;padding:0 0 0 4px}
.ir{display:flex;align-items:flex-end;gap:5px;background:${CR};border:1px solid ${CK};border-radius:10px;padding:6px 8px}
.ib{background:none;border:none;cursor:pointer;color:${TL};padding:4px;flex-shrink:0;border-radius:6px;transition:.2s;display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent}.ib:hover,.ib:active{color:${B};background:${BL}}
.vb.rec{color:${B};background:${BL};animation:pulse 1.5s infinite}
.ta{flex:1;background:none;border:none;outline:none;color:${TD};font-family:'Outfit',sans-serif;font-size:13px;resize:none;line-height:1.5;min-height:28px;max-height:72px;-webkit-appearance:none}.ta::placeholder{color:rgba(139,101,77,.35)}
.sn{background:${BL};border:none;border-radius:7px;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.3s;color:${TL};-webkit-tap-highlight-color:transparent}.sn.on{background:${B};color:${CR}}
.pw{text-align:center;margin-top:5px;font-size:8.5px;color:${TL};letter-spacing:.3px}
@keyframes si{from{opacity:0;transform:scale(.93) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes td{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@media(max-width:600px){.pnl{position:fixed;top:0;bottom:0;left:0;right:0;width:100%;height:100%;max-height:100%;border-radius:0;border:none;animation:msi .25s ease}.bbl{bottom:16px;right:16px;width:52px;height:52px}.ba{font-size:16px}.bai{font-size:5px}.tip{display:none}.hdr{padding:12px 14px 10px;padding-top:max(12px,env(safe-area-inset-top))}.hi{width:30px;height:30px;font-size:13px}.htl{font-size:13px}.msgs{padding:12px 10px}.ia{padding:6px 10px 8px;padding-bottom:max(8px,env(safe-area-inset-bottom))}.ta{font-size:14px}.pc{min-width:125px;max-width:145px}.pi{height:95px}.dim{height:220px}.cls{font-size:28px;padding:6px}}
@keyframes msi{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
`}

  render();
})();
