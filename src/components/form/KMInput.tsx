"use client";
// ============================================================
// COMPONENTE KMInput - Dois campos separados: [KM] , [metros]
// Sem formatação automática. O que o usuário digita = o que aparece.
// ============================================================

import React, { useRef } from "react";

interface KMInputProps {
  label: string;
  value: string;           // formato interno: "XXX,XXX" ou ""
  onChange: (valor: string) => void;
  obrigatorio?: boolean;
  erro?: string;
}

export default function KMInput({
  label,
  value,
  onChange,
  obrigatorio = false,
  erro,
}: KMInputProps) {
  const refMetros = useRef<HTMLInputElement>(null);
  const refKm = useRef<HTMLInputElement>(null);

  // Separa o valor interno "XXX,XXX" nos dois campos
  const partes = value ? value.split(",") : ["", ""];
  const parteKm = partes[0] ?? "";
  const parteMetros = partes[1] ?? "";

  // Atualiza o valor interno combinando os dois campos
  const atualizar = (km: string, metros: string) => {
    if (!km && !metros) {
      onChange("");
      return;
    }
    onChange(`${km},${metros}`);
  };

  const handleKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    atualizar(val, parteMetros);
    // Avança automaticamente para o campo de metros ao digitar 3 dígitos
    if (val.length === 3) {
      setTimeout(() => refMetros.current?.focus(), 0);
    }
  };

  const handleMetrosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    atualizar(parteKm, val);
  };

  // Ao pressionar backspace no campo metros vazio, volta pro campo km
  const handleMetrosKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && parteMetros === "") {
      refKm.current?.focus();
    }
  };

  const valido = parteKm.length === 3 && parteMetros.length === 3;
  const temErro = !!erro;

  return (
    <div className="flex flex-col gap-1">
      {/* Label */}
      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {label}
        {obrigatorio && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Dois campos lado a lado */}
      <div className={`
        flex items-center gap-0 rounded-xl border-2 overflow-hidden bg-white
        ${temErro ? "border-red-400" : valido ? "border-green-500" : "border-gray-300"}
      `}>
        {/* Campo KM */}
        <input
          ref={refKm}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={3}
          value={parteKm}
          onChange={handleKmChange}
          placeholder="000"
          className={`
            w-full text-center text-3xl font-bold py-4
            focus:outline-none focus:bg-green-50
            placeholder:text-gray-300 placeholder:font-normal placeholder:text-2xl
            bg-transparent
          `}
        />

        {/* Separador vírgula */}
        <span className="text-4xl font-bold text-gray-400 px-1 select-none">,</span>

        {/* Campo metros */}
        <input
          ref={refMetros}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={3}
          value={parteMetros}
          onChange={handleMetrosChange}
          onKeyDown={handleMetrosKeyDown}
          placeholder="000"
          className={`
            w-full text-center text-3xl font-bold py-4
            focus:outline-none focus:bg-green-50
            placeholder:text-gray-300 placeholder:font-normal placeholder:text-2xl
            bg-transparent
          `}
        />

        {/* Ícone de validação */}
        <div className="pr-3">
          {valido && !temErro && (
            <span className="text-green-500 text-xl">✓</span>
          )}
          {temErro && (
            <span className="text-red-400 text-xl">!</span>
          )}
        </div>
      </div>

      {/* Legenda dos campos */}
      <div className="flex text-xs text-gray-400 px-1">
        <span className="flex-1 text-center">quilômetro</span>
        <span className="w-6" />
        <span className="flex-1 text-center">metros</span>
        <span className="w-8" />
      </div>

      {/* Erro */}
      {temErro && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
          ⚠️ {erro}
        </p>
      )}
    </div>
  );
}
