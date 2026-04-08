"use client";
// ============================================================
// COMPONENTE SelectField - Dropdown grande e fácil de usar
// Otimizado para usuários com dificuldade em tecnologia
// ============================================================

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  opcoes: string[];
  obrigatorio?: boolean;
  erro?: string;
  placeholder?: string;
}

export default function SelectField({
  label,
  value,
  onChange,
  opcoes,
  obrigatorio = false,
  erro,
  placeholder = "Selecione...",
}: SelectFieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {label}
        {obrigatorio && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full min-w-0 max-w-full text-base font-medium
          border-2 rounded-xl px-4 py-4
          appearance-none bg-no-repeat
          transition-all duration-150
          ${erro
            ? "border-red-400 bg-red-50 text-red-900"
            : value
            ? "border-green-400 bg-white text-gray-900"
            : "border-gray-300 bg-gray-50 text-gray-400"
          }
          focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundPosition: "right 12px center",
          backgroundSize: "20px",
          paddingRight: "44px",
        }}
      >
        <option value="">{placeholder}</option>
        {opcoes.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>

      {erro && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
          ⚠️ {erro}
        </p>
      )}
    </div>
  );
}
