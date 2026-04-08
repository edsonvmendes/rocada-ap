"use client";
// ============================================================
// HOOK: useAdminConfig - Carrega config do admin (dropdowns)
// ============================================================

import { useState, useEffect } from "react";
import { AdminConfig } from "@/types";
import { getAdminConfig } from "@/lib/adminConfig";
import { CONFIG_PADRAO } from "@/lib/adminConfig";

export function useAdminConfig() {
  const [config, setConfig] = useState<AdminConfig>(CONFIG_PADRAO);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    getAdminConfig().then((c) => {
      setConfig(c);
      setCarregando(false);
    });
  }, []);

  return { config, carregando };
}
