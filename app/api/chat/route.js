import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { STYLIST_SYSTEM_PROMPT, TOOLS, STORE_INFO, WHATSAPP_NUMBER } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateDesignImage(prompt) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;
  try {
    const enhanced = `Ultra-premium luxury Indian menswear editorial photograph for Vogue India. ${prompt}. The garment is exquisitely crafted with visible hand-done artisan detailing, rich fabric with depth and sheen, and impeccable tailoring. The male model has a strong jawline, styled hair, and a commanding presence. Shot by a world-class fashion photographer using a Hasselblad medium format camera, with Rembrandt lighting — warm golden key light from the left, soft fill from the right. Background is a luxurious minimalist setting with warm cream tones and subtle bokeh. Full-length editorial portrait. Colors are rich and saturated. Mood: opulent, regal, aspirational — GQ India or Vogue Homme. 8K resolution, incredible fabric detail.`;
    const res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "wait" },
      body: JSON.stringify({ input: { prompt: enhanced, aspect_ratio: "3:4", output_format: "webp", output_quality: 95, safety_tolerance: 2, prompt_upsampling: true } }),
    });
    if (!res.ok) { console.error("Replicate error:", res.status); return null; }
    const pred = await res.json();
    if (pred.output?.[0]) return pred.output[0];
    if (typeof pred.output === "string") return pred.output;
    if (pred.urls?.get) {
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const poll = await fetch(pred.urls.get, { headers: { Authorization: `Bearer ${token}` } });
        const p = await poll.json();
        if (p.status === "succeeded") return p.output?.[0] || (typeof p.output === "string" ? p.output : null);
        if (p.status === "failed" || p.status === "canceled") return null;
      }
    }
    return null;
  } catch (err) { console.error("Replicate error:", err.message); return null; }
}

async function executeTool(name, input) {
  switch (name) {
    case "generate_design_brief": {
      const imageUrl = await generateDesignImage(input.image_prompt);
      return {
        type: "design_brief",
        data: {
          occasion: input.occasion || "", garment_type: input.garment_type || "",
          color_palette: input.color_palette || "", fabric: input.fabric || "Not specified",
          embroidery_detail: input.embroidery_detail || "Not specified",
          silhouette: input.silhouette || "Not specified",
          additional_notes: input.additional_notes || "",
          image_prompt: input.image_prompt || "", image_url: imageUrl,
          whatsapp_number: WHATSAPP_NUMBER,
        },
        text: imageUrl ? "Design created with AI visualization." : "Design brief created.",
      };
    }
    case "get_store_info": {
      const city = input.city?.toLowerCase();
      if (city === "all") return { type: "stores", data: STORE_INFO, text: "All stores." };
      return STORE_INFO[city]
        ? { type: "store", data: STORE_INFO[city], text: `Store info for ${city}.` }
        : { type: "stores", data: STORE_INFO, text: "All stores." };
    }
    default: return { type: "error", text: `Unknown tool: ${name}` };
  }
}

export async function POST(request) {
  try {
    const { messages, mode, clientProducts } = await request.json();
    if (!messages?.length) return NextResponse.json({ error: "Messages required" }, { status: 400 });

    const claudeMessages = messages.map(m => ({
      role: m.role === "bot" ? "assistant" : m.role,
      content: m.text || m.content,
    }));

    // Build product context from client-side search
    let productContext = "";
    if (clientProducts?.length) {
      productContext = "\n\n⚠️ CRITICAL: These are the ONLY products being shown to the customer as visual cards. You MUST ONLY mention products from THIS list. Do NOT invent or hallucinate product names that are not in this list.\n\n[PRODUCTS VISIBLE TO CUSTOMER RIGHT NOW]:\n" +
        clientProducts.map((p, i) =>
          `${i+1}. "${p.title}" — ${p.price}${p.onSale ? ` (was ${p.compareAtPrice}, ${p.discount}% OFF!)` : ""}`
        ).join("\n") +
        "\n\n[RULES]:\n- ONLY reference products from the list above by their EXACT title\n- The customer sees these as cards with images — don't describe what they look like\n- Give styling tips for the products SHOWN, not imaginary products\n- If these don't match what the customer asked for, say 'Here are some pieces from our collection that could work' and explain why\n- Highlight any that are on sale\n- NEVER make up product names that aren't in the list above";
    }

    const modeCtx = mode === "design"
      ? "\n\nDESIGN MODE. Gather vision quickly (1-2 questions max), then use generate_design_brief. Write an extremely detailed image_prompt for luxury Indian menswear."
      : `\n\nSTYLE ME MODE. The widget searched asukacouture.com and is showing product cards.${productContext || "\n\nNo products were found for this search. DON'T say 'I can't access the catalog'. Instead say 'I couldn't find an exact match for that — could you try a different garment type like kurta set, sherwani, or bandhgala?' Also suggest WhatsApp +91 9063356542 for personalized help."}\n\nKeep your response concise — 2-3 sentences max since the products are already visible as cards. Don't repeat all product names — just highlight 1-2 standout picks and give a styling tip.`;

    // Remove search_products tool in style mode (widget handles it)
    const tools = mode === "design" ? TOOLS : TOOLS.filter(t => t.name !== "search_products");

    let response = await client.messages.create({
      model: "claude-sonnet-4-20250514", max_tokens: 1024,
      system: STYLIST_SYSTEM_PROMPT + modeCtx, tools, messages: claudeMessages,
    });

    const toolResults = [];
    let iterations = 0;
    while (response.stop_reason === "tool_use" && iterations < 3) {
      iterations++;
      const toolUses = response.content.filter(b => b.type === "tool_use");
      const results = [];
      for (const tu of toolUses) {
        const result = await executeTool(tu.name, tu.input);
        toolResults.push({ tool: tu.name, ...result });
        results.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(result) });
      }
      response = await client.messages.create({
        model: "claude-sonnet-4-20250514", max_tokens: 1024,
        system: STYLIST_SYSTEM_PROMPT + modeCtx, tools,
        messages: [...claudeMessages, { role: "assistant", content: response.content }, { role: "user", content: results }],
      });
    }

    const replyText = response.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    const res = { reply: replyText, products: clientProducts || [], design: null, stores: null };
    for (const r of toolResults) {
      if (r.type === "design_brief") res.design = r.data;
      if (r.type === "store" || r.type === "stores") res.stores = r.data;
    }
    return NextResponse.json(res);
  } catch (error) {
    console.error("Chat API error:", error.message);
    return NextResponse.json({ reply: "I'm having a moment — could you try that again?", products: [], design: null }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
