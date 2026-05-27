import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (optional)
 * @returns {Promise}
 */
export const sendEmail = async ({ to, subject, html, text = "" }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "RESEND_API_KEY not configured. Email would be sent to:",
        to
      );
      return { success: true, message: "Email service not configured" };
    }

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@paytm.com",
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, "")
    });

    if (response.error) {
      console.error("Email send error:", response.error);
      return { success: false, error: response.error };
    }

    console.log("Email sent successfully:", response.id);
    return { success: true, messageId: response.id };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send money credited notification email
 */
export const sendMoneyReceivedEmail = async ({
  email,
  amount,
  senderName,
  availableBalance,
  transactionId,
  time
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin: 0 0 20px 0;">Money Received Successfully ✓</h2>
        
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;"><strong>₹${amount}</strong> has been credited to your wallet</p>
        </div>

        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>From:</strong> ${senderName}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Available Balance:</strong> ₹${availableBalance}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Time:</strong> ${time}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Transaction ID:</strong> ${transactionId}
          </p>
        </div>

        <p style="color: #718096; margin: 20px 0; font-size: 14px;">
          If you did not authorize this transaction, please contact our support team immediately.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <p style="color: #718096; margin: 0; font-size: 12px;">
            © 2026 PayTm. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Money Received Successfully - ₹" + amount,
    html
  });
};

/**
 * Send money debited notification email
 */
export const sendMoneyDebitedEmail = async ({
  email,
  amount,
  recipientName,
  availableBalance,
  transactionId,
  time
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin: 0 0 20px 0;">Money Transferred</h2>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>₹${amount}</strong> has been transferred from your wallet</p>
        </div>

        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>To:</strong> ${recipientName}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Available Balance:</strong> ₹${availableBalance}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Time:</strong> ${time}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Transaction ID:</strong> ${transactionId}
          </p>
        </div>

        <p style="color: #718096; margin: 20px 0; font-size: 14px;">
          If you did not authorize this transaction, please contact our support team immediately.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <p style="color: #718096; margin: 0; font-size: 12px;">
            © 2026 PayTm. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Money Transferred - ₹" + amount,
    html
  });
};

/**
 * Send withdrawal request email
 */
export const sendWithdrawalRequestEmail = async ({
  email,
  amount,
  withdrawalId,
  time
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin: 0 0 20px 0;">Withdrawal Request Submitted</h2>
        
        <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;"><strong>₹${amount}</strong> withdrawal request is being processed</p>
        </div>

        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Requested Amount:</strong> ₹${amount}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Request Time:</strong> ${time}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Request ID:</strong> ${withdrawalId}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Status:</strong> <span style="color: #f59e0b;">Processing</span>
          </p>
        </div>

        <p style="color: #718096; margin: 20px 0; font-size: 14px;">
          Your withdrawal will be processed within 1-2 business days. You will receive an email confirmation once the amount is transferred to your bank account.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <p style="color: #718096; margin: 0; font-size: 12px;">
            © 2026 PayTm. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Withdrawal Request Submitted - ₹" + amount,
    html
  });
};

/**
 * Send withdrawal success email
 */
export const sendWithdrawalSuccessEmail = async ({
  email,
  amount,
  accountNumber,
  time,
  transactionId
}) => {
  const maskedAccount = accountNumber.slice(-4).padStart(accountNumber.length, "*");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin: 0 0 20px 0;">Withdrawal Successful ✓</h2>
        
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;"><strong>₹${amount}</strong> has been withdrawn successfully</p>
        </div>

        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Amount Withdrawn:</strong> ₹${amount}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Bank Account:</strong> ${maskedAccount}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Time:</strong> ${time}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Transaction ID:</strong> ${transactionId}
          </p>
        </div>

        <p style="color: #718096; margin: 20px 0; font-size: 14px;">
          The amount will be credited to your linked bank account within 1-2 business days.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <p style="color: #718096; margin: 0; font-size: 12px;">
            © 2026 PayTm. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Withdrawal Successful - ₹" + amount,
    html
  });
};

/**
 * Send KYC approved email
 */
export const sendKYCApprovedEmail = async ({ email, userName }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin: 0 0 20px 0;">KYC Verification Approved ✓</h2>
        
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;"><strong>Your account has been fully verified!</strong></p>
        </div>

        <p style="color: #4b5563; margin: 20px 0;">
          Hi ${userName},
        </p>

        <p style="color: #4b5563; margin: 20px 0;">
          Great news! Your KYC (Know Your Customer) verification has been approved. Your account is now fully verified and you have access to all features including higher transaction limits.
        </p>

        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #4b5563;">
            ✓ Full transaction access
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            ✓ Higher daily limits
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            ✓ All wallet features enabled
          </p>
        </div>

        <p style="color: #718096; margin: 20px 0; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <p style="color: #718096; margin: 0; font-size: 12px;">
            © 2026 PayTm. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "KYC Verification Approved - Account Fully Verified",
    html
  });
};

/**
 * Send KYC rejected email
 */
export const sendKYCRejectedEmail = async ({ email, userName, reason }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin: 0 0 20px 0;">KYC Verification Status Update</h2>
        
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;"><strong>Your KYC verification has been rejected</strong></p>
        </div>

        <p style="color: #4b5563; margin: 20px 0;">
          Hi ${userName},
        </p>

        <p style="color: #4b5563; margin: 20px 0;">
          Unfortunately, your KYC verification could not be approved. Please review the reason below and resubmit your documents.
        </p>

        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Reason:</strong> ${reason || "Documents do not meet requirements"}
          </p>
        </div>

        <p style="color: #718096; margin: 20px 0; font-size: 14px;">
          Please ensure your documents are clear, valid, and not expired before resubmitting. If you need help, contact our support team.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <p style="color: #718096; margin: 0; font-size: 12px;">
            © 2026 PayTm. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "KYC Verification Status - Please Resubmit",
    html
  });
};

/**
 * Send login alert email (SECURITY)
 */
export const sendLoginAlertEmail = async ({
  email,
  userName,
  ip,
  browser,
  time,
  deviceName
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #ef4444; margin: 0 0 20px 0;">⚠️ New Login Detected</h2>
        
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;"><strong>A new login to your account has been detected</strong></p>
        </div>

        <p style="color: #4b5563; margin: 20px 0;">
          Hi ${userName},
        </p>

        <p style="color: #4b5563; margin: 20px 0;">
          A new login to your PayTm account has been detected. Please review the details below.
        </p>

        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>IP Address:</strong> ${ip}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Browser:</strong> ${browser}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Device:</strong> ${deviceName}
          </p>
          <p style="margin: 8px 0; color: #4b5563;">
            <strong>Time:</strong> ${time}
          </p>
        </div>

        <p style="color: #ef4444; margin: 20px 0; font-weight: bold; font-size: 14px;">
          If this wasn't you, please change your password immediately and contact support.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <p style="color: #718096; margin: 0; font-size: 12px;">
            © 2026 PayTm. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "⚠️ Security Alert - New Login Detected",
    html
  });
};

/**
 * Send password changed email
 */
export const sendPasswordChangedEmail = async ({ email, userName, time }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #2d3748; margin: 0 0 20px 0;">Password Changed Successfully</h2>
        
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;"><strong>Your password has been changed successfully</strong></p>
        </div>

        <p style="color: #4b5563; margin: 20px 0;">
          Hi ${userName},
        </p>

        <p style="color: #4b5563; margin: 20px 0;">
          Your password was changed successfully at ${time}. If you did not make this change, please reset your password immediately.
        </p>

        <p style="color: #718096; margin: 20px 0; font-size: 14px;">
          For security reasons, please do not share your password with anyone, including PayTm support staff.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <p style="color: #718096; margin: 0; font-size: 12px;">
            © 2026 PayTm. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Password Changed Successfully",
    html
  });
};

/**
 * Send low balance alert email (OPTIONAL)
 */
export const sendLowBalanceAlertEmail = async ({ email, userName, balance }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #f59e0b; margin: 0 0 20px 0;">Low Balance Alert</h2>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>Your wallet balance is below ₹100</strong></p>
        </div>

        <p style="color: #4b5563; margin: 20px 0;">
          Hi ${userName},
        </p>

        <p style="color: #4b5563; margin: 20px 0;">
          Your current wallet balance is ₹${balance}. Please add funds to avoid transaction failures.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
          <p style="color: #718096; margin: 0; font-size: 12px;">
            © 2026 PayTm. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Low Balance Alert - ₹" + balance,
    html
  });
};
