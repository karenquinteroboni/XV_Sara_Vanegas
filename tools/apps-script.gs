// Registro de confirmaciones de la invitación XV.
// Se pega en Extensiones → Apps Script de una hoja de Google (ver README).
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName("Confirmaciones") || ss.insertSheet("Confirmaciones");
    if (sh.getLastRow() === 0) {
      sh.appendRow(["Fecha", "Nombre", "Cupos", "Asistirán", "Menú"]);
      sh.setFrozenRows(1);
    } else if (sh.getRange(1, 5).getValue() === "") {
      sh.getRange(1, 5).setValue("Menú");
    }
    var fecha = Utilities.formatDate(new Date(), "America/Bogota", "yyyy-MM-dd HH:mm");
    sh.appendRow([fecha, String(d.nombre || ""), Number(d.cupos) || 0, Number(d.asistentes) || 0, String(d.menu || "")]);
    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
}

// Para probar la URL desde el navegador: debe mostrar "activo".
function doGet() {
  return ContentService.createTextOutput("activo");
}
