import Bill from "../../models/Bill.js";
import Resident from "../../models/Resident.js";
import Audit from "../../models/Audit.js";
import Payment from "../../models/Payment.js";

export const generateBills = async (req, res) => {
  try {
    const { month, amount, dueDate } = req.body;

    const monthMatch = /^(\d{4})-(\d{2})$/.exec(String(month || "").trim());
    if (!monthMatch) {
      return res.status(400).json({ message: "Billing month must be in YYYY-MM format." });
    }

    const selectedYear = Number(monthMatch[1]);
    const selectedMonth = Number(monthMatch[2]);
    if (selectedMonth < 1 || selectedMonth > 12) {
      return res.status(400).json({ message: "Billing month must be a valid month." });
    }

    const now = new Date();
    const selectedIndex = selectedYear * 12 + (selectedMonth - 1);
    const currentIndex = now.getFullYear() * 12 + now.getMonth();
    if (selectedIndex < currentIndex) {
      return res.status(400).json({ message: "Cannot generate bills for past months." });
    }

    // Get all residents
    const residents = await Resident.find({
      societyId: req.user.societyId,
      isDeleted: false,
    });

    // Generate bills
    const bills = residents.map((res) => ({
      societyId: req.user.societyId,
      residentId: res._id,
      flatNo: res.flatNo,
      month,
      amount,
      dueDate,
      remainingAmount: amount,
    }));

    const createdBills = await Bill.insertMany(bills);

    // Audit log
    await Audit.create({
      action: "CREATE",
      model: "Bill",
      recordId: null,
      recordName: `Bills for ${month}`,
      performedBy: req.user.id,
      performedByName: req.user.username,
      societyId: req.user.societyId,
      newData: createdBills,
    });

    res.status(201).json(createdBills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ societyId: req.user.societyId }).populate("residentId", "ownerName flatNo phone");
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // Check society access
    if (bill.societyId.toString() !== req.user.societyId.toString())
      return res.status(403).json({ message: "Not allowed" });

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateBillStatus = async (req, res) => {
  try {
    const { paidAmount } = req.body;

    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    bill.paidAmount += paidAmount;
    bill.remainingAmount = bill.amount - bill.paidAmount;

    bill.status =
      bill.remainingAmount === 0 ? "Paid" : "Partial";

    await bill.save();

    // Audit log
    await Audit.create({
      action: "UPDATE",
      model: "Bill",
      recordId: bill._id,
      recordName: bill.flatNo,
      performedBy: req.user.id,
      performedByName: req.user.username,
      societyId: req.user.societyId,
      newData: bill,
    });

    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    if (String(bill.societyId) !== String(req.user.societyId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const hasPayments = await Payment.exists({ billId: bill._id });
    if (hasPayments || bill.paidAmount > 0 || bill.status !== "Pending") {
      return res.status(400).json({
        message: "Cannot delete a bill that has payments or is not pending.",
      });
    }

    await Bill.deleteOne({ _id: bill._id });

    await Audit.create({
      action: "DELETE",
      model: "Bill",
      recordId: bill._id,
      recordName: `${bill.flatNo} (${bill.month})`,
      performedBy: req.user.id,
      performedByName: req.user.username,
      societyId: req.user.societyId,
      oldData: bill,
      newData: null,
    });

    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
