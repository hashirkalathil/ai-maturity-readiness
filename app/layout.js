import "./globals.css";

export const metadata = {
  title: "AI Maturity Assessment",
  description: "Measure organizational AI readiness across seven dimensions.",
  keywords: ["AI maturity", "assessment", "readiness", "strategy"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
