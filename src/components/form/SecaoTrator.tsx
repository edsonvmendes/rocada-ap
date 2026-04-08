"use client";
// ============================================================
// SEÇÃO 4: TRATOR (usado para Trator A, B e C)
// ============================================================

import SectionCard from "@/components/ui/SectionCard";
import SelectField from "@/components/ui/SelectField";
import KMInput from "@/components/form/KMInput";
import NumberField from "@/components/ui/NumberField";
import { Trator } from "@/types";
import { AdminConfig } from "@/types";
import { calcularKMProduzido, calcularArea, formatarArea, formatarKMProduzido } from "@/lib/kmUtils";

interface Props {
  titulo: string;            // "Trator A", "Trator B", "Trator C"
  icone: string;
  cor: "orange" | "purple" | "red";
  dados: Trator;
  onChange: (dados: Trator) => void;
  config: AdminConfig;
}

export default function SecaoTrator({ titulo, icone, cor, dados, onChange, config }: Props) {
  const set = <K extends keyof Trator>(campo: K, valor: Trator[K]) =>
    onChange({ ...dados, [campo]: valor });

  const kmProduzido = calcularKMProduzido(dados.kmInicial, dados.kmFinal);
  const area = calcularArea(kmProduzido, dados.largura);
  const temProducao = dados.ativo && kmProduzido > 0;

  const corResultado: Record<string, string> = {
    orange: "bg-orange-100 border-orange-400 text-orange-700 text-orange-600 text-orange-800",
    purple: "bg-purple-100 border-purple-400 text-purple-700 text-purple-600 text-purple-800",
    red: "bg-red-100 border-red-400 text-red-700 text-red-600 text-red-800",
  };

  return (
    <SectionCard titulo={titulo} icone={icone} cor={cor} collapsible defaultOpen={false}>
      {/* Toggle ativo/inativo */}
      <div className="flex items-center justify-between bg-white rounded-xl border-2 border-gray-200 px-4 py-4">
        <div>
          <p className="font-bold text-gray-800">{titulo} em operação?</p>
          <p className="text-sm text-gray-500">Ative para preencher os dados</p>
        </div>
        <button
          type="button"
          onClick={() => set("ativo", !dados.ativo)}
          className={`
            w-16 h-9 rounded-full transition-all duration-300 relative
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

      {/* Campos - só mostra se ativo */}
      {dados.ativo && (
        <>
          <SelectField
            label="Prefixo do Trator"
            value={dados.prefixo}
            onChange={(v) => set("prefixo", v)}
            opcoes={config.prefixosTrator}
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

          <SelectField
            label="Tipo de Roçadeira"
            value={dados.tipoRocadeira}
            onChange={(v) => set("tipoRocadeira", v)}
            opcoes={config.tiposRocadeira}
            obrigatorio
          />

          {/* KMs */}
          <div className="grid grid-cols-2 gap-3">
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

          {/* Observações */}
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

          {/* Resultado */}
          {temProducao && (
            <div className={`border-2 rounded-xl p-4 ${corResultado[cor].split(" ").slice(0,2).join(" ")}`}>
              <p className={`text-xs font-bold uppercase mb-2 ${corResultado[cor].split(" ")[2]}`}>
                ✅ Produção Calculada
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className={`text-xs ${corResultado[cor].split(" ")[3]}`}>KM Produzido</p>
                  <p className={`text-2xl font-bold ${corResultado[cor].split(" ")[4]}`}>{formatarKMProduzido(kmProduzido)}</p>
                </div>
                <div className="text-center">
                  <p className={`text-xs ${corResultado[cor].split(" ")[3]}`}>Área</p>
                  <p className={`text-2xl font-bold ${corResultado[cor].split(" ")[4]}`}>{formatarArea(area)}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}
