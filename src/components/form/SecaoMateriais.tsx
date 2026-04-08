"use client";
// ============================================================
// SEÇÃO 2: MATERIAIS E INSUMOS
// ============================================================

import SectionCard from "@/components/ui/SectionCard";
import NumberField from "@/components/ui/NumberField";
import { Materiais } from "@/types";

interface Props {
  dados: Materiais;
  onChange: (dados: Materiais) => void;
}

export default function SecaoMateriais({ dados, onChange }: Props) {
  const set = <K extends keyof Materiais>(campo: K, valor: Materiais[K]) =>
    onChange({ ...dados, [campo]: valor });

  return (
    <SectionCard titulo="Materiais e Insumos" icone="🪣" cor="blue">
      {/* Roçada Manual */}
      <div className="bg-white rounded-xl border border-blue-200 p-4">
        <p className="text-sm font-bold text-blue-700 uppercase mb-3">🌿 Roçada Manual</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label="Gasolina"
            value={dados.gasolinaManual}
            onChange={(v) => set("gasolinaManual", v)}
            sufixo="litros"
          />
          <NumberField
            label="Óleo 2T"
            value={dados.oleo2T}
            onChange={(v) => set("oleo2T", v)}
            sufixo="litros"
          />
          <NumberField
            label="Nylon"
            value={dados.nylonUnidades}
            onChange={(v) => set("nylonUnidades", v)}
            sufixo="un."
            decimais={false}
          />
          <NumberField
            label="Lâminas"
            value={dados.laminasUnidades}
            onChange={(v) => set("laminasUnidades", v)}
            sufixo="un."
            decimais={false}
          />
        </div>
      </div>

      {/* Tratores */}
      <div className="bg-white rounded-xl border border-blue-200 p-4">
        <p className="text-sm font-bold text-blue-700 uppercase mb-3">🚜 Tratores</p>
        <NumberField
          label="Diesel"
          value={dados.dieselTratores}
          onChange={(v) => set("dieselTratores", v)}
          sufixo="litros"
        />
      </div>

      {/* Robô */}
      <div className="bg-white rounded-xl border border-blue-200 p-4">
        <p className="text-sm font-bold text-blue-700 uppercase mb-3">🤖 Robô</p>
        <NumberField
          label="Gasolina"
          value={dados.gasolinaRobo}
          onChange={(v) => set("gasolinaRobo", v)}
          sufixo="litros"
        />
      </div>
    </SectionCard>
  );
}
