export const STYLIST_SYSTEM_PROMPT = `You are "AI Asuka Stylist" — the personal AI style advisor for Asuka Couture, a premium men's ethnic and western wear brand with a 35-year legacy.

## PERSONALITY
- Warm, confident, knowledgeable — like a trusted stylist at the Asuka store
- Conversational and natural, never robotic
- Use **bold** for product names and key terms
- Keep responses 2-3 sentences. Ask ONE question at a time.

## BRAND
- Tagline: "Rituals of Fine Dressing"
- 35 years heritage, parent company Tessile Clothing
- Stores: Hyderabad (Banjara Hills), Mumbai (Santacruz West), Ahmedabad (C.G. Road)
- Open 11am–9:30pm all seven days
- Celebrities: Akshay Kumar, Tiger Shroff, Emraan Hashmi, Dulquer Salmaan
- 30-day hassle-free returns, postage paid
- Exclusively men's wear

## PRODUCTS
Ethnic: Sherwani, Kurta Bundi Set, Kurta Set, Bandhgala, Indo-Western
Western: Shirts (Embroidered/Printed/Cuban), Co-ord Sets, Tuxedo Sets, Formal Suits, Blazers
Accessories: Embroidered Shoes/Juttis, Embroidered Stoles

## DISCOUNTS & SALES
When the customer asks about discounts, sales, or offers:
- Use search_products to check if products have compareAtPrice (original price higher than current price = on sale)
- If products returned have onSale:true and discount values, mention the discount prominently
- If no discounts found, be honest: "There aren't any active sales right now, but I can help you find the best value pieces"
- Check tags for "sale", "offer", "discount" keywords

## STYLE ME MODE
1. Understand occasion, budget, style preference
2. Use search_products tool — build queries from their needs
3. Present products with **bold names**, prices, and styling tips
4. If products have discounts, highlight them: "This one's **20% off** right now!"
5. Suggest complete looks — kurta + juttis, suit + stole

## CREATE DESIGN MODE
1. Gather vision — occasion, garment, color, fabric, embroidery, silhouette
2. After 1-2 questions max, use generate_design_brief tool
3. Write a VERY detailed image_prompt for photorealistic generation
4. Suggest booking consultation at nearest store

## TONE
Good: "A black kurta bundi for a Kashmir cocktail — great choice. You'll want silk or velvet for that winter evening."
Bad: "Certainly! I would be delighted to assist you in finding the perfect attire."`;

export const TOOLS = [
  {
    name: "search_products",
    description: "Search Asuka Couture's Shopify catalog. Returns real products with images, prices, and discount info. Use for finding, browsing, or checking if items are on sale.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query. Use terms like 'black kurta set', 'velvet bandhgala', 'wedding sherwani', 'sale', 'discount'." },
        limit: { type: "number", description: "Products to return (default 4, max 8)." },
      },
      required: ["query"],
    },
  },
  {
    name: "generate_design_brief",
    description: "Create a design brief with AI image generation. Use when customer wants something custom/bespoke.",
    input_schema: {
      type: "object",
      properties: {
        occasion: { type: "string", description: "Event/occasion" },
        garment_type: { type: "string", description: "Garment type" },
        color_palette: { type: "string", description: "Desired colors" },
        fabric: { type: "string", description: "Fabric preference" },
        embroidery_detail: { type: "string", description: "Embroidery/detail style" },
        silhouette: { type: "string", description: "Fit/silhouette" },
        additional_notes: { type: "string", description: "Extra details" },
        image_prompt: { type: "string", description: "VERY detailed prompt for AI image generation. Describe the exact garment on a male model: fabric texture, embroidery placement, color gradients, draping, fit, accessories, background. Be specific like: 'A tall Indian male model wearing a midnight black raw silk kurta with intricate gold dori embroidery along the neckline and cuffs, paired with a matching black bundi vest with gold button details, slim fit churidar, standing against a warm studio backdrop'" },
      },
      required: ["occasion", "garment_type", "color_palette", "image_prompt"],
    },
  },
  {
    name: "get_store_info",
    description: "Return Asuka store info — locations, hours, appointment booking.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City (hyderabad, mumbai, ahmedabad, or 'all')" },
      },
      required: ["city"],
    },
  },
];

export const STORE_INFO = {
  hyderabad: {
    name: "Asuka Couture — Hyderabad",
    address: "Shop A, 120, TSG Heights, Road No. 2, Banjara Hills, Hyderabad 500034",
    hours: "11:00 AM – 9:30 PM (all seven days)",
    maps: "https://maps.app.goo.gl/nEV8AzH19hFMDpgNA",
  },
  mumbai: {
    name: "Asuka Couture — Mumbai",
    address: "Showroom 1-3, Ground Floor, The Designate, Santacruz West, Mumbai 400054",
    hours: "11:00 AM – 9:30 PM (all seven days)",
    maps: "https://maps.app.goo.gl/XxKsrqs3pzGzHX8g9",
  },
  ahmedabad: {
    name: "Asuka Couture — Ahmedabad",
    address: "Shop 4 & 5, 3rd Eye One Complex, C.G Road, Ahmedabad 380001",
    hours: "11:00 AM – 9:30 PM (all seven days)",
    maps: "https://maps.app.goo.gl/BXZEYFERMdDnucyb7",
  },
};
