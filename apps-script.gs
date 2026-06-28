// Shore Logic AI Advisors — Google Apps Script
// Handles form submissions: logs to Google Sheet + sends email notification
//
// SETUP INSTRUCTIONS:
// 1. Go to script.google.com and create a new project
// 2. Paste this entire file into the editor
// 3. Click Deploy > New deployment > Web app
// 4. Set "Execute as" = Me, "Who has access" = Anyone
// 5. Copy the deployment URL and paste it into index.html (APPS_SCRIPT_URL)

const SHEET_ID = '1jqYxDmmWZXjxRbj425zsjciabhKM_Yvj8GNLzASJXhI';
const NOTIFY_EMAIL = 'smothes@shorelogic.ai';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const name    = data.name    || '';
    const email   = data.email   || '';
    const company = data.company || '';
    const phone   = data.phone   || '';
    const message = data.message || '';

    // Append row to Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    sheet.appendRow([
      new Date().toISOString(),
      name,
      email,
      company,
      message,
      phone
    ]);

    // Send email notification
    const subject = `New Shore Logic Inquiry — ${name} (${company})`;
    const body = [
      'New inquiry submitted via shorelogic.ai\n',
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Company: ${company}`,
      `Phone:   ${phone || 'Not provided'}`,
      `\nMessage:\n${message}`
    ].join('\n');

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
