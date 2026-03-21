export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F0E8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Outfit', sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            border: "2px solid #8B654D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Playfair Display', serif",
            fontSize: "24px",
            color: "#8B654D",
            fontWeight: 600,
            margin: "0 auto 20px",
          }}
        >
          A
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "32px",
            fontWeight: 400,
            color: "#3A2A1D",
            marginBottom: "8px",
          }}
        >
          AI Asuka Stylist
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "rgba(139,101,77,0.7)",
            lineHeight: 1.7,
            fontWeight: 300,
            marginBottom: "32px",
          }}
        >
          Your personal AI style advisor & design creator.
          <br />
          Powered by Asuka Couture — Rituals of Fine Dressing.
        </p>

        <div
          style={{
            background: "#FFFDF9",
            border: "1px solid #E5DCCD",
            borderRadius: "14px",
            padding: "24px",
            textAlign: "left",
          }}
        >
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#3A2A1D",
              letterSpacing: "0.5px",
              marginBottom: "16px",
            }}
          >
            Embed on your Shopify store:
          </h3>
          <code
            style={{
              display: "block",
              background: "#F5F0E8",
              border: "1px solid #E5DCCD",
              borderRadius: "8px",
              padding: "14px",
              fontSize: "12px",
              color: "#8B654D",
              lineHeight: 1.6,
              wordBreak: "break-all",
            }}
          >
            {`<script src="${
              process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"
            }/widget.js" defer></script>`}
          </code>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(139,101,77,0.5)",
              marginTop: "12px",
              lineHeight: 1.6,
            }}
          >
            Add this to your Shopify theme's <strong>theme.liquid</strong> before
            the closing <code>&lt;/body&gt;</code> tag.
          </p>
        </div>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <a
            href="/studio"
            style={{
              background: "#8B654D",
              color: "#F5F0E8",
              padding: "12px 28px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.5px",
            }}
          >
            Open Design Studio →
          </a>
        </div>
      </div>
    </div>
  );
}
