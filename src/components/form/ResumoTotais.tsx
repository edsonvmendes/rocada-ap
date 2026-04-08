"use client";
// ============================================================
// RESUMO DE TOTAIS - Exibido ao final do formulário
// ============================================================

import { RelatorioCompleto } from "@/types";
import { calcularKMProduzido, calcularArea, formatarArea, formatarKMProduzido } from "@/lib/kmUtils";

interface Props {
  dados: Omit<RelatorioCompleto, "id" | "syncStatus" | "criadoEm">;
}

export default function ResumoTotais({ dados }: Props) {
  const calcTrator = (t: typeof dados.tratorA) => {
    if (!t.ativo) return { km: 0, area: 0 };
    const km = calcularKMProduzido(t.kmInicial, t.kmFinal);
    return { km, area: calcularArea(km, t.largura) };
  };

  const manual = {
    km: calcularKMProduzido(dados.rocadaManual.kmInicial, dados.rocadaManual.kmFinal),
    area: 0,
  };
  manual.area = calcularArea(manual.km, dados.rocadaManual.largura);

  const a = calcTrator(dados.tratorA);
  const b = calcTrator(dados.tratorB);
  const c = calcTrator(dados.tratorC);

  const roboKm = dados.robo.ativo ? calcularKMProduzido(dados.robo.kmInicial, dados.robo.kmFinal) : 0;
  const roboArea = dados.robo.ativo ? calcularArea(roboKm, dados.robo.largura) : 0;

  const totalKm = manual.km + a.km + b.km + c.km + roboKm;
  const totalArea = manual.area + a.area + b.area + c.area + roboArea;

  if (totalKm === 0) return null;

  return (
    <div className="rounded-2xl border-4 border-green-500 bg-green-50 overflow-hidden shadow-lg">
      <div className="bg-green-600 px-5 py-4">
        <h3 className="text-white text-xl font-bold">📊 Resumo da Produção</h3>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Linhas por seção */}
        {[
          { label: "🌿 Roçada Manual", km: manual.km, area: manual.area },
          { label: "🚜 Trator A", km: a.km, area: a.area, skip: !dados.tratorA.ativo },
          { label: "🚜 Trator B", km: b.km, area: b.area, skip: !dados.tratorB.ativo },
          { label: "🚜 Trator C", km: c.km, area: c.area, skip: !dados.tratorC.ativo },
          { label: "🤖 Robô", km: roboKm, area: roboArea, skip: !dados.robo.ativo },
        ]
          .filter((item) => !item.skip && item.km > 0)
          .map((item) => (
            <div key={item.label} className="flex justify-between items-center bg-white rounded-xl px-4 py-3 border border-green-200">
              <span className="font-medium text-gray-700">{item.label}</span>
              <div className="text-right">
                <p className="font-bold text-green-700">{formatarKMProduzido(item.km)}</p>
                <p className="text-xs text-gray-500">{formatarArea(item.area)}</p>
              </div>
            </div>
          ))}

        {/* Total */}
        <div className="bg-green-600 rounded-xl px-4 py-4 flex justify-between items-center">
          <span className="text-white font-bold text-lg">TOTAL</span>
          <div className="text-right">
            <p className="text-white font-bold text-2xl">{formatarKMProduzido(totalKm)}</p>
            <p className="text-green-200 text-sm">{formatarArea(totalArea)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
