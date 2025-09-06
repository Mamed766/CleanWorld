const nodemailer = require("nodemailer");

/* ===== helpers ===== */
function arrify(v) {
  return Array.isArray(v) ? v.filter(Boolean) : v ? [v] : [];
}
function parseList(val) {
  return (val || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ===== transport ===== */
function buildTransport({ host, port, secure, user, pass }) {
  return nodemailer.createTransport({
    host,
    port,
    secure, // 465/25025: true, 2525/587: false
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { servername: host },
    logger: true,
    debug: true,
  });
}

async function trySend(cfg, mail) {
  console.log("[SMTP TRY]", cfg);
  const t = buildTransport(cfg);
  await t.verify(); // burada ilişərsə şəbəkə problemidir
  const info = await t.sendMail(mail);
  console.log("✅ Email sent:", info.messageId);
  return true;
}

/* ===== main ===== */
module.exports = async function sendMail(to, text, options = {}) {
  const {
    subject = "Notification",
    html, // opsional HTML
    replyTo, // opsional reply-to
    cc, // opsional: əlavə CC (string | string[])
    bcc, // opsional: əlavə BCC (string | string[])
    attachments, // opsional: [{ filename, content, path, ... }]
  } = options;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromAddress = process.env.SMTP_FROM || user;
  const fromName = process.env.SMTP_FROM_NAME || "Təmiz Dünya";

  // display name düzgün getsin
  const from = { name: fromName, address: fromAddress };

  // ENV yönləndirmələri:
  // - NOTIFY_TO: əsas admin/alıcı (əgər 'to' boş verilsə)
  // - SMTP_CC: əlavə görünən kopyalar (virgüllə)
  // - FORWARD_TO və ya SMTP_BCC: gizli kopyalar (virgüllə)
  const toList =
    arrify(to).length > 0 ? arrify(to) : arrify(process.env.NOTIFY_TO);

  const ccEnv = parseList(process.env.SMTP_CC);
  const bccEnv = parseList(process.env.FORWARD_TO || process.env.SMTP_BCC);

  const ccList = [...ccEnv, ...arrify(cc)];
  const bccList = [...bccEnv, ...arrify(bcc)];

  const mail = {
    from,
    to: toList,
    subject,
    text: text || "",
    ...(html ? { html } : {}),
    ...(replyTo ? { replyTo } : {}),
    ...(ccList.length ? { cc: ccList } : {}),
    ...(bccList.length ? { bcc: bccList } : {}),
    ...(attachments ? { attachments } : {}),
  };

  const attempts = [
    {
      host,
      port: Number(process.env.SMTP_PORT || 2525),
      secure: false,
      user,
      pass,
    }, // 2525
    { host, port: 587, secure: false, user, pass }, // STARTTLS
    { host, port: 465, secure: true, user, pass }, // SSL
    { host, port: 25025, secure: true, user, pass }, // TurboSMTP SSL alternativi
  ];

  for (const cfg of attempts) {
    try {
      return await trySend(cfg, mail);
    } catch (e) {
      console.error(`❌ sendMail ${cfg.port} error:`, e.message);
    }
  }
  return false;
};
