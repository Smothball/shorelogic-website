// Shore Logic AI Advisors — Google Apps Script
// Handles form submissions: contact inquiries, resource waitlist, blog subscribers
//
// SETUP INSTRUCTIONS:
// 1. Go to script.google.com and open (or create) your project
// 2. Paste this entire file into the editor, replacing the previous version
// 3. Click Deploy > Manage deployments > Edit > New version > Deploy
// 4. The deployment URL does not change between versions
//
// SHEET STRUCTURE (auto-created if missing):
//   Sheet 1 (tab 0) — Contact inquiries (existing)
//   "Resource Waitlist" tab — Resource signup leads
//   "Blog Subscribers"  tab — Blog notification subscribers

const SHEET_ID    = '1jqYxDmmWZXjxRbj425zsjciabhKM_Yvj8GNLzASJXhI';
const NOTIFY_EMAIL = 'smothes@shorelogic.ai';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const type = data.type || 'contact';

    if (type === 'resource_waitlist') return handleResourceWaitlist(data);
    if (type === 'blog_subscriber')   return handleBlogSubscriber(data);
    return handleContact(data);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Contact Form ─────────────────────────────────────────────────────────────

function handleContact(data) {
  const name    = data.name    || '';
  const email   = data.email   || '';
  const company = data.company || '';
  const phone   = data.phone   || '';
  const message = data.message || '';

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  sheet.appendRow([new Date().toISOString(), name, email, company, message, phone]);

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

  return jsonOk();
}

// ── Resource Waitlist ─────────────────────────────────────────────────────────

function handleResourceWaitlist(data) {
  const name  = data.name  || '';
  const email = data.email || '';

  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = getOrCreateSheet(ss, 'Resource Waitlist', ['Timestamp', 'Name', 'Email']);
  sheet.appendRow([new Date().toISOString(), name, email]);

  MailApp.sendEmail(
    NOTIFY_EMAIL,
    `Resource Waitlist Signup — ${name || email}`,
    `${name} (${email}) joined the Shore Logic resource waitlist.`
  );

  const firstName = name ? name.split(' ')[0] : 'there';

  MailApp.sendEmail({
    to: email,
    subject: "You're on the Shore Logic resource waitlist",
    htmlBody: buildResourceWaitlistEmail(firstName)
  });

  return jsonOk();
}

function buildResourceWaitlistEmail(firstName) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#F3EFE9; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
  .wrap { max-width:560px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; }
  .header { background:#12263F; padding:28px 32px; }
  .header-name { color:#ffffff; font-family:Georgia,serif; font-size:20px; font-weight:bold; letter-spacing:0.02em; }
  .body { padding:36px 32px; }
  h2 { font-family:Georgia,serif; color:#12263F; margin:0 0 16px; font-size:22px; line-height:1.3; }
  p { color:#4a5568; font-size:15px; line-height:1.65; margin:0 0 16px; }
  .resource-list { background:#F3EFE9; border-radius:8px; padding:20px 24px; margin:24px 0; }
  .resource-list p { margin:0 0 4px; color:#12263F; font-size:13px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; }
  .resource-list ul { list-style:none; margin:12px 0 0; padding:0; }
  .resource-list li { color:#2d3748; font-size:14px; padding:8px 0; border-bottom:1px solid #D0D5DD; line-height:1.5; }
  .resource-list li:last-child { border-bottom:none; }
  .resource-list li::before { content:"→ "; color:#8A95A5; }
  .sig { border-top:1px solid #D0D5DD; padding-top:20px; margin-top:24px; }
  .sig p { font-size:14px; color:#4a5568; margin:0; }
  .fine-print { font-size:12px; color:#8A95A5; margin-top:8px; }
  a { color:#12263F; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <span class="header-name">Shore Logic Advisors</span>
  </div>
  <div class="body">
    <h2>You're on the list, ${firstName}.</h2>
    <p>Thanks for your interest in our free AI starter resources. We're putting the finishing touches on them now and you'll be among the first to receive:</p>
    <div class="resource-list">
      <p>Coming Your Way</p>
      <ul>
        <li><strong>AI Readiness Checklist</strong> — Find your best AI opportunities in 15 minutes</li>
        <li><strong>10 Starter Prompts for Small Business</strong> — Copy-paste and go</li>
        <li><strong>The AI Buyer's Guide</strong> — Spend wisely, skip the hype</li>
      </ul>
    </div>
    <p>We'll send everything directly to this email address the moment they're ready. In the meantime, feel free to reach out with any questions.</p>
    <div class="sig">
      <p>— Stephen Mothes<br>Founder, Shore Logic Advisors<br><a href="mailto:smothes@shorelogic.ai">smothes@shorelogic.ai</a></p>
      <p class="fine-print">You're receiving this because you signed up at <a href="https://shorelogic.ai/resources.html">shorelogic.ai/resources</a>. If this was a mistake, simply ignore this email.</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ── Blog Subscribers ──────────────────────────────────────────────────────────

function handleBlogSubscriber(data) {
  const email = data.email || '';

  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = getOrCreateSheet(ss, 'Blog Subscribers', ['Timestamp', 'Email']);
  sheet.appendRow([new Date().toISOString(), email]);

  MailApp.sendEmail(
    NOTIFY_EMAIL,
    `Blog Subscriber — ${email}`,
    `${email} subscribed to The ShoreLogic Brief.`
  );

  MailApp.sendEmail({
    to: email,
    subject: "You're subscribed to The ShoreLogic Brief",
    htmlBody: buildBlogSubscriberEmail()
  });

  return jsonOk();
}

function buildBlogSubscriberEmail() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#F3EFE9; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; }
  .wrap { max-width:560px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; }
  .header { background:#12263F; padding:28px 32px; }
  .header-name { color:#ffffff; font-family:Georgia,serif; font-size:20px; font-weight:bold; letter-spacing:0.02em; }
  .body { padding:36px 32px; }
  h2 { font-family:Georgia,serif; color:#12263F; margin:0 0 16px; font-size:22px; line-height:1.3; }
  p { color:#4a5568; font-size:15px; line-height:1.65; margin:0 0 16px; }
  .preview-list { background:#F3EFE9; border-radius:8px; padding:20px 24px; margin:24px 0; }
  .preview-list p { margin:0 0 4px; color:#12263F; font-size:13px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; }
  .preview-list ul { list-style:none; margin:12px 0 0; padding:0; }
  .preview-list li { color:#2d3748; font-size:14px; padding:8px 0; border-bottom:1px solid #D0D5DD; line-height:1.5; }
  .preview-list li:last-child { border-bottom:none; }
  .preview-list li::before { content:"→ "; color:#8A95A5; }
  .sig { border-top:1px solid #D0D5DD; padding-top:20px; margin-top:24px; }
  .sig p { font-size:14px; color:#4a5568; margin:0; }
  .fine-print { font-size:12px; color:#8A95A5; margin-top:8px; }
  a { color:#12263F; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <span class="header-name">Shore Logic Advisors</span>
  </div>
  <div class="body">
    <h2>Welcome to The ShoreLogic Brief.</h2>
    <p>You're subscribed. When we publish, you'll get each article sent directly to your inbox — no newsletter fluff, just the post.</p>
    <p>Here's a preview of what's coming first:</p>
    <div class="preview-list">
      <p>First Articles</p>
      <ul>
        <li>The First 5 Things Every Small Business Should Automate With AI</li>
        <li>How a Landscaper Could Use AI to Win More Bids Without Hiring Anyone</li>
        <li>Don't Buy the Software. Solve the Problem.</li>
      </ul>
    </div>
    <p>In the meantime, feel free to explore our <a href="https://shorelogic.ai/resources.html">free resources</a> or <a href="https://shorelogic.ai/about.html">learn more about us</a>.</p>
    <div class="sig">
      <p>— Stephen Mothes<br>Founder, Shore Logic Advisors<br><a href="mailto:smothes@shorelogic.ai">smothes@shorelogic.ai</a></p>
      <p class="fine-print">You subscribed at <a href="https://shorelogic.ai/blog/">shorelogic.ai/blog</a>. If this was a mistake, simply ignore this email.</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function jsonOk() {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
