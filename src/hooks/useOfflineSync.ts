"use client";
// ============================================================
// HOOK: useOfflineSync - Monitora conexão e sincroniza pendentes
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { sincronizarPendentes } from "@/lib/sync";
import { buscarPendentes, buscarComErro } from "@/lib/db";

export function useOfflineSync() {
  const [online, setOnline] = useState(true);
  const [pendentes, setPendentes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimaSync, setUltimaSync] = useState<string | null>(null);

  // Atualiza contagem de pendentes
  const atualizarPendentes = useCallback(async () => {
    const p = await buscarPendentes();
    const e = await buscarComErro();
    setPendentes(p.length + e.length);
  }, []);

  // Tenta sincronizar
  const sincronizar = useCallback(async () => {
    if (!online || sincronizando) return;
    setSincronizando(true);
    try {
      const resultado = await sincronizarPendentes();
      if (resultado.enviados > 0) {
        setUltimaSync(new Date().toLocaleTimeString("pt-BR"));
      }
      await atualizarPendentes();
    } finally {
      setSincronizando(false);
    }
  }, [online, sincronizando, atualizarPendentes]);

  useEffect(() => {
    // Estado inicial de conexão
    setOnline(navigator.onLine);

    const handleOnline = () => {
      setOnline(true);
      // Ao voltar a internet, sincroniza automaticamente
      sincronizar();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Carrega contagem inicial
    atualizarPendentes();

    // Tenta sincronizar a cada 2 minutos quando online
    const interval = setInterval(() => {
      if (navigator.onLine) sincronizar();
    }, 2 * 60 * 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [sincronizar, atualizarPendentes]);

  return { online, pendentes, sincronizando, ultimaSync, sincronizar, atualizarPendentes };
}
