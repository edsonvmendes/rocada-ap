"use client";
// ============================================================
// COMPONENTE NumberField - Campo numérico simples
// ============================================================

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (valor: number) => void;
  obrigatorio?: boolean;
  erro?: string;
  decimais?: boolean;
  sufixo?: string;
  min?: number;
  max?: number;
}

export default function NumberField({
  label,
  value,
  onChange,
  obrigatorio = false,
  erro,
  decimais = true,
  sufixo,
  min = 0,
  max,
}: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {label}
        {obrigatorio && <span className="text-red-500 ml-1">*</span>}
        {sufixo && (
          <span className="text-gray-400 font-normal ml-1 normal-case">
            ({sufixo})
          </span>
        )}
      </label>

      <input
        type="number"
        inputMode={decimais ? "decimal" : "numeric"}
        value={value === 0 ? "" : value}
        onChange={(e) => {
          const val = decimais
            ? parseFloat(e.target.value)
            : parseInt(e.target.value);
          onChange(isNaN(val) ? 0 : val);
        }}
        placeholder="0"
        min={min}
        max={max}
        step={decimais ? "0.01" : "1"}
        className={`
          w-full text-xl font-bold text-center
          border-2 rounded-xl px-4 py-4
          transition-all duration-150
          ${erro
            ? "border-red-400 bg-red-50"
            : value > 0
            ? "border-green-400 bg-white"
            : "border-gray-300 bg-gray-50"
          }
          focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200
        `}
      />

      {erro && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
          ⚠️ {erro}
        </p>
      )}
    </div>
  );
}
