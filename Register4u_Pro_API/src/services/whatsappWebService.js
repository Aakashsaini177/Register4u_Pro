// Alternative WhatsApp Web Service for sending notifications
// This uses WhatsApp Web API (like WhatsApp Business API) for sending messages

const axios = require('axios');

const sendWhatsAppWebMessage = async (phoneNumber, message) => {
  try {
    // Check if WhatsApp Web API credentials are configured
    const apiUrl = process.env.WHATSAPP_WEB_API_URL;
    const apiKey = process.env.WHATSAPP_WEB_API_KEY;
    const instanceId = process.env.WHATSAPP_WEB_INSTANCE_ID;
    
    if (!apiUrl || !apiKey || !instanceId) {
      console.log('⚠️ WhatsApp Web API credentials not configured.');
      console.log('📱 Message would be sent to:', phoneNumber);
      console.log('💬 Message:', message);
      console.log('💡 To enable real WhatsApp messages, configure WHATSAPP_WEB_API_URL, WHATSAPP_WEB_API_KEY, and WHATSAPP_WEB_INSTANCE_ID in .env file');
      return { success: true, messageId: 'whatsapp-web-dev-' + Date.now() };
    }
    
    // Send WhatsApp message via Web API
    const response = await axios.post(`${apiUrl}/send-message`, {
      instanceId: instanceId,
      phoneNumber: phoneNumber,
      message: message
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ WhatsApp Web message sent successfully:', response.data);
    return { success: true, messageId: response.data.messageId || 'web-' + Date.now() };
  } catch (error) {
    console.error('❌ Error sending WhatsApp Web message:', error);
    // Fallback to console log for development
    console.log('📱 WhatsApp Web message (fallback):', phoneNumber);
    console.log('💬 Message:', message);
    return { success: false, error: error.message };
  }
};

// Send hotel allotment notification to hotel via WhatsApp Web
const sendHotelAllotmentNotificationWeb = async (hotelContactNumber, travelDetails) => {
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

  return await sendWhatsAppWebMessage(hotelContactNumber, message);
};

// Send travel allotment notification to travel contact via WhatsApp Web
const sendTravelAllotmentNotificationWeb = async (travelContactNumber, travelDetails, hotelDetails, driverDetails) => {
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

  return await sendWhatsAppWebMessage(travelContactNumber, message);
};

// Send driver allotment notification to driver via WhatsApp Web
const sendDriverAllotmentNotificationWeb = async (driverContactNumber, travelDetails, hotelDetails) => {
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

  return await sendWhatsAppWebMessage(driverContactNumber, message);
};

module.exports = {
  sendWhatsAppWebMessage,
  sendHotelAllotmentNotificationWeb,
  sendTravelAllotmentNotificationWeb,
  sendDriverAllotmentNotificationWeb
};


