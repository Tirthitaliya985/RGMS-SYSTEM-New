import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const wingAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    role: {
      type: String,
      enum: ["wingadmin"],
      default: "wingadmin",
    },
    wing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wing",
      required: true,
    },
    resetPasswordOtp: {
      type: String,
      default: null,
    },
    resetPasswordOtpExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash Password
wingAdminSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // no next needed

  this.password = await bcrypt.hash(this.password, 10);
});

// Match Password
wingAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("WingAdmin", wingAdminSchema);
