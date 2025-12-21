const sendEmail = async (to, subject, text, html) => {
  try {
    // TODO: Integrate with actual Email provider (Nodemailer, SendGrid, etc.)
    console.log(`📧 [MOCK EMAIL] To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${text}`);

    return { success: true, messageId: "dev-" + Date.now() };
  } catch (error) {
    console.error("Error sending email:", error);
    // don't throw, just log error so flow continues
    return { success: false, error: error.message };
  }
};

const sendVisitorWelcomeEmail = async (visitor) => {
  const subject = "Welcome to Register4u Pro!";
  const text = `
    Dear ${visitor.name},
    
    Thank you for registering!
    Your Visitor ID is: ${visitor.visitorId}
    
    Please show the attached QR code or your Visitor ID at the entry.
    
    Regards,
    Register4u Team
  `;

  // In a real app, we would generate the QR code buffer and attach it.

  return await sendEmail(visitor.email, subject, text);
};

module.exports = {
  sendEmail,
  sendVisitorWelcomeEmail,
};
