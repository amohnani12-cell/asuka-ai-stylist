import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchProducts } from "@/lib/shopify";
import { STYLIST_SYSTEM_PROMPT, TOOLS, STORE_INFO } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function generateDesignImageUrl(prompt) {
  const enhanced = `professional Indian menswear fashion photography, studio lighting, male model wearing ${prompt}, luxury fashion catalog, clean background, photorealistic, high detail, 4k`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?width=512&height=680&nologo=true&model=flux&seed=${Date.now()}`;
}

async function executeTool(name, input) {
  switch (name) {
    case "search_products": {
      try {
        const products = await searchProducts(input.query, input.limit || 4);
        const saleItems = products.filter(p => p.onSale);
        let text = products.length
          ? `Found ${products.length} products.`
          : `No products found for "${input.query}".`;
        if (saleItems.length) text += ` ${saleItems.length} item(s) are currently on sale!`;
        return { type: "products", data: products, text };
      } catch (err) {
        console.error("Shopify error:", err);
        return { type: "error", text: "Could not search products. Let me help differently." };
      }
    }
    case "generate_design_brief": {
      return {
        type: "design_brief",
        data: {
          ...input,
          fabric: input.fabric || "Not specified",
          embroidery_detail: input.embroidery_detail || "Not specified",
          silhouette: input.silhouette || "Not specified",
          additional_notes: input.additional_notes || "",
          image_url: generateDesignImageUrl(input.image_prompt),
        },
        text: "Design brief created with AI visualization.",
      };
    }
    case "get_store_info": {
      const city = input.city?.toLowerCase();
      if (city === "all") return { type: "stores", data: STORE_INFO, text: "All stores." };
      return STORE_INFO[city]
        ? { type: "store", data: STORE_INFO[city], text: `Store info for ${city}.` }
        : { type: "stores", data: STORE_INFO, text: "All stores." };
    }
    default:
      return { type: "error", text: `Unknown tool: ${name}` };
  }
}

export async function POST(request) {
  try {
    const { messages, mode } = await request.json();
    if (!messages?.length) return NextResponse.json({ error: "Messages required" }, { status: 400 });

    const claudeMessages = messages.map(m => ({
      role: m.role === "bot" ? "assistant" : m.role,
      content: m.text || m.content,
    }));

    const modeCtx = mode === "design"
      ? "\n\nDESIGN MODE active. Gather vision quickly (1-2 questions max), then use generate_design_brief. Write an extremely detailed image_prompt describing the garment on a male model."
      : "\n\nSTYLE ME MODE active. Use search_products for matching items. Highlight any discounts. Use **bold** for product names.";

    let response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: STYLIST_SYSTEM_PROMPT + modeCtx,
      tools: TOOLS,
      messages: claudeMessages,
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
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: STYLIST_SYSTEM_PROMPT + modeCtx,
        tools: TOOLS,
        messages: [...claudeMessages, { role: "assistant", content: response.content }, { role: "user", content: results }],
      });
    }

    const replyText = response.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    const res = { reply: replyText, products: [], design: null, stores: null };
    for (const r of toolResults) {
      if (r.type === "products" && r.data?.length) res.products = r.data;
      if (r.type === "design_brief") res.design = r.data;
      if (r.type === "store" || r.type === "stores") res.stores = r.data;
    }
    return NextResponse.json(res);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ reply: "I'm having a moment — could you try that again?", products: [], design: null, error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
}
