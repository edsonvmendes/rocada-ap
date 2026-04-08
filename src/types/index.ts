// ============================================================
// TIPOS GLOBAIS DO SISTEMA - RELATÓRIO DIÁRIO DE ROÇADA
// ============================================================

// ---- Seção 1: Informações Gerais ----
export interface InfoGeral {
  data: string;           // DD/MM/AAAA
  horaInicio: string;     // HH:MM
  supervisor: string;
  encarregado: string;
  equipe: string;
  transporte: string;
  qtdLideres: number;
  qtdOperadoresTrator: number;
  qtdOperadoresEquipamento: number;
  qtdOperadoresRocadeira: number;
  qtdAjudantes: number;
  condicoesTrabalho: string;
}

// ---- Seção 2: Materiais ----
export interface Materiais {
  gasolinaManual: number;
  oleo2T: number;
  dieselTratores: number;
  gasolinaRobo: number;
  nylonUnidades: number;
  laminasUnidades: number;
}

// ---- Seção 3: Roçada Manual ----
export interface RocadaManual {
  rodovia: string;
  canteiro: string;
  kmInicial: string;   // formato "XXX,XXX"
  kmFinal: string;     // formato "XXX,XXX"
  largura: number;
  // calculados
  kmProduzido?: number;
  area?: number;
}

// ---- Seção 4: Trator ----
export interface Trator {
  ativo: boolean;
  prefixo: string;
  rodovia: string;
  canteiro: string;
  tipoRocadeira: string;
  kmInicial: string;   // formato "XXX,XXX"
  kmFinal: string;     // formato "XXX,XXX"
  largura: number;
  observacoes: string;
  // calculados
  kmProduzido?: number;
  area?: number;
}

// ---- Seção 5: Robô ----
export interface Robo {
  ativo: boolean;
  tipo: string;
  rodovia: string;
  canteiro: string;
  kmInicial: string;
  kmFinal: string;
  largura: number;
  observacoes: string;
  kmProduzido?: number;
  area?: number;
}

// ---- Formulário completo ----
export interface RelatorioCompleto {
  id?: string;           // gerado localmente
  syncStatus: "pendente" | "enviado" | "erro";
  criadoEm: string;     // ISO timestamp
  infoGeral: InfoGeral;
  materiais: Materiais;
  rocadaManual: RocadaManual;
  tratorA: Trator;
  tratorB: Trator;
  tratorC: Trator;
  robo: Robo;
  // totais calculados
  totalKm?: number;
  totalArea?: number;
}

// ---- Configurações do Admin ----
export interface AdminConfig {
  supervisores: string[];
  encarregados: string[];
  equipes: string[];
  transportes: string[];
  rodovias: string[];
  canteiros: string[];
  prefixosTrator: string[];
  tiposRocadeira: string[];
  tiposRobo: string[];
  condicoesTrabalho: string[];
}
