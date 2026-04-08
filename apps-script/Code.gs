// ============================================================
// GOOGLE APPS SCRIPT - Vincula ao Google Sheets existente
// Planilha: RELATÓRIO DIÁRIO DE SERVIÇO (SLN RDT)
// ID: 1bw43J7TvaUGVWC68xhLK6ey6N-npvtUrCkSuwAe-Wbw
//
// INSTRUÇÕES:
// 1. Abra a planilha em sheets.google.com
// 2. Extensões → Apps Script
// 3. Apague o código existente e cole este arquivo completo
// 4. Clique em Implantar → Nova implantação
// 5. Tipo: App da Web
// 6. Executar como: Eu mesmo (edsonvmendes@gmail.com)
// 7. Quem pode acessar: Qualquer pessoa
// 8. Clique em Implantar e copie a URL gerada
// 9. Cole a URL no Admin do sistema → aba Integração
// ============================================================

// ID da planilha existente — NÃO alterar
var SPREADSHEET_ID = "1bw43J7TvaUGVWC68xhLK6ey6N-npvtUrCkSuwAe-Wbw";

// Nome da aba onde os dados serão gravados
// (a mesma aba onde o Google Forms já grava as respostas)
var SHEET_NAME = "Respostas ao formulário 1";

// Ordem exata das 55 colunas da planilha original
// Gerada pelo Google Forms — respeitamos a mesma ordem
var COLUNAS = [
  "carimbo",               // 1  Carimbo de data/hora
  "data",                  // 2  DATA
  "hora_inicio",           // 3  HORÁRIO DE INÍCIO
  "supervisor",            // 4  SUPERVISOR
  "encarregado",           // 5  NOME DO ENCARREGADO
  "equipe",                // 6  EQUIPE
  "transporte",            // 7  TRANSPORTE (VEÍCULO)
  "qtd_lideres",           // 8  TOTAL DE LÍDERES / DIA
  "qtd_op_trator",         // 9  TOTAL DE TRATORISTAS / DIA
  "qtd_op_equipamento",    // 10 TOTAL DE OPERADORES DE EQUIPAMENTO / DIA
  "qtd_op_rocadeira",      // 11 TOTAL DE OPERADORES DE ROÇADEIRA / DIA
  "qtd_ajudantes",         // 12 TOTAL DE AJUDANTES / DIA
  "condicoes",             // 13 CONDIÇÕES DE TRABALHO
  "gasolina_manual",       // 14 GASOLINA (Litros) - Roçada Manual
  "oleo_2t",               // 15 ÓLEO 2T (Litros) - Roçada Manual
  "nylon_unidades",        // 16 NYLON (un) - Roçada Manual
  "laminas_unidades",      // 17 LÂMINA (un) - Roçada Manual
  "diesel_tratores",       // 18 DIESEL (Litros) - Tratores
  "gasolina_robo",         // 19 GASOLINA (Litros) (Robô)
  "manual_rodovia",        // 20 RODOVIA (Roçada Manual)
  "manual_canteiro",       // 21 CANTEIRO (Roçada Manual)
  "manual_km_inicial",     // 22 KM INICIAL (Roçada Manual)
  "manual_km_final",       // 23 KM FINAL (Roçada Manual)
  "manual_largura",        // 24 LARGURA (média) (Roçada Manual)
  "trator_a_prefixo",      // 25 TRATOR A (Prefixo)
  "trator_a_rodovia",      // 26 RODOVIA (Trator A)
  "trator_a_canteiro",     // 27 CANTEIRO (Trator A)
  "trator_a_tipo",         // 28 TIPO DE ROÇADEIRA (Trator A)
  "trator_a_km_inicial",   // 29 KM INICIAL (Trator A)
  "trator_a_km_final",     // 30 KM FINAL (Trator A)
  "trator_a_largura",      // 31 LARGURA (média) (Trator A)
  "trator_b_prefixo",      // 32 TRATOR B (Prefixo)
  "trator_b_rodovia",      // 33 RODOVIA (Trator B)
  "trator_b_canteiro",     // 34 CANTEIRO (Trator B)
  "trator_b_tipo",         // 35 TIPO DE ROÇADEIRA (Trator B)
  "trator_b_km_inicial",   // 36 KM INICIAL (Trator B)
  "trator_b_km_final",     // 37 KM FINAL (Trator B)
  "trator_b_largura",      // 38 LARGURA (média) (Trator B)
  "trator_c_prefixo",      // 39 TRATOR C (Prefixo)
  "trator_c_rodovia",      // 40 RODOVIA (Trator C)
  "trator_c_canteiro",     // 41 CANTEIRO (Trator C)
  "trator_c_tipo",         // 42 TIPO DE ROÇADEIRA (Trator C)
  "trator_c_km_inicial",   // 43 KM INICIAL (Trator C)
  "trator_c_km_final",     // 44 KM FINAL (Trator C)
  "trator_c_largura",      // 45 LARGURA (média) (Trator C)
  "robo_tipo",             // 46 ROÇADA ROBÔ - RECURSO
  "robo_rodovia",          // 47 RODOVIA (Robô)
  "robo_canteiro",         // 48 CANTEIRO (Robô)
  "robo_km_inicial",       // 49 KM INICIAL (Robô)
  "robo_km_final",         // 50 KM FINAL (Robô)
  "robo_largura",          // 51 LARGURA (média) (Robô)
  "hora_termino",          // 52 HORÁRIO DE TÉRMINO
  "limpeza_drenagem",      // 53 LIMPEZA DE DRENAGEM SUPERFICIAL
  "remocao_massa_seca",    // 54 REMOÇÃO DE MASSA SECA
  "consideracoes_gerais",  // 55 CONSIDERAÇÕES GERAIS
];

// Abre a aba correta da planilha existente
function getSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Tenta encontrar a aba pelo nome exato
  var sheet = ss.getSheetByName(SHEET_NAME);

  // Se não encontrar pelo nome, pega a primeira aba
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }

  return sheet;
}

// Recebe POST do formulário web e grava na planilha
function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var sheet = getSheet();

    // Monta a linha na ordem exata das 55 colunas
    var linha = COLUNAS.map(function(col) {
      if (col === "carimbo") {
        // Carimbo de data/hora gerado automaticamente
        return new Date().toLocaleString("pt-BR");
      }
      var val = dados[col];
      // Converte undefined/null para string vazia
      return (val === undefined || val === null) ? "" : val;
    });

    sheet.appendRow(linha);

    // Formata a nova linha
    var ultimaLinha = sheet.getLastRow();
    var range = sheet.getRange(ultimaLinha, 1, 1, COLUNAS.length);

    // Zebra: alterna cor de fundo
    if (ultimaLinha % 2 === 0) {
      range.setBackground("#f0fdf4");
    } else {
      range.setBackground("#ffffff");
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, linha: ultimaLinha }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, erro: erro.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET: testa se o script está ativo
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      mensagem: "API ativa — Relatório Diário de Roçada",
      planilha: SPREADSHEET_ID,
      aba: SHEET_NAME
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
