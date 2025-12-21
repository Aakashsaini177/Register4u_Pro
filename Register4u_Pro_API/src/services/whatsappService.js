// WhatsApp Service for sending allotment notifications
// This service will send WhatsApp messages when allotments are made

const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (!accountSid || !authToken || !whatsappNumber) {
      console.log('⚠️ Twilio credentials not configured. WhatsApp message would be sent to:', phoneNumber);
      console.log('📱 Message:', message);
      console.log('💡 To enable real WhatsApp messages, configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER in .env file');
      return { success: true, messageId: 'whatsapp-dev-' + Date.now() };
    }
    
    // Send actual WhatsApp message via Twilio
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);
    
    const result = await client.messages.create({
      body: message,
      from: 'whatsapp:' + whatsappNumber,
      to: 'whatsapp:' + phoneNumber
    });
    
    console.log('✅ WhatsApp message sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    // Fallback to console log for development
    console.log('📱 WhatsApp message (fallback):', phoneNumber);
    console.log('💬 Message:', message);
    return { success: false, error: error.message };
  }
};

// Send hotel allotment notification to hotel
const sendHotelAllotmentNotification = async (hotelContactNumber, travelDetails) => {
  const message = `🏨 *Hotel Allotment Notification*

*New Guest Allotment:*
👤 Guest: ${travelDetails.visitorName}
📱 Contact: ${travelDetails.mobileNumber}
🆔 Visitor ID: ${travelDetails.visitorId}
✈️ Travel Type: ${travelDetails.travelBy}
📍 From: ${travelDetails.fromLocation}
📍 To: ${travelDetails.toLocation}
📅 Travel Date: ${new Date(travelDetails.travelDate).toLocaleDateString()}
🕐 Travel Time: ${travelDetails.travelTime}

*Please prepare for guest arrival.*`;

  return await sendWhatsAppMessage(hotelContactNumber, message);
};

// Send travel allotment notification to travel contact
const sendTravelAllotmentNotification = async (travelContactNumber, travelDetails, hotelDetails, driverDetails) => {
  let message = `✈️ *Travel Allotment Confirmation*

*Your Travel Details:*
👤 Name: ${travelDetails.visitorName}
📱 Contact: ${travelDetails.mobileNumber}
🆔 Visitor ID: ${travelDetails.visitorId}
✈️ Travel Type: ${travelDetails.travelBy}
📍 From: ${travelDetails.fromLocation}
📍 To: ${travelDetails.toLocation}
📅 Travel Date: ${new Date(travelDetails.travelDate).toLocaleDateString()}
🕐 Travel Time: ${travelDetails.travelTime}

`;

  if (hotelDetails) {
    message += `🏨 *Hotel Allotment:*
🏨 Hotel: ${hotelDetails.hotelName}
📍 Address: ${hotelDetails.hotelAddress}
📞 Contact: ${hotelDetails.contactNumber}
🏠 Room: ${hotelDetails.roomNumber}
📅 Check-in: ${new Date(hotelDetails.checkInDate).toLocaleDateString()}
📅 Check-out: ${new Date(hotelDetails.checkOutDate).toLocaleDateString()}

`;
  }

  if (driverDetails) {
    message += `🚗 *Driver Allotment:*
👨‍💼 Driver: ${driverDetails.driverName}
📞 Contact: ${driverDetails.contactNumber}
🚗 Vehicle: ${driverDetails.vehicleNumber} (${driverDetails.vehicleType})
🪑 Capacity: ${driverDetails.seater} seats
📅 Pickup: ${new Date(driverDetails.pickupDate).toLocaleDateString()}
🕐 Time: ${driverDetails.pickupTime}

`;
  }

  message += `*Thank you for choosing our services!*`;

  return await sendWhatsAppMessage(travelContactNumber, message);
};

// Send driver allotment notification to driver
const sendDriverAllotmentNotification = async (driverContactNumber, travelDetails, hotelDetails) => {
  let message = `🚗 *Driver Assignment Notification*

*Guest Details:*
👤 Guest: ${travelDetails.visitorName}
📱 Contact: ${travelDetails.mobileNumber}
🆔 Visitor ID: ${travelDetails.visitorId}
✈️ Travel Type: ${travelDetails.travelBy}
📍 From: ${travelDetails.fromLocation}
📍 To: ${travelDetails.toLocation}
📅 Travel Date: ${new Date(travelDetails.travelDate).toLocaleDateString()}
🕐 Travel Time: ${travelDetails.travelTime}

`;

  if (hotelDetails) {
    message += `🏨 *Hotel Details:*
🏨 Hotel: ${hotelDetails.hotelName}
📍 Address: ${hotelDetails.hotelAddress}
📞 Hotel Contact: ${hotelDetails.contactNumber}
🏠 Room: ${hotelDetails.roomNumber}
📅 Check-in: ${new Date(hotelDetails.checkInDate).toLocaleDateString()}
📅 Check-out: ${new Date(hotelDetails.checkOutDate).toLocaleDateString()}

`;
  }

  message += `*Please coordinate with guest for pickup.*`;

  return await sendWhatsAppMessage(driverContactNumber, message);
};

module.exports = {
  sendWhatsAppMessage,
  sendHotelAllotmentNotification,
  sendTravelAllotmentNotification,
  sendDriverAllotmentNotification
};
