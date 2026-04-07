import "./globals.css";

export const metadata = {
  title: "VIGIL-AI",
  description: "Cyber-styled fake resume detector with Groq-powered extraction, question generation, and authenticity scoring.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
