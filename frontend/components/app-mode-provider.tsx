"use client";

import { useEffect } from "react";

import { hydrateAppStores, useAppMode } from "@/store/app-store";

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useAppMode();

  useEffect(() => {
    hydrateAppStores();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.mode = mode;
    document.body.dataset.mode = mode;
  }, [mode]);

  return children;
}
