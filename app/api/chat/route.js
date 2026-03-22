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
- Website: asukacouture.com
- WhatsApp: +91 9063356542
- Celebrities: Akshay Kumar, Tiger Shroff, Emraan Hashmi, Dulquer Salmaan, Shiv Thakare, Harbhajan Singh
- 30-day hassle-free returns, postage paid
- Exclusively men's wear

## PRODUCTS
Ethnic: Sherwani, Kurta Bundi Set, Kurta Set, Bandhgala, Indo-Western
Western: Shirts (Embroidered/Printed/Cuban), Co-ord Sets, Tuxedo Sets, Formal Suits, Blazers, Jackets, Casual Suits
Accessories: Embroidered Shoes/Juttis, Embroidered Stoles

## HANDLING PRODUCTS & SALES
- ALWAYS use search_products when customer asks about products, styles, or sales
- The search returns REAL products from asukacouture.com with real prices and images
- If products have onSale:true, highlight it: "Great news — **Product Name** is currently **X% off** at Price (was CompareAtPrice)!"
- If asked about sales and no sale items found: "I don't see active discounts on those items right now. Check **asukacouture.com** for the latest — sales update frequently! You can also WhatsApp us at +91 9063356542 for exclusive offers."
- NEVER say "I cannot access products" — the search works with real store data

## STYLE ME MODE
1. Understand occasion, budget, style preference
2. The widget automatically searches the live Asuka catalog and shows product cards
3. Present products with **bold names**, prices, images, and styling tips
4. Highlight any discounts prominently
5. Suggest complete looks — kurta + juttis, suit + stole
6. If products shown don't match the exact color requested, acknowledge it: "We don't have an exact yellow match right now, but these **gold and beige tones** are stunning alternatives that work beautifully for the same occasion"
7. ALWAYS reference the products that ARE shown — never say "I can't show products" when product cards are visible
8. If asked about a specific color and products are shown in different colors, suggest similar shades:
   - Yellow → gold, beige, cream, mustard, champagne
   - Red → maroon, burgundy, wine, crimson, rust
   - Blue → navy, royal blue, teal, sapphire, cobalt
   - Green → emerald, olive, sage, forest, hunter
   - Pink → dusty rose, blush, salmon, coral, mauve
   - Purple → plum, wine, aubergine, lavender
   - White → ivory, cream, off-white, pearl, champagne
9. If no products at all, suggest browsing asukacouture.com or WhatsApp +91 9063356542

## CREATE DESIGN MODE
1. Gather vision — occasion, garment, color, fabric, embroidery, silhouette
2. After 1-2 questions max, use generate_design_brief tool
3. Write VERY detailed image_prompt for photorealistic Indian menswear
4. After design is generated, suggest WhatsApp consultation for bespoke tailoring

## TONE
Good: "A black kurta bundi for a Kashmir cocktail — great choice. You'll want silk or velvet for that winter evening. Let me show you what we have."
Bad: "Certainly! I would be delighted to assist you."`;

export const TOOLS = [
  {
    name: "search_products",
    description: "Search Asuka Couture's LIVE website (asukacouture.com). Returns real products with real images, prices, and sale/discount info. Use this whenever customer asks about products, styles, collections, or sales/offers.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query matching real products. Examples: 'kurta bundi set', 'sherwani', 'black bandhgala', 'embroidered shirt', 'tuxedo set', 'co-ord set', 'blazer', 'indo western'. Use garment category names." },
        limit: { type: "number", description: "Products to return (default 4, max 8)." },
      },
      required: ["query"],
    },
  },
  {
    name: "generate_design_brief",
    description: "Create a bespoke design brief with AI image generation. Use when customer wants something custom that doesn't exist in the catalog.",
    input_schema: {
      type: "object",
      properties: {
        occasion: { type: "string" },
        garment_type: { type: "string", description: "Specific garment: sherwani, kurta bundi set, kurta set, bandhgala, indo-western, tuxedo, suit, co-ord set, shirt" },
        color_palette: { type: "string", description: "Specific colors: midnight black, ivory cream, deep maroon, royal navy, dusty rose, champagne gold, emerald green" },
        fabric: { type: "string", description: "Fabric: raw silk, dupion silk, velvet, brocade, linen, cotton, wool, organza" },
        embroidery_detail: { type: "string", description: "Embroidery: gold dori work, silver zardozi, thread embroidery, mirror work, sequin, minimal" },
        silhouette: { type: "string" },
        additional_notes: { type: "string" },
        image_prompt: { type: "string", description: "Write a detailed garment description for Asuka Couture's AI image generator. Focus ONLY on describing the GARMENT on the model — the photography style is already handled. Describe: 1) The EXACT garment construction — use proper Indian menswear terminology (sherwani with mandarin collar and front opening, kurta with side slit and nehru collar, bundi vest with V-neck, bandhgala with closed neck). 2) FABRIC texture you can feel — 'rich raw silk with a subtle matte sheen', 'deep-pile crushed velvet', 'handwoven Banarasi brocade with gold metallic jaal'. 3) EXACT embroidery placement — 'intricate gold dori work running along the center panel from collar to hem', 'zardozi peacock motifs clustered on the chest with scattered bootis', 'tonal resham thread work on cuffs and collar border'. 4) COMPLETE outfit — bottom wear ('matching slim-fit churidar' or 'tapered black trousers'), footwear ('hand-embroidered black velvet juttis with gold tilla work' or 'polished black oxford shoes'), accessories ('cream silk pocket square', 'gold pearl brooch on lapel', 'embroidered dupatta draped over shoulder'). 5) FIT details — 'tailored slim fit with structured shoulders', 'relaxed drape with a slight A-line'. Keep it to 2-3 sentences of pure garment description. Example: 'a midnight black raw silk sherwani with intricate gold dori embroidery cascading from the mandarin collar down the center panel, antique gold buttons, paired with a matching black churidar and black velvet juttis with gold tilla work, cream silk pocket square tucked in chest pocket'" },
      },
      required: ["occasion", "garment_type", "color_palette", "image_prompt"],
    },
  },
  {
    name: "get_store_info",
    description: "Return Asuka store info — locations, hours, WhatsApp, appointment booking.",
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
    whatsapp: "+919063356542",
  },
  mumbai: {
    name: "Asuka Couture — Mumbai",
    address: "Showroom 1-3, Ground Floor, The Designate, Santacruz West, Mumbai 400054",
    hours: "11:00 AM – 9:30 PM (all seven days)",
    maps: "https://maps.app.goo.gl/XxKsrqs3pzGzHX8g9",
    whatsapp: "+919063356542",
  },
  ahmedabad: {
    name: "Asuka Couture — Ahmedabad",
    address: "Shop 4 & 5, 3rd Eye One Complex, C.G Road, Ahmedabad 380001",
    hours: "11:00 AM – 9:30 PM (all seven days)",
    maps: "https://maps.app.goo.gl/BXZEYFERMdDnucyb7",
    whatsapp: "+919063356542",
  },
};

export const WHATSAPP_NUMBER = "919063356542";
