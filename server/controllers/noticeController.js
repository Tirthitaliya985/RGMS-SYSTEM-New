import Notice from "../models/Notice.js";
import Resident from "../models/Resident.js";
import { sendWhatsAppWebMessage } from "../utils/whatsappService.js";

// Create Notice
export const createNotice = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      createdBy: req.user?._id || req.body.createdBy,
    };
    const notice = await Notice.create(payload);

    if (req.user?.role?.toLowerCase() === "society") {
      const societyId = req.user.societyId;
      if (societyId) {
        const residents = await Resident.find({
          societyId,
          isDeleted: false,
          status: { $ne: "Inactive" },
        }).select("phone ownerName flatNo");

        const messageLines = [
          "New Society Notice",
          `Title: ${notice.title || "-"}`,
          notice.description ? `Details: ${notice.description}` : null,
          notice.priority ? `Priority: ${notice.priority}` : null,
          notice.expiryDate
            ? `Expiry: ${new Date(notice.expiryDate).toLocaleString()}`
            : null,
        ].filter(Boolean);

        const messageText = messageLines.join("\n");

        Promise.allSettled(
          residents.map((resident) =>
            sendWhatsAppWebMessage(resident.phone, messageText)
          )
        ).then((results) => {
          const failed = results.filter((r) => r.status === "rejected");
          if (failed.length > 0) {
            console.warn(
              `WhatsApp notice send failed for ${failed.length} residents`
            );
          }
        });
      }
    }

    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    console.error("Notice creation error:", error.message, error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get All Notices
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json({ success: true, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Notice
export const updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Notice
export const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notice Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
