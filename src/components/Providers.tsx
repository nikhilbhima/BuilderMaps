"use client";

import { ReactNode } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/contexts/ThemeContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>{children}</AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
