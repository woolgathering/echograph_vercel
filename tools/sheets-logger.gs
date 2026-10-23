// Google Apps Script bound to the sales spreadsheet. Deploy as a web app
// (Execute as: Me, Who has access: Anyone) and put its URL in SHEET_WEBHOOK_URL.
// Set the same secret as the Script Property TOKEN and in SHEET_WEBHOOK_TOKEN.
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  if (d.token !== PropertiesService.getScriptProperties().getProperty('TOKEN')) {
    return ContentService.createTextOutput('forbidden');
  }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sales') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Sales');
  if (sheet.getLastRow() === 0) sheet.appendRow(['Date', 'Email', 'Amount (USD)', 'Code', 'Stripe session']);
  sheet.appendRow([d.date, d.email, d.amount, d.code, d.session]);
  return ContentService.createTextOutput('ok');
}
