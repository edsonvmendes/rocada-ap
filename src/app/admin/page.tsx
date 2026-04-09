"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminConfig } from "@/types";
import { CONFIG_PADRAO, getAdminConfig, saveAdminConfig } from "@/lib/adminConfig";
import { getScriptToken, getScriptUrl, setScriptToken, setScriptUrl } from "@/lib/sync";

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

type AbaKey = "listas" | "integracao";

const LISTAS: { key: ListaKey; label: string; icone: string }[] = [
  { key: "supervisores", label: "Supervisores", icone: "SG" },
  { key: "encarregados", label: "Encarregados", icone: "EN" },
  { key: "equipes", label: "Equipes", icone: "EQ" },
  { key: "transportes", label: "Transportes", icone: "TR" },
  { key: "rodovias", label: "Rodovias", icone: "RO" },
  { key: "canteiros", label: "Canteiros / Laterais", icone: "CA" },
  { key: "prefixosTrator", label: "Prefixos de Trator", icone: "TT" },
  { key: "tiposRocadeira", label: "Tipos de Rocadeira", icone: "RC" },
  { key: "tiposRobo", label: "Tipos de Robo", icone: "RB" },
  { key: "condicoesTrabalho", label: "Condicoes de Trabalho", icone: "CT" },
];

function AbaButton({
  ativa,
  onClick,
  label,
}: {
  ativa: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all ${
        ativa
          ? "border-green-600 bg-green-600 text-white"
          : "border-gray-200 bg-white text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}

export default function PaginaAdmin() {
  const [config, setConfig] = useState<AdminConfig>(CONFIG_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [salvo, setSalvo] = useState(false);
  const [listaAtiva, setListaAtiva] = useState<ListaKey | null>(null);
  const [novoItem, setNovoItem] = useState("");
  const [scriptUrl, setScriptUrlState] = useState("");
  const [scriptToken, setScriptTokenState] = useState("");
  const [abaSelecionada, setAbaSelecionada] = useState<AbaKey>("listas");

  useEffect(() => {
    Promise.all([
      getAdminConfig(),
      Promise.resolve(getScriptUrl()),
      Promise.resolve(getScriptToken()),
    ]).then(([configSalva, url, token]) => {
      setConfig(configSalva);
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
    if (!confirm("Restaurar todas as listas padrao?")) return;
    setConfig(CONFIG_PADRAO);
    setScriptUrlState(getScriptUrl() || "");
    await saveAdminConfig(CONFIG_PADRAO);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const adicionarItem = () => {
    if (!novoItem.trim() || !listaAtiva) return;
    const lista = config[listaAtiva] as string[];
    if (lista.includes(novoItem.trim())) return;

    setConfig((atual) => ({
      ...atual,
      [listaAtiva]: [...lista, novoItem.trim()],
    }));
    setNovoItem("");
  };

  const removerItem = (lista: ListaKey, item: string) => {
    setConfig((atual) => ({
      ...atual,
      [lista]: (atual[lista] as string[]).filter((valor) => valor !== item),
    }));
  };

  const moverItem = (lista: ListaKey, index: number, direcao: "up" | "down") => {
    const itens = [...(config[lista] as string[])];
    const novoIndex = direcao === "up" ? index - 1 : index + 1;
    if (novoIndex < 0 || novoIndex >= itens.length) return;

    [itens[index], itens[novoIndex]] = [itens[novoIndex], itens[index]];
    setConfig((atual) => ({ ...atual, [lista]: itens }));
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
      <header className="bg-green-600 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-lg">Painel Admin</h1>
            <p className="text-green-100 text-xs">Configuracoes do aplicativo</p>
          </div>
          <Link
            href="/"
            className="bg-green-500 text-white text-sm px-3 py-2 rounded-xl font-bold whitespace-nowrap"
          >
            Voltar ao formulario
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-4 pb-20">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <AbaButton ativa={abaSelecionada === "listas"} onClick={() => setAbaSelecionada("listas")} label="Listas" />
          <AbaButton ativa={abaSelecionada === "integracao"} onClick={() => setAbaSelecionada("integracao")} label="Integracao" />
        </div>

        {abaSelecionada === "listas" && (
          <>
            {LISTAS.map(({ key, label, icone }) => (
              <div key={key} className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setListaAtiva(listaAtiva === key ? null : key)}
                  className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-xl bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {icone}
                    </span>
                    <div className="text-left min-w-0">
                      <p className="font-bold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500">{(config[key] as string[]).length} itens</p>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xl">{listaAtiva === key ? "^" : "v"}</span>
                </button>

                {listaAtiva === key && (
                  <div className="p-4 flex flex-col gap-3">
                    <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
                      {(config[key] as string[]).map((item, idx) => (
                        <div key={item} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => moverItem(key, idx, "up")}
                              disabled={idx === 0}
                              className="text-gray-400 text-xs disabled:opacity-30 leading-none"
                            >
                              ^
                            </button>
                            <button
                              type="button"
                              onClick={() => moverItem(key, idx, "down")}
                              disabled={idx === (config[key] as string[]).length - 1}
                              className="text-gray-400 text-xs disabled:opacity-30 leading-none"
                            >
                              v
                            </button>
                          </div>
                          <span className="flex-1 text-sm text-gray-800 min-w-0 break-words">{item}</span>
                          <button
                            type="button"
                            onClick={() => removerItem(key, item)}
                            className="text-red-400 hover:text-red-600 text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={novoItem}
                        onChange={(e) => setNovoItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && adicionarItem()}
                        placeholder={`Novo item em ${label}...`}
                        className="flex-1 border-2 border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-600"
                      />
                      <button
                        type="button"
                        onClick={adicionarItem}
                        className="bg-green-600 text-white px-4 py-3 rounded-xl font-bold text-sm sm:min-w-24"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {abaSelecionada === "integracao" && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 flex flex-col gap-4">
            <div>
              <h2 className="font-bold text-gray-800 text-lg mb-1">Google Sheets</h2>
              <p className="text-sm text-gray-500">
                Configure aqui a URL do Apps Script e o token para leitura e envio dos relatorios.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">Como configurar:</p>
              <ol className="text-xs text-blue-700 list-decimal list-inside flex flex-col gap-1">
                <li>Abra a planilha no Google Sheets</li>
                <li>Clique em Extensoes e depois em Apps Script</li>
                <li>Publique o script como app web</li>
                <li>Copie a URL /exec gerada</li>
                <li>Se usar token, salve o mesmo valor aqui</li>
              </ol>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">URL do Apps Script</label>
              <input
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrlState(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Token de acesso</label>
              <input
                type="password"
                value={scriptToken}
                onChange={(e) => setScriptTokenState(e.target.value)}
                placeholder="Use o mesmo token configurado no Apps Script"
                className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-600"
              />
              <p className="text-xs text-gray-500">
                Esse token protege as leituras e gravacoes da planilha quando a API estiver fechada.
              </p>
            </div>

            {scriptUrl && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-sm text-green-700 font-semibold">Integracao configurada</p>
                <p className="text-xs text-green-600 break-all mt-1">{scriptUrl}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={salvar}
            className={`w-full py-5 rounded-2xl text-white text-xl font-bold shadow-lg transition-all active:scale-95 ${
              salvo ? "bg-green-500" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {salvo ? "Configuracoes salvas" : "SALVAR CONFIGURACOES"}
          </button>

          <button
            type="button"
            onClick={restaurarPadrao}
            className="w-full py-4 rounded-2xl text-gray-600 border-2 border-gray-300 font-bold bg-white hover:bg-gray-50 transition-all"
          >
            Restaurar padrao
          </button>
        </div>
      </main>
    </div>
  );
}
