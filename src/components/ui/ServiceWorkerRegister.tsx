"use client";
// ============================================================
// Registra o Service Worker para suporte offline
// ============================================================

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {/* ignora erros silenciosamente */});
    }
  }, []);

  return null;
}
