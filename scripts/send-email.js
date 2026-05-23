#!/usr/bin/env node
// Sends an email via Gmail SMTP using an app password.
//
// Env vars (all read from GitHub Actions secrets in workflows):
//   GMAIL_USER          - Gmail address to send FROM (e.g. robmcdtv@gmail.com)
//   GMAIL_APP_PASSWORD  - 16-char app password from myaccount.google.com (REQUIRED)
//   EMAIL_TO            - recipient address (defaults to GMAIL_USER)
//
// Body comes from stdin. Subject is argv[1].
//
// Behavior when GMAIL_APP_PASSWORD is missing: exits 0 with a log message,
// so workflows that haven't been configured with the secret yet don't fail.
//
// Usage in workflows:
//   echo "$BODY" | node scripts/send-email.js "Subject line"

const nodemailer = require("nodemailer");

async function main() {
  const subject = process.argv[2];
  if (!subject) {
    console.error("[email] missing subject argument");
    process.exit(2);
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.EMAIL_TO || user;

  if (!user || !pass) {
    console.log("[email] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping (set them as GitHub secrets to enable)");
    return;
  }

  const body = await new Promise((resolve, reject) => {
    let buf = "";
    process.stdin.on("data", chunk => { buf += chunk; });
    process.stdin.on("end", () => resolve(buf));
    process.stdin.on("error", reject);
  });

  if (!body.trim()) {
    console.error("[email] empty body — not sending");
    process.exit(2);
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: user,
    to,
    subject,
    text: body
  });

  console.log(`[email] sent "${subject}" to ${to}`);
}

main().catch(err => {
  console.error("[email] FAILED:", err.message);
  process.exit(1);
});
