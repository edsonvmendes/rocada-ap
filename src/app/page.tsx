"use client";

import { useState } from "react";
import SecaoFechamento from "@/components/form/SecaoFechamento";
import SecaoInfoGeral from "@/components/form/SecaoInfoGeral";
import SecaoMateriais from "@/components/form/SecaoMateriais";
import SecaoRobo from "@/components/form/SecaoRobo";
import SecaoRocadaManual from "@/components/form/SecaoRocadaManual";
import SecaoTrator from "@/components/form/SecaoTrator";
import ResumoTotais from "@/components/form/ResumoTotais";
import { RELATORIO_VAZIO } from "@/lib/constants";
import { salvarRelatorio } from "@/lib/db";
import { parseKM, validarKM } from "@/lib/kmUtils";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useAdminConfig } from "@/hooks/useAdminConfig";
import { RelatorioCompleto } from "@/types";

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

  if (!dados.rodovia) erros.push(`${titulo}: rodovia e obrigatoria`);
  if (!dados.canteiro) erros.push(`${titulo}: canteiro/lateral e obrigatorio`);

  const erroKmInicial = validarKM(dados.kmInicial);
  if (erroKmInicial) erros.push(`${titulo}: KM inicial invalido`);

  const erroKmFinal = validarKM(dados.kmFinal);
  if (erroKmFinal) erros.push(`${titulo}: KM final invalido`);

  if (!dados.largura || dados.largura <= 0) {
    erros.push(`${titulo}: largura media deve ser maior que zero`);
  }

  if (!erroKmInicial && !erroKmFinal && parseKM(dados.kmFinal) <= parseKM(dados.kmInicial)) {
    erros.push(`${titulo}: KM final deve ser maior que o KM inicial`);
  }

  return erros;
}

function validarFormulario(dados: FormData): string[] {
  const erros: string[] = [];

  if (!dados.infoGeral.data) erros.push("Data e obrigatoria");
  if (!dados.infoGeral.horaInicio) erros.push("Hora de inicio e obrigatoria");
  if (!dados.infoGeral.supervisor) erros.push("Supervisor e obrigatorio");
  if (!dados.infoGeral.encarregado) erros.push("Encarregado e obrigatorio");
  if (!dados.infoGeral.equipe) erros.push("Equipe e obrigatoria");
  if (!dados.infoGeral.transporte) erros.push("Transporte e obrigatorio");
  if (!dados.infoGeral.condicoesTrabalho) erros.push("Condicoes de trabalho sao obrigatorias");

  erros.push(...validarSecaoKM("Rocada Manual", dados.rocadaManual));

  if (dados.tratorA.ativo) {
    if (!dados.tratorA.prefixo) erros.push("Trator A: prefixo e obrigatorio");
    if (!dados.tratorA.tipoRocadeira) erros.push("Trator A: tipo de rocadeira e obrigatorio");
    erros.push(...validarSecaoKM("Trator A", dados.tratorA));
  }

  if (dados.tratorB.ativo) {
    if (!dados.tratorB.prefixo) erros.push("Trator B: prefixo e obrigatorio");
    if (!dados.tratorB.tipoRocadeira) erros.push("Trator B: tipo de rocadeira e obrigatorio");
    erros.push(...validarSecaoKM("Trator B", dados.tratorB));
  }

  if (dados.tratorC.ativo) {
    if (!dados.tratorC.prefixo) erros.push("Trator C: prefixo e obrigatorio");
    if (!dados.tratorC.tipoRocadeira) erros.push("Trator C: tipo de rocadeira e obrigatorio");
    erros.push(...validarSecaoKM("Trator C", dados.tratorC));
  }

  if (dados.robo.ativo) {
    if (!dados.robo.tipo) erros.push("Robo: tipo e obrigatorio");
    erros.push(...validarSecaoKM("Robo", dados.robo));
  }

  return erros;
}

export default function PaginaFormulario() {
  const { config, carregando } = useAdminConfig();
  const { online, pendentes, sincronizando, ultimaSync, sincronizar, atualizarPendentes } =
    useOfflineSync();
  const [dados, setDados] = useState<FormData>(RELATORIO_VAZIO as FormData);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [mensagemEnvio, setMensagemEnvio] = useState("");
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
      await atualizarPendentes();

      if (navigator.onLine) {
        const resultado = await sincronizar();
        setMensagemEnvio(
          resultado?.enviados
            ? "Relatorio enviado para o servidor."
            : "Relatorio salvo no aparelho. O envio sera tentado novamente automaticamente."
        );
      } else {
        setMensagemEnvio("Sem internet. Sera enviado automaticamente quando conectar.");
      }

      setEnviado(true);
      setTimeout(() => {
        setDados(RELATORIO_VAZIO as FormData);
        setEnviado(false);
        setMensagemEnvio("");
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
          <div className="text-6xl mb-4">...</div>
          <p className="text-xl font-bold text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-green-500 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-8xl mb-6">OK</div>
          <h2 className="text-3xl font-bold text-white mb-3">Relatorio Salvo!</h2>
          <p className="text-green-100 text-lg">{mensagemEnvio}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg leading-tight">Relatorio Diario</h1>
            <p className="text-green-200 text-xs">Equipe Rocada</p>
          </div>
          <div className="flex items-center gap-2">
            {pendentes > 0 && (
              <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                {pendentes} pendente{pendentes > 1 ? "s" : ""}
              </div>
            )}
            <div
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                online ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
            >
              <span>{online ? "*" : "o"}</span>
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
          <p className="text-green-200 text-xs max-w-lg mx-auto mt-1">Ultima sync: {ultimaSync}</p>
        )}
      </header>

      {erros.length > 0 && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4">
            <p className="font-bold text-red-700 mb-2">Corrija os seguintes campos:</p>
            <ul className="list-disc list-inside">
              {erros.map((erro, indice) => (
                <li key={indice} className="text-red-600 text-sm">
                  {erro}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4 pb-32">
        <SecaoInfoGeral
          dados={dados.infoGeral}
          onChange={(valor) => setDados((atual) => ({ ...atual, infoGeral: valor }))}
          config={config}
        />
        <SecaoMateriais
          dados={dados.materiais}
          onChange={(valor) => setDados((atual) => ({ ...atual, materiais: valor }))}
        />
        <SecaoRocadaManual
          dados={dados.rocadaManual}
          onChange={(valor) => setDados((atual) => ({ ...atual, rocadaManual: valor }))}
          config={config}
        />
        <SecaoTrator
          titulo="Trator A"
          icone="T"
          cor="orange"
          dados={dados.tratorA}
          onChange={(valor) => setDados((atual) => ({ ...atual, tratorA: valor }))}
          config={config}
        />
        <SecaoTrator
          titulo="Trator B"
          icone="T"
          cor="purple"
          dados={dados.tratorB}
          onChange={(valor) => setDados((atual) => ({ ...atual, tratorB: valor }))}
          config={config}
        />
        <SecaoTrator
          titulo="Trator C"
          icone="T"
          cor="red"
          dados={dados.tratorC}
          onChange={(valor) => setDados((atual) => ({ ...atual, tratorC: valor }))}
          config={config}
        />
        <SecaoRobo
          dados={dados.robo}
          onChange={(valor) => setDados((atual) => ({ ...atual, robo: valor }))}
          config={config}
        />

        <ResumoTotais dados={dados} />

        <SecaoFechamento
          dados={dados.fechamento}
          onChange={(valor) => setDados((atual) => ({ ...atual, fechamento: valor }))}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={enviando}
          className={`
            w-full py-6 rounded-2xl text-white text-2xl font-bold shadow-lg
            active:scale-95 transition-all duration-150
            ${
              enviando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 active:bg-green-800"
            }
          `}
        >
          {enviando ? "Salvando..." : "ENVIAR RELATORIO"}
        </button>
      </main>
    </div>
  );
}
