"use client";
// ============================================================
// DASHBOARD - Lê dados do Google Sheets (histórico completo)
// + dados locais ainda não sincronizados
// ============================================================

import { useState, useEffect, useMemo } from "react";
import { getScriptUrl } from "@/lib/sync";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";

// ---- Tipo de linha vinda da planilha ----
interface LinhaPlanilha {
  carimbo: string;
  data: string;
  hora_inicio: string;
  supervisor: string;
  encarregado: string;
  equipe: string;
  manual_km_inicial: string;
  manual_km_final: string;
  manual_largura: string;
  trator_a_prefixo: string;
  trator_a_km_inicial: string;
  trator_a_km_final: string;
  trator_a_largura: string;
  trator_b_prefixo: string;
  trator_b_km_inicial: string;
  trator_b_km_final: string;
  trator_b_largura: string;
  trator_c_prefixo: string;
  trator_c_km_inicial: string;
  trator_c_km_final: string;
  trator_c_largura: string;
  robo_tipo: string;
  robo_km_inicial: string;
  robo_km_final: string;
  robo_largura: string;
  diesel_tratores: string;
  gasolina_manual: string;
  gasolina_robo: string;
  [key: string]: string;
}

// ---- Helpers de cálculo ----
function parseKM(s: string): number {
  if (!s) return 0;
  // Suporta formatos "142,941" e "142.941" e "142941"
  const limpo = String(s).replace(/\s/g, "");
  if (limpo.includes(",")) return parseFloat(limpo.replace(",", "."));
  if (limpo.includes(".")) return parseFloat(limpo);
  // 6 dígitos sem separador: primeiros 3 = km, últimos 3 = metros
  if (limpo.length === 6 && /^\d+$/.test(limpo)) {
    return parseFloat(limpo.slice(0, 3) + "." + limpo.slice(3));
  }
  return parseFloat(limpo) || 0;
}

function kmProd(ini: string, fin: string): number {
  return Math.max(0, parseKM(fin) - parseKM(ini));
}

function calcTotaisLinha(r: LinhaPlanilha) {
  const manual = kmProd(r.manual_km_inicial, r.manual_km_final);
  const aManual = manual * 1000 * (parseFloat(r.manual_largura) || 0);

  const ta = r.trator_a_prefixo && r.trator_a_prefixo !== "N/A"
    ? kmProd(r.trator_a_km_inicial, r.trator_a_km_final) : 0;
  const aA = ta * 1000 * (parseFloat(r.trator_a_largura) || 0);

  const tb = r.trator_b_prefixo && r.trator_b_prefixo !== "N/A"
    ? kmProd(r.trator_b_km_inicial, r.trator_b_km_final) : 0;
  const aB = tb * 1000 * (parseFloat(r.trator_b_largura) || 0);

  const tc = r.trator_c_prefixo && r.trator_c_prefixo !== "N/A"
    ? kmProd(r.trator_c_km_inicial, r.trator_c_km_final) : 0;
  const aC = tc * 1000 * (parseFloat(r.trator_c_largura) || 0);

  const robo = r.robo_tipo && r.robo_tipo !== "N/A"
    ? kmProd(r.robo_km_inicial, r.robo_km_final) : 0;
  const aRobo = robo * 1000 * (parseFloat(r.robo_largura) || 0);

  return {
    km: manual + ta + tb + tc + robo,
    area: aManual + aA + aB + aC + aRobo,
    kmManual: manual,
    kmTratores: ta + tb + tc,
    kmRobo: robo,
    diesel: parseFloat(r.diesel_tratores) || 0,
    gasolinaManual: parseFloat(r.gasolina_manual) || 0,
    gasolinaRobo: parseFloat(r.gasolina_robo) || 0,
  };
}

// Converte data do formato brasileiro (dd/mm/aaaa) para ISO (aaaa-mm-dd)
function dataParaISO(data: string): string {
  if (!data) return "";
  // Já está em ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) return data.slice(0, 10);
  // dd/mm/aaaa
  const partes = data.split("/");
  if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}`;
  return data.slice(0, 10);
}

function formatKM(km: number) {
  return km.toFixed(3).replace(".", ",") + " km";
}

function formatArea(area: number) {
  if (area >= 10000) return `${(area / 10000).toFixed(2)} ha`;
  return `${area.toFixed(0)} m²`;
}

function formatDataExib(iso: string) {
  if (!iso) return "—";
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function KPICard({ label, valor, sub, cor }: { label: string; valor: string; sub?: string; cor: string }) {
  return (
    <div className={`rounded-2xl p-4 ${cor} flex flex-col gap-1`}>
      <p className="text-xs font-semibold text-white/80 uppercase">{label}</p>
      <p className="text-2xl font-bold text-white leading-tight">{valor}</p>
      {sub && <p className="text-xs text-white/70">{sub}</p>}
    </div>
  );
}

type Periodo = "7" | "30" | "90" | "todos";

export default function PaginaDashboard() {
  const [dados, setDados] = useState<LinhaPlanilha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Periodo>("30");
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    const url = getScriptUrl();
    if (!url) {
      setErro("URL do Apps Script não configurada. Acesse /admin → Integração.");
      setCarregando(false);
      return;
    }
    try {
      const res = await fetch(`${url}?action=getData`);
      const json = await res.json();
      if (json.ok) {
        setDados(json.dados || []);
        setAtualizadoEm(new Date().toLocaleTimeString("pt-BR"));
      } else {
        setErro("Erro ao buscar dados: " + json.erro);
      }
    } catch {
      setErro("Não foi possível conectar ao servidor. Verifique a URL do Apps Script no Admin.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  // Filtra por período
  const filtrados = useMemo(() => {
    if (periodo === "todos") return dados;
    const dias = parseInt(periodo);
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);
    return dados.filter((r) => {
      const iso = dataParaISO(r.data);
      if (!iso) return true;
      return new Date(iso) >= limite;
    });
  }, [dados, periodo]);

  // KPIs globais
  const kpis = useMemo(() => {
    const totais = filtrados.map(calcTotaisLinha);
    return {
      totalKm: totais.reduce((s, t) => s + t.km, 0),
      totalArea: totais.reduce((s, t) => s + t.area, 0),
      totalRelatorios: filtrados.length,
      kmManual: totais.reduce((s, t) => s + t.kmManual, 0),
      kmTratores: totais.reduce((s, t) => s + t.kmTratores, 0),
      kmRobo: totais.reduce((s, t) => s + t.kmRobo, 0),
      diesel: totais.reduce((s, t) => s + t.diesel, 0),
      gasolinaManual: totais.reduce((s, t) => s + t.gasolinaManual, 0),
    };
  }, [filtrados]);

  // Produção por dia
  const producaoPorDia = useMemo(() => {
    const mapa = new Map<string, number>();
    filtrados.forEach((r) => {
      const iso = dataParaISO(r.data);
      const { km } = calcTotaisLinha(r);
      mapa.set(iso, (mapa.get(iso) || 0) + km);
    });
    return Array.from(mapa.entries())
      .filter(([d]) => d)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-20)
      .map(([data, km]) => ({ data: formatDataExib(data), km: parseFloat(km.toFixed(3)) }));
  }, [filtrados]);

  // Produção por equipe
  const producaoPorEquipe = useMemo(() => {
    const mapa = new Map<string, number>();
    filtrados.forEach((r) => {
      const equipe = r.equipe || "Sem equipe";
      const { km } = calcTotaisLinha(r);
      mapa.set(equipe, (mapa.get(equipe) || 0) + km);
    });
    return Array.from(mapa.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([equipe, km]) => ({ equipe, km: parseFloat(km.toFixed(3)) }));
  }, [filtrados]);

  // Produção por encarregado (top 8)
  const producaoPorEncarregado = useMemo(() => {
    const mapa = new Map<string, number>();
    filtrados.forEach((r) => {
      const nome = (r.encarregado || "—").split(" ")[0];
      const { km } = calcTotaisLinha(r);
      mapa.set(nome, (mapa.get(nome) || 0) + km);
    });
    return Array.from(mapa.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([nome, km]) => ({ nome, km: parseFloat(km.toFixed(3)) }));
  }, [filtrados]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">📊 Dashboard</h1>
            <p className="text-blue-200 text-xs">
              {atualizadoEm ? `Atualizado às ${atualizadoEm}` : "Coordenador Geral"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={carregar}
              disabled={carregando}
              className="bg-blue-500 text-white text-xs px-3 py-2 rounded-xl font-bold disabled:opacity-50"
            >
              {carregando ? "⏳" : "🔄"} Atualizar
            </button>
            <a href="/" className="bg-green-600 text-white text-xs px-3 py-2 rounded-xl font-bold">
              📋 Form
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-5 pb-10">

        {/* Erro de configuração */}
        {erro && (
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-5 text-center">
            <p className="text-3xl mb-2">⚠️</p>
            <p className="font-bold text-red-700 mb-1">Sem conexão com a planilha</p>
            <p className="text-sm text-red-600">{erro}</p>
            <a href="/admin" className="mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
              Ir para Admin
            </a>
          </div>
        )}

        {carregando && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-10 text-center">
            <p className="text-4xl mb-3">⏳</p>
            <p className="text-gray-500 font-medium">Buscando dados da planilha...</p>
          </div>
        )}

        {!carregando && !erro && (
          <>
            {/* Seletor de período */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Período</p>
              <div className="grid grid-cols-4 gap-2">
                {([["7", "7 dias"], ["30", "30 dias"], ["90", "90 dias"], ["todos", "Tudo"]] as [Periodo, string][]).map(
                  ([val, label]) => (
                    <button key={val} onClick={() => setPeriodo(val)}
                      className={`py-2 rounded-xl text-sm font-bold transition-all ${
                        periodo === val ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {filtrados.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-10 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 font-medium">Nenhum relatório neste período</p>
              </div>
            ) : (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-2 gap-3">
                  <KPICard label="KM Total" valor={formatKM(kpis.totalKm)} sub={`${kpis.totalRelatorios} relatórios`} cor="bg-blue-600" />
                  <KPICard label="Área Total" valor={formatArea(kpis.totalArea)} cor="bg-green-600" />
                  <KPICard label="KM Manual" valor={formatKM(kpis.kmManual)} cor="bg-orange-500" />
                  <KPICard label="KM Tratores" valor={formatKM(kpis.kmTratores)} cor="bg-purple-600" />
                  <KPICard label="Diesel" valor={`${kpis.diesel.toFixed(0)} L`} cor="bg-gray-600" />
                  <KPICard label="Gasolina Manual" valor={`${kpis.gasolinaManual.toFixed(0)} L`} cor="bg-yellow-600" />
                </div>

                {/* Produção diária */}
                {producaoPorDia.length > 1 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                    <p className="font-bold text-gray-700 mb-4">📈 Produção Diária (km)</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={producaoPorDia}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="data" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v) => [`${Number(v).toFixed(3)} km`, "KM"]} />
                        <Line type="monotone" dataKey="km" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Por equipe */}
                {producaoPorEquipe.length > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                    <p className="font-bold text-gray-700 mb-4">👥 Produção por Equipe (km)</p>
                    <ResponsiveContainer width="100%" height={Math.max(180, producaoPorEquipe.length * 44)}>
                      <BarChart data={producaoPorEquipe} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="equipe" type="category" tick={{ fontSize: 11 }} width={90} />
                        <Tooltip formatter={(v) => [`${Number(v).toFixed(3)} km`, "KM"]} />
                        <Bar dataKey="km" fill="#16a34a" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Por encarregado */}
                {producaoPorEncarregado.length > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                    <p className="font-bold text-gray-700 mb-4">👷 Top Encarregados (km)</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={producaoPorEncarregado}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v) => [`${Number(v).toFixed(3)} km`, "KM"]} />
                        <Bar dataKey="km" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Distribuição */}
                {kpis.totalKm > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                    <p className="font-bold text-gray-700 mb-4">🔍 Distribuição de Produção</p>
                    <div className="flex flex-col gap-3">
                      {[
                        { label: "🌿 Manual", km: kpis.kmManual, cor: "bg-green-500" },
                        { label: "🚜 Tratores", km: kpis.kmTratores, cor: "bg-orange-500" },
                        { label: "🤖 Robô", km: kpis.kmRobo, cor: "bg-purple-500" },
                      ].map(({ label, km, cor }) => {
                        const pct = kpis.totalKm > 0 ? (km / kpis.totalKm) * 100 : 0;
                        return (
                          <div key={label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700">{label}</span>
                              <span className="text-gray-500">{formatKM(km)} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${cor} rounded-full`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Últimos relatórios */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <p className="font-bold text-gray-700">🕓 Últimos Relatórios ({filtrados.length})</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {filtrados.slice(0, 15).map((r, i) => {
                      const { km } = calcTotaisLinha(r);
                      const iso = dataParaISO(r.data);
                      return (
                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{r.equipe || "—"}</p>
                            <p className="text-xs text-gray-500">
                              {iso ? formatDataExib(iso) : r.data} • {(r.encarregado || "—").split(" ")[0]}
                            </p>
                          </div>
                          <p className="font-bold text-blue-700 text-sm">{formatKM(km)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
