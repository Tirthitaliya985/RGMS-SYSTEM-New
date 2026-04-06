
import Complaint from "../models/Complaint.js";
// Get all complaints for logged-in resident
export const getAllComplaints = async (req, res) => {
  try {
    const residentId = req.user.id; // from JWT
    const societyId = req.user.societyId;
    let complaints = await Complaint.find({ residentId })
      .sort({ createdAt: -1 })
      .populate("wing", "name") // optional: show wing name
      .lean();

    if(complaints.length === 0){
      complaints = await Complaint.find({ societyId })
      .sort({ createdAt: -1 })
      .populate("wing", "name")
      .lean();
    }

    res.status(200).json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const residentId = req.user.id;
    const residentName = req.user.ownerName || req.user.name || "A Resident";
    const societyId = req.user.societyId;
    const wing = req.user.wing;

    const { subject, description } = req.body;

    const complaint = await Complaint.create({
      residentId,
      residentName,
      societyId,
      wing,
      subject,
      description,
    });

    // Optional: emit real-time notification via Socket.IO
    if (req.io && wing) {
      req.io.to(wing).emit("newWingNotification", {
        title: `New Complaint from ${residentName}`,
        message: subject,
        isRead: false,
      });
    }

    // --- WhatsApp Notification Logic ---
    try {
      // We need to dynamically import User or fetch admins
      const User = (await import("../models/User.js")).default;
      
      // Find Society Admin and Wing Admin
      const admins = await User.find({
        societyId,
        $or: [
          { role: "society_admin" },
          { role: "wing_admin", wing: wing }
        ],
        phone: { $exists: true, $ne: null }
      });

      if (admins.length > 0) {
        const staffList = admins.map(admin => ({
          name: admin.username || admin.name || "Admin",
          phone: admin.phone
        }));

        const whatsappMessage = `🚨 *New Complaint Registered*\n\n*Resident:* ${residentName}\n*Wing:* ${wing || 'N/A'}\n*Subject:* ${subject}\n\n*Description:*\n${description}\n\nPlease check the admin dashboard for more details.`;

        // Make an internal API call or use the whatsapp utility
        const { sendWhatsApp } = await import("../utils/whatsapp.js");
        
        // Loop through and send (or if your util supports bulk, use that)
        for (const staff of staffList) {
           await sendWhatsApp(staff.phone, whatsappMessage);
        }
        console.log(`WhatsApp complaint notifications sent to ${staffList.length} admins.`);
      }
    } catch (waErr) {
      console.error("Failed to send WhatsApp notification for complaint:", waErr);
      // We don't fail the complaint creation if WA fails
    }
    // -----------------------------------

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Update complaint status
export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('residentId', 'name ownerName phone'); // Populate resident info for WA

    if (!complaint) {
       return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // --- WhatsApp Notification to Resident ---
    try {
      const resident = complaint.residentId;
      if (resident && resident.phone) {
        const residentName = resident.ownerName || resident.name || "Resident";
        let messageBody = `Hello ${residentName},\n\nThe status of your recent complaint regarding *"${complaint.subject}"* has been updated to: *${status}*.\n\n`;
        
        if (status === "In Progress") {
          messageBody += "Our team is currently working on it and we will update you once it is resolved.";
        } else if (status === "Resolved") {
          messageBody += "We are pleased to inform you that the issue has been resolved. Thank you for your patience.";
        }

        const { sendWhatsApp } = await import("../utils/whatsapp.js");
        await sendWhatsApp(resident.phone, messageBody);
        console.log(`WhatsApp status update sent to resident: ${residentName}`);
      }
    } catch (waErr) {
      console.error("Failed to send WhatsApp status update to resident:", waErr);
    }
    // -----------------------------------------

    res.status(200).json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete complaint
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    await Complaint.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
