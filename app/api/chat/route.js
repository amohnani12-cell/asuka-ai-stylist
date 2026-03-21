import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchProducts, getCollection } from "@/lib/shopify";
import { STYLIST_SYSTEM_PROMPT, TOOLS, STORE_INFO } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Handle tool calls from Claude
 */
async function executeTool(name, input) {
  switch (name) {
    case "search_products": {
      try {
        const products = await searchProducts(input.query, input.limit || 4);
        return {
          type: "products",
          data: products,
          text: products.length
            ? `Found ${products.length} products matching "${input.query}".`
            : `No products found for "${input.query}". Try a different description.`,
        };
      } catch (err) {
        return {
          type: "error",
          text: `Could not search products right now. Let me help you differently.`,
        };
      }
    }

    case "generate_design_brief": {
      return {
        type: "design_brief",
        data: {
          occasion: input.occasion,
          garment_type: input.garment_type,
          color_palette: input.color_palette,
          fabric: input.fabric || "Not specified",
          embroidery_detail: input.embroidery_detail || "Not specified",
          silhouette: input.silhouette || "Not specified",
          additional_notes: input.additional_notes || "",
          image_prompt: input.image_prompt,
        },
        text: "Design brief created successfully.",
      };
    }

    case "get_store_info": {
      const city = input.city?.toLowerCase();
      if (city === "all") {
        return { type: "stores", data: STORE_INFO, text: "All store information." };
      }
      const store = STORE_INFO[city];
      if (store) {
        return { type: "store", data: store, text: `Store info for ${city}.` };
      }
      return { type: "stores", data: STORE_INFO, text: "Here are all our stores." };
    }

    default:
      return { type: "error", text: `Unknown tool: ${name}` };
  }
}

/**
 * POST /api/chat
 * Main conversational endpoint
 */
export async function POST(request) {
  try {
    const { messages, mode } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    // Format messages for Claude
    const claudeMessages = messages.map((m) => ({
      role: m.role === "bot" ? "assistant" : m.role,
      content: m.text || m.content,
    }));

    // Add mode context to system prompt
    const modeContext =
      mode === "design"
        ? "\n\nThe customer is in DESIGN MODE. They want to create something custom. Focus on gathering their vision and generating a design brief. Ask about occasion, garment type, colors, fabric, embroidery, and silhouette. Once you have enough detail, use the generate_design_brief tool."
        : "\n\nThe customer is in STYLE ME MODE. They want to find products from the Asuka collection. Use the search_products tool to find matching items. Show real products with prices.";

    // Initial Claude call
    let response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: STYLIST_SYSTEM_PROMPT + modeContext,
      tools: TOOLS,
      messages: claudeMessages,
    });

    // Process tool calls in a loop (multi-orchestration)
    const toolResults = [];
    let iterations = 0;
    const MAX_ITERATIONS = 3;

    while (response.stop_reason === "tool_use" && iterations < MAX_ITERATIONS) {
      iterations++;

      // Find all tool use blocks
      const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");

      // Execute all tools
      const toolResultMessages = [];
      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(toolUse.name, toolUse.input);
        toolResults.push({ tool: toolUse.name, ...result });

        toolResultMessages.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      // Continue conversation with tool results
      response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: STYLIST_SYSTEM_PROMPT + modeContext,
        tools: TOOLS,
        messages: [
          ...claudeMessages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResultMessages },
        ],
      });
    }

    // Extract text response
    const textBlocks = response.content.filter((b) => b.type === "text");
    const replyText = textBlocks.map((b) => b.text).join("\n");

    // Build structured response
    const structuredResponse = {
      reply: replyText,
      products: [],
      design: null,
      stores: null,
    };

    // Attach tool result data
    for (const result of toolResults) {
      if (result.type === "products" && result.data?.length) {
        structuredResponse.products = result.data;
      }
      if (result.type === "design_brief") {
        structuredResponse.design = result.data;
      }
      if (result.type === "store" || result.type === "stores") {
        structuredResponse.stores = result.data;
      }
    }

    return NextResponse.json(structuredResponse);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        reply: "I'm having a moment — could you try that again?",
        products: [],
        design: null,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.SHOPIFY_STORE_URL || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
