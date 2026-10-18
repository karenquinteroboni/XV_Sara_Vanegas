// Registro de confirmaciones de la invitación XV.
// Proyecto en script.google.com → Implementar → Aplicación web
// (ejecutar como "yo", acceso "cualquier persona"). Ver README.
var SHEET_ID = "PEGA_AQUI_EL_ID_DE_LA_HOJA";
var HOJA = "Confirmaciones";

function hoja_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  return ss.getSheetByName(HOJA) || ss.insertSheet(HOJA);
}
function texto_(t) { return ContentService.createTextOutput(t); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Guarda una confirmación. Si el invitado ya tenía una, la reemplaza (borra la anterior).
function doPost(e) {
  if (!e || !e.postData) return texto_("sin datos");
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var nombre = String(d.nombre || "").trim();
    var sh = hoja_();
    if (sh.getLastRow() === 0) {
      sh.appendRow(["Fecha", "Nombre", "Cupos", "Asistirán", "Menú"]);
      sh.setFrozenRows(1);
    } else if (sh.getRange(1, 5).getValue() === "") {
      sh.getRange(1, 5).setValue("Menú");
    }
    var vals = sh.getDataRange().getValues();
    for (var i = vals.length - 1; i >= 1; i--) {            // de abajo hacia arriba para no desplazar filas
      if (String(vals[i][1]).trim() === nombre) sh.deleteRow(i + 1);
    }
    var fecha = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm");
    sh.appendRow([fecha, nombre, Number(d.cupos) || 0, Number(d.asistentes) || 0, String(d.menu || "")]);
    return texto_("ok");
  } finally {
    lock.releaseLock();
  }
}

// Sin parámetros: responde "activo". Con ?nombre=...: devuelve la confirmación de ese invitado.
function doGet(e) {
  var nombre = e && e.parameter && e.parameter.nombre ? String(e.parameter.nombre).trim() : "";
  if (!nombre) return texto_("activo");
  var sh = hoja_(), vals = sh.getDataRange().getValues();
  for (var i = vals.length - 1; i >= 1; i--) {
    if (String(vals[i][1]).trim() === nombre) {
      return json_({ found: true, cupos: Number(vals[i][2]) || 0, asistentes: Number(vals[i][3]) || 0, menu: String(vals[i][4] || "") });
    }
  }
  return json_({ found: false });
}

// SOLO PARA PROBAR: elígela en el menú desplegable y pulsa ▶ Ejecutar.
function prueba() {
  doPost({ postData: { contents: JSON.stringify({ nombre: "Prueba", cupos: 2, asistentes: 2, menu: "1. Prueba: Filet Mignon | 2. Acompañante 2: Pollo al Cilantro" }) } });
  doPost({ postData: { contents: JSON.stringify({ nombre: "Prueba", cupos: 2, asistentes: 1, menu: "1. Prueba: Pollo al Cilantro" }) } });
  Logger.log(doGet({ parameter: { nombre: "Prueba" } }).getContent()); // debe mostrar 1 asistente y quedar UNA sola fila
}
