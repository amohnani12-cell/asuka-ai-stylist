import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { STYLIST_SYSTEM_PROMPT, TOOLS, STORE_INFO, WHATSAPP_NUMBER } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateDesignImage(prompt) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  try {
    const enhanced = `
Ultra-realistic commercial fashion photograph of an Indian male model wearing a ${prompt}.

STRICT FOCUS ON GARMENT (TOP PRIORITY):
- embroidery must be extremely sharp, intricate, and clearly visible
- fabric texture must show richness (silk sheen, velvet depth, linen grain)
- stitching, seams, and craftsmanship must look premium and couture-level
- garment must look structured, well-fitted, and luxurious

GARMENT PRESENTATION:
- full-length outfit clearly visible
- clean silhouette, elegant fall and drape of fabric
- no distortion, no exaggerated fantasy styling
- outfit must look wearable and ready for a luxury retail campaign

MODEL:
- Indian male model with sharp jawline, well-groomed beard, styled hair
- confident, neutral expression
- strong posture, facing camera

LIGHTING:
- soft studio lighting with warm key light
- subtle rim light for depth and separation
- evenly lit garment (no harsh shadows hiding details)

BACKGROUND:
- minimal luxury studio background (beige / ivory / warm neutral tones)
- soft gradient or subtle texture
- no props, no distractions

CAMERA & QUALITY:
- medium format camera look
- ultra high resolution
- extremely sharp focus on garment
- realistic skin tones and fabric colors

STYLE REFERENCE:
- premium Indian couture campaign (Sabyasachi / Tarun Tahiliani level realism)

OUTPUT REQUIREMENT:
- hyper-realistic (must look like a real photoshoot, NOT AI)
- garment must be the hero of the image
- suitable for luxury fashion brand campaign
`;

    const res = await fetch(
      "https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt: enhanced,
            aspect_ratio: "3:4",
            output_format: "webp",
            output_quality: 95,
            safety_tolerance: 2,
            prompt_upsampling: true,
            num_outputs: 2
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("Replicate error:", res.status);
      return null;
    }

    const pred = await res.json();

    if (pred.output?.[0]) return pred.output[0];
    if (typeof pred.output === "string") return pred.output;

    if (pred.urls?.get) {
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const poll = await fetch(pred.urls.get, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const p = await poll.json();

        if (p.status === "succeeded") {
          return p.output?.[0] ||
            (typeof p.output === "string" ? p.output : null);
        }

        if (p.status === "failed" || p.status === "canceled") {
          return null;
        }
      }
    }

    return null;
  } catch (err) {
    console.error("Replicate error:", err.message);
    return null;
  }
}

async function executeTool(name, input) {
  switch (name) {
    case "generate_design_brief": {
      const imageUrl = await generateDesignImage(input.image_prompt);
      return {
        type: "design_brief",
        data: {
          occasion: input.occasion || "",
          garment_type: input.garment_type || "",
          color_palette: input.color_palette || "",
          fabric: input.fabric || "Not specified",
          embroidery_detail: input.embroidery_detail || "Not specified",
          silhouette: input.silhouette || "Not specified",
          additional_notes: input.additional_notes || "",
          image_prompt: input.image_prompt || "",
          image_url: imageUrl,
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

    default:
      return { type: "error", text: `Unknown tool: ${name}` };
  }
}

export async function POST(request) {
  try {
    const { messages, mode, clientProducts } = await request.json();
    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const claudeMessages = messages.map(m => ({
      role: m.role === "bot" ? "assistant" : m.role,
      content: m.text || m.content,
    }));

    let productContext = "";
    if (clientProducts?.length) {
      productContext =
        "\n\n[LIVE PRODUCTS FROM ASUKACOUTURE.COM - Show these to the customer with styling tips]\n" +
        clientProducts
          .map(
            p =>
              `• ${p.title} — ${p.price}${
                p.onSale ? ` (was ${p.compareAtPrice}, ${p.discount}% OFF!)` : ""
              } — ${p.url}`
          )
          .join("\n") +
        "\n[Reference these REAL products by name and price. If any are on sale, highlight the discount prominently.]";
    }

    const modeCtx =
      mode === "design"
        ? "\n\nDESIGN MODE. Gather vision quickly (1-2 questions max), then use generate_design_brief. Write an extremely detailed image_prompt for luxury Indian menswear."
        : `\n\nSTYLE ME MODE. The widget has already searched for products on asukacouture.com.${
            productContext ||
            "\n\nNo products were found for this query. Give helpful styling advice and suggest the customer browse asukacouture.com directly or try asking for a different category. You can also suggest they WhatsApp +91 9063356542 for personalized help."
          }\n\nPresent the products with **bold names**, prices, and styling tips. Highlight any discounts. Suggest complete looks.`;

    const tools = mode === "design" ? TOOLS : TOOLS.filter(t => t.name !== "search_products");

    let response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: STYLIST_SYSTEM_PROMPT + modeCtx,
      tools,
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

        results.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: JSON.stringify(result),
        });
      }

      response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: STYLIST_SYSTEM_PROMPT + modeCtx,
        tools,
        messages: [
          ...claudeMessages,
          { role: "assistant", content: response.content },
          { role: "user", content: results },
        ],
      });
    }

    const replyText = response.content
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n");

    const res = {
      reply: replyText,
      products: clientProducts || [],
      design: null,
      stores: null,
    };

    for (const r of toolResults) {
      if (r.type === "design_brief") res.design = r.data;
      if (r.type === "store" || r.type === "stores") res.stores = r.data;
    }

    return NextResponse.json(res);
  } catch (error) {
    console.error("Chat API error:", error.message);
    return NextResponse.json(
      { reply: "I'm having a moment — could you try that again?", products: [], design: null },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
