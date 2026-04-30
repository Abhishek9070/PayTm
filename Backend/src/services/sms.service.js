import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

const normalizePhoneNumber = (phoneNumber) => {
  const rawPhoneNumber = String(phoneNumber || "").trim();

  if (!rawPhoneNumber) {
    return null;
  }

  if (rawPhoneNumber.startsWith("+")) {
    return rawPhoneNumber;
  }

  if (/^\d{10}$/.test(rawPhoneNumber)) {
    return `+91${rawPhoneNumber}`;
  }

  return rawPhoneNumber;
};

export const sendSMS = async ({ to, message }) => {
  try {
    if (!client || !fromPhoneNumber) {
      console.warn("SMS not sent: Twilio is not configured");
      return null;
    }

    const normalizedTo = normalizePhoneNumber(to);

    if (!normalizedTo) {
      console.warn("SMS not sent: missing recipient number");
      return null;
    }

    return await client.messages.create({
      body: message,
      from: fromPhoneNumber,
      to: normalizedTo
    });
  } catch (error) {
    console.log("SMS ERROR:", error.message);
    return null;
  }
};