/**
 * AI Asuka Stylist — Embeddable Chat Widget v2
 * With markdown rendering + AI design image generation
 * 
 * Add to Shopify: <script src="https://asuka-ai-stylist.vercel.app/widget.js" defer></script>
 */
(function () {
  "use strict";

  const API_BASE = document.currentScript?.src
    ? new URL(document.currentScript.src).origin
    : "https://asuka-ai-stylist.vercel.app";

  const B = "#8B654D";
  const BL = "rgba(139,101,77,0.12)";
  const CR = "#F5F0E8";
  const CD = "#EDE6DA";
  const CK = "#E5DCCD";
  const TD = "#3A2A1D";
  const TM = "rgba(139,101,77,0.7)";
  const TL = "rgba(139,101,77,0.45)";
  const W = "#FFFDF9";

  const STYLE_PROMPTS = [
    "Wedding outfit ideas",
    "Cocktail party look",
    "Kurta sets for festive",
    "Formal suits",
  ];
  const DESIGN_PROMPTS = [
    "Black kurta bundi for a Kashmir cocktail",
    "Ivory sherwani with gold dori work",
    "Modern bandhgala for a Goa sangeet",
  ];

  /* ─── State ─── */
  let state = {
    open: false,
    mode: "style",
    messages: [],
    input: "",
    loading: false,
    conversationHistory: [],
  };

  /* ─── DOM ─── */
  const host = document.createElement("div");
  host.id = "asuka-ai-stylist";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  /* ─── Markdown Parser ─── */
  function parseMd(text) {
    if (!text) return "";
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:' + TD + '">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="font-style:italic">$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:' + BL + ';padding:1px 5px;border-radius:4px;font-size:11px">$1</code>')
      .replace(/\n/g, "<br>");
  }

  /* ─── API ─── */
  async function sendMessage(text) {
    state.loading = true;
    state.messages.push({ role: "user", text });
    state.conversationHistory.push({ role: "user", text });
    render();

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: state.conversationHistory,
          mode: state.mode,
        }),
      });

      const data = await res.json();
      const botMsg = {
        role: "bot",
        text: data.reply,
        products: data.products || [],
        design: data.design || null,
        stores: data.stores || null,
      };

      state.messages.push(botMsg);
      state.conversationHistory.push({ role: "bot", text: data.reply, content: data.reply });
    } catch (err) {
      state.messages.push({
        role: "bot",
        text: "I'm having trouble connecting right now. Please try again in a moment.",
      });
    }

    state.loading = false;
    render();
    scrollToBottom();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const msgs = shadow.querySelector(".asuka-messages");
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    });
  }

  function switchMode(mode) {
    state.mode = mode;
    state.messages = [];
    state.conversationHistory = [];
    render();
  }

  /* ─── Render ─── */
  function render() {
    shadow.innerHTML = `<style>${getStyles()}</style>${state.open ? renderPanel() : ""}${renderBubble()}`;
    attachEvents();
  }

  function renderBubble() {
    return `
      <button class="asuka-bubble" aria-label="Open AI Asuka Stylist">
        ${state.open
          ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${CR}" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
          : `<span class="bubble-logo">A</span><span class="bubble-ai">AI</span><span class="bubble-dot"></span>`}
      </button>
      ${!state.open ? `<div class="asuka-tooltip">Need styling help? <em>Ask Asuka AI</em></div>` : ""}
    `;
  }

  function renderPanel() {
    return `
      <div class="asuka-panel">
        <div class="asuka-header">
          <div class="header-top">
            <div class="header-brand">
              <div class="header-icon">A</div>
              <div>
                <div class="header-title"><span class="ai-badge">AI</span> Asuka Stylist</div>
                <div class="header-sub"><span class="online-dot"></span> Style advisor & design creator</div>
              </div>
            </div>
            <button class="close-btn" aria-label="Close">&times;</button>
          </div>
          <div class="mode-tabs">
            <button class="mode-tab ${state.mode === "style" ? "active" : ""}" data-mode="style">
              <span class="tab-label">Style Me</span>
              <span class="tab-sub">Shop collection</span>
            </button>
            <button class="mode-tab ${state.mode === "design" ? "active" : ""}" data-mode="design">
              <span class="tab-label">Create Design</span>
              <span class="tab-sub">Design something new</span>
            </button>
          </div>
        </div>

        <div class="asuka-messages">
          ${state.messages.length === 0 ? renderWelcome() : state.messages.map(renderMessage).join("")}
          ${state.loading ? renderTyping() : ""}
        </div>

        <div class="asuka-input-area">
          <div class="input-row">
            <textarea class="asuka-textarea" placeholder="${state.mode === "style" ? "Tell me about your occasion..." : "Describe your dream design..."}" rows="1">${state.input}</textarea>
            <button class="send-btn ${state.input.trim() ? "active" : ""}" aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div class="powered-by">AI Asuka Stylist · Powered by Asuka Couture</div>
        </div>
      </div>
    `;
  }

  function renderWelcome() {
    const icon = `<div class="welcome-icon">A</div>`;
    if (state.mode === "style") {
      return `
        <div class="welcome">
          ${icon}
          <div class="welcome-title">What's the occasion?</div>
          <p class="welcome-sub">Tell me and I'll find perfect pieces from the Asuka collection.</p>
          <div class="prompt-pills">
            ${STYLE_PROMPTS.map(p => `<button class="prompt-pill" data-prompt="${p}">${p}</button>`).join("")}
          </div>
        </div>`;
    }
    return `
      <div class="welcome">
        ${icon}
        <div class="welcome-title">What do you <em>envision?</em></div>
        <p class="welcome-sub">Describe your dream outfit — I'll create a design concept with an AI-generated visual for you.</p>
        <div class="prompt-list">
          ${DESIGN_PROMPTS.map(p => `<button class="prompt-card" data-prompt="${p}"><span class="prompt-star">✦</span> ${p}</button>`).join("")}
        </div>
      </div>`;
  }

  function renderMessage(msg) {
    if (msg.role === "user") {
      return `<div class="msg-row msg-user"><div class="msg-bubble user-bubble">${escapeHtml(msg.text)}</div></div>`;
    }

    let extra = "";

    // Product cards
    if (msg.products?.length) {
      extra += `<div class="product-scroll">
        ${msg.products.map(p => `
          <a href="${p.url}" target="_blank" class="product-card">
            <div class="product-img">${p.image
              ? `<img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy" />`
              : `<span class="product-emoji">👔</span>`}</div>
            <div class="product-info">
              <div class="product-name">${escapeHtml(p.title)}</div>
              <div class="product-price">${p.price}</div>
              <span class="product-cta">View Product →</span>
            </div>
          </a>`).join("")}
      </div>
      <div class="bridge-text">Want something unique? <button class="bridge-link" data-switch="design">Create a custom design ✦</button></div>`;
    }

    // Design brief with AI-generated image
    if (msg.design) {
      extra += `
        <div class="design-card">
          <div class="design-preview">
            ${msg.design.image_url
              ? `<img src="${msg.design.image_url}" alt="AI Generated Design" class="design-image" loading="lazy" />
                 <div class="design-image-overlay">
                   <span class="design-label">✦ AI Generated Design</span>
                 </div>`
              : `<div class="design-placeholder">
                   <div class="design-icon">✦</div>
                   <span class="design-label">AI Design Concept</span>
                 </div>`}
          </div>
          <div class="design-info">
            <div class="design-title">${escapeHtml(msg.design.garment_type)} — ${escapeHtml(msg.design.occasion)}</div>
            <div class="design-details">
              <span>${escapeHtml(msg.design.color_palette)}</span>
              ${msg.design.fabric !== "Not specified" ? ` · <span>${escapeHtml(msg.design.fabric)}</span>` : ""}
              ${msg.design.embroidery_detail !== "Not specified" ? ` · <span>${escapeHtml(msg.design.embroidery_detail)}</span>` : ""}
            </div>
            <div class="design-actions">
              <a href="https://asukacouture.com/pages/book-an-appointment" target="_blank" class="design-btn primary">Book Consultation</a>
              <button class="design-btn secondary" data-prompt="I'd like to refine this design — can we adjust it?">Refine Design</button>
            </div>
          </div>
        </div>`;
    }

    // Store info
    if (msg.stores) {
      const storeEntries = msg.stores.name ? [msg.stores] : Object.values(msg.stores);
      extra += `<div class="store-cards">
        ${storeEntries.map(s => `
          <div class="store-card">
            <div class="store-name">${s.name}</div>
            <div class="store-addr">${s.address}</div>
            <div class="store-hours">${s.hours}</div>
            <a href="${s.maps}" target="_blank" class="store-link">Get Directions →</a>
          </div>`).join("")}
      </div>`;
    }

    return `
      <div class="msg-row msg-bot">
        <div class="bot-avatar">A</div>
        <div class="msg-content">
          <div class="msg-bubble bot-bubble">${parseMd(msg.text)}</div>
          ${extra}
        </div>
      </div>`;
  }

  function renderTyping() {
    return `
      <div class="msg-row msg-bot">
        <div class="bot-avatar">A</div>
        <div class="typing-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      </div>`;
  }

  /* ─── Events ─── */
  function attachEvents() {
    shadow.querySelector(".asuka-bubble")?.addEventListener("click", () => {
      state.open = !state.open;
      if (state.open && state.messages.length === 0) state.mode = "style";
      render();
      if (state.open) scrollToBottom();
    });

    shadow.querySelector(".close-btn")?.addEventListener("click", () => { state.open = false; render(); });

    shadow.querySelectorAll(".mode-tab").forEach(tab => {
      tab.addEventListener("click", () => switchMode(tab.dataset.mode));
    });

    shadow.querySelectorAll("[data-prompt]").forEach(btn => {
      btn.addEventListener("click", () => sendMessage(btn.dataset.prompt));
    });

    shadow.querySelectorAll("[data-switch]").forEach(btn => {
      btn.addEventListener("click", () => switchMode(btn.dataset.switch));
    });

    const textarea = shadow.querySelector(".asuka-textarea");
    if (textarea) {
      textarea.value = state.input;
      textarea.addEventListener("input", (e) => {
        state.input = e.target.value;
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
        const sendBtn = shadow.querySelector(".send-btn");
        if (sendBtn) sendBtn.classList.toggle("active", state.input.trim().length > 0);
      });
      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (state.input.trim()) { sendMessage(state.input.trim()); state.input = ""; }
        }
      });
    }

    shadow.querySelector(".send-btn")?.addEventListener("click", () => {
      if (state.input.trim()) { sendMessage(state.input.trim()); state.input = ""; }
    });
  }

  /* ─── Helpers ─── */
  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ─── Styles ─── */
  function getStyles() {
    return `
      :host { all: initial; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif; }
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }

      .asuka-bubble {
        position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
        width: 58px; height: 58px; border-radius: 50%;
        background: ${B}; border: none; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        box-shadow: 0 4px 20px rgba(139,101,77,0.35); transition: transform 0.2s;
      }
      .asuka-bubble:hover { transform: scale(1.05); }
      .asuka-bubble:active { transform: scale(0.95); }
      .bubble-logo { font-family: 'Playfair Display', serif; font-size: 18px; color: ${CR}; font-weight: 600; line-height: 1; }
      .bubble-ai { font-size: 6px; color: rgba(245,240,232,0.6); letter-spacing: 1px; font-weight: 600; }
      .bubble-dot { position: absolute; top: -1px; right: -1px; width: 14px; height: 14px; border-radius: 50%; background: #c0392b; border: 2.5px solid white; }

      .asuka-tooltip {
        position: fixed; bottom: 90px; right: 24px; z-index: 2147483646;
        background: white; border: 1px solid ${CK}; border-radius: 10px;
        padding: 10px 14px; box-shadow: 0 2px 12px rgba(139,101,77,0.1);
        font-size: 12px; color: ${TD}; font-weight: 500; white-space: nowrap;
        animation: fadeUp 0.4s ease 2s both;
      }
      .asuka-tooltip em { font-family: 'Playfair Display', serif; color: ${B}; font-style: italic; }
      .asuka-tooltip::after {
        content: ''; position: absolute; bottom: -6px; right: 24px;
        width: 12px; height: 12px; background: white;
        border: 1px solid ${CK}; border-top: none; border-left: none; transform: rotate(45deg);
      }

      .asuka-panel {
        position: fixed; bottom: 94px; right: 24px; z-index: 2147483647;
        width: 400px; max-width: calc(100vw - 32px);
        height: 600px; max-height: 78vh;
        background: ${W}; border-radius: 18px; border: 1px solid ${CK};
        box-shadow: 0 8px 40px rgba(139,101,77,0.14), 0 1px 6px rgba(139,101,77,0.04);
        display: flex; flex-direction: column; overflow: hidden;
        animation: scaleIn 0.3s cubic-bezier(0.22,1,0.36,1);
      }

      .asuka-header {
        padding: 16px 18px 14px; border-bottom: 1px solid ${CK};
        background: linear-gradient(180deg, rgba(139,101,77,0.04) 0%, transparent 100%);
      }
      .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
      .header-brand { display: flex; align-items: center; gap: 10px; }
      .header-icon {
        width: 36px; height: 36px; border-radius: 10px; background: ${B};
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-size: 16px; color: ${CR}; font-weight: 600;
      }
      .header-title { font-size: 14.5px; color: ${TD}; font-weight: 600; display: flex; align-items: center; gap: 7px; }
      .ai-badge { font-size: 8.5px; background: ${B}; color: ${CR}; padding: 2px 6px; border-radius: 4px; font-weight: 700; letter-spacing: 1px; }
      .header-sub { font-size: 10px; color: ${TL}; margin-top: 1px; display: flex; align-items: center; gap: 4px; }
      .online-dot { width: 5px; height: 5px; border-radius: 50%; background: #5a9a5a; }
      .close-btn { background: none; border: none; cursor: pointer; color: ${TL}; font-size: 22px; line-height: 1; }

      .mode-tabs { display: flex; background: ${CD}; border-radius: 9px; padding: 3px; }
      .mode-tab {
        flex: 1; background: transparent; border: 1px solid transparent;
        border-radius: 7px; padding: 8px 6px; cursor: pointer; text-align: center; transition: all 0.25s;
      }
      .mode-tab.active { background: ${W}; border-color: ${CK}; box-shadow: 0 1px 3px rgba(139,101,77,0.06); }
      .tab-label { display: block; font-size: 12px; color: ${TM}; font-weight: 400; }
      .mode-tab.active .tab-label { color: ${TD}; font-weight: 600; }
      .tab-sub { display: block; font-size: 9px; color: ${TL}; margin-top: 1px; }

      .asuka-messages {
        flex: 1; overflow-y: auto; padding: 16px 14px;
        display: flex; flex-direction: column; gap: 10px;
      }
      .asuka-messages::-webkit-scrollbar { width: 3px; }
      .asuka-messages::-webkit-scrollbar-thumb { background: rgba(139,101,77,0.1); border-radius: 3px; }

      .welcome { text-align: center; padding: 8px 4px; }
      .welcome-icon {
        width: 46px; height: 46px; border-radius: 12px;
        background: ${BL}; border: 1.5px solid rgba(139,101,77,0.12);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 12px;
        font-family: 'Playfair Display', serif; font-size: 20px; color: ${B}; font-weight: 600;
      }
      .welcome-title { font-family: 'Playfair Display', serif; font-size: 17px; color: ${TD}; margin-bottom: 6px; }
      .welcome-title em { color: ${B}; }
      .welcome-sub { font-size: 12px; color: ${TM}; line-height: 1.6; font-weight: 300; max-width: 260px; margin: 0 auto 16px; }
      .prompt-pills { display: flex; flex-wrap: wrap; gap: 7px; justify-content: center; }
      .prompt-pill {
        background: ${CR}; border: 1px solid ${CK}; border-radius: 18px;
        padding: 7px 14px; font-size: 11.5px; color: ${B};
        font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif;
      }
      .prompt-pill:hover { border-color: ${B}; background: ${BL}; }
      .prompt-list { display: flex; flex-direction: column; gap: 7px; }
      .prompt-card {
        background: ${CR}; border: 1px solid ${CK}; border-radius: 10px;
        padding: 10px 12px; font-size: 11.5px; color: ${TD};
        cursor: pointer; text-align: left; display: flex; align-items: center; gap: 8px;
        font-family: 'Outfit', sans-serif; transition: all 0.2s;
      }
      .prompt-card:hover { border-color: ${B}; }
      .prompt-star { color: ${B}; font-weight: 600; }

      .msg-row { display: flex; animation: fadeUp 0.3s ease; }
      .msg-user { justify-content: flex-end; }
      .msg-bot { justify-content: flex-start; }
      .bot-avatar {
        width: 24px; height: 24px; border-radius: 7px; background: ${B};
        display: flex; align-items: center; justify-content: center;
        font-family: 'Playfair Display', serif; font-size: 11px;
        color: ${CR}; font-weight: 600; flex-shrink: 0; margin-right: 7px; margin-top: 2px;
      }
      .msg-content { max-width: 85%; }
      .msg-bubble { padding: 10px 14px; font-size: 13px; line-height: 1.6; font-weight: 300; }
      .user-bubble { background: ${B}; color: ${CR}; border-radius: 14px 14px 4px 14px; max-width: 78%; }
      .bot-bubble { background: ${CR}; color: ${TD}; border-radius: 14px 14px 14px 4px; }

      .product-scroll {
        display: flex; gap: 9px; overflow-x: auto; padding: 8px 0 6px; margin-top: 8px;
      }
      .product-scroll::-webkit-scrollbar { height: 3px; }
      .product-scroll::-webkit-scrollbar-thumb { background: rgba(139,101,77,0.1); border-radius: 3px; }
      .product-card {
        min-width: 148px; background: ${CR}; border-radius: 11px;
        border: 1px solid ${CK}; overflow: hidden; cursor: pointer;
        flex-shrink: 0; text-decoration: none; color: inherit; transition: all 0.2s;
      }
      .product-card:hover { border-color: ${B}; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(139,101,77,0.08); }
      .product-img { height: 110px; background: ${CD}; display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .product-img img { width: 100%; height: 100%; object-fit: cover; }
      .product-emoji { font-size: 28px; }
      .product-info { padding: 9px 10px; }
      .product-name { font-size: 11px; font-weight: 500; color: ${TD}; margin-bottom: 3px; line-height: 1.35; }
      .product-price { font-size: 12px; font-weight: 600; color: ${B}; }
      .product-cta { display: inline-block; margin-top: 6px; font-size: 10px; color: ${B}; font-weight: 600; }

      .bridge-text { margin-top: 6px; font-size: 11px; color: ${TM}; }
      .bridge-link {
        background: none; border: none; color: ${B}; font-weight: 600;
        cursor: pointer; font-size: 11px; text-decoration: underline; padding: 0; font-family: 'Outfit', sans-serif;
      }

      /* ─── Design Card with Image ─── */
      .design-card {
        margin-top: 8px; background: ${W}; border: 1px solid ${CK};
        border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(139,101,77,0.06);
      }
      .design-preview {
        position: relative; min-height: 200px; background: linear-gradient(135deg, ${CD}, rgba(139,101,77,0.08));
        display: flex; align-items: center; justify-content: center; overflow: hidden;
      }
      .design-image {
        width: 100%; height: 260px; object-fit: cover; display: block;
        animation: fadeIn 0.8s ease;
      }
      .design-image-overlay {
        position: absolute; bottom: 0; left: 0; right: 0;
        background: linear-gradient(transparent, rgba(14,13,11,0.7));
        padding: 16px 12px 10px; text-align: center;
      }
      .design-placeholder {
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; min-height: 200px; width: 100%;
      }
      .design-icon {
        width: 56px; height: 56px; border-radius: 50%;
        background: rgba(139,101,77,0.12); border: 1.5px solid rgba(139,101,77,0.2);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; color: ${B}; animation: pulse 2s infinite;
      }
      .design-label {
        font-size: 9px; color: ${CR}; letter-spacing: 2px;
        text-transform: uppercase; font-weight: 600;
      }
      .design-info { padding: 12px 14px; }
      .design-title { font-size: 13px; font-weight: 600; color: ${TD}; margin-bottom: 4px; text-transform: capitalize; }
      .design-details { font-size: 11px; color: ${TM}; line-height: 1.6; margin-bottom: 10px; text-transform: capitalize; }
      .design-actions { display: flex; gap: 7px; }
      .design-btn {
        flex: 1; border-radius: 7px; padding: 9px; font-size: 10.5px; font-weight: 600;
        cursor: pointer; text-align: center; text-decoration: none; font-family: 'Outfit', sans-serif;
        transition: all 0.2s;
      }
      .design-btn.primary { background: ${B}; color: ${CR}; border: none; }
      .design-btn.primary:hover { background: #6B4A35; }
      .design-btn.secondary { background: none; color: ${B}; border: 1px solid rgba(139,101,77,0.25); }
      .design-btn.secondary:hover { background: ${BL}; }

      .store-cards { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
      .store-card { background: ${CR}; border: 1px solid ${CK}; border-radius: 10px; padding: 12px 14px; }
      .store-name { font-size: 12px; font-weight: 600; color: ${TD}; margin-bottom: 4px; }
      .store-addr { font-size: 11px; color: ${TM}; line-height: 1.5; margin-bottom: 2px; }
      .store-hours { font-size: 10px; color: ${TL}; margin-bottom: 6px; }
      .store-link { font-size: 11px; color: ${B}; font-weight: 600; text-decoration: none; }

      .typing-dots {
        background: ${CR}; border-radius: 14px; padding: 12px 18px;
        display: flex; gap: 4px; align-items: center;
      }
      .dot { width: 6px; height: 6px; border-radius: 50%; background: ${B}; opacity: 0.35; animation: typeDot 1.2s infinite; }
      .dot:nth-child(2) { animation-delay: 0.2s; }
      .dot:nth-child(3) { animation-delay: 0.4s; }

      .asuka-input-area { padding: 10px 14px 12px; border-top: 1px solid ${CK}; }
      .input-row {
        display: flex; align-items: flex-end; gap: 8px;
        background: ${CR}; border: 1px solid ${CK}; border-radius: 11px; padding: 8px 10px;
      }
      .asuka-textarea {
        flex: 1; background: none; border: none; outline: none;
        color: ${TD}; font-family: 'Outfit', sans-serif;
        font-size: 13px; resize: none; line-height: 1.5; min-height: 28px; max-height: 72px;
      }
      .asuka-textarea::placeholder { color: rgba(139,101,77,0.35); }
      .send-btn {
        background: ${BL}; border: none; border-radius: 7px;
        width: 32px; height: 32px; cursor: default;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: all 0.3s; color: ${TL};
      }
      .send-btn.active { background: ${B}; color: ${CR}; cursor: pointer; }
      .powered-by { text-align: center; margin-top: 6px; font-size: 9px; color: ${TL}; letter-spacing: 0.3px; }

      @keyframes scaleIn { from { opacity: 0; transform: scale(0.93) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes typeDot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
      @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

      @media (max-width: 480px) {
        .asuka-panel { bottom: 0; right: 0; left: 0; width: 100%; height: 100vh; max-height: 100vh; border-radius: 0; }
        .asuka-bubble { bottom: 16px; right: 16px; }
        .asuka-tooltip { display: none; }
      }
    `;
  }

  render();
})();
