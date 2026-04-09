"use client";
// ============================================================
// SECAO 2: MATERIAIS E INSUMOS
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
    <SectionCard titulo="Materiais e Insumos" icone="MI" cor="blue">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Registro de consumo
        </p>
        <p className="mt-1 text-sm text-blue-700">
          Os campos de materiais aceitam valor zero e mantem a unidade visivel em litros ou unidades.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-blue-200 p-4">
        <p className="text-sm font-bold text-blue-700 uppercase mb-3">Rocada Manual</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumberField
            label="Gasolina"
            value={dados.gasolinaManual}
            onChange={(v) => set("gasolinaManual", v)}
            sufixo="litros"
            mostrarZero
          />
          <NumberField
            label="Oleo 2T"
            value={dados.oleo2T}
            onChange={(v) => set("oleo2T", v)}
            sufixo="litros"
            mostrarZero
          />
          <NumberField
            label="Nylon"
            value={dados.nylonUnidades}
            onChange={(v) => set("nylonUnidades", v)}
            sufixo="un."
            decimais={false}
            mostrarZero
          />
          <NumberField
            label="Laminas"
            value={dados.laminasUnidades}
            onChange={(v) => set("laminasUnidades", v)}
            sufixo="un."
            decimais={false}
            mostrarZero
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-blue-200 p-4">
        <p className="text-sm font-bold text-blue-700 uppercase mb-3">Tratores</p>
        <NumberField
          label="Diesel"
          value={dados.dieselTratores}
          onChange={(v) => set("dieselTratores", v)}
          sufixo="litros"
          mostrarZero
        />
      </div>

      <div className="bg-white rounded-xl border border-blue-200 p-4">
        <p className="text-sm font-bold text-blue-700 uppercase mb-3">Robo</p>
        <NumberField
          label="Gasolina"
          value={dados.gasolinaRobo}
          onChange={(v) => set("gasolinaRobo", v)}
          sufixo="litros"
          mostrarZero
        />
      </div>
    </SectionCard>
  );
}
