"use client";

import { useEffect } from "react";

// Registra el Service Worker (public/sw.js) que habilita instalar la PWA
// y el fallback offline. No renderiza nada — solo efecto secundario.
export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("No se pudo registrar el service worker:", err);
    });
  }, []);

  return null;
}
