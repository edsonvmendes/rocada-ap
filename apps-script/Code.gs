// ============================================================
// GOOGLE APPS SCRIPT - Planilha: RELATORIO DIARIO DE SERVICO
// ID: 1bw43J7TvaUGVWC68xhLK6ey6N-npvtUrCkSuwAe-Wbw
// ============================================================

var SPREADSHEET_ID = "1bw43J7TvaUGVWC68xhLK6ey6N-npvtUrCkSuwAe-Wbw";
var SHEET_NAME = "Respostas ao formulario 1";

var COLUNAS = [
  "carimbo",
  "data",
  "hora_inicio",
  "supervisor",
  "encarregado",
  "equipe",
  "transporte",
  "qtd_lideres",
  "qtd_op_trator",
  "qtd_op_equipamento",
  "qtd_op_rocadeira",
  "qtd_ajudantes",
  "condicoes",
  "gasolina_manual",
  "oleo_2t",
  "nylon_unidades",
  "laminas_unidades",
  "diesel_tratores",
  "gasolina_robo",
  "manual_rodovia",
  "manual_canteiro",
  "manual_km_inicial",
  "manual_km_final",
  "manual_largura",
  "trator_a_prefixo",
  "trator_a_rodovia",
  "trator_a_canteiro",
  "trator_a_tipo",
  "trator_a_km_inicial",
  "trator_a_km_final",
  "trator_a_largura",
  "trator_b_prefixo",
  "trator_b_rodovia",
  "trator_b_canteiro",
  "trator_b_tipo",
  "trator_b_km_inicial",
  "trator_b_km_final",
  "trator_b_largura",
  "trator_c_prefixo",
  "trator_c_rodovia",
  "trator_c_canteiro",
  "trator_c_tipo",
  "trator_c_km_inicial",
  "trator_c_km_final",
  "trator_c_largura",
  "robo_tipo",
  "robo_rodovia",
  "robo_canteiro",
  "robo_km_inicial",
  "robo_km_final",
  "robo_largura",
  "hora_termino",
  "limpeza_drenagem",
  "remocao_massa_seca",
  "consideracoes_gerais",
];

function getSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];
  return sheet;
}

function getApiTokenConfigurado() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty("API_TOKEN");
  return token ? String(token).trim() : "";
}

function tokenRecebido(e) {
  if (!e) return "";

  if (e.parameter && e.parameter.token) {
    return String(e.parameter.token).trim();
  }

  if (e.postData && e.postData.contents) {
    try {
      var dados = JSON.parse(e.postData.contents);
      if (dados && dados.token) {
        return String(dados.token).trim();
      }
    } catch (erro) {}
  }

  return "";
}

function autorizado(e) {
  var tokenConfigurado = getApiTokenConfigurado();
  if (!tokenConfigurado) return true;
  return tokenRecebido(e) === tokenConfigurado;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function unauthorizedResponse() {
  return jsonResponse({ ok: false, erro: "Nao autorizado" });
}

function doPost(e) {
  if (!autorizado(e)) {
    return unauthorizedResponse();
  }

  try {
    var dados = JSON.parse(e.postData.contents || "{}");
    delete dados.token;

    var sheet = getSheet();
    var linha = COLUNAS.map(function(col) {
      if (col === "carimbo") return new Date().toLocaleString("pt-BR");
      var val = dados[col];
      return val === undefined || val === null ? "" : val;
    });

    sheet.appendRow(linha);

    var ultimaLinha = sheet.getLastRow();
    var range = sheet.getRange(ultimaLinha, 1, 1, COLUNAS.length);
    range.setBackground(ultimaLinha % 2 === 0 ? "#f0fdf4" : "#ffffff");

    return jsonResponse({ ok: true, linha: ultimaLinha });
  } catch (erro) {
    return jsonResponse({ ok: false, erro: erro.toString() });
  }
}

function doGet(e) {
  var action = e && e.parameter && e.parameter.action ? e.parameter.action : "status";

  if (action === "getData") {
    if (!autorizado(e)) {
      return unauthorizedResponse();
    }

    try {
      var sheet = getSheet();
      var lastRow = sheet.getLastRow();

      if (lastRow <= 1) {
        return jsonResponse({ ok: true, dados: [] });
      }

      var numRows = lastRow - 1;
      var range = sheet.getRange(2, 1, numRows, COLUNAS.length);
      var valores = range.getValues();

      var dados = valores.map(function(linha) {
        var obj = {};
        COLUNAS.forEach(function(col, idx) {
          obj[col] = linha[idx] !== undefined ? String(linha[idx]) : "";
        });
        return obj;
      });

      dados = dados.filter(function(row) {
        return row.data !== "" || row.encarregado !== "";
      });

      return jsonResponse({ ok: true, total: dados.length, dados: dados });
    } catch (erro) {
      return jsonResponse({ ok: false, erro: erro.toString() });
    }
  }

  return jsonResponse({
    ok: true,
    mensagem: "API ativa - Relatorio Diario de Rocada",
    planilha: SPREADSHEET_ID,
    tokenConfigurado: Boolean(getApiTokenConfigurado()),
    endpoints: {
      status: "GET ?action=status",
      dados: "GET ?action=getData&token=...",
      gravar: "POST ?token=... (body JSON)",
    },
  });
}
