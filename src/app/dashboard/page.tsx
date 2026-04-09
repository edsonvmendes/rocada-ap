"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { buildScriptUrl, getScriptUrl } from "@/lib/sync";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

interface LinhaPlanilha {
  carimbo: string;
  data: string;
  hora_inicio: string;
  hora_termino: string;
  supervisor: string;
  equipe: string;
  qtd_lideres: string;
  qtd_op_trator: string;
  qtd_op_equipamento: string;
  qtd_op_rocadeira: string;
  qtd_ajudantes: string;
  condicoes: string;
  gasolina_manual: string;
  oleo_2t: string;
  diesel_tratores: string;
  gasolina_robo: string;
  manual_rodovia: string;
  manual_canteiro: string;
  manual_km_inicial: string;
  manual_km_final: string;
  manual_largura: string;
  trator_a_prefixo: string;
  trator_a_rodovia: string;
  trator_a_canteiro: string;
  trator_a_km_inicial: string;
  trator_a_km_final: string;
  trator_a_largura: string;
  trator_b_prefixo: string;
  trator_b_rodovia: string;
  trator_b_canteiro: string;
  trator_b_km_inicial: string;
  trator_b_km_final: string;
  trator_b_largura: string;
  trator_c_prefixo: string;
  trator_c_rodovia: string;
  trator_c_canteiro: string;
  trator_c_km_inicial: string;
  trator_c_km_final: string;
  trator_c_largura: string;
  robo_tipo: string;
  robo_rodovia: string;
  robo_canteiro: string;
  robo_km_inicial: string;
  robo_km_final: string;
  robo_largura: string;
  consideracoes_gerais: string;
}

interface Equipamento { categoria: "manual" | "trator" | "robo"; nome: string; rodovia: string; canteiro: string; km: number; area: number; combustivel: number; }
interface Linha { id: string; isoDate: string; equipe: string; supervisor: string; teamSize: number; horas: number; totalKm: number; totalArea: number; totalCombustivel: number; productive: boolean; rain: boolean; traffic: boolean; failure: boolean; equipment: Equipamento[]; }
type Periodo = "7" | "30" | "90" | "todos";
type Granularidade = "dia" | "semana" | "mes";
type TipoTrabalho = "todos" | "manual" | "trator" | "robo";

const MESES = [
  { valor: "01", label: "Janeiro" },
  { valor: "02", label: "Fevereiro" },
  { valor: "03", label: "Marco" },
  { valor: "04", label: "Abril" },
  { valor: "05", label: "Maio" },
  { valor: "06", label: "Junho" },
  { valor: "07", label: "Julho" },
  { valor: "08", label: "Agosto" },
  { valor: "09", label: "Setembro" },
  { valor: "10", label: "Outubro" },
  { valor: "11", label: "Novembro" },
  { valor: "12", label: "Dezembro" },
];

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");
const num = (v?: string) => { const s = (v || "").trim(); if (!s) return 0; if (/^-?\d+,\d+$/.test(s)) return parseFloat(s.replace(",", ".")) || 0; return parseFloat(s.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")) || 0; };
const km = (v?: string) => { const s = (v || "").replace(/\s/g, ""); if (!s) return 0; if (s.includes(",")) return parseFloat(s.replace(",", ".")) || 0; if (s.length === 6 && /^\d+$/.test(s)) return parseFloat(`${s.slice(0,3)}.${s.slice(3)}`) || 0; return parseFloat(s) || 0; };
const kmProd = (a?: string, b?: string) => Math.max(0, km(b) - km(a));
const fmtArea = (v: number) => !v || v <= 0 ? "0 m2" : `${v.toFixed(0)} m2`;
const fmtAxisArea = (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${Math.round(v)}`;
const fmtKm = (v: number) => `${v.toFixed(3).replace(".", ",")} km`;
const fmtRate = (v: number, d = 1) => (Number.isFinite(v) && v > 0 ? v.toFixed(d).replace(".", ",") : "0");
const rankColor = (i: number, total: number) => i === 0 ? "#15803d" : i === total - 1 ? "#dc2626" : "#2563eb";
const text = (v?: string) => (v || "").trim();
const valid = (date: Date) => !Number.isNaN(date.getTime());
const iso = (v?: string) => {
  const s = text(v); if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const d = new Date(s); if (!valid(d)) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dateLabel = (v: string) => { const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${m[3]}/${m[2]}` : "--"; };
const weekStart = (v: string) => { const d = new Date(`${v}T12:00:00`); const day = d.getDay(); d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const periodKey = (v: string, g: Granularidade) => !v ? "" : g === "dia" ? v : g === "mes" ? v.slice(0, 7) : weekStart(v);
const periodLabel = (v: string, g: Granularidade) => g === "dia" ? dateLabel(v) : g === "mes" ? `${v.slice(5, 7)}/${v.slice(2, 4)}` : `Sem ${dateLabel(weekStart(v))}`;
const hasTerm = (v: string, terms: string[]) => terms.some((term) => v.includes(term));
const horas = (a?: string, b?: string) => { const s = (a || "").match(/^(\d{2}):(\d{2})$/); const e = (b || "").match(/^(\d{2}):(\d{2})$/); if (!s || !e) return 0; const mi = parseInt(s[1], 10) * 60 + parseInt(s[2], 10); const mf = parseInt(e[1], 10) * 60 + parseInt(e[2], 10); return mf > mi ? (mf - mi) / 60 : 0; };

function makeRow(row: LinhaPlanilha, index: number): Linha {
  const teamSize = num(row.qtd_lideres) + num(row.qtd_op_trator) + num(row.qtd_op_equipamento) + num(row.qtd_op_rocadeira) + num(row.qtd_ajudantes);
  const manualKm = kmProd(row.manual_km_inicial, row.manual_km_final);
  const manualArea = manualKm * 1000 * num(row.manual_largura);
  const tractors = [
    { nome: text(row.trator_a_prefixo) || "Trator A", rodovia: text(row.trator_a_rodovia), canteiro: text(row.trator_a_canteiro), km: kmProd(row.trator_a_km_inicial, row.trator_a_km_final), area: kmProd(row.trator_a_km_inicial, row.trator_a_km_final) * 1000 * num(row.trator_a_largura) },
    { nome: text(row.trator_b_prefixo) || "Trator B", rodovia: text(row.trator_b_rodovia), canteiro: text(row.trator_b_canteiro), km: kmProd(row.trator_b_km_inicial, row.trator_b_km_final), area: kmProd(row.trator_b_km_inicial, row.trator_b_km_final) * 1000 * num(row.trator_b_largura) },
    { nome: text(row.trator_c_prefixo) || "Trator C", rodovia: text(row.trator_c_rodovia), canteiro: text(row.trator_c_canteiro), km: kmProd(row.trator_c_km_inicial, row.trator_c_km_final), area: kmProd(row.trator_c_km_inicial, row.trator_c_km_final) * 1000 * num(row.trator_c_largura) },
  ].filter((item) => item.nome || item.km > 0 || item.area > 0);
  const robotKm = kmProd(row.robo_km_inicial, row.robo_km_final);
  const robotArea = robotKm * 1000 * num(row.robo_largura);
  const diesel = num(row.diesel_tratores);
  const gasManual = num(row.gasolina_manual);
  const gasRobo = num(row.gasolina_robo);
  const tractorsArea = tractors.reduce((sum, item) => sum + item.area, 0);
  const tractorsKm = tractors.reduce((sum, item) => sum + item.km, 0);
  const equipamentos: Equipamento[] = [];
  if (manualArea > 0 || manualKm > 0 || text(row.manual_rodovia)) equipamentos.push({ categoria: "manual", nome: "Manual", rodovia: text(row.manual_rodovia) || "Sem rodovia", canteiro: text(row.manual_canteiro) || "Sem canteiro", km: manualKm, area: manualArea, combustivel: gasManual });
  tractors.forEach((item) => { const share = tractorsArea > 0 ? item.area / tractorsArea : tractorsKm > 0 ? item.km / tractorsKm : 1 / Math.max(tractors.length, 1); const litros = diesel * share; equipamentos.push({ categoria: "trator", nome: item.nome, rodovia: item.rodovia || "Sem rodovia", canteiro: item.canteiro || "Sem canteiro", km: item.km, area: item.area, combustivel: litros }); });
  if (robotArea > 0 || robotKm > 0 || text(row.robo_tipo)) equipamentos.push({ categoria: "robo", nome: text(row.robo_tipo) || "Robo", rodovia: text(row.robo_rodovia) || "Sem rodovia", canteiro: text(row.robo_canteiro) || "Sem canteiro", km: robotKm, area: robotArea, combustivel: gasRobo });
  const cond = `${text(row.condicoes)} ${text(row.consideracoes_gerais)}`.toLowerCase();
  return { id: `${row.carimbo || row.data}-${index}`, isoDate: iso(row.data), equipe: text(row.equipe) || "Sem equipe", supervisor: text(row.supervisor) || "Sem coordenador", teamSize, horas: horas(row.hora_inicio, row.hora_termino), totalKm: equipamentos.reduce((s, item) => s + item.km, 0), totalArea: equipamentos.reduce((s, item) => s + item.area, 0), totalCombustivel: equipamentos.reduce((s, item) => s + item.combustivel, 0), productive: equipamentos.some((item) => item.area > 0), rain: hasTerm(cond, ["chuva", "chuv", "garoa"]), traffic: hasTerm(cond, ["trafego", "transito", "trânsito", "veiculo"]), failure: hasTerm(cond, ["falha", "quebra", "manutenc", "pane", "defeito"]), equipment: equipamentos };
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <section className="rounded-2xl border-2 border-gray-200 bg-white p-4 sm:p-5"><div className="mb-4"><h2 className="text-lg font-bold text-gray-800">{title}</h2><p className="text-sm text-gray-500">{subtitle}</p></div>{children}</section>;
}

function Kpi({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return <div className={cn("rounded-2xl border-2 p-4 sm:p-5", tone)}><p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p><p className="mt-2 text-2xl font-bold sm:text-3xl">{value}</p><p className="mt-2 text-sm opacity-75">{note}</p></div>;
}

export default function PaginaDashboard() {
  const [dados, setDados] = useState<LinhaPlanilha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Periodo>("30");
  const [granularidade, setGranularidade] = useState<Granularidade>("semana");
  const [anoSelecionado, setAnoSelecionado] = useState("todos");
  const [mesSelecionado, setMesSelecionado] = useState("todos");
  const [diaSelecionado, setDiaSelecionado] = useState("todos");
  const [rodoviaSelecionada, setRodoviaSelecionada] = useState("todas");
  const [equipeSelecionada, setEquipeSelecionada] = useState("todas");
  const [tratorSelecionado, setTratorSelecionado] = useState("todos");
  const [tipoTrabalho, setTipoTrabalho] = useState<TipoTrabalho>("todos");

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    const url = getScriptUrl();
    if (!url) {
      setErro("URL do Apps Script nao configurada. Ajuste em /admin > Integracao.");
      setCarregando(false);
      return;
    }
    try {
      const resposta = await fetch(buildScriptUrl(url, { action: "getData" }));
      const json = (await resposta.json()) as { ok?: boolean; erro?: string; dados?: LinhaPlanilha[] };
      if (!json.ok) {
        setErro(json.erro || "Nao foi possivel buscar os dados da planilha.");
      } else {
        setDados(Array.isArray(json.dados) ? json.dados : []);
        setAtualizadoEm(new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date()));
      }
    } catch {
      setErro("Falha de conexao com a planilha. Verifique URL e token no painel admin.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { void carregar(); }, []);

  const linhas = useMemo(() => dados.map((item, index) => makeRow(item, index)), [dados]);
  const anos = useMemo(() => {
    return Array.from(
      new Set(
        linhas
          .map((linha) => linha.isoDate.slice(0, 4))
          .filter(Boolean)
      )
    ).sort((a, b) => b.localeCompare(a));
  }, [linhas]);
  const dias = useMemo(() => {
    return Array.from(
      new Set(
        linhas
          .filter((linha) => {
            if (!linha.isoDate) return false;
            const [ano, mes] = linha.isoDate.split("-");
            if (anoSelecionado !== "todos" && ano !== anoSelecionado) return false;
            if (mesSelecionado !== "todos" && mes !== mesSelecionado) return false;
            return true;
          })
          .map((linha) => linha.isoDate.slice(8, 10))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [anoSelecionado, linhas, mesSelecionado]);
  const rodovias = useMemo(() => Array.from(new Set(linhas.flatMap((linha) => linha.equipment.map((item) => item.rodovia)))).sort((a, b) => a.localeCompare(b)), [linhas]);
  const equipes = useMemo(() => Array.from(new Set(linhas.map((linha) => linha.equipe))).sort((a, b) => a.localeCompare(b)), [linhas]);
  const tratores = useMemo(() => Array.from(new Set(linhas.flatMap((linha) => linha.equipment.filter((item) => item.categoria === "trator").map((item) => item.nome)))).sort((a, b) => a.localeCompare(b)), [linhas]);

  useEffect(() => {
    if (diaSelecionado !== "todos" && !dias.includes(diaSelecionado)) {
      setDiaSelecionado("todos");
    }
  }, [diaSelecionado, dias]);

  const dimensionadas = useMemo(() => linhas.filter((linha) => {
    const okRoad = rodoviaSelecionada === "todas" || linha.equipment.some((item) => item.rodovia === rodoviaSelecionada);
    const okTeam = equipeSelecionada === "todas" || linha.equipe === equipeSelecionada;
    const okTractor = tratorSelecionado === "todos" || linha.equipment.some((item) => item.categoria === "trator" && item.nome === tratorSelecionado);
    const okType = tipoTrabalho === "todos" || linha.equipment.some((item) => item.categoria === tipoTrabalho);
    return okRoad && okTeam && okTractor && okType;
  }), [equipeSelecionada, linhas, rodoviaSelecionada, tipoTrabalho, tratorSelecionado]);

  const filtradas = useMemo(() => {
    return dimensionadas.filter((linha) => {
      if (!linha.isoDate) return false;

      const [ano, mes, dia] = linha.isoDate.split("-");

      if (anoSelecionado !== "todos" && ano !== anoSelecionado) return false;
      if (mesSelecionado !== "todos" && mes !== mesSelecionado) return false;
      if (diaSelecionado !== "todos" && dia !== diaSelecionado) return false;

      const dataEspecifica =
        anoSelecionado !== "todos" ||
        mesSelecionado !== "todos" ||
        diaSelecionado !== "todos";

      if (dataEspecifica || periodo === "todos") return true;

      const limite = new Date();
      limite.setHours(0, 0, 0, 0);
      limite.setDate(limite.getDate() - (parseInt(periodo, 10) - 1));

      return new Date(`${linha.isoDate}T12:00:00`) >= limite;
    });
  }, [anoSelecionado, diaSelecionado, dimensionadas, mesSelecionado, periodo]);

  const totalArea = filtradas.reduce((sum, linha) => sum + linha.totalArea, 0);
  const totalKm = filtradas.reduce((sum, linha) => sum + linha.totalKm, 0);
  const totalCombustivel = filtradas.reduce((sum, linha) => sum + linha.totalCombustivel, 0);
  const totalOperadores = filtradas.reduce((sum, linha) => sum + linha.teamSize, 0);
  const m2PorOperador = totalOperadores > 0 ? totalArea / totalOperadores : 0;
  const combustivelPorM2 = totalArea > 0 ? totalCombustivel / totalArea : 0;

  const diasComparacao = periodo === "todos" ? 30 : parseInt(periodo, 10);
  const resumoAnterior = useMemo(() => {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() - (diasComparacao * 2 - 1));
    const fim = new Date();
    fim.setHours(23, 59, 59, 999);
    fim.setDate(fim.getDate() - diasComparacao);
    return dimensionadas.filter((linha) => linha.isoDate).reduce((acc, linha) => {
      const data = new Date(`${linha.isoDate}T12:00:00`);
      if (data >= inicio && data <= fim) acc += linha.totalArea;
      return acc;
    }, 0);
  }, [diasComparacao, dimensionadas]);
  const tendencia = resumoAnterior > 0 ? ((totalArea - resumoAnterior) / resumoAnterior) * 100 : null;

  const tempo = useMemo(() => {
    const mapa = new Map<string, { label: string; area: number }>();
    filtradas.forEach((linha) => {
      const key = periodKey(linha.isoDate, granularidade); if (!key) return;
      const atual = mapa.get(key) || { label: periodLabel(linha.isoDate, granularidade), area: 0 };
      atual.area += linha.totalArea; mapa.set(key, atual);
    });
    return Array.from(mapa.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([, item]) => ({ ...item, area: Math.round(item.area) }));
  }, [filtradas, granularidade]);

  const byTeam = useMemo(() => {
    const mapa = new Map<string, { area: number; km: number; fuel: number; operators: number; reports: number }>();
    filtradas.forEach((linha) => {
      const atual = mapa.get(linha.equipe) || { area: 0, km: 0, fuel: 0, operators: 0, reports: 0 };
      atual.area += linha.totalArea; atual.km += linha.totalKm; atual.fuel += linha.totalCombustivel; atual.operators += linha.teamSize; atual.reports += 1; mapa.set(linha.equipe, atual);
    });
    return Array.from(mapa.entries()).map(([nome, v]) => ({ nome, area: Math.round(v.area), m2PorOperador: v.operators > 0 ? v.area / v.operators : 0, fuelPerKm: v.km > 0 ? v.fuel / v.km : 0, teamSize: v.reports > 0 ? v.operators / v.reports : 0, areaPorRelatorio: v.reports > 0 ? v.area / v.reports : 0 })).sort((a, b) => b.area - a.area);
  }, [filtradas]);

  const byCoordinator = useMemo(() => {
    const mapa = new Map<string, { area: number; operators: number }>();
    filtradas.forEach((linha) => { const atual = mapa.get(linha.supervisor) || { area: 0, operators: 0 }; atual.area += linha.totalArea; atual.operators += linha.teamSize; mapa.set(linha.supervisor, atual); });
    return Array.from(mapa.entries()).map(([nome, v]) => ({ nome, area: Math.round(v.area), m2PorOperador: v.operators > 0 ? v.area / v.operators : 0 })).sort((a, b) => b.area - a.area).slice(0, 6);
  }, [filtradas]);

  const byTractor = useMemo(() => {
    const mapa = new Map<string, { area: number; km: number; fuel: number }>();
    filtradas.forEach((linha) => linha.equipment.filter((item) => item.categoria === "trator").forEach((item) => { const atual = mapa.get(item.nome) || { area: 0, km: 0, fuel: 0 }; atual.area += item.area; atual.km += item.km; atual.fuel += item.combustivel; mapa.set(item.nome, atual); }));
    return Array.from(mapa.entries()).map(([nome, v]) => ({ nome, area: Math.round(v.area), fuelPerM2: v.area > 0 ? v.fuel / v.area : 0 })).sort((a, b) => b.area - a.area);
  }, [filtradas]);

  const byRoad = useMemo(() => {
    const mapa = new Map<string, { area: number; fuel: number }>();
    filtradas.forEach((linha) => linha.equipment.forEach((item) => { const atual = mapa.get(item.rodovia) || { area: 0, fuel: 0 }; atual.area += item.area; atual.fuel += item.combustivel; mapa.set(item.rodovia, atual); }));
    return Array.from(mapa.entries()).map(([nome, v]) => ({ nome, area: Math.round(v.area), fuelPerM2: v.area > 0 ? v.fuel / v.area : 0 })).sort((a, b) => b.area - a.area);
  }, [filtradas]);

  const bySegment = useMemo(() => {
    const mapa = new Map<string, { area: number; fuel: number }>();
    filtradas.forEach((linha) => linha.equipment.forEach((item) => { const chave = `${item.rodovia} - ${item.canteiro}`; const atual = mapa.get(chave) || { area: 0, fuel: 0 }; atual.area += item.area; atual.fuel += item.combustivel; mapa.set(chave, atual); }));
    return Array.from(mapa.entries()).map(([nome, v]) => ({ nome, area: Math.round(v.area), fuelPerM2: v.area > 0 ? v.fuel / v.area : 0 })).filter((item) => item.area > 0).sort((a, b) => b.fuelPerM2 - a.fuelPerM2).slice(0, 6);
  }, [filtradas]);

  const scatter = byTeam.map((item) => ({ nome: item.nome, teamSize: parseFloat(item.teamSize.toFixed(1)), area: Math.round(item.areaPorRelatorio), eficiencia: parseFloat(item.m2PorOperador.toFixed(1)) }));
  const topTeam = byTeam.slice(0, 8);
  const topTractor = byTractor.slice(0, 8);
  const topRoad = byRoad.slice(0, 8);
  const fuelTeam = [...byTeam].sort((a, b) => b.fuelPerKm - a.fuelPerKm).slice(0, 8);
  const fuelTractor = [...byTractor].sort((a, b) => b.fuelPerM2 - a.fuelPerM2).slice(0, 8);

  const quality = useMemo(() => {
    const dates = new Set<string>(); const prod = new Set<string>(); const rain = new Set<string>(); const traffic = new Set<string>(); const failure = new Set<string>();
    filtradas.forEach((linha) => { if (!linha.isoDate) return; dates.add(linha.isoDate); if (linha.productive) prod.add(linha.isoDate); if (linha.rain) rain.add(linha.isoDate); if (linha.traffic) traffic.add(linha.isoDate); if (linha.failure) failure.add(linha.isoDate); });
    return { total: dates.size, productive: prod.size, rain: rain.size, traffic: traffic.size, failure: failure.size };
  }, [filtradas]);

  const insights = useMemo(() => {
    const list: string[] = [];
    const bestTeam = [...byTeam].filter((item) => item.m2PorOperador > 0).sort((a, b) => b.m2PorOperador - a.m2PorOperador)[0];
    const avgSize = byTeam.length ? byTeam.reduce((s, item) => s + item.teamSize, 0) / byTeam.length : 0;
    const weakTeam = byTeam.filter((item) => item.teamSize >= avgSize && item.m2PorOperador > 0).sort((a, b) => a.m2PorOperador - b.m2PorOperador)[0];
    const bestTractor = [...byTractor].filter((item) => item.area > 0).sort((a, b) => a.fuelPerM2 - b.fuelPerM2)[0];
    const worstRoad = [...byRoad].filter((item) => item.area > 0).sort((a, b) => b.fuelPerM2 - a.fuelPerM2)[0];
    if (bestTeam) list.push(`${bestTeam.nome} lidera produtividade com ${fmtRate(bestTeam.m2PorOperador, 0)} m2 por operador.`);
    if (weakTeam) list.push(`${weakTeam.nome} opera com time medio de ${fmtRate(weakTeam.teamSize, 1)} pessoas e baixa entrega relativa.`);
    if (bestTractor) list.push(`${bestTractor.nome} e o trator mais eficiente no recorte, com ${fmtRate(bestTractor.fuelPerM2, 4)} L por m2.`);
    if (worstRoad) list.push(`${worstRoad.nome} concentra o maior consumo relativo, com ${fmtRate(worstRoad.fuelPerM2, 4)} L por m2.`);
    if (tendencia !== null) list.push(tendencia >= 0 ? `A area produzida avancou ${fmtRate(tendencia, 1)}% contra a janela anterior.` : `A area produzida recuou ${fmtRate(Math.abs(tendencia), 1)}% contra a janela anterior.`);
    return list.slice(0, 5);
  }, [byRoad, byTeam, byTractor, tendencia]);

  if (carregando) return <div className="min-h-screen bg-gray-100 px-4 py-12"><div className="mx-auto max-w-6xl rounded-2xl border-2 border-gray-200 bg-white p-10 text-center"><p className="text-lg font-semibold text-gray-700">Carregando dashboard...</p></div></div>;
  if (erro) return <div className="min-h-screen bg-gray-100 px-4 py-12"><div className="mx-auto max-w-4xl rounded-2xl border-2 border-red-200 bg-red-50 p-8"><h1 className="text-2xl font-bold text-red-800">Falha ao carregar o dashboard</h1><p className="mt-3 text-red-700">{erro}</p><div className="mt-5 flex gap-2"><Link href="/admin" className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white">Abrir admin</Link><button type="button" onClick={carregar} className="rounded-xl border-2 border-red-300 px-4 py-2 text-sm font-bold text-red-700">Tentar novamente</button></div></div></div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white px-4 py-4 sticky top-0 z-50 shadow-lg"><div className="max-w-6xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-green-100 text-xs font-bold uppercase tracking-wide">Dashboard Gerencial</p><h1 className="text-2xl font-bold text-white">Painel de Performance</h1><p className="text-green-100 text-sm">Area, eficiencia, combustivel e comparativos entre equipes, tratores, coordenadores e rodovias.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={carregar} className="rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white">Atualizar</button><Link href="/admin" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-green-700">Admin</Link><Link href="/" className="rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white">Formulario</Link></div></div></header>
      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 pb-10">
        <section className="rounded-2xl border-2 border-gray-200 bg-white p-4 sm:p-5"><div className="grid gap-3 xl:grid-cols-[1.8fr_1fr]"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><div className="md:col-span-2 xl:col-span-1"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Periodo</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{([ ["7", "7 dias"], ["30", "30 dias"], ["90", "90 dias"], ["todos", "Tudo"] ] as [Periodo, string][]).map(([v, label]) => <button key={v} type="button" onClick={() => setPeriodo(v)} className={cn("rounded-xl px-3 py-2 text-sm font-bold border-2", periodo === v ? "border-green-600 bg-green-600 text-white" : "border-gray-200 bg-gray-50 text-gray-600")}>{label}</button>)}</div></div><label className="min-w-0"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Ano</span><select value={anoSelecionado} onChange={(e) => setAnoSelecionado(e.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"><option value="todos">Todos</option>{anos.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="min-w-0"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Mes</span><select value={mesSelecionado} onChange={(e) => setMesSelecionado(e.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"><option value="todos">Todos</option>{MESES.map((item) => <option key={item.valor} value={item.valor}>{item.label}</option>)}</select></label><label className="min-w-0"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Dia</span><select value={diaSelecionado} onChange={(e) => setDiaSelecionado(e.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"><option value="todos">Todos</option>{dias.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="min-w-0"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Granularidade</span><select value={granularidade} onChange={(e) => setGranularidade(e.target.value as Granularidade)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"><option value="dia">Dia</option><option value="semana">Semana</option><option value="mes">Mes</option></select></label><label className="min-w-0"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Rodovia</span><select value={rodoviaSelecionada} onChange={(e) => setRodoviaSelecionada(e.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"><option value="todas">Todas</option>{rodovias.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="min-w-0"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Equipe</span><select value={equipeSelecionada} onChange={(e) => setEquipeSelecionada(e.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"><option value="todas">Todas</option>{equipes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="min-w-0"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Trator</span><select value={tratorSelecionado} onChange={(e) => setTratorSelecionado(e.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"><option value="todos">Todos</option>{tratores.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="min-w-0"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Tipo</span><select value={tipoTrabalho} onChange={(e) => setTipoTrabalho(e.target.value as TipoTrabalho)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"><option value="todos">Todos</option><option value="manual">Manual</option><option value="trator">Trator</option><option value="robo">Robo</option></select></label></div><div className="rounded-2xl border border-green-200 bg-green-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">Recorte selecionado</p><p className="mt-2 text-sm text-green-900">Ano, mes e dia fecham um recorte especifico. Quando nenhum deles estiver travado, o filtro rapido de periodo continua valendo.</p><p className="mt-3 text-xs text-green-700">{atualizadoEm ? `Base atualizada em ${atualizadoEm}` : "Aguardando sincronizacao"}</p></div></div></section>

        {filtradas.length === 0 ? <section className="rounded-2xl border-2 border-gray-200 bg-white p-10 text-center"><h2 className="text-xl font-bold text-gray-800">Nenhum dado para este recorte</h2><p className="mt-2 text-sm text-gray-500">Ajuste filtros ou verifique a sincronizacao no painel admin.</p></section> : <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6"><Kpi label="Area total" value={fmtArea(totalArea)} note={`${filtradas.length} relatorios no recorte`} tone="border-green-200 bg-green-50 text-green-900" /><Kpi label="KM total" value={fmtKm(totalKm)} note="Volume executado" tone="border-blue-200 bg-blue-50 text-blue-900" /><Kpi label="m2 por operador" value={fmtRate(m2PorOperador, 0)} note="Produtividade da equipe" tone="border-green-200 bg-green-50 text-green-900" /><Kpi label="Combustivel total" value={`${fmtRate(totalCombustivel, 1)} L`} note="Consumo agregado do recorte" tone="border-amber-200 bg-amber-50 text-amber-900" /><Kpi label="Combustivel por m2" value={fmtRate(combustivelPorM2, 4)} note="Litros por area produzida" tone="border-slate-200 bg-slate-50 text-slate-900" /><Kpi label="Tendencia" value={tendencia === null ? "Sem base" : `${tendencia >= 0 ? "+" : "-"}${fmtRate(Math.abs(tendencia), 1)}%`} note="Comparado com a janela anterior" tone={tendencia !== null && tendencia < 0 ? "border-amber-200 bg-amber-50 text-amber-900" : "border-blue-200 bg-blue-50 text-blue-900"} /></section>
          <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]"><Card title="Performance" subtitle="Volume produzido no tempo e comparativo por coordenador."><div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]"><div><ResponsiveContainer width="100%" height={280}><LineChart data={tempo}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={fmtAxisArea} /><Tooltip formatter={(value) => [fmtArea(Number(value)), "Area"]} /><Line type="monotone" dataKey="area" stroke="#15803d" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div><div className="space-y-3">{byCoordinator.map((item, index) => <div key={item.nome} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{index + 1}. {item.nome}</p><p className="text-xs text-slate-500">{fmtRate(item.m2PorOperador, 0)} m2 por operador</p></div><p className="text-sm font-bold text-emerald-700">{fmtArea(item.area)}</p></div></div>)}</div></div></Card><Card title="Leituras gerenciais" subtitle="Pontos que merecem atencao de gestao."><div className="space-y-3">{insights.map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{item}</div>)}</div></Card></div>
          <div className="grid gap-5 xl:grid-cols-2"><Card title="Area por equipe" subtitle="Ranking principal para comparar execucao entre equipes."><ResponsiveContainer width="100%" height={Math.max(280, topTeam.length * 44)}><BarChart data={topTeam} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={fmtAxisArea} /><YAxis dataKey="nome" type="category" width={92} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => [fmtArea(Number(value)), "Area"]} /><Bar dataKey="area" radius={[0, 8, 8, 0]}>{topTeam.map((item, index, array) => <Cell key={item.nome} fill={rankColor(index, array.length)} />)}</Bar></BarChart></ResponsiveContainer></Card><Card title="Area por trator" subtitle="Comparativo de produtividade entre tratores."><ResponsiveContainer width="100%" height={Math.max(280, topTractor.length * 44)}><BarChart data={topTractor} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={fmtAxisArea} /><YAxis dataKey="nome" type="category" width={96} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => [fmtArea(Number(value)), "Area"]} /><Bar dataKey="area" radius={[0, 8, 8, 0]}>{topTractor.map((item, index, array) => <Cell key={item.nome} fill={rankColor(index, array.length)} />)}</Bar></BarChart></ResponsiveContainer></Card></div>
          <div className="grid gap-5 xl:grid-cols-2"><Card title="Eficiencia" subtitle="X = tamanho da equipe, Y = area por relatorio."><ResponsiveContainer width="100%" height={300}><ScatterChart margin={{ top: 16, right: 12, bottom: 8, left: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis type="number" dataKey="teamSize" tick={{ fontSize: 11 }} /><YAxis type="number" dataKey="area" tick={{ fontSize: 11 }} tickFormatter={fmtAxisArea} /><ZAxis type="number" dataKey="eficiencia" range={[80, 320]} /><Tooltip formatter={(value, name) => name === "area" ? [fmtArea(Number(value)), "Area por relatorio"] : name === "teamSize" ? [fmtRate(Number(value), 1), "Tamanho medio"] : [fmtRate(Number(value), 0), "m2 por operador"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.nome || ""} /><Scatter data={scatter} fill="#2563eb">{scatter.map((item, index) => <Cell key={item.nome} fill={index === 0 ? "#15803d" : "#2563eb"} />)}</Scatter></ScatterChart></ResponsiveContainer></Card><Card title="m2 por operador por equipe" subtitle="Produtividade sem vies de tamanho de equipe."><ResponsiveContainer width="100%" height={Math.max(280, topTeam.length * 44)}><BarChart data={topTeam} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="nome" type="category" width={92} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => [`${fmtRate(Number(value), 0)} m2`, "m2 por operador"]} /><Bar dataKey="m2PorOperador" fill="#0f766e" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></Card></div>
          <div className="grid gap-5 xl:grid-cols-2"><Card title="Combustivel por km por equipe" subtitle="Onde o consumo operacional esta mais pesado."><ResponsiveContainer width="100%" height={Math.max(280, fuelTeam.length * 44)}><BarChart data={fuelTeam} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="nome" type="category" width={92} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => [`${fmtRate(Number(value), 2)} L/km`, "Consumo"]} /><Bar dataKey="fuelPerKm" fill="#b45309" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></Card><Card title="Combustivel por m2 por trator" subtitle="Comparativo de consumo entre equipamentos."><ResponsiveContainer width="100%" height={Math.max(280, fuelTractor.length * 44)}><BarChart data={fuelTractor} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis type="number" tick={{ fontSize: 11 }} /><YAxis dataKey="nome" type="category" width={96} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => [`${fmtRate(Number(value), 4)} L/m2`, "Consumo"]} /><Bar dataKey="fuelPerM2" fill="#475569" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></Card></div>
          <div className="grid gap-5 xl:grid-cols-2"><Card title="Rodovias" subtitle="Rodovias com maior area executada no recorte."><ResponsiveContainer width="100%" height={Math.max(280, topRoad.length * 44)}><BarChart data={topRoad} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={fmtAxisArea} /><YAxis dataKey="nome" type="category" width={96} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => [fmtArea(Number(value)), "Area"]} /><Bar dataKey="area" fill="#0f766e" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></Card><Card title="Segmentos criticos" subtitle="Segmentos com maior consumo relativo por m2."><div className="space-y-3">{bySegment.map((item, index) => <div key={item.nome} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{index + 1}. {item.nome}</p><p className="text-xs text-slate-500">Area {fmtArea(item.area)}</p></div><p className="text-sm font-bold text-red-700">{fmtRate(item.fuelPerM2, 4)} L/m2</p></div></div>)}</div></Card></div>
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]"><Card title="Qualidade operacional" subtitle="Impactos externos e disciplina operacional do periodo."><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Dias produtivos", value: String(quality.productive) }, { label: "Dias com chuva", value: String(quality.rain) }, { label: "Dias com trafego", value: String(quality.traffic) }, { label: "Dias com falha", value: String(quality.failure) }].map((item) => <div key={item.label} className="rounded-2xl border border-gray-200 bg-gray-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{item.label}</p><p className="mt-2 text-3xl font-bold text-gray-800">{item.value}</p></div>)}</div><div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4"><p className="text-sm font-semibold text-gray-800">{fmtRate(quality.total > 0 ? (quality.productive / quality.total) * 100 : 0, 1)}% dos dias do recorte tiveram producao efetiva.</p><p className="mt-1 text-sm text-gray-500">{Math.max(0, quality.total - quality.productive)} dias ficaram sem entrega mensuravel de area.</p></div></Card><Card title="Notas da gestao" subtitle="Resumo curto para validar contexto sem virar log operacional."><div className="space-y-3">{byCoordinator.slice(0, 3).map((item) => <div key={item.nome} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"><p className="text-sm font-semibold text-gray-800">{item.nome}</p><p className="mt-1 text-xs text-gray-500">Area {fmtArea(item.area)} | {fmtRate(item.m2PorOperador, 0)} m2 por operador</p></div>)}</div></Card></div>
        </>}
      </main>
    </div>
  );
}


