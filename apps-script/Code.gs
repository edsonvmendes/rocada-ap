// ============================================================
// GOOGLE APPS SCRIPT - Backend para Google Sheets
// Recebe relatórios do formulário e salva como linhas na planilha
//
// INSTRUÇÕES DE USO:
// 1. Abra o Google Sheets
// 2. Extensões → Apps Script
// 3. Cole este código completo
// 4. Clique em Implantar → Nova implantação
// 5. Tipo: App da Web
// 6. Executar como: Eu mesmo
// 7. Quem pode acessar: Qualquer pessoa
// 8. Copie a URL gerada e cole no Admin do sistema
// ============================================================

var SHEET_NAME = "Relatórios";

// Cabeçalhos das colunas na planilha
var CABECALHOS = [
  "ID", "Data", "Hora Início", "Supervisor", "Encarregado", "Equipe", "Transporte",
  "Qtd Líderes", "Qtd Op. Trator", "Qtd Op. Equip.", "Qtd Op. Roçad.", "Qtd Ajudantes",
  "Condições",
  // Materiais
  "Gasolina Manual (L)", "Óleo 2T (L)", "Diesel Tratores (L)", "Gasolina Robô (L)",
  "Nylon (un)", "Lâminas (un)",
  // Roçada Manual
  "Manual - Rodovia", "Manual - Canteiro",
  "Manual - KM Inicial", "Manual - KM Final", "Manual - Largura",
  "Manual - KM Produzido", "Manual - Área (m²)",
  // Trator A
  "Trator A - Ativo", "Trator A - Prefixo", "Trator A - Rodovia", "Trator A - Canteiro",
  "Trator A - Tipo", "Trator A - KM Ini", "Trator A - KM Fim",
  "Trator A - Largura", "Trator A - KM Prod.", "Trator A - Área (m²)", "Trator A - Obs",
  // Trator B
  "Trator B - Ativo", "Trator B - Prefixo", "Trator B - Rodovia", "Trator B - Canteiro",
  "Trator B - Tipo", "Trator B - KM Ini", "Trator B - KM Fim",
  "Trator B - Largura", "Trator B - KM Prod.", "Trator B - Área (m²)", "Trator B - Obs",
  // Trator C
  "Trator C - Ativo", "Trator C - Prefixo", "Trator C - Rodovia", "Trator C - Canteiro",
  "Trator C - Tipo", "Trator C - KM Ini", "Trator C - KM Fim",
  "Trator C - Largura", "Trator C - KM Prod.", "Trator C - Área (m²)", "Trator C - Obs",
  // Robô
  "Robô - Ativo", "Robô - Tipo", "Robô - Rodovia", "Robô - Canteiro",
  "Robô - KM Ini", "Robô - KM Fim", "Robô - Largura",
  "Robô - KM Prod.", "Robô - Área (m²)", "Robô - Obs",
  // Totais
  "TOTAL KM", "TOTAL ÁREA (m²)", "Enviado em"
];

// Cria ou busca a aba de relatórios
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Adiciona cabeçalhos na primeira linha
    sheet.getRange(1, 1, 1, CABECALHOS.length).setValues([CABECALHOS]);
    // Formata cabeçalhos
    var headerRange = sheet.getRange(1, 1, 1, CABECALHOS.length);
    headerRange.setBackground("#1e3a5f");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    sheet.setFrozenRows(1);
    // Ajusta largura das colunas importantes
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 90);
    sheet.setColumnWidth(4, 150);
    sheet.setColumnWidth(5, 200);
  }

  return sheet;
}

// Recebe POST do formulário
function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var sheet = getSheet();

    // Monta a linha com os dados na ordem dos cabeçalhos
    var linha = [
      dados.id || "",
      dados.data || "",
      dados.hora_inicio || "",
      dados.supervisor || "",
      dados.encarregado || "",
      dados.equipe || "",
      dados.transporte || "",
      dados.qtd_lideres || 0,
      dados.qtd_op_trator || 0,
      dados.qtd_op_equipamento || 0,
      dados.qtd_op_rocadeira || 0,
      dados.qtd_ajudantes || 0,
      dados.condicoes || "",
      // Materiais
      dados.gasolina_manual || 0,
      dados.oleo_2t || 0,
      dados.diesel_tratores || 0,
      dados.gasolina_robo || 0,
      dados.nylon_unidades || 0,
      dados.laminas_unidades || 0,
      // Roçada Manual
      dados.manual_rodovia || "",
      dados.manual_canteiro || "",
      dados.manual_km_inicial || 0,
      dados.manual_km_final || 0,
      dados.manual_largura || 0,
      dados.manual_km_produzido || 0,
      dados.manual_area || 0,
      // Trator A
      dados.trator_a_ativo ? "SIM" : "NÃO",
      dados.trator_a_prefixo || "",
      dados.trator_a_rodovia || "",
      dados.trator_a_canteiro || "",
      dados.trator_a_tipo || "",
      dados.trator_a_km_inicial || 0,
      dados.trator_a_km_final || 0,
      dados.trator_a_largura || 0,
      dados.trator_a_km_produzido || 0,
      dados.trator_a_area || 0,
      dados.trator_a_obs || "",
      // Trator B
      dados.trator_b_ativo ? "SIM" : "NÃO",
      dados.trator_b_prefixo || "",
      dados.trator_b_rodovia || "",
      dados.trator_b_canteiro || "",
      dados.trator_b_tipo || "",
      dados.trator_b_km_inicial || 0,
      dados.trator_b_km_final || 0,
      dados.trator_b_largura || 0,
      dados.trator_b_km_produzido || 0,
      dados.trator_b_area || 0,
      dados.trator_b_obs || "",
      // Trator C
      dados.trator_c_ativo ? "SIM" : "NÃO",
      dados.trator_c_prefixo || "",
      dados.trator_c_rodovia || "",
      dados.trator_c_canteiro || "",
      dados.trator_c_tipo || "",
      dados.trator_c_km_inicial || 0,
      dados.trator_c_km_final || 0,
      dados.trator_c_largura || 0,
      dados.trator_c_km_produzido || 0,
      dados.trator_c_area || 0,
      dados.trator_c_obs || "",
      // Robô
      dados.robo_ativo ? "SIM" : "NÃO",
      dados.robo_tipo || "",
      dados.robo_rodovia || "",
      dados.robo_canteiro || "",
      dados.robo_km_inicial || 0,
      dados.robo_km_final || 0,
      dados.robo_largura || 0,
      dados.robo_km_produzido || 0,
      dados.robo_area || 0,
      dados.robo_obs || "",
      // Totais
      dados.total_km || 0,
      dados.total_area || 0,
      dados.enviado_em || new Date().toISOString()
    ];

    // Adiciona a linha no final da planilha
    sheet.appendRow(linha);

    // Formata a nova linha
    var ultimaLinha = sheet.getLastRow();
    var range = sheet.getRange(ultimaLinha, 1, 1, CABECALHOS.length);

    // Alterna cor das linhas (zebra)
    if (ultimaLinha % 2 === 0) {
      range.setBackground("#f8fafc");
    } else {
      range.setBackground("#ffffff");
    }

    // Destaca totais nas últimas colunas
    var totalRange = sheet.getRange(ultimaLinha, CABECALHOS.length - 2, 1, 2);
    totalRange.setBackground("#dcfce7");
    totalRange.setFontWeight("bold");

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, linha: ultimaLinha }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, erro: erro.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET para testar se o script está funcionando
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      mensagem: "Sistema de Relatório de Roçada - API ativa",
      versao: "1.0"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
