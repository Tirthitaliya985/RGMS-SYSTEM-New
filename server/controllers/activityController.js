import Activity from "../models/Activity.js";

// GET /api/activities
export const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

// POST /api/activities
export const createActivity = async (req, res) => {
  try {
    const { username, action ,time} = req.body;
    if (!username || !action)
      return res.status(400).json({ message: "User and action required" });

    const activity = await Activity.create({ username, action , time });
    res.status(201).json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to log activity" });
  }
};


// POST /api/activities/mark-read
export const markActivitiesRead = async (req, res) => {
  try {
    await Activity.updateMany({ read: false }, { $set: { read: true } });
    res.json({ message: "All notifications marked as read" });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark activities as read" });
  }
};

// Previous code using Express app instance directly

// app.post("/api/activities/mark-read", async (req, res) => {
//   await Activity.updateMany({ read: false }, { $set: { read: true } });
//   res.json({ message: "All notifications marked as read" });
// });
