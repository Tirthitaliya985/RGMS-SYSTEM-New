// server/controllers/societyController.js
import Society from "../models/Society.js";
import { logActivity } from "../utils/logger.js";

export const createSociety = async (req, res) => {
  try {
    const existing = await Society.findOne({ name: req.body.name });
    if (existing) {
      return res.status(400).json({ message: "Society name already exists" });
    }

    const society = await Society.create({
      ...req.body,
      amenities: req.body.amenities?.split(",").map(a => a.trim()),
      createdBy: req.user.username,
    });

    res.status(201).json(society);
  } catch (err) {
    res.status(500).json({ message: "Failed to create society" });
  }
};

export const getSocieties = async (req, res) => {
  const societies = await Society.find().sort({ createdAt: -1 });
  res.json(societies);
};

export const getSocietyById = async (req, res) => {
  try {
    const society = await Society.findById(req.params.id);
    if (!society) return res.status(404).json({ message: "Society not found" });

    res.json({ data: society });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSociety = async (req, res) => {
  try {
    const society = await Society.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        amenities: req.body.amenities?.split(",").map(a => a.trim()),
      },
      { new: true }
    );

    res.json(society);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteSociety = async (req, res) => {
  try {
    await Society.findByIdAndDelete(req.params.id);
    res.json({ message: "Society deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};