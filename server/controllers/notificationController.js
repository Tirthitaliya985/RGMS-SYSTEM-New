const Notification = require("../models/Notification");

// Get notifications with pagination + search
exports.getNotifications = async (req, res) => {
  try {
    const societyId = req.user.societyId;
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      societyId,
      title: { $regex: search, $options: "i" },
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notifications,
      total,
      hasMore: total > page * limit,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// mark one as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, societyId: req.user.societyId },
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { societyId: req.user.societyId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({
      _id: id,
      societyId: req.user.societyId,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
