"use client";
// ============================================================
// PÁGINA ADMIN - Gerenciamento de listas (dropdowns)
// Página separada, sem autenticação
// ============================================================

import { useState, useEffect } from "react";
import { AdminConfig } from "@/types";
import { getAdminConfig, saveAdminConfig } from "@/lib/adminConfig";
import { CONFIG_PADRAO } from "@/lib/adminConfig";
import { setScriptUrl, getScriptUrl } from "@/lib/sync";

type ListaKey = keyof Omit<AdminConfig, never>;

const LISTAS: { key: ListaKey; label: string; icone: string }[] = [
  { key: "supervisores", label: "Supervisores", icone: "👔" },
  { key: "encarregados", label: "Encarregados", icone: "👷" },
  { key: "equipes", label: "Equipes", icone: "👥" },
  { key: "transportes", label: "Transportes", icone: "🚌" },
  { key: "rodovias", label: "Rodovias", icone: "🛣️" },
  { key: "canteiros", label: "Canteiros / Laterais", icone: "🌾" },
  { key: "prefixosTrator", label: "Prefixos de Trator", icone: "🚜" },
  { key: "tiposRocadeira", label: "Tipos de Roçadeira", icone: "⚙️" },
  { key: "tiposRobo", label: "Tipos de Robô", icone: "🤖" },
  { key: "condicoesTrabalho", label: "Condições de Trabalho", icone: "🌦️" },
];

export default function PaginaAdmin() {
  const [config, setConfig] = useState<AdminConfig>(CONFIG_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [salvo, setSalvo] = useState(false);
  const [listaAtiva, setListaAtiva] = useState<ListaKey | null>(null);
  const [novoItem, setNovoItem] = useState("");
  const [scriptUrl, setScriptUrlState] = useState("");
  const [abaSelecionada, setAbaSelecionada] = useState<"listas" | "integracao">("listas");

  useEffect(() => {
    getAdminConfig().then((c) => {
      setConfig(c);
      setCarregando(false);
    });
    const url = getScriptUrl();
    if (url) setScriptUrlState(url);
  }, []);

  const salvar = async () => {
    await saveAdminConfig(config);
    if (scriptUrl) setScriptUrl(scriptUrl);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const restaurarPadrao = async () => {
    if (!confirm("Restaurar todas as listas para os valores padrão?")) return;
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
            <h1 className="font-bold text-lg">⚙️ Painel Admin</h1>
            <p className="text-gray-400 text-xs">Gerenciamento do sistema</p>
          </div>
          <a href="/" className="bg-green-600 text-white text-sm px-3 py-2 rounded-xl font-bold">
            ← Formulário
          </a>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4 pb-20">
        {/* Abas */}
        <div className="grid grid-cols-2 gap-2">
          {(["listas", "integracao"] as const).map((aba) => (
            <button
              key={aba}
              onClick={() => setAbaSelecionada(aba)}
              className={`py-3 rounded-xl font-bold text-sm transition-all ${
                abaSelecionada === aba
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-600 border-2 border-gray-200"
              }`}
            >
              {aba === "listas" ? "📋 Listas" : "🔗 Integração"}
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
                    {listaAtiva === key ? "▲" : "▼"}
                  </span>
                </button>

                {/* Conteúdo expandido */}
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
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => moverItem(key, idx, "down")}
                              disabled={idx === (config[key] as string[]).length - 1}
                              className="text-gray-400 text-xs disabled:opacity-30 leading-none"
                            >
                              ▼
                            </button>
                          </div>
                          <span className="flex-1 text-sm text-gray-800">{item}</span>
                          <button
                            type="button"
                            onClick={() => removerItem(key, item)}
                            className="text-red-400 hover:text-red-600 text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
                          >
                            ✕
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

        {/* Aba: Integração Google Sheets */}
        {abaSelecionada === "integracao" && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 flex flex-col gap-4">
            <div>
              <h2 className="font-bold text-gray-800 text-lg mb-1">🔗 Google Sheets</h2>
              <p className="text-sm text-gray-500">
                Cole aqui a URL do Google Apps Script para enviar os relatórios para a planilha.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">Como obter a URL:</p>
              <ol className="text-xs text-blue-700 list-decimal list-inside flex flex-col gap-1">
                <li>Abra a planilha no Google Sheets</li>
                <li>Clique em Extensões → Apps Script</li>
                <li>Cole o código fornecido</li>
                <li>Clique em Implantar → Nova implantação</li>
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

            {scriptUrl && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-sm text-green-700 font-semibold">✅ URL configurada</p>
                <p className="text-xs text-green-600 break-all mt-1">{scriptUrl}</p>
              </div>
            )}
          </div>
        )}

        {/* Botões de ação */}
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
            {salvo ? "✅ Salvo com sucesso!" : "💾 SALVAR CONFIGURAÇÕES"}
          </button>

          <button
            type="button"
            onClick={restaurarPadrao}
            className="w-full py-4 rounded-2xl text-gray-600 border-2 border-gray-300 font-bold bg-white hover:bg-gray-50 transition-all"
          >
            🔄 Restaurar padrão
          </button>
        </div>
      </main>
    </div>
  );
}
