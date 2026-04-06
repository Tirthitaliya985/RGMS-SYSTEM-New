import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ResidentSchema = new mongoose.Schema(
  {
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },

    wing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wing",
      required: true,
    },

    flatNo: {
      type: String,
      required: true,
    },

    ownerName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      unique: true,
      required: true, // Example: +919876543210
    },

    status: {
      type: String,
      default: "Active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["resident"],
      default: "resident",
    },

    deletedAt: {
      type: Date,
      default: null,
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

// Unique flat per wing
// ResidentSchema.index({ wing: 1, flatNo: 1 }, { unique: true });

// ResidentSchema.index(
//   { email: 1 },
//   { unique: true, partialFilterExpression: { isDeleted: false }}
// );

// ResidentSchema.index(
//   {  phone: 1 },
//   { unique: true, partialFilterExpression: { isDeleted: false }}
// );


/* 🔐 Hash password before save */
ResidentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return; // no next needed
 
   this.password = await bcrypt.hash(this.password, 10);
});

/* 🔐 Compare password method */
ResidentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

ResidentSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});


export default mongoose.model("Resident", ResidentSchema);
