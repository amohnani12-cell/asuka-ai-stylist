export const metadata = {
  title: "AI Asuka Stylist — Design Studio",
  description:
    "Your personal AI style advisor & design creator by Asuka Couture. 35 years of heritage in men's ethnic and western wear.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, background: "#F5F0E8" }}>{children}</body>
    </html>
  );
}
