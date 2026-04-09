// ============================================================
// UTILITÁRIOS DE KM - Formatação e validação do padrão XXX,XXX
// ============================================================

/**
 * Formata uma string de dígitos brutos para o padrão XXX,XXX
 * Exemplos:
 *   "020"     → "020,000"
 *   "020030"  → "020,030"
 *   "20030"   → "020,030"
 *   "1"       → "001,000"  (enquanto digita)
 *   "142941"  → "142,941"
 */
export function formatarKM(raw: string): string {
  // Remove tudo que não for dígito
  const soDigitos = raw.replace(/\D/g, "");

  if (!soDigitos) return "";

  // Máximo 6 dígitos (XXX,XXX)
  const truncado = soDigitos.slice(0, 6);

  if (truncado.length <= 3) {
    // Ainda digitando a parte inteira - mostra só os dígitos
    return truncado;
  }

  // Tem mais de 3 dígitos: insere a vírgula
  const parte1 = truncado.slice(0, 3).padStart(3, "0");
  const parte2 = truncado.slice(3).padEnd(3, "0");
  return `${parte1},${parte2}`;
}

/**
 * Formata para exibição final (ao perder o foco)
 * Garante sempre o formato XXX,XXX com 3 dígitos em cada parte
 */
export function finalizarKM(raw: string): string {
  const soDigitos = raw.replace(/\D/g, "");
  if (!soDigitos) return "";

  const truncado = soDigitos.slice(0, 6);

  const parte1 = truncado.slice(0, 3).padStart(3, "0");
  const parte2 = (truncado.slice(3) || "000").padEnd(3, "0");

  return `${parte1},${parte2}`;
}

/**
 * Converte string formatada "XXX,XXX" para número decimal
 * Exemplo: "142,941" → 142.941
 */
export function parseKM(kmStr: string): number {
  if (!kmStr) return 0;
  const normalizado = kmStr.replace(",", ".");
  const num = parseFloat(normalizado);
  return isNaN(num) ? 0 : num;
}

/**
 * Valida se o KM está no formato correto XXX,XXX
 * Retorna mensagem de erro ou null se válido
 */
export function validarKM(kmStr: string): string | null {
  if (!kmStr) return null; // campo opcional: ok estar vazio

  const regex = /^\d{3},\d{3}$/;
  if (!regex.test(kmStr)) {
    return "Formato inválido. Use o padrão: 000,000 (ex: 142,941)";
  }
  return null;
}

/**
 * Calcula KM produzido (final - inicial)
 * Retorna 0 se inválido ou negativo
 */
export function calcularKMProduzido(kmInicial: string, kmFinal: string): number {
  const ini = parseKM(kmInicial);
  const fin = parseKM(kmFinal);
  return Math.max(0, fin - ini);
}

/**
 * Calcula área em m²
 * area = kmProduzido * 1000m * largura
 */
export function calcularArea(kmProduzido: number, largura: number): number {
  return kmProduzido * 1000 * (largura || 0);
}

/**
 * Formata área para exibição
 */
export function formatarArea(area: number): string {
  return `${area.toFixed(0)} m2`;
}

/**
 * Formata KM produzido para exibição
 */
export function formatarKMProduzido(km: number): string {
  return `${km.toFixed(3)} km`.replace(".", ",");
}
