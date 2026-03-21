# AI Asuka Stylist

**Your personal AI style advisor & design creator by Asuka Couture.**

A conversational AI chatbot that helps customers discover products from Asuka's Shopify catalog and create custom design concepts. Built with Next.js, Claude AI, and Shopify Storefront API. Deploys to Vercel and embeds on your Shopify store as a floating widget.

---

## Architecture

```
┌──────────────────────────────────────────┐
│           asukacouture.com               │
│              (Shopify)                   │
│                                          │
│   ┌──────────────────────────────────┐   │
│   │  <script src="widget.js" />      │   │
│   │                                  │   │
│   │  ┌────────────────────────────┐  │   │
│   │  │   AI Asuka Stylist         │  │   │
│   │  │   ┌──────┐ ┌────────────┐ │  │   │
│   │  │   │Style │ │Create      │ │  │   │
│   │  │   │Me    │ │Design      │ │  │   │
│   │  │   └──────┘ └────────────┘ │  │   │
│   │  └──────────────┬─────────────┘  │   │
│   └─────────────────┼────────────────┘   │
└─────────────────────┼────────────────────┘
                      │ API calls
                      ▼
          ┌───────────────────────┐
          │   Vercel (Next.js)    │
          │                       │
          │  /api/chat ───────────┼──► Claude AI (Anthropic)
          │     │                 │      - Conversation
          │     │                 │      - Tool orchestration
          │     ├─ search_products┼──► Shopify Storefront API
          │     ├─ design_brief   │      - Product search
          │     └─ store_info     │      - Collections
          │                       │
          └───────────────────────┘
```

## How It Works

### Multi-Orchestration

The AI uses Claude's **tool use** to dynamically decide what to do based on the conversation:

1. **Customer says "Show me wedding sherwanis"** → Claude calls `search_products` → Returns real Shopify products with images, prices, and links
2. **Customer says "I want a custom black kurta bundi for Kashmir"** → Claude calls `generate_design_brief` → Creates a structured design concept
3. **Customer says "Where's your Mumbai store?"** → Claude calls `get_store_info` → Returns store details with maps link
4. **Claude can chain tools** — search products, not find a match, then suggest custom design — all in one turn

### Two Modes, One Widget

- **Style Me** — Product discovery from Shopify catalog
- **Create Design** — Custom bespoke design generation

The AI intelligently routes between modes based on the conversation.

---

## Setup & Deployment

### Prerequisites

- [Node.js 18+](https://nodejs.org)
- [Vercel account](https://vercel.com) (free tier works)
- [GitHub account](https://github.com)
- [Anthropic API key](https://console.anthropic.com)
- Shopify Storefront API access token

### Step 1: Get Your API Keys

#### Anthropic (Claude AI)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Save it — you'll need it for `ANTHROPIC_API_KEY`

#### Shopify Storefront API
1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps" → "Create an app"
3. Name it "AI Asuka Stylist"
4. Under "Configuration" → Storefront API access scopes, enable:
   - `unauthenticated_read_products`
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_tags`
5. Install the app and copy the **Storefront API access token**

### Step 2: Deploy to Vercel

```bash
# Clone/download this project
cd asuka-ai-stylist

# Push to GitHub
git init
git add .
git commit -m "Initial commit - AI Asuka Stylist"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/asuka-ai-stylist.git
git push -u origin main
```

Then:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables:
   - `ANTHROPIC_API_KEY` = your Anthropic key
   - `SHOPIFY_STORE_DOMAIN` = `asukacouture.myshopify.com`
   - `SHOPIFY_STOREFRONT_TOKEN` = your Storefront token
   - `SHOPIFY_STORE_URL` = `https://asukacouture.com`
   - `NEXT_PUBLIC_APP_URL` = (will be set after first deploy)
4. Deploy!
5. After deploy, copy your Vercel URL and update `NEXT_PUBLIC_APP_URL`

### Step 3: Embed on Shopify

1. Go to Shopify Admin → Online Store → Themes → Edit Code
2. Open `layout/theme.liquid`
3. Add this just before `</body>`:

```html
<script src="https://YOUR-APP.vercel.app/widget.js" defer></script>
```

4. Save. Done.

---

## Project Structure

```
asuka-ai-stylist/
├── app/
│   ├── layout.js              # Next.js layout
│   ├── page.js                # Status/dashboard page
│   └── api/
│       └── chat/
│           └── route.js       # Main AI orchestration endpoint
├── lib/
│   ├── shopify.js             # Shopify Storefront API client
│   └── prompts.js             # Claude system prompts & tools
├── public/
│   └── widget.js              # Embeddable chat widget (vanilla JS)
├── embed/
│   └── shopify-snippet.liquid # Shopify theme embed code
├── .env.example               # Environment variables template
├── next.config.js             # Next.js + CORS config
└── package.json
```

---

## Customization

### Changing the AI personality
Edit `lib/prompts.js` → `STYLIST_SYSTEM_PROMPT`

### Adding product categories
Edit the tool definitions in `lib/prompts.js` → `TOOLS`

### Changing widget colors
Edit the color constants at the top of `public/widget.js`

### Adding image generation for designs
1. Get a [Replicate API token](https://replicate.com)
2. Add `REPLICATE_API_TOKEN` to your env vars
3. Add an image generation call in the `generate_design_brief` tool handler in `app/api/chat/route.js`

---

## Cost Estimates

- **Claude API**: ~$0.003 per conversation turn (Sonnet)
- **Vercel**: Free tier handles ~100K requests/month
- **Shopify Storefront API**: Free (included with Shopify)

For ~1000 conversations/month: approximately $15-30/month in Claude API costs.

---

Built with ❤️ for Asuka Couture — Rituals of Fine Dressing
