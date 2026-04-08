"use client";
// ============================================================
// PÁGINA PRINCIPAL - FORMULÁRIO DO OPERADOR DE CAMPO
// ============================================================

import { useState } from "react";
import { RelatorioCompleto } from "@/types";
import { RELATORIO_VAZIO } from "@/lib/constants";
import { salvarRelatorio } from "@/lib/db";
import { parseKM, validarKM } from "@/lib/kmUtils";
import { useAdminConfig } from "@/hooks/useAdminConfig";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import SecaoInfoGeral from "@/components/form/SecaoInfoGeral";
import SecaoMateriais from "@/components/form/SecaoMateriais";
import SecaoRocadaManual from "@/components/form/SecaoRocadaManual";
import SecaoTrator from "@/components/form/SecaoTrator";
import SecaoRobo from "@/components/form/SecaoRobo";
import SecaoFechamento from "@/components/form/SecaoFechamento";
import ResumoTotais from "@/components/form/ResumoTotais";

type FormData = Omit<RelatorioCompleto, "id" | "syncStatus" | "criadoEm">;

function validarSecaoKM(
  titulo: string,
  dados: {
    rodovia?: string;
    canteiro?: string;
    kmInicial: string;
    kmFinal: string;
    largura: number;
  }
): string[] {
  const erros: string[] = [];
  const temAlgumDado = Boolean(
    dados.rodovia || dados.canteiro || dados.kmInicial || dados.kmFinal || dados.largura > 0
  );

  if (!temAlgumDado) return erros;

  if (!dados.rodovia) erros.push(`${titulo}: rodovia é obrigatória`);
  if (!dados.canteiro) erros.push(`${titulo}: canteiro/lateral é obrigatório`);

  const erroKmInicial = validarKM(dados.kmInicial);
  if (erroKmInicial) erros.push(`${titulo}: KM inicial inválido`);

  const erroKmFinal = validarKM(dados.kmFinal);
  if (erroKmFinal) erros.push(`${titulo}: KM final inválido`);

  if (!dados.largura || dados.largura <= 0) {
    erros.push(`${titulo}: largura média deve ser maior que zero`);
  }

  if (!erroKmInicial && !erroKmFinal && parseKM(dados.kmFinal) <= parseKM(dados.kmInicial)) {
    erros.push(`${titulo}: KM final deve ser maior que o KM inicial`);
  }

  return erros;
}

function validarFormulario(dados: FormData): string[] {
  const erros: string[] = [];
  if (!dados.infoGeral.data) erros.push("Data é obrigatória");
  if (!dados.infoGeral.horaInicio) erros.push("Hora de início é obrigatória");
  if (!dados.infoGeral.supervisor) erros.push("Supervisor é obrigatório");
  if (!dados.infoGeral.encarregado) erros.push("Encarregado é obrigatório");
  if (!dados.infoGeral.equipe) erros.push("Equipe é obrigatória");
  if (!dados.infoGeral.transporte) erros.push("Transporte é obrigatório");
  if (!dados.infoGeral.condicoesTrabalho) erros.push("Condições de trabalho são obrigatórias");

  erros.push(...validarSecaoKM("Roçada Manual", dados.rocadaManual));

  if (dados.tratorA.ativo) {
    if (!dados.tratorA.prefixo) erros.push("Trator A: prefixo é obrigatório");
    if (!dados.tratorA.tipoRocadeira) erros.push("Trator A: tipo de roçadeira é obrigatório");
    erros.push(...validarSecaoKM("Trator A", dados.tratorA));
  }

  if (dados.tratorB.ativo) {
    if (!dados.tratorB.prefixo) erros.push("Trator B: prefixo é obrigatório");
    if (!dados.tratorB.tipoRocadeira) erros.push("Trator B: tipo de roçadeira é obrigatório");
    erros.push(...validarSecaoKM("Trator B", dados.tratorB));
  }

  if (dados.tratorC.ativo) {
    if (!dados.tratorC.prefixo) erros.push("Trator C: prefixo é obrigatório");
    if (!dados.tratorC.tipoRocadeira) erros.push("Trator C: tipo de roçadeira é obrigatório");
    erros.push(...validarSecaoKM("Trator C", dados.tratorC));
  }

  if (dados.robo.ativo) {
    if (!dados.robo.tipo) erros.push("Robô: tipo é obrigatório");
    erros.push(...validarSecaoKM("Robô", dados.robo));
  }

  return erros;
}

export default function PaginaFormulario() {
  const { config, carregando } = useAdminConfig();
  const { online, pendentes, sincronizando, ultimaSync } = useOfflineSync();
  const [dados, setDados] = useState<FormData>(RELATORIO_VAZIO as FormData);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erros, setErros] = useState<string[]>([]);

  const handleSubmit = async () => {
    const errosValidacao = validarFormulario(dados);
    if (errosValidacao.length > 0) {
      setErros(errosValidacao);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setEnviando(true);
    setErros([]);
    try {
      await salvarRelatorio(dados);
      setEnviado(true);
      setTimeout(() => {
        setDados(RELATORIO_VAZIO as FormData);
        setEnviado(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 3000);
    } catch {
      setErros(["Erro ao salvar. Tente novamente."]);
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌿</div>
          <p className="text-xl font-bold text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-green-500 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-8xl mb-6">✅</div>
          <h2 className="text-3xl font-bold text-white mb-3">Relatório Salvo!</h2>
          <p className="text-green-100 text-lg">
            {online
              ? "Enviando para o servidor..."
              : "Sem internet. Será enviado automaticamente quando conectar."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header fixo */}
      <header className="bg-green-600 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg leading-tight">Relatório Diário</h1>
            <p className="text-green-200 text-xs">Equipe Roçada</p>
          </div>
          <div className="flex items-center gap-2">
            {pendentes > 0 && (
              <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                {pendentes} pendente{pendentes > 1 ? "s" : ""}
              </div>
            )}
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${online ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
              <span>{online ? "●" : "○"}</span>
              <span>{online ? "Online" : "Offline"}</span>
            </div>
          </div>
        </div>
        {sincronizando && (
          <div className="max-w-lg mx-auto mt-2">
            <div className="bg-green-500 rounded-full h-1 animate-pulse w-full" />
            <p className="text-green-200 text-xs mt-1">Sincronizando...</p>
          </div>
        )}
        {ultimaSync && !sincronizando && (
          <p className="text-green-200 text-xs max-w-lg mx-auto mt-1">
            Última sync: {ultimaSync}
          </p>
        )}
      </header>

      {/* Erros de validação */}
      {erros.length > 0 && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4">
            <p className="font-bold text-red-700 mb-2">⚠️ Corrija os seguintes campos:</p>
            <ul className="list-disc list-inside">
              {erros.map((e, i) => (
                <li key={i} className="text-red-600 text-sm">{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Formulário */}
      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4 pb-32">
        <SecaoInfoGeral
          dados={dados.infoGeral}
          onChange={(v) => setDados((d) => ({ ...d, infoGeral: v }))}
          config={config}
        />
        <SecaoMateriais
          dados={dados.materiais}
          onChange={(v) => setDados((d) => ({ ...d, materiais: v }))}
        />
        <SecaoRocadaManual
          dados={dados.rocadaManual}
          onChange={(v) => setDados((d) => ({ ...d, rocadaManual: v }))}
          config={config}
        />
        <SecaoTrator titulo="Trator A" icone="🚜" cor="orange"
          dados={dados.tratorA}
          onChange={(v) => setDados((d) => ({ ...d, tratorA: v }))}
          config={config}
        />
        <SecaoTrator titulo="Trator B" icone="🚜" cor="purple"
          dados={dados.tratorB}
          onChange={(v) => setDados((d) => ({ ...d, tratorB: v }))}
          config={config}
        />
        <SecaoTrator titulo="Trator C" icone="🚜" cor="red"
          dados={dados.tratorC}
          onChange={(v) => setDados((d) => ({ ...d, tratorC: v }))}
          config={config}
        />
        <SecaoRobo
          dados={dados.robo}
          onChange={(v) => setDados((d) => ({ ...d, robo: v }))}
          config={config}
        />

        {/* Resumo automático de totais */}
        <ResumoTotais dados={dados} />

        <SecaoFechamento
          dados={dados.fechamento}
          onChange={(v) => setDados((d) => ({ ...d, fechamento: v }))}
        />

        {/* Botão de envio */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={enviando}
          className={`
            w-full py-6 rounded-2xl text-white text-2xl font-bold shadow-lg
            active:scale-95 transition-all duration-150
            ${enviando ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 active:bg-green-800"}
          `}
        >
          {enviando ? "⏳ Salvando..." : "✅ ENVIAR RELATÓRIO"}
        </button>

      </main>
    </div>
  );
}
