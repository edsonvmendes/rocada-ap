"use client";
// ============================================================
// SINCRONIZAÇÃO - Envia relatórios pendentes ao Google Sheets
// via Google Apps Script quando houver conexão
// ============================================================

import { buscarPendentes, buscarComErro, atualizarStatusSync } from "./db";
import { RelatorioCompleto } from "@/types";
import { parseKM } from "./kmUtils";

export const DEFAULT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz3Maq_WqHuUbNIB8lfBzJSXQHHL8YFmakRiZHJzOxBf9lW-bgjd4DulkX1Ikc0DYU7/exec";

const SCRIPT_URL_KEY = "gas_url";
const SCRIPT_TOKEN_KEY = "gas_token";

function normalizarScriptUrl(url: string | null): string | null {
  const valor = url?.trim();
  return valor ? valor : null;
}

function normalizarScriptToken(token: string | null): string | null {
  const valor = token?.trim();
  return valor ? valor : null;
}

// URL do Google Apps Script (configurada pelo admin no localStorage)
export function getScriptUrl(): string | null {
  if (typeof window === "undefined") return null;
  const configurada = normalizarScriptUrl(localStorage.getItem(SCRIPT_URL_KEY));
  if (configurada) return configurada;
  localStorage.setItem(SCRIPT_URL_KEY, DEFAULT_SCRIPT_URL);
  return DEFAULT_SCRIPT_URL;
}

export function setScriptUrl(url: string): void {
  const configurada = normalizarScriptUrl(url) ?? DEFAULT_SCRIPT_URL;
  localStorage.setItem(SCRIPT_URL_KEY, configurada);
}

export function getScriptToken(): string | null {
  if (typeof window === "undefined") return null;
  return normalizarScriptToken(localStorage.getItem(SCRIPT_TOKEN_KEY));
}

export function setScriptToken(token: string): void {
  const configurado = normalizarScriptToken(token);
  if (!configurado) {
    localStorage.removeItem(SCRIPT_TOKEN_KEY);
    return;
  }
  localStorage.setItem(SCRIPT_TOKEN_KEY, configurado);
}

export function buildScriptUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  const url = new URL(baseUrl);
  const token = getScriptToken();

  if (token) {
    url.searchParams.set("token", token);
  }

  if (params) {
    Object.entries(params).forEach(([chave, valor]) => {
      if (valor === null || valor === undefined || valor === "") return;
      url.searchParams.set(chave, String(valor));
    });
  }

  return url.toString();
}

// Converte o relatório para o formato de linha do Google Sheets
function relatorioParaLinha(r: RelatorioCompleto): Record<string, unknown> {
  const kmManualInicial = parseKM(r.rocadaManual.kmInicial);
  const kmManualFinal = parseKM(r.rocadaManual.kmFinal);
  const kmManualProd = Math.max(0, kmManualFinal - kmManualInicial);
  const areaManual = kmManualProd * 1000 * (r.rocadaManual.largura || 0);

  const calcTrator = (t: typeof r.tratorA) => {
    if (!t.ativo) return { kmProd: 0, area: 0, kmIni: 0, kmFin: 0 };
    const ini = parseKM(t.kmInicial);
    const fin = parseKM(t.kmFinal);
    const prod = Math.max(0, fin - ini);
    return { kmProd: prod, area: prod * 1000 * (t.largura || 0), kmIni: ini, kmFin: fin };
  };

  const a = calcTrator(r.tratorA);
  const b = calcTrator(r.tratorB);
  const c = calcTrator(r.tratorC);

  const roboIni = parseKM(r.robo.kmInicial);
  const roboFin = parseKM(r.robo.kmFinal);
  const roboKmProd = r.robo.ativo ? Math.max(0, roboFin - roboIni) : 0;
  const roboArea = roboKmProd * 1000 * (r.robo.largura || 0);

  const totalKm = kmManualProd + a.kmProd + b.kmProd + c.kmProd + roboKmProd;
  const totalArea = areaManual + a.area + b.area + c.area + roboArea;

  return {
    id: r.id,
    data: r.infoGeral.data,
    hora_inicio: r.infoGeral.horaInicio,
    supervisor: r.infoGeral.supervisor,
    encarregado: r.infoGeral.encarregado,
    equipe: r.infoGeral.equipe,
    transporte: r.infoGeral.transporte,
    qtd_lideres: r.infoGeral.qtdLideres,
    qtd_op_trator: r.infoGeral.qtdOperadoresTrator,
    qtd_op_equipamento: r.infoGeral.qtdOperadoresEquipamento,
    qtd_op_rocadeira: r.infoGeral.qtdOperadoresRocadeira,
    qtd_ajudantes: r.infoGeral.qtdAjudantes,
    condicoes: r.infoGeral.condicoesTrabalho,
    // Materiais
    gasolina_manual: r.materiais.gasolinaManual,
    oleo_2t: r.materiais.oleo2T,
    diesel_tratores: r.materiais.dieselTratores,
    gasolina_robo: r.materiais.gasolinaRobo,
    nylon_unidades: r.materiais.nylonUnidades,
    laminas_unidades: r.materiais.laminasUnidades,
    // Roçada Manual
    manual_rodovia: r.rocadaManual.rodovia,
    manual_canteiro: r.rocadaManual.canteiro,
    manual_km_inicial: kmManualInicial,
    manual_km_final: kmManualFinal,
    manual_largura: r.rocadaManual.largura,
    manual_km_produzido: kmManualProd,
    manual_area: areaManual,
    // Trator A
    trator_a_ativo: r.tratorA.ativo,
    trator_a_prefixo: r.tratorA.prefixo,
    trator_a_rodovia: r.tratorA.rodovia,
    trator_a_canteiro: r.tratorA.canteiro,
    trator_a_tipo: r.tratorA.tipoRocadeira,
    trator_a_km_inicial: a.kmIni,
    trator_a_km_final: a.kmFin,
    trator_a_largura: r.tratorA.largura,
    trator_a_km_produzido: a.kmProd,
    trator_a_area: a.area,
    trator_a_obs: r.tratorA.observacoes,
    // Trator B
    trator_b_ativo: r.tratorB.ativo,
    trator_b_prefixo: r.tratorB.prefixo,
    trator_b_rodovia: r.tratorB.rodovia,
    trator_b_canteiro: r.tratorB.canteiro,
    trator_b_tipo: r.tratorB.tipoRocadeira,
    trator_b_km_inicial: b.kmIni,
    trator_b_km_final: b.kmFin,
    trator_b_largura: r.tratorB.largura,
    trator_b_km_produzido: b.kmProd,
    trator_b_area: b.area,
    trator_b_obs: r.tratorB.observacoes,
    // Trator C
    trator_c_ativo: r.tratorC.ativo,
    trator_c_prefixo: r.tratorC.prefixo,
    trator_c_rodovia: r.tratorC.rodovia,
    trator_c_canteiro: r.tratorC.canteiro,
    trator_c_tipo: r.tratorC.tipoRocadeira,
    trator_c_km_inicial: c.kmIni,
    trator_c_km_final: c.kmFin,
    trator_c_largura: r.tratorC.largura,
    trator_c_km_produzido: c.kmProd,
    trator_c_area: c.area,
    trator_c_obs: r.tratorC.observacoes,
    // Robô
    robo_ativo: r.robo.ativo,
    robo_tipo: r.robo.tipo,
    robo_rodovia: r.robo.rodovia,
    robo_canteiro: r.robo.canteiro,
    robo_km_inicial: roboIni,
    robo_km_final: roboFin,
    robo_largura: r.robo.largura,
    robo_km_produzido: roboKmProd,
    robo_area: roboArea,
    robo_obs: r.robo.observacoes,
    // Fechamento
    hora_termino: r.fechamento?.horaTermino || "",
    limpeza_drenagem: r.fechamento?.limpezaDrenagem || "",
    remocao_massa_seca: r.fechamento?.remocaoMassaSeca || "",
    consideracoes_gerais: r.fechamento?.consideracoesGerais || "",
    // Totais
    total_km: totalKm,
    total_area: totalArea,
    enviado_em: new Date().toISOString(),
  };
}

// Envia um relatório para o Google Apps Script
async function enviarRelatorio(relatorio: RelatorioCompleto): Promise<boolean> {
  const url = getScriptUrl();
  if (!url) return false;

  try {
    const linha = relatorioParaLinha(relatorio);
    const response = await fetch(buildScriptUrl(url), {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(linha),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Roda a sincronização de todos os pendentes
export async function sincronizarPendentes(): Promise<{
  enviados: number;
  erros: number;
}> {
  const pendentes = await buscarPendentes();
  const comErro = await buscarComErro();
  const todos = [...pendentes, ...comErro];

  let enviados = 0;
  let erros = 0;

  for (const relatorio of todos) {
    const ok = await enviarRelatorio(relatorio);
    if (ok) {
      await atualizarStatusSync(relatorio.id!, "enviado");
      enviados++;
    } else {
      await atualizarStatusSync(relatorio.id!, "erro");
      erros++;
    }
  }

  return { enviados, erros };
}
