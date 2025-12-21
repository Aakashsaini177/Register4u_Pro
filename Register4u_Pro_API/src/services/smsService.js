// SMS Service for sending notifications
// This is a placeholder implementation - you would need to integrate with actual SMS providers like Twilio, AWS SNS, etc.

const sendSMS = async (phoneNumber, message) => {
  try {
    // TODO: Integrate with actual SMS provider
    // For now, we'll just log the SMS that would be sent
    console.log(`SMS would be sent to ${phoneNumber}: ${message}`);

    // Example integration with Twilio (uncomment and configure):
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);
    
    const message = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    return { success: true, messageId: message.sid };
    */

    // For development/testing purposes, return success
    return { success: true, messageId: "dev-" + Date.now() };
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new Error("Failed to send SMS");
  }
};

const sendRoomAllotmentSMS = async (
  visitorName,
  visitorNumber,
  hotelName,
  roomNumber,
  checkInDate
) => {
  const message = `Dear ${visitorName}, your room ${roomNumber} has been allotted at ${hotelName}. Check-in date: ${new Date(
    checkInDate
  ).toLocaleDateString()}. Thank you!`;

  return await sendSMS(visitorNumber, message);
};

const sendDriverAllotmentSMS = async (
  visitorName,
  visitorNumber,
  driverName,
  vehicleNumber,
  pickupDate,
  pickupTime
) => {
  const message = `Dear ${visitorName}, your driver ${driverName} (${vehicleNumber}) has been allotted. Pickup date: ${new Date(
    pickupDate
  ).toLocaleDateString()} at ${pickupTime}. Thank you!`;

  return await sendSMS(visitorNumber, message);
};

module.exports = {
  sendSMS,
  sendDriverAllotmentSMS,
  sendVisitorRegistrationSMS: async (visitor, eventLink) => {
    const message = `Welcome ${visitor.name}! You are successfully registered. Your Visitor ID is ${visitor.visitorId}. View details: ${eventLink}`;
    return await sendSMS(visitor.contact, message);
  },
};
