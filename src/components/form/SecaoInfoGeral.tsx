"use client";
// ============================================================
// SEÇÃO 1: INFORMAÇÕES GERAIS
// ============================================================

import SelectField from "@/components/ui/SelectField";
import SectionCard from "@/components/ui/SectionCard";
import { InfoGeral } from "@/types";
import { AdminConfig } from "@/types";
import { QTD_OPTIONS } from "@/lib/constants";

interface Props {
  dados: InfoGeral;
  onChange: (dados: InfoGeral) => void;
  config: AdminConfig;
  erros?: Partial<Record<keyof InfoGeral, string>>;
}

export default function SecaoInfoGeral({ dados, onChange, config, erros = {} }: Props) {
  const set = <K extends keyof InfoGeral>(campo: K, valor: InfoGeral[K]) =>
    onChange({ ...dados, [campo]: valor });

  return (
    <SectionCard titulo="Informações Gerais" icone="📋" cor="green">
      {/* Data */}
      <div className="flex min-w-0 flex-col gap-1 overflow-hidden">
        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Data <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={dados.data}
          onChange={(e) => set("data", e.target.value)}
          className={`
            block w-full min-w-0 max-w-full overflow-hidden text-base font-bold border-2 rounded-xl px-3 py-4 sm:px-4 sm:text-xl
            focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200
            ${erros.data ? "border-red-400 bg-red-50" : dados.data ? "border-green-400" : "border-gray-300 bg-gray-50"}
          `}
        />
        {erros.data && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">⚠️ {erros.data}</p>}
      </div>

      {/* Hora Início */}
      <div className="flex min-w-0 flex-col gap-1 overflow-hidden">
        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Hora de Início <span className="text-red-500">*</span>
        </label>
        <input
          type="time"
          value={dados.horaInicio}
          onChange={(e) => set("horaInicio", e.target.value)}
          className={`
            block w-full min-w-0 max-w-full overflow-hidden text-base font-bold border-2 rounded-xl px-3 py-4 sm:px-4 sm:text-xl
            focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200
            ${erros.horaInicio ? "border-red-400 bg-red-50" : dados.horaInicio ? "border-green-400" : "border-gray-300 bg-gray-50"}
          `}
        />
      </div>

      {/* Supervisor */}
      <SelectField
        label="Supervisor"
        value={dados.supervisor}
        onChange={(v) => set("supervisor", v)}
        opcoes={config.supervisores}
        obrigatorio
        erro={erros.supervisor}
      />

      {/* Encarregado */}
      <SelectField
        label="Encarregado"
        value={dados.encarregado}
        onChange={(v) => set("encarregado", v)}
        opcoes={config.encarregados}
        obrigatorio
        erro={erros.encarregado}
      />

      {/* Equipe */}
      <SelectField
        label="Equipe"
        value={dados.equipe}
        onChange={(v) => set("equipe", v)}
        opcoes={config.equipes}
        obrigatorio
        erro={erros.equipe}
      />

      {/* Transporte */}
      <SelectField
        label="Transporte / Veículo"
        value={dados.transporte}
        onChange={(v) => set("transporte", v)}
        opcoes={config.transportes}
        obrigatorio
        erro={erros.transporte}
      />

      {/* Quantidades - grid 2 colunas */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-bold text-gray-600 uppercase mb-3">Quantidade de Pessoal</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: "Líderes", campo: "qtdLideres" as const },
            { label: "Op. Trator", campo: "qtdOperadoresTrator" as const },
            { label: "Op. Equipamento", campo: "qtdOperadoresEquipamento" as const },
            { label: "Op. Roçadeira", campo: "qtdOperadoresRocadeira" as const },
            { label: "Ajudantes", campo: "qtdAjudantes" as const },
          ].map(({ label, campo }) => (
            <div key={campo} className="flex min-w-0 flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase">{label}</label>
              <select
                value={dados[campo]}
                onChange={(e) => set(campo, parseInt(e.target.value))}
                className="w-full min-w-0 max-w-full border-2 border-gray-300 rounded-xl bg-gray-50 px-3 py-3 text-lg font-bold text-center focus:border-green-500 focus:outline-none sm:text-xl"
              >
                {QTD_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Condições de trabalho */}
      <SelectField
        label="Condições de Trabalho"
        value={dados.condicoesTrabalho}
        onChange={(v) => set("condicoesTrabalho", v)}
        opcoes={config.condicoesTrabalho}
        obrigatorio
        erro={erros.condicoesTrabalho}
      />
    </SectionCard>
  );
}
