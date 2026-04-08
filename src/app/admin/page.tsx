"use client";
// ============================================================
// PÃGINA ADMIN - Gerenciamento de listas (dropdowns)
// PÃ¡gina separada, sem autenticaÃ§Ã£o
// ============================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminConfig } from "@/types";
import { getAdminConfig, saveAdminConfig } from "@/lib/adminConfig";
import { CONFIG_PADRAO } from "@/lib/adminConfig";
import { setScriptUrl, getScriptUrl, getScriptToken, setScriptToken } from "@/lib/sync";

type ListaKey =
  | "supervisores"
  | "encarregados"
  | "equipes"
  | "transportes"
  | "rodovias"
  | "canteiros"
  | "prefixosTrator"
  | "tiposRocadeira"
  | "tiposRobo"
  | "condicoesTrabalho";

const LISTAS: { key: ListaKey; label: string; icone: string }[] = [
  { key: "supervisores", label: "Supervisores", icone: "ðŸ‘”" },
  { key: "encarregados", label: "Encarregados", icone: "ðŸ‘·" },
  { key: "equipes", label: "Equipes", icone: "ðŸ‘¥" },
  { key: "transportes", label: "Transportes", icone: "ðŸšŒ" },
  { key: "rodovias", label: "Rodovias", icone: "ðŸ›£ï¸" },
  { key: "canteiros", label: "Canteiros / Laterais", icone: "ðŸŒ¾" },
  { key: "prefixosTrator", label: "Prefixos de Trator", icone: "ðŸšœ" },
  { key: "tiposRocadeira", label: "Tipos de RoÃ§adeira", icone: "âš™ï¸" },
  { key: "tiposRobo", label: "Tipos de RobÃ´", icone: "ðŸ¤–" },
  { key: "condicoesTrabalho", label: "CondiÃ§Ãµes de Trabalho", icone: "ðŸŒ¦ï¸" },
];

export default function PaginaAdmin() {
  const [config, setConfig] = useState<AdminConfig>(CONFIG_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [salvo, setSalvo] = useState(false);
  const [listaAtiva, setListaAtiva] = useState<ListaKey | null>(null);
  const [novoItem, setNovoItem] = useState("");
  const [scriptUrl, setScriptUrlState] = useState("");
  const [scriptToken, setScriptTokenState] = useState("");
  const [abaSelecionada, setAbaSelecionada] = useState<"listas" | "integracao" | "custos">("listas");

  useEffect(() => {
    Promise.all([
      getAdminConfig(),
      Promise.resolve(getScriptUrl()),
      Promise.resolve(getScriptToken()),
    ]).then(([c, url, token]) => {
      setConfig(c);
      if (url) setScriptUrlState(url);
      if (token) setScriptTokenState(token);
      setCarregando(false);
    });
  }, []);

  const salvar = async () => {
    await saveAdminConfig(config);
    setScriptUrl(scriptUrl.trim());
    setScriptToken(scriptToken.trim());
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const restaurarPadrao = async () => {
    if (!confirm("Restaurar todas as listas para os valores padrÃ£o?")) return;
    setConfig(CONFIG_PADRAO);
    await saveAdminConfig(CONFIG_PADRAO);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const adicionarItem = () => {
    if (!novoItem.trim() || !listaAtiva) return;
    const lista = config[listaAtiva] as string[];
    if (lista.includes(novoItem.trim())) return;
    setConfig((c) => ({
      ...c,
      [listaAtiva]: [...lista, novoItem.trim()],
    }));
    setNovoItem("");
  };

  const removerItem = (lista: ListaKey, item: string) => {
    setConfig((c) => ({
      ...c,
      [lista]: (c[lista] as string[]).filter((i) => i !== item),
    }));
  };

  const moverItem = (lista: ListaKey, index: number, direcao: "up" | "down") => {
    const arr = [...(config[lista] as string[])];
    const novoIndex = direcao === "up" ? index - 1 : index + 1;
    if (novoIndex < 0 || novoIndex >= arr.length) return;
    [arr[index], arr[novoIndex]] = [arr[novoIndex], arr[index]];
    setConfig((c) => ({ ...c, [lista]: arr }));
  };

  const atualizarCusto = (
    campo: keyof AdminConfig["custosReferencia"],
    valor: string
  ) => {
    const numero = parseFloat(valor);
    setConfig((atual) => ({
      ...atual,
      custosReferencia: {
        ...atual.custosReferencia,
        [campo]: Number.isNaN(numero) ? 0 : numero,
      },
    }));
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-bold text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">âš™ï¸ Painel Admin</h1>
            <p className="text-gray-400 text-xs">Gerenciamento do sistema</p>
          </div>
          <Link href="/" className="bg-green-600 text-white text-sm px-3 py-2 rounded-xl font-bold">
            â† FormulÃ¡rio
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4 pb-20">
        {/* Abas */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {(["listas", "integracao", "custos"] as const).map((aba) => (
            <button
              key={aba}
              onClick={() => setAbaSelecionada(aba)}
              className={`py-3 rounded-xl font-bold text-sm transition-all ${
                abaSelecionada === aba
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-600 border-2 border-gray-200"
              }`}
            >
              {aba === "listas"
                ? "ðŸ“‹ Listas"
                : aba === "integracao"
                  ? "ðŸ”— IntegraÃ§Ã£o"
                  : "ðŸ’° Custos"}
            </button>
          ))}
        </div>

        {/* Aba: Listas */}
        {abaSelecionada === "listas" && (
          <>
            {LISTAS.map(({ key, label, icone }) => (
              <div key={key} className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                {/* Header da lista */}
                <button
                  type="button"
                  onClick={() => setListaAtiva(listaAtiva === key ? null : key)}
                  className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icone}</span>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">
                        {(config[key] as string[]).length} itens
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xl">
                    {listaAtiva === key ? "â–²" : "â–¼"}
                  </span>
                </button>

                {/* ConteÃºdo expandido */}
                {listaAtiva === key && (
                  <div className="p-4 flex flex-col gap-3">
                    {/* Lista de itens */}
                    <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
                      {(config[key] as string[]).map((item, idx) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200"
                        >
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => moverItem(key, idx, "up")}
                              disabled={idx === 0}
                              className="text-gray-400 text-xs disabled:opacity-30 leading-none"
                            >
                              â–²
                            </button>
                            <button
                              type="button"
                              onClick={() => moverItem(key, idx, "down")}
                              disabled={idx === (config[key] as string[]).length - 1}
                              className="text-gray-400 text-xs disabled:opacity-30 leading-none"
                            >
                              â–¼
                            </button>
                          </div>
                          <span className="flex-1 text-sm text-gray-800">{item}</span>
                          <button
                            type="button"
                            onClick={() => removerItem(key, item)}
                            className="text-red-400 hover:text-red-600 text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
                          >
                            âœ•
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Adicionar novo item */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={novoItem}
                        onChange={(e) => setNovoItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && adicionarItem()}
                        placeholder={`Novo item em ${label}...`}
                        className="flex-1 border-2 border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={adicionarItem}
                        className="bg-gray-800 text-white px-4 py-3 rounded-xl font-bold text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Aba: IntegraÃ§Ã£o Google Sheets */}
        {abaSelecionada === "integracao" && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 flex flex-col gap-4">
            <div>
              <h2 className="font-bold text-gray-800 text-lg mb-1">ðŸ”— Google Sheets</h2>
              <p className="text-sm text-gray-500">
                Cole aqui a URL do Google Apps Script para enviar os relatÃ³rios para a planilha.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">Como obter a URL:</p>
              <ol className="text-xs text-blue-700 list-decimal list-inside flex flex-col gap-1">
                <li>Abra a planilha no Google Sheets</li>
                <li>Clique em ExtensÃµes â†’ Apps Script</li>
                <li>Cole o cÃ³digo fornecido</li>
                <li>Clique em Implantar â†’ Nova implantaÃ§Ã£o</li>
                <li>Copie a URL gerada e cole aqui</li>
              </ol>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                URL do Apps Script
              </label>
              <input
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrlState(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Token de acesso
              </label>
              <input
                type="password"
                value={scriptToken}
                onChange={(e) => setScriptTokenState(e.target.value)}
                placeholder="Defina o mesmo token usado no Apps Script"
                className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
              />
              <p className="text-xs text-gray-500">
                Esse token Ã© enviado junto nas leituras e gravaÃ§Ãµes da planilha para bloquear
                acessos sem autorizaÃ§Ã£o.
              </p>
            </div>

            {scriptUrl && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-sm text-green-700 font-semibold">âœ… URL configurada</p>
                <p className="text-xs text-green-600 break-all mt-1">{scriptUrl}</p>
              </div>
            )}
          </div>
        )}

        {abaSelecionada === "custos" && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 flex flex-col gap-4">
            <div>
              <h2 className="font-bold text-gray-800 text-lg mb-1">Custos de Referencia</h2>
              <p className="text-sm text-gray-500">
                Esses valores abastecem o dashboard gerencial para calcular custo por KM e custo
                por m2.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Diesel (R$/L)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={config.custosReferencia.diesel}
                  onChange={(e) => atualizarCusto("diesel", e.target.value)}
                  className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Gasolina (R$/L)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={config.custosReferencia.gasolina}
                  onChange={(e) => atualizarCusto("gasolina", e.target.value)}
                  className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Oleo 2T (R$/L)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={config.custosReferencia.oleo2T}
                  onChange={(e) => atualizarCusto("oleo2T", e.target.value)}
                  className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-600"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">
                Uso no painel gerencial
              </p>
              <p className="text-xs text-amber-700">
                O dashboard usa esses custos para estimar custo por m2 e custo por KM. Se estiverem
                zerados, os rankings de custo ficam distorcidos.
              </p>
            </div>
          </div>
        )}

        {/* BotÃµes de aÃ§Ã£o */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={salvar}
            className={`
              w-full py-5 rounded-2xl text-white text-xl font-bold shadow-lg
              transition-all active:scale-95
              ${salvo ? "bg-green-500" : "bg-gray-800 hover:bg-gray-900"}
            `}
          >
            {salvo ? "âœ… Salvo com sucesso!" : "ðŸ’¾ SALVAR CONFIGURAÃ‡Ã•ES"}
          </button>

          <button
            type="button"
            onClick={restaurarPadrao}
            className="w-full py-4 rounded-2xl text-gray-600 border-2 border-gray-300 font-bold bg-white hover:bg-gray-50 transition-all"
          >
            ðŸ”„ Restaurar padrÃ£o
          </button>
        </div>
      </main>
    </div>
  );
}

