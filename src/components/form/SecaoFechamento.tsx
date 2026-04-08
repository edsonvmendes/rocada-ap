"use client";
// ============================================================
// SEÇÃO 6: FECHAMENTO DO DIA
// ============================================================

import SectionCard from "@/components/ui/SectionCard";
import { Fechamento } from "@/types";

interface Props {
  dados: Fechamento;
  onChange: (dados: Fechamento) => void;
}

export default function SecaoFechamento({ dados, onChange }: Props) {
  const set = <K extends keyof Fechamento>(campo: K, valor: Fechamento[K]) =>
    onChange({ ...dados, [campo]: valor });

  return (
    <SectionCard titulo="Fechamento do Dia" icone="🏁" cor="gray">

      {/* Hora de Término */}
      <div className="flex min-w-0 flex-col gap-1 overflow-hidden">
        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Horário de Término
        </label>
        <input
          type="time"
          value={dados.horaTermino}
          onChange={(e) => set("horaTermino", e.target.value)}
          className={`
            block w-full min-w-0 max-w-full overflow-hidden text-base font-bold border-2 rounded-xl px-3 py-4 sm:px-4 sm:text-xl
            focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200
            ${dados.horaTermino ? "border-green-400 bg-white" : "border-gray-300 bg-gray-50"}
          `}
        />
      </div>

      {/* Limpeza de Drenagem */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Limpeza de Drenagem Superficial?
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["Sim", "Não"] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => set("limpezaDrenagem", opcao)}
              className={`
                min-w-0 rounded-xl border-2 py-5 text-lg font-bold transition-all active:scale-95 sm:text-xl
                ${dados.limpezaDrenagem === opcao
                  ? opcao === "Sim"
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-red-500 border-red-500 text-white"
                  : "bg-white border-gray-300 text-gray-500"
                }
              `}
            >
              {opcao === "Sim" ? "✅ Sim" : "❌ Não"}
            </button>
          ))}
        </div>
      </div>

      {/* Remoção de Massa Seca */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Remoção de Massa Seca?
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["Sim", "Não"] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => set("remocaoMassaSeca", opcao)}
              className={`
                min-w-0 rounded-xl border-2 py-5 text-lg font-bold transition-all active:scale-95 sm:text-xl
                ${dados.remocaoMassaSeca === opcao
                  ? opcao === "Sim"
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-red-500 border-red-500 text-white"
                  : "bg-white border-gray-300 text-gray-500"
                }
              `}
            >
              {opcao === "Sim" ? "✅ Sim" : "❌ Não"}
            </button>
          ))}
        </div>
      </div>

      {/* Considerações Gerais */}
      <div className="flex min-w-0 flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Considerações Gerais
        </label>
        <textarea
          value={dados.consideracoesGerais}
          onChange={(e) => set("consideracoesGerais", e.target.value)}
          placeholder="Observações do dia, ocorrências, imprevistos..."
          rows={4}
          className={`
            w-full border-2 rounded-xl px-4 py-3 text-base resize-none
            focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200
            ${dados.consideracoesGerais ? "border-green-400 bg-white" : "border-gray-300 bg-gray-50"}
          `}
        />
      </div>

    </SectionCard>
  );
}
