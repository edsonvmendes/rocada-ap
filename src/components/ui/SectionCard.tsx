"use client";
// ============================================================
// COMPONENTE SectionCard - Cartão de seção do formulário
// ============================================================

interface SectionCardProps {
  titulo: string;
  icone?: string;
  children: React.ReactNode;
  cor?: "green" | "blue" | "orange" | "purple" | "red" | "gray";
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const coresBorda: Record<string, string> = {
  green: "border-green-500 bg-green-50",
  blue: "border-blue-500 bg-blue-50",
  orange: "border-orange-500 bg-orange-50",
  purple: "border-purple-500 bg-purple-50",
  red: "border-red-500 bg-red-50",
  gray: "border-gray-400 bg-gray-50",
};

const coresHeader: Record<string, string> = {
  green: "bg-green-500 text-white",
  blue: "bg-blue-500 text-white",
  orange: "bg-orange-500 text-white",
  purple: "bg-purple-500 text-white",
  red: "bg-red-500 text-white",
  gray: "bg-gray-500 text-white",
};

import { useState } from "react";

export default function SectionCard({
  titulo,
  icone,
  children,
  cor = "green",
  collapsible = false,
  defaultOpen = true,
}: SectionCardProps) {
  const [aberto, setAberto] = useState(defaultOpen);

  return (
    <div className={`rounded-2xl border-2 overflow-hidden shadow-sm ${coresBorda[cor]}`}>
      {/* Header da seção */}
      <button
        type="button"
        onClick={() => collapsible && setAberto(!aberto)}
        className={`
          w-full flex items-center justify-between gap-3 px-5 py-4 text-left
          ${coresHeader[cor]}
          ${collapsible ? "cursor-pointer" : "cursor-default"}
        `}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {icone && <span className="shrink-0 text-2xl">{icone}</span>}
          <span className="min-w-0 break-words text-lg font-bold tracking-wide">{titulo}</span>
        </div>
        {collapsible && (
          <span className="shrink-0 text-2xl transition-transform duration-200" style={{
            transform: aberto ? "rotate(180deg)" : "rotate(0deg)"
          }}>
            ▾
          </span>
        )}
      </button>

      {/* Conteúdo */}
      {(!collapsible || aberto) && (
        <div className="flex min-w-0 flex-col gap-4 p-4">
          {children}
        </div>
      )}
    </div>
  );
}
