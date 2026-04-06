import Staff from "../models/Staff.js";
import { sendWhatsApp } from "../utils/whatsapp.js";

export const sendMessage = async (req, res) => {
  try {
    const { staffId, message } = req.body;

    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    await sendWhatsApp(staff.phone, message);

    res.json({
      success: true,
      message: "WhatsApp sent successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending WhatsApp"
    });
  }
};
