"use client";
// ============================================================
// PÁGINA DASHBOARD - Visão do coordenador geral
// Produtividade, comparações por equipe/rodovia
// ============================================================

import { useState, useEffect, useMemo } from "react";
import { RelatorioCompleto } from "@/types";
import { buscarTodos } from "@/lib/db";
import { sincronizarPendentes } from "@/lib/sync";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import { calcularKMProduzido, calcularArea, formatarArea } from "@/lib/kmUtils";

// ---- Helpers ----
function calcTotaisRelatorio(r: RelatorioCompleto) {
  const kmM = calcularKMProduzido(r.rocadaManual.kmInicial, r.rocadaManual.kmFinal);
  const areaM = calcularArea(kmM, r.rocadaManual.largura);

  const calcT = (t: typeof r.tratorA) => {
    if (!t.ativo) return { km: 0, area: 0 };
    const km = calcularKMProduzido(t.kmInicial, t.kmFinal);
    return { km, area: calcularArea(km, t.largura) };
  };

  const a = calcT(r.tratorA);
  const b = calcT(r.tratorB);
  const c = calcT(r.tratorC);

  const kmRobo = r.robo.ativo ? calcularKMProduzido(r.robo.kmInicial, r.robo.kmFinal) : 0;
  const areaRobo = r.robo.ativo ? calcularArea(kmRobo, r.robo.largura) : 0;

  return {
    km: kmM + a.km + b.km + c.km + kmRobo,
    area: areaM + a.area + b.area + c.area + areaRobo,
    kmManual: kmM,
    kmTratores: a.km + b.km + c.km,
    kmRobo,
  };
}

function formatKM(km: number) {
  return km.toFixed(3).replace(".", ",") + " km";
}

function formatData(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit",
  });
}

// ---- Cards de KPI ----
function KPICard({ label, valor, sub, cor }: { label: string; valor: string; sub?: string; cor: string }) {
  return (
    <div className={`rounded-2xl p-4 ${cor} flex flex-col gap-1`}>
      <p className="text-xs font-semibold text-white/80 uppercase">{label}</p>
      <p className="text-2xl font-bold text-white">{valor}</p>
      {sub && <p className="text-xs text-white/70">{sub}</p>}
    </div>
  );
}

type Periodo = "7" | "30" | "90" | "todos";

export default function PaginaDashboard() {
  const [relatorios, setRelatorios] = useState<RelatorioCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>("30");
  const [sincronizando, setSincronizando] = useState(false);

  const carregar = async () => {
    const todos = await buscarTodos();
    setRelatorios(todos);
    setCarregando(false);
  };

  useEffect(() => { carregar(); }, []);

  const sincronizar = async () => {
    setSincronizando(true);
    await sincronizarPendentes();
    await carregar();
    setSincronizando(false);
  };

  // Filtra por período
  const filtrados = useMemo(() => {
    if (periodo === "todos") return relatorios;
    const dias = parseInt(periodo);
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);
    return relatorios.filter((r) => new Date(r.criadoEm) >= limite);
  }, [relatorios, periodo]);

  // KPIs globais
  const kpis = useMemo(() => {
    const totais = filtrados.map(calcTotaisRelatorio);
    return {
      totalKm: totais.reduce((s, t) => s + t.km, 0),
      totalArea: totais.reduce((s, t) => s + t.area, 0),
      totalRelatorios: filtrados.length,
      kmManual: totais.reduce((s, t) => s + t.kmManual, 0),
      kmTratores: totais.reduce((s, t) => s + t.kmTratores, 0),
      kmRobo: totais.reduce((s, t) => s + t.kmRobo, 0),
    };
  }, [filtrados]);

  // Produção por dia (últimos N dias)
  const producaoPorDia = useMemo(() => {
    const mapa = new Map<string, number>();
    filtrados.forEach((r) => {
      const data = r.infoGeral.data || r.criadoEm.slice(0, 10);
      const { km } = calcTotaisRelatorio(r);
      mapa.set(data, (mapa.get(data) || 0) + km);
    });
    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([data, km]) => ({
        data: formatData(data),
        km: parseFloat(km.toFixed(3)),
      }));
  }, [filtrados]);

  // Produção por equipe
  const producaoPorEquipe = useMemo(() => {
    const mapa = new Map<string, number>();
    filtrados.forEach((r) => {
      const equipe = r.infoGeral.equipe || "Sem equipe";
      const { km } = calcTotaisRelatorio(r);
      mapa.set(equipe, (mapa.get(equipe) || 0) + km);
    });
    return Array.from(mapa.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([equipe, km]) => ({ equipe, km: parseFloat(km.toFixed(3)) }));
  }, [filtrados]);

  // Produção por encarregado
  const producaoPorEncarregado = useMemo(() => {
    const mapa = new Map<string, number>();
    filtrados.forEach((r) => {
      const nome = r.infoGeral.encarregado || "Sem encarregado";
      // Pega só o primeiro nome para caber no gráfico
      const primeiroNome = nome.split(" ")[0];
      const { km } = calcTotaisRelatorio(r);
      mapa.set(primeiroNome, (mapa.get(primeiroNome) || 0) + km);
    });
    return Array.from(mapa.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([nome, km]) => ({ nome, km: parseFloat(km.toFixed(3)) }));
  }, [filtrados]);

  // Últimos relatórios
  const ultimos = filtrados.slice(0, 10);

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-bold text-gray-600">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">📊 Dashboard</h1>
            <p className="text-blue-200 text-xs">Coordenador Geral</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={sincronizar}
              disabled={sincronizando}
              className="bg-blue-500 text-white text-xs px-3 py-2 rounded-xl font-bold disabled:opacity-50"
            >
              {sincronizando ? "⏳" : "🔄"} Sync
            </button>
            <a href="/" className="bg-green-600 text-white text-xs px-3 py-2 rounded-xl font-bold">
              📋 Form
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-5 pb-10">
        {/* Seletor de período */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-3">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Período</p>
          <div className="grid grid-cols-4 gap-2">
            {([["7", "7 dias"], ["30", "30 dias"], ["90", "90 dias"], ["todos", "Tudo"]] as [Periodo, string][]).map(
              ([val, label]) => (
                <button
                  key={val}
                  onClick={() => setPeriodo(val)}
                  className={`py-2 rounded-xl text-sm font-bold transition-all ${
                    periodo === val
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {filtrados.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-10 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 font-medium">Nenhum relatório encontrado</p>
            <p className="text-gray-400 text-sm mt-1">Os relatórios enviados aparecerão aqui</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <KPICard label="KM Total" valor={formatKM(kpis.totalKm)} sub={`${kpis.totalRelatorios} relatórios`} cor="bg-blue-600" />
              <KPICard label="Área Total" valor={formatarArea(kpis.totalArea)} cor="bg-green-600" />
              <KPICard label="KM Manual" valor={formatKM(kpis.kmManual)} cor="bg-orange-500" />
              <KPICard label="KM Tratores" valor={formatKM(kpis.kmTratores)} cor="bg-purple-600" />
            </div>

            {/* Gráfico: Produção por dia */}
            {producaoPorDia.length > 1 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                <p className="font-bold text-gray-700 mb-4">📈 Produção Diária (km)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={producaoPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${Number(v).toFixed(3)} km`, "KM"]} />
                    <Line type="monotone" dataKey="km" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfico: Produção por equipe */}
            {producaoPorEquipe.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                <p className="font-bold text-gray-700 mb-4">👥 Produção por Equipe (km)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={producaoPorEquipe} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="equipe" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip formatter={(v) => [`${Number(v).toFixed(3)} km`, "KM"]} />
                    <Bar dataKey="km" fill="#16a34a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfico: Produção por encarregado */}
            {producaoPorEncarregado.length > 0 && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                <p className="font-bold text-gray-700 mb-4">👷 Top Encarregados (km)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={producaoPorEncarregado}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${Number(v).toFixed(3)} km`, "KM"]} />
                    <Bar dataKey="km" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Breakdown: Manual vs Tratores vs Robô */}
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
                          <span className="text-gray-500">
                            {formatKM(km)} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cor} rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
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
                <p className="font-bold text-gray-700">🕓 Últimos Relatórios</p>
              </div>
              <div className="divide-y divide-gray-100">
                {ultimos.map((r) => {
                  const { km } = calcTotaisRelatorio(r);
                  return (
                    <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {r.infoGeral.equipe || "—"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {r.infoGeral.data
                            ? formatData(r.infoGeral.data)
                            : new Date(r.criadoEm).toLocaleDateString("pt-BR")}{" "}
                          • {r.infoGeral.encarregado?.split(" ")[0] || "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-700 text-sm">{formatKM(km)}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            r.syncStatus === "enviado"
                              ? "bg-green-100 text-green-700"
                              : r.syncStatus === "erro"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {r.syncStatus === "enviado" ? "✓ Sync" : r.syncStatus === "erro" ? "✗ Erro" : "⏳ Pendente"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
