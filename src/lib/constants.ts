// ============================================================
// CONSTANTES PADRÃO - LISTAS DE DROPDOWNS
// ============================================================

export const SUPERVISORES_PADRAO = [
  "Julio Mendes",
  "Marcos Vinícius Alves",
];

export const ENCARREGADOS_PADRAO = [
  "Vera Lucia de Almeida Aguiar",
  "Alex Adriano da Silva",
  "Patricio Paiva Santana",
  "José Paulo Sampaio da Silva",
  "Silvestre Vieira Filho",
  "Antônio Roberto Alves Cabral",
  "Valdecir Custodio da Silva",
  "Carlos Cezar Cavinato",
  "Bruno Henrique Mudafaris",
  "Laurindo Aparecido da Silva Lopes",
  "Aparecido Andrade Alves",
];

export const EQUIPES_PADRAO = [
  "Agudos",
  "Capivari",
  "Conchas",
  "Monte Mor",
  "Piracicaba",
  "São Manuel",
];

export const TRANSPORTES_PADRAO = ["Ônibus", "Caminhão", "Outro"];

export const CONDICOES_TRABALHO_PADRAO = [
  "Sem interferência",
  "Chuva",
  "Tráfego intenso",
  "Falta de material",
  "Falha de equipamento",
  "Ausência de pessoal",
  "Outro",
];

export const RODOVIAS_PADRAO = [
  // Rodovias principais
  "SP-101",
  "SP-113",
  "SP-209",
  "SP-300",
  "SP-308",
  "SPI-162/308",
  "SPI-181/300",
  // SPA - SP-101
  "SPA-022/101",
  "SPA-026/101",
  "SPA-032/101",
  "SPA-043/101",
  "SPA-051/101",
  // SPA - SP-209
  "SPA-007/209",
  // SPA - SP-300
  "SPA-159/300",
  "SPA-172/300",
  "SPA-176/300",
  "SPA-193/300",
  "SPA-196/300",
  "SPA-231/300",
  "SPA-241/300",
  "SPA-251/300",
  "SPA-270/300",
  "SPA-283/300",
  // SPA - SP-308
  "SPA-139/308",
  "SPA-155/308",
  // SP-300 segmentos
  "SP 300 LRP 321",
  "SP 300 CHS 387/326",
  "SP 300 AHB 146",
  "SP 300 BTC 353/055",
  "SP 300 PRD 010",
  "SP 300 SMN 373/040",
  "SP 300 LEP 119",
  "SP 300 LEP 374",
  "SP 300 LEP 363",
  "SP 300 LEP 030",
  "SP 300 LEP 347",
  "SP 300 LEP 148",
  "SP 300 LEP 321",
  "SP 300 LEP 357",
  "SP 300 MTB 148",
  "SP 300 MTB 195",
  "SP 300 MTB 070",
  "SP 300 BRE 232",
  "SP 300 BRE 005",
  // SP-101 segmentos
  "SP 101 HRT 050",
  "SP 101 MOR 040",
  "SP 101 MOR 137",
  "SP 101 MOR 293",
  "SP 101 ESF 020",
  "SP 101 IDT 085",
  "SP 101 RFR 154",
  "SP 101 CPR 152",
  "SP 101 PFZ 080",
  // SP-113 segmentos
  "SP 113 TIT 366",
  // SP-308 segmentos
  "SP 308 PIR 030",
  "SP 308 RPD 020",
  "SP 308 RPD 015",
  "SP 308 CPR 010",
  // SP-209 segmentos
  "SP 209 BTC 260",
  "SP 209 BTC 040",
  "SP 209 ITN 313",
  // Não aplicável
  "N/A",
];

export const CANTEIROS_PADRAO = [
  "Lateral Norte",
  "Lateral Sul",
  "Lateral Leste",
  "Lateral Oeste",
  "Central",
  "Lateral Norte/Sul",
  "Lateral Norte/Sul/Canteiro Central",
  "Dispositivo",
  "Outro",
  "N/A",
];

export const PREFIXOS_TRATOR_PADRAO = [
  "TP 01", "TP 02", "TP 03", "TP 04", "TP 05",
  "TP 06", "TP 07", "TP 08", "TP 09", "TP 10",
  "TP 11", "TP 12", "TP 13", "TP 14", "TP 15",
  "TP 16", "TP 17", "TP 18", "TP 19", "TP 20",
  "TB-01", "TB-02", "TB-03", "TB-04", "TB-05",
  "TB-06", "TB-07",
  "N/A",
];

export const TIPOS_ROCADEIRA_PADRAO = [
  "Roçadeira de Arrasto",
  "Roçadeira Semi-articulada",
  "Roçadeira Tripla",
  "Roçadeira Simples",
  "Roçadeira Braço Articulado",
  "N/A",
];

export const TIPOS_ROBO_PADRAO = ["Panther", "Spider", "N/A"];

// Quantidade: 0 a 10
export const QTD_OPTIONS = Array.from({ length: 11 }, (_, i) => i);

// Valores padrão de um relatório em branco
export const RELATORIO_VAZIO = {
  infoGeral: {
    data: "",
    horaInicio: "",
    supervisor: "",
    encarregado: "",
    equipe: "",
    transporte: "",
    qtdLideres: 0,
    qtdOperadoresTrator: 0,
    qtdOperadoresEquipamento: 0,
    qtdOperadoresRocadeira: 0,
    qtdAjudantes: 0,
    condicoesTrabalho: "",
  },
  materiais: {
    gasolinaManual: 0,
    oleo2T: 0,
    dieselTratores: 0,
    gasolinaRobo: 0,
    nylonUnidades: 0,
    laminasUnidades: 0,
  },
  rocadaManual: {
    rodovia: "",
    canteiro: "",
    kmInicial: "",
    kmFinal: "",
    largura: 0,
  },
  tratorA: {
    ativo: false,
    prefixo: "",
    rodovia: "",
    canteiro: "",
    tipoRocadeira: "",
    kmInicial: "",
    kmFinal: "",
    largura: 0,
    observacoes: "",
  },
  tratorB: {
    ativo: false,
    prefixo: "",
    rodovia: "",
    canteiro: "",
    tipoRocadeira: "",
    kmInicial: "",
    kmFinal: "",
    largura: 0,
    observacoes: "",
  },
  tratorC: {
    ativo: false,
    prefixo: "",
    rodovia: "",
    canteiro: "",
    tipoRocadeira: "",
    kmInicial: "",
    kmFinal: "",
    largura: 0,
    observacoes: "",
  },
  robo: {
    ativo: false,
    tipo: "",
    rodovia: "",
    canteiro: "",
    kmInicial: "",
    kmFinal: "",
    largura: 0,
    observacoes: "",
  },
  fechamento: {
    horaTermino: "",
    limpezaDrenagem: "" as const,
    remocaoMassaSeca: "" as const,
    consideracoesGerais: "",
  },
};
