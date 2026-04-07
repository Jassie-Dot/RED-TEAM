import "./globals.css";

export const metadata = {
  title: "VIGIL-AI",
  description: "Employer-side screening MVP for resume validation and skill testing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
