"use client";
// ============================================================
// COMPONENTE KMInput - Dois campos separados: [KM] , [metros]
// ============================================================

import React, { useRef } from "react";

interface KMInputProps {
  label: string;
  value: string;
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

  const partes = value ? value.split(",") : ["", ""];
  const parteKm = partes[0] ?? "";
  const parteMetros = partes[1] ?? "";

  const atualizar = (km: string, metros: string) => {
    if (!km && !metros) { onChange(""); return; }
    onChange(`${km},${metros}`);
  };

  const handleKmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    atualizar(val, parteMetros);
    if (val.length === 3) setTimeout(() => refMetros.current?.focus(), 0);
  };

  const handleMetrosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    atualizar(parteKm, val);
  };

  const handleMetrosKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && parteMetros === "") refKm.current?.focus();
  };

  const valido = parteKm.length === 3 && parteMetros.length === 3;
  const temErro = !!erro;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {label}
        {obrigatorio && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Container principal */}
      <div className={`
        flex items-stretch rounded-xl border-2 overflow-hidden bg-white
        ${temErro ? "border-red-400" : valido ? "border-green-500" : "border-gray-300"}
      `}>
        {/* Campo KM */}
        <div className="flex flex-col flex-1 min-w-0">
          <input
            ref={refKm}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={3}
            value={parteKm}
            onChange={handleKmChange}
            placeholder="000"
            className="w-full text-center text-2xl font-bold py-3 px-1 focus:outline-none focus:bg-green-50 bg-transparent placeholder:text-gray-300"
          />
          <span className="text-center text-xs text-gray-400 pb-1 leading-none">km</span>
        </div>

        {/* Vírgula separadora */}
        <div className="flex items-center px-0.5 pb-4">
          <span className="text-3xl font-bold text-gray-400 leading-none">,</span>
        </div>

        {/* Campo Metros */}
        <div className="flex flex-col flex-1 min-w-0">
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
            className="w-full text-center text-2xl font-bold py-3 px-1 focus:outline-none focus:bg-green-50 bg-transparent placeholder:text-gray-300"
          />
          <span className="text-center text-xs text-gray-400 pb-1 leading-none">metros</span>
        </div>

        {/* Ícone validação */}
        <div className="flex items-center pr-2 pb-4">
          {valido && !temErro && <span className="text-green-500 text-lg">✓</span>}
          {temErro && <span className="text-red-400 text-lg font-bold">!</span>}
        </div>
      </div>

      {temErro && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
          ⚠️ {erro}
        </p>
      )}
    </div>
  );
}
