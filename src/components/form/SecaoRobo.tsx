"use client";
// ============================================================
// SEÇÃO 5: ROBÔ
// ============================================================

import SectionCard from "@/components/ui/SectionCard";
import SelectField from "@/components/ui/SelectField";
import KMInput from "@/components/form/KMInput";
import NumberField from "@/components/ui/NumberField";
import { Robo } from "@/types";
import { AdminConfig } from "@/types";
import { calcularKMProduzido, calcularArea, formatarArea, formatarKMProduzido } from "@/lib/kmUtils";

interface Props {
  dados: Robo;
  onChange: (dados: Robo) => void;
  config: AdminConfig;
}

export default function SecaoRobo({ dados, onChange, config }: Props) {
  const set = <K extends keyof Robo>(campo: K, valor: Robo[K]) =>
    onChange({ ...dados, [campo]: valor });

  const kmProduzido = calcularKMProduzido(dados.kmInicial, dados.kmFinal);
  const area = calcularArea(kmProduzido, dados.largura);
  const temProducao = dados.ativo && kmProduzido > 0;

  return (
    <SectionCard titulo="Robô" icone="🤖" cor="purple" collapsible defaultOpen={false}>
      {/* Toggle ativo/inativo */}
      <div className="flex items-center justify-between gap-3 bg-white rounded-xl border-2 border-gray-200 px-4 py-4">
        <div className="min-w-0">
          <p className="font-bold text-gray-800">Robô em operação?</p>
          <p className="text-sm text-gray-500">Ative para preencher os dados</p>
        </div>
        <button
          type="button"
          onClick={() => set("ativo", !dados.ativo)}
          className={`
            relative h-9 w-16 shrink-0 rounded-full transition-all duration-300
            ${dados.ativo ? "bg-green-500" : "bg-gray-300"}
          `}
        >
          <span
            className={`
              absolute top-1 w-7 h-7 rounded-full bg-white shadow-md transition-all duration-300
              ${dados.ativo ? "left-8" : "left-1"}
            `}
          />
        </button>
      </div>

      {dados.ativo && (
        <>
          <SelectField
            label="Tipo de Robô"
            value={dados.tipo}
            onChange={(v) => set("tipo", v)}
            opcoes={config.tiposRobo}
            obrigatorio
          />

          <SelectField
            label="Rodovia"
            value={dados.rodovia}
            onChange={(v) => set("rodovia", v)}
            opcoes={config.rodovias}
            obrigatorio
          />

          <SelectField
            label="Canteiro / Lateral"
            value={dados.canteiro}
            onChange={(v) => set("canteiro", v)}
            opcoes={config.canteiros}
            obrigatorio
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <KMInput
              label="KM Inicial"
              value={dados.kmInicial}
              onChange={(v) => set("kmInicial", v)}
              obrigatorio
            />
            <KMInput
              label="KM Final"
              value={dados.kmFinal}
              onChange={(v) => set("kmFinal", v)}
              obrigatorio
            />
          </div>

          <NumberField
            label="Largura Média"
            value={dados.largura}
            onChange={(v) => set("largura", v)}
            sufixo="metros"
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Observações
            </label>
            <textarea
              value={dados.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
              placeholder="Opcional..."
              rows={2}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none"
            />
          </div>

          {temProducao && (
            <div className="bg-purple-100 border-2 border-purple-400 rounded-xl p-4">
              <p className="text-xs font-bold text-purple-700 uppercase mb-2">✅ Produção Calculada</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="text-center">
                  <p className="text-xs text-purple-600">KM Produzido</p>
                  <p className="text-2xl font-bold text-purple-800">{formatarKMProduzido(kmProduzido)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-purple-600">Área</p>
                  <p className="text-2xl font-bold text-purple-800">{formatarArea(area)}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}
