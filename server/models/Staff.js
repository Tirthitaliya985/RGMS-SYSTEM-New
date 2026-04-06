import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const StaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,

    role: {
      type: String,
      enum: ["guard", "cleaner", "manager", "electrician", "plumber", "other"],
      required: true,
    },
    password: {
      type: String,
      default: null,
      select: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    photo : String,
    salaryPerMonth: Number,
    joiningDate: Date,
  },
  { timestamps: true }
);

StaffSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  if (!this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});

StaffSchema.set("toJSON", {
  transform: function (_, ret) {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("Staff", StaffSchema);
