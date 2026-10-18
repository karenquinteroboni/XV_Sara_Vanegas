// Pegar en script.google.com (proyecto nuevo) → Implementar → Aplicación web
// Ejecutar como: yo · Acceso: cualquier persona. Copiar la URL en config.js (rsvpEndpoint).
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Confirmaciones") ||
           SpreadsheetApp.getActiveSpreadsheet().insertSheet("Confirmaciones");
  if (sh.getLastRow() === 0) sh.appendRow(["Fecha", "Nombre", "Cupos", "Asistirán"]);
  sh.appendRow([d.fecha, d.nombre, d.cupos, d.asistentes]);
  return ContentService.createTextOutput("ok");
}
