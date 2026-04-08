"use client";
// ============================================================
// GERENCIAMENTO DE CONFIGURAÇÕES DO ADMIN
// Usa IndexedDB como armazenamento principal
// ============================================================

import { AdminConfig } from "@/types";
import {
  SUPERVISORES_PADRAO,
  ENCARREGADOS_PADRAO,
  EQUIPES_PADRAO,
  TRANSPORTES_PADRAO,
  RODOVIAS_PADRAO,
  CANTEIROS_PADRAO,
  PREFIXOS_TRATOR_PADRAO,
  TIPOS_ROCADEIRA_PADRAO,
  TIPOS_ROBO_PADRAO,
  CONDICOES_TRABALHO_PADRAO,
} from "./constants";
import { salvarConfig, carregarConfig } from "./db";

// Configuração padrão de fábrica
export const CONFIG_PADRAO: AdminConfig = {
  supervisores: SUPERVISORES_PADRAO,
  encarregados: ENCARREGADOS_PADRAO,
  equipes: EQUIPES_PADRAO,
  transportes: TRANSPORTES_PADRAO,
  rodovias: RODOVIAS_PADRAO,
  canteiros: CANTEIROS_PADRAO,
  prefixosTrator: PREFIXOS_TRATOR_PADRAO,
  tiposRocadeira: TIPOS_ROCADEIRA_PADRAO,
  tiposRobo: TIPOS_ROBO_PADRAO,
  condicoesTrabalho: CONDICOES_TRABALHO_PADRAO,
  custosReferencia: {
    diesel: 6.25,
    gasolina: 6.05,
    oleo2T: 32,
  },
};

// Carrega config (ou retorna padrão se não existir)
export async function getAdminConfig(): Promise<AdminConfig> {
  try {
    const salva = await carregarConfig();
    if (salva) {
      return {
        ...CONFIG_PADRAO,
        ...salva,
        custosReferencia: {
          ...CONFIG_PADRAO.custosReferencia,
          ...salva.custosReferencia,
        },
      };
    }
    // Primeira execução: salva o padrão
    await salvarConfig(CONFIG_PADRAO);
    return CONFIG_PADRAO;
  } catch {
    return CONFIG_PADRAO;
  }
}

// Salva configuração
export async function saveAdminConfig(config: AdminConfig): Promise<void> {
  await salvarConfig(config);
}
