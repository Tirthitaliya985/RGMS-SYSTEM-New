// controllers/salaryController.js
import Salary from "../models/Salary.js";
import Staff from "../models/Staff.js";
import dayjs from "dayjs";

// Automatically generate salaries for all active staff
export const autoCreateSalary = async (req, res) => {
  try {
    // Fetch all active staff
    const activeStaff = await Staff.find({ status: "active" });

    const month = dayjs().month() + 1; // current month (1-12)
    const year = dayjs().year();

    const salaries = [];

    for (const s of activeStaff) {
      // check if salary already exists for this month
      const exists = await Salary.findOne({
        staff: s._id,
        month,
        year,
      });

      if (exists) continue; // skip if already exists

      const basicSalary = s.salaryPerMonth || 0; // get from staff profile
      const bonus = 0;
      const deduction = 0;
      const totalPaid = basicSalary + bonus - deduction;

      const salary = await Salary.create({
        staff: s._id,
        month,
        year,
        basicSalary,
        bonus,
        deduction,
        totalPaid,
        paymentStatus: "pending",
      });

      salaries.push(salary);
    }

    res.json({ success: true, salariesCreated: salaries.length, salaries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to auto-create salaries" });
  }
};


// Create or update salary
export const createOrUpdateSalary = async (req, res) => {
  try {
    const { staff, basicSalary, bonus = 0, deduction = 0, month, year, paymentStatus } = req.body;

    const totalPaid = (basicSalary || 0) + (bonus || 0) - (deduction || 0);

    let salary;
    if (req.params.id) {
      salary = await Salary.findByIdAndUpdate(
        req.params.id,
        { staff, basicSalary, bonus, deduction, totalPaid, month, year, paymentStatus },
        { new: true }
      );
    } else {
      salary = await Salary.create({ staff, basicSalary, bonus, deduction, totalPaid, month, year, paymentStatus });
    }

    res.json(salary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Salary save failed" });
  }
};

// Get all salaries
export const getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find().populate("staff").sort({ year: -1, month: -1 });
    res.json(salaries);
  } catch {
    res.status(500).json({ message: "Failed to fetch salaries" });
  }
};

// Delete salary
export const deleteSalary = async (req, res) => {
  try {
    await Salary.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to delete salary" });
  }
};

// Auto-generate monthly salaries
export const generateMonthlySalaries = async () => {
  try {
    const currentMonth = dayjs().month() + 1;
    const currentYear = dayjs().year();

    const activeStaff = await Staff.find({ status: "active" });

    for (const staff of activeStaff) {
      const exists = await Salary.findOne({ staff: staff._id, month: currentMonth, year: currentYear });
      if (!exists) {
        await Salary.create({
          staff: staff._id,
          month: currentMonth,
          year: currentYear,
          basicSalary: staff.basicSalary || 0,
          bonus: 0,
          deduction: 0,
          totalPaid: staff.basicSalary || 0,
          paymentStatus: "pending",
        });
      }
    }
    console.log("Monthly salaries generated successfully!");
  } catch (err) {
    console.error("Error generating salaries:", err);
  }
};
