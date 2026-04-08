"use client";
// ============================================================
// COMPONENTE KMInput - Input de KM com auto-formatação XXX,XXX
// Aceita apenas dígitos, formata automaticamente enquanto digita
// ============================================================

import React, { useState, useRef } from "react";
import { formatarKM, finalizarKM, validarKM } from "@/lib/kmUtils";

interface KMInputProps {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  obrigatorio?: boolean;
  erro?: string;
  placeholder?: string;
}

export default function KMInput({
  label,
  value,
  onChange,
  obrigatorio = false,
  erro,
  placeholder = "000,000",
}: KMInputProps) {
  const [focado, setFocado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ao digitar: aceita só dígitos e formata em tempo real
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const soDigitos = raw.replace(/\D/g, "").slice(0, 6);
    const formatado = formatarKM(soDigitos);
    onChange(formatado);
  };

  // Ao perder o foco: finaliza o formato (ex: "020" → "020,000")
  const handleBlur = () => {
    setFocado(false);
    if (value) {
      const finalizado = finalizarKM(value);
      onChange(finalizado);
    }
  };

  // Ao focar: seleciona tudo para facilitar correção
  const handleFocus = () => {
    setFocado(true);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  // Evita colar conteúdo com formatação errada
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const colado = e.clipboardData.getData("text");
    const soDigitos = colado.replace(/\D/g, "").slice(0, 6);
    const formatado = formatarKM(soDigitos);
    onChange(formatado);
  };

  // Impede teclas não numéricas (exceto backspace, delete, setas, tab)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const permitidas = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight",
      "Tab", "Enter", "Home", "End",
    ];
    const ehDigito = /^\d$/.test(e.key);
    if (!ehDigito && !permitidas.includes(e.key)) {
      e.preventDefault();
    }
  };

  const erroLocal = value ? validarKM(value) : null;
  const erroFinal = erro || erroLocal;
  const temErro = !!erroFinal;

  return (
    <div className="flex flex-col gap-1">
      {/* Label */}
      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {label}
        {obrigatorio && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"     // abre teclado numérico no celular
          pattern="\d*"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full text-center text-2xl font-bold tracking-widest
            border-2 rounded-xl px-4 py-4
            transition-all duration-150
            ${focado
              ? "border-green-500 bg-green-50 ring-2 ring-green-200"
              : temErro
              ? "border-red-400 bg-red-50"
              : value
              ? "border-green-400 bg-white"
              : "border-gray-300 bg-gray-50"
            }
            focus:outline-none
            placeholder:text-gray-300 placeholder:font-normal placeholder:text-xl
          `}
          style={{ letterSpacing: "0.2em" }}
        />

        {/* Indicador de formato */}
        {!focado && !value && (
          <div className="absolute bottom-1 right-3 text-xs text-gray-400">
            ex: 142,941
          </div>
        )}

        {/* Check verde quando válido */}
        {value && !temErro && !focado && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xl">
            ✓
          </div>
        )}
      </div>

      {/* Dica de uso */}
      {focado && (
        <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
          💡 Digite só os números. A vírgula é colocada automaticamente.
        </p>
      )}

      {/* Mensagem de erro */}
      {temErro && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200 flex items-center gap-1">
          <span>⚠️</span> {erroFinal}
        </p>
      )}
    </div>
  );
}
