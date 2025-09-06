export const adminNotifyTpl = (data) => ({
  subject: `New contact message: ${data.subject}`,
  html: `
    <h2>New Contact Message</h2>
    <p><b>Name:</b> ${data.fullName}</p>
    <p><b>Email:</b> ${data.email}</p>
    <p><b>Phone:</b> ${data.phone || "-"}</p>
    <p><b>Subject:</b> ${data.subject}</p>
    <p><b>Message:</b></p>
    <pre style="white-space:pre-wrap;font-family:inherit">${data.message}</pre>
  `,
});

export const userReplyTpl = (original, replyText) => ({
  subject: `Re: ${original.subject}`,
  html: `
    <p>Salam ${original.fullName},</p>
    <p>${replyText.replace(/\n/g, "<br/>")}</p>
    <hr/>
    <p><b>Sizin müraciətiniz:</b></p>
    <blockquote style="color:#555">${original.message}</blockquote>
  `,
});
