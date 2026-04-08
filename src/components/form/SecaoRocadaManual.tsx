"use client";
// ============================================================
// SEÇÃO 3: ROÇADA MANUAL
// ============================================================

import SectionCard from "@/components/ui/SectionCard";
import SelectField from "@/components/ui/SelectField";
import KMInput from "@/components/form/KMInput";
import NumberField from "@/components/ui/NumberField";
import { RocadaManual } from "@/types";
import { AdminConfig } from "@/types";
import { calcularKMProduzido, calcularArea, formatarArea, formatarKMProduzido } from "@/lib/kmUtils";

interface Props {
  dados: RocadaManual;
  onChange: (dados: RocadaManual) => void;
  config: AdminConfig;
}

export default function SecaoRocadaManual({ dados, onChange, config }: Props) {
  const set = <K extends keyof RocadaManual>(campo: K, valor: RocadaManual[K]) =>
    onChange({ ...dados, [campo]: valor });

  const kmProduzido = calcularKMProduzido(dados.kmInicial, dados.kmFinal);
  const area = calcularArea(kmProduzido, dados.largura);
  const temProducao = kmProduzido > 0;

  return (
    <SectionCard titulo="Roçada Manual" icone="🌿" cor="green">
      <SelectField
        label="Rodovia"
        value={dados.rodovia}
        onChange={(v) => set("rodovia", v)}
        opcoes={config.rodovias}
      />

      <SelectField
        label="Canteiro / Lateral"
        value={dados.canteiro}
        onChange={(v) => set("canteiro", v)}
        opcoes={config.canteiros}
      />

      {/* KMs em lado a lado */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <KMInput
          label="KM Inicial"
          value={dados.kmInicial}
          onChange={(v) => set("kmInicial", v)}
        />
        <KMInput
          label="KM Final"
          value={dados.kmFinal}
          onChange={(v) => set("kmFinal", v)}
        />
      </div>

      <NumberField
        label="Largura Média"
        value={dados.largura}
        onChange={(v) => set("largura", v)}
        sufixo="metros"
      />

      {/* Resultado automático */}
      {temProducao && (
        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4">
          <p className="text-xs font-bold text-green-700 uppercase mb-2">✅ Produção Calculada</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="text-center">
              <p className="text-xs text-green-600">KM Produzido</p>
              <p className="text-2xl font-bold text-green-800">{formatarKMProduzido(kmProduzido)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-green-600">Área</p>
              <p className="text-2xl font-bold text-green-800">{formatarArea(area)}</p>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
