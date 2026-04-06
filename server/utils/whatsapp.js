import axios from "axios";

export const sendWhatsApp = async (phone, message) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      
      }
    );
  } catch (err) {
    console.log("WhatsApp Error:", err.response?.data || err.message);
    throw err;
  }
};
