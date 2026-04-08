"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildScriptUrl, getScriptUrl } from "@/lib/sync";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

function parseKM(s: string): number {
  if (!s) return 0;

  const limpo = String(s).replace(/\s/g, "");
  if (limpo.includes(",")) return parseFloat(limpo.replace(",", "."));
  if (limpo.includes(".")) return parseFloat(limpo);

  if (limpo.length === 6 && /^\d+$/.test(limpo)) {
    return parseFloat(`${limpo.slice(0, 3)}.${limpo.slice(3)}`);
  }

  return parseFloat(limpo) || 0;
}

function kmProd(ini: string, fin: string): number {
  return Math.max(0, parseKM(fin) - parseKM(ini));
}

function calcTotaisLinha(r: LinhaPlanilha) {
  const manual = kmProd(r.manual_km_inicial, r.manual_km_final);
  const areaManual = manual * 1000 * (parseFloat(r.manual_largura) || 0);

  const tratorA = r.trator_a_prefixo && r.trator_a_prefixo !== "N/A"
    ? kmProd(r.trator_a_km_inicial, r.trator_a_km_final)
    : 0;
  const areaA = tratorA * 1000 * (parseFloat(r.trator_a_largura) || 0);

  const tratorB = r.trator_b_prefixo && r.trator_b_prefixo !== "N/A"
    ? kmProd(r.trator_b_km_inicial, r.trator_b_km_final)
    : 0;
  const areaB = tratorB * 1000 * (parseFloat(r.trator_b_largura) || 0);

  const tratorC = r.trator_c_prefixo && r.trator_c_prefixo !== "N/A"
    ? kmProd(r.trator_c_km_inicial, r.trator_c_km_final)
    : 0;
  const areaC = tratorC * 1000 * (parseFloat(r.trator_c_largura) || 0);

  const robo = r.robo_tipo && r.robo_tipo !== "N/A"
    ? kmProd(r.robo_km_inicial, r.robo_km_final)
    : 0;
  const areaRobo = robo * 1000 * (parseFloat(r.robo_largura) || 0);

  return {
    km: manual + tratorA + tratorB + tratorC + robo,
    area: areaManual + areaA + areaB + areaC + areaRobo,
    kmManual: manual,
    kmTratores: tratorA + tratorB + tratorC,
    kmRobo: robo,
    diesel: parseFloat(r.diesel_tratores) || 0,
    gasolinaManual: parseFloat(r.gasolina_manual) || 0,
    gasolinaRobo: parseFloat(r.gasolina_robo) || 0,
  };
}

function dataValida(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function formatarDateParaISO(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function dataParaISO(data: string): string {
  if (!data) return "";

  const valor = data.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(valor)) return valor.slice(0, 10);

  const partesBR = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (partesBR) return `${partesBR[3]}-${partesBR[2]}-${partesBR[1]}`;

  const tentativa = new Date(valor);
  if (dataValida(tentativa)) return formatarDateParaISO(tentativa);

  return "";
}

function formatKM(km: number) {
  return `${km.toFixed(3).replace(".", ",")} km`;
}

function formatArea(area: number) {
  if (area >= 10000) return `${(area / 10000).toFixed(2)} ha`;
  return `${area.toFixed(0)} m²`;
}

function formatDataExib(iso: string) {
  if (!iso) return "—";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "—";
  return `${match[3]}/${match[2]}`;
}

function apelidoEncarregado(nomeCompleto: string) {
  const nome = nomeCompleto.trim();
  if (!nome) return "—";

  const partes = nome.split(/\s+/);
  if (partes.length <= 2) return nome;

  return `${partes[0]} ${partes[partes.length - 1]}`;
}

function KPICard({
  label,
  valor,
  sub,
  cor,
}: {
  label: string;
  valor: string;
  sub?: string;
  cor: string;
}) {
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
      const res = await fetch(buildScriptUrl(url, { action: "getData" }));
      const json = await res.json();

      if (json.ok) {
        setDados(json.dados || []);
        setAtualizadoEm(new Date().toLocaleTimeString("pt-BR"));
      } else {
        setErro(`Erro ao buscar dados: ${json.erro}`);
      }
    } catch {
      setErro("Não foi possível conectar ao servidor. Verifique a URL e o token do Apps Script no Admin.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregar();
  }, []);

  const filtrados = useMemo(() => {
    if (periodo === "todos") return dados;

    const dias = parseInt(periodo, 10);
    const limite = new Date();
    limite.setHours(0, 0, 0, 0);
    limite.setDate(limite.getDate() - (dias - 1));

    return dados.filter((r) => {
      const iso = dataParaISO(r.data);
      if (!iso) return true;
      return new Date(`${iso}T12:00:00`) >= limite;
    });
  }, [dados, periodo]);

  const kpis = useMemo(() => {
    const totais = filtrados.map(calcTotaisLinha);
    return {
      totalKm: totais.reduce((soma, total) => soma + total.km, 0),
      totalArea: totais.reduce((soma, total) => soma + total.area, 0),
      totalRelatorios: filtrados.length,
      kmManual: totais.reduce((soma, total) => soma + total.kmManual, 0),
      kmTratores: totais.reduce((soma, total) => soma + total.kmTratores, 0),
      kmRobo: totais.reduce((soma, total) => soma + total.kmRobo, 0),
      diesel: totais.reduce((soma, total) => soma + total.diesel, 0),
      gasolinaManual: totais.reduce((soma, total) => soma + total.gasolinaManual, 0),
    };
  }, [filtrados]);

  const producaoPorDia = useMemo(() => {
    const mapa = new Map<string, number>();

    filtrados.forEach((r) => {
      const iso = dataParaISO(r.data);
      const { km } = calcTotaisLinha(r);
      mapa.set(iso, (mapa.get(iso) || 0) + km);
    });

    return Array.from(mapa.entries())
      .filter(([data]) => data)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-20)
      .map(([data, km]) => ({ data: formatDataExib(data), km: parseFloat(km.toFixed(3)) }));
  }, [filtrados]);

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

  const producaoPorEncarregado = useMemo(() => {
    const mapa = new Map<string, number>();

    filtrados.forEach((r) => {
      const nome = (r.encarregado || "—").trim() || "—";
      const { km } = calcTotaisLinha(r);
      mapa.set(nome, (mapa.get(nome) || 0) + km);
    });

    return Array.from(mapa.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([nome, km]) => ({
        nome,
        nomeCurto: apelidoEncarregado(nome),
        km: parseFloat(km.toFixed(3)),
      }));
  }, [filtrados]);

  const ultimosRelatorios = useMemo(() => {
    return filtrados
      .map((registro, index) => ({
        registro,
        index,
        iso: dataParaISO(registro.data),
      }))
      .sort((a, b) => {
        if (a.iso && b.iso && a.iso !== b.iso) {
          return b.iso.localeCompare(a.iso);
        }
        if (a.iso && !b.iso) return -1;
        if (!a.iso && b.iso) return 1;
        return b.index - a.index;
      })
      .slice(0, 15);
  }, [filtrados]);

  return (
    <div className="min-h-screen bg-gray-100">
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
            <Link href="/" className="bg-green-600 text-white text-xs px-3 py-2 rounded-xl font-bold">
              📋 Form
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-5 pb-10">
        {erro && (
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-5 text-center">
            <p className="text-3xl mb-2">⚠️</p>
            <p className="font-bold text-red-700 mb-1">Sem conexão com a planilha</p>
            <p className="text-sm text-red-600">{erro}</p>
            <Link href="/admin" className="mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
              Ir para Admin
            </Link>
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
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-3">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Período</p>
              <div className="grid grid-cols-4 gap-2">
                {([
                  ["7", "7 dias"],
                  ["30", "30 dias"],
                  ["90", "90 dias"],
                  ["todos", "Tudo"],
                ] as [Periodo, string][]).map(([valor, label]) => (
                  <button
                    key={valor}
                    onClick={() => setPeriodo(valor)}
                    className={`py-2 rounded-xl text-sm font-bold transition-all ${
                      periodo === valor ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {filtrados.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-10 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 font-medium">Nenhum relatório neste período</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <KPICard label="KM Total" valor={formatKM(kpis.totalKm)} sub={`${kpis.totalRelatorios} relatórios`} cor="bg-blue-600" />
                  <KPICard label="Área Total" valor={formatArea(kpis.totalArea)} cor="bg-green-600" />
                  <KPICard label="KM Manual" valor={formatKM(kpis.kmManual)} cor="bg-orange-500" />
                  <KPICard label="KM Tratores" valor={formatKM(kpis.kmTratores)} cor="bg-purple-600" />
                  <KPICard label="Diesel" valor={`${kpis.diesel.toFixed(0)} L`} cor="bg-gray-600" />
                  <KPICard label="Gasolina Manual" valor={`${kpis.gasolinaManual.toFixed(0)} L`} cor="bg-yellow-600" />
                </div>

                {producaoPorDia.length > 1 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                    <p className="font-bold text-gray-700 mb-4">📈 Produção Diária (km)</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={producaoPorDia}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="data" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(valor) => [`${Number(valor).toFixed(3)} km`, "KM"]} />
                        <Line type="monotone" dataKey="km" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {producaoPorEquipe.length > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                    <p className="font-bold text-gray-700 mb-4">👥 Produção por Equipe (km)</p>
                    <ResponsiveContainer width="100%" height={Math.max(180, producaoPorEquipe.length * 44)}>
                      <BarChart data={producaoPorEquipe} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="equipe" type="category" tick={{ fontSize: 11 }} width={90} />
                        <Tooltip formatter={(valor) => [`${Number(valor).toFixed(3)} km`, "KM"]} />
                        <Bar dataKey="km" fill="#16a34a" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {producaoPorEncarregado.length > 0 && (
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                    <p className="font-bold text-gray-700 mb-4">👷 Top Encarregados (km)</p>
                    <ResponsiveContainer width="100%" height={Math.max(220, producaoPorEncarregado.length * 40)}>
                      <BarChart data={producaoPorEncarregado} layout="vertical" margin={{ left: 8, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="nomeCurto" type="category" tick={{ fontSize: 11 }} width={120} />
                        <Tooltip
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.nome || ""}
                          formatter={(valor) => [`${Number(valor).toFixed(3)} km`, "KM"]}
                        />
                        <Bar dataKey="km" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

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

                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <p className="font-bold text-gray-700">🕓 Últimos Relatórios ({filtrados.length})</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {ultimosRelatorios.map(({ registro: r, iso }, i) => {
                      const { km } = calcTotaisLinha(r);
                      return (
                        <div key={`${r.carimbo}-${i}`} className="px-4 py-3 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{r.equipe || "—"}</p>
                            <p className="text-xs text-gray-500">
                              {iso ? formatDataExib(iso) : r.data} • {apelidoEncarregado(r.encarregado || "—")}
                            </p>
                          </div>
                          <p className="font-bold text-blue-700 text-sm whitespace-nowrap">{formatKM(km)}</p>
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
