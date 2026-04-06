import Wing from "../../models/wingModel.js";
import Resident from "../../models/Resident.js";
import Complaint from "../../models/Complaint.js";

/**
 * GET /wing/dashboard
 * Wing Admin Dashboard Data
 */
export const getWingDashboard = async (req, res) => {
  try {
    const wingId = req.user.wing; // from auth middleware

    // 1️⃣ Total Residents
    const totalResidents = await Resident.countDocuments({ wing: wingId });

    // 2️⃣ Total Flats
    const totalFlats = await Wing.findById(wingId).then(w => w.totalFlats || 0);

    // 3️⃣ Complaints
    const totalComplaints = await Complaint.countDocuments({ wing: wingId });
    const pendingComplaints = await Complaint.countDocuments({
      wing: wingId,
      status: "Pending",
    });
    const inProgressComplaints = await Complaint.countDocuments({
      wing: wingId,
      status: "In Progress",
    });
    const resolvedComplaints = await Complaint.countDocuments({
      wing: wingId,
      status: "Resolved",
    });

    const resolvedPercentage =
      totalComplaints === 0 ? 0 : Math.round((resolvedComplaints / totalComplaints) * 100);
    const inProgressPercentage =
      totalComplaints === 0 ? 0 : Math.round((inProgressComplaints / totalComplaints) * 100);
    const pendingPercentage =
      totalComplaints === 0 ? 0 : Math.round((pendingComplaints / totalComplaints) * 100);

    // 4️⃣ Recent Complaints
    const recentComplaints = await Complaint.find({ wing: wingId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("residentId", "residentName flatNo");

    const mappedComplaints = recentComplaints.map(c => ({
      _id: c._id,
      title: c.subject,
      status: c.status,
      ownerName: c.residentName,
    }));

    // 5️⃣ Recent Residents
    const recentResidents = await Resident.find({ wing: wingId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalResidents,
        totalFlats,
        totalComplaints,
        pendingComplaints,
        resolvedPercentage,
        inProgressPercentage,
        pendingPercentage,
      },
      recentComplaints: mappedComplaints,
      recentResidents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
