import type { Metadata } from "next";

import { AppModeProvider } from "@/components/app-mode-provider";
import { AnalysisProvider } from "@/components/analysis-provider";
import { BootScreen } from "@/components/boot-screen";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vigil-AI Recruiting Workspace",
  description:
    "Production-grade recruiting intelligence for trust scoring, resume analysis, hiring insights, and interview execution.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/brand-mark.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-body">
        <AppModeProvider>
          <BootScreen>
            <AnalysisProvider>{children}</AnalysisProvider>
          </BootScreen>
        </AppModeProvider>
      </body>
    </html>
  );
}
