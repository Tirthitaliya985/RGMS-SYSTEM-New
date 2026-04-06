import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const visitorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      match: [/^\d{10,}$/, 'Please provide a valid phone number'],
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    visitDate: {
      type: Date,
      required: [true, 'Please provide a visit date'],
    },
    visitTime: {
      type: String,
      required: [true, 'Please provide a visit time'],
    },
    purpose: {
      type: String,
      enum: ['Property Tour', 'Demo', 'Inquiry', 'Complaint', 'Other'],
      default: 'Inquiry',
    },
    description: {
      type: String,
      maxlength: 500,
    },
    hostName: {
      type: String,
      trim: true,
    },
    hostUnit: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Visited'],
      default: 'Pending',
    },
    idProof: {
      type: String,
      enum: ['Passport', 'Driving License', 'Aadhar', 'Voter ID', 'Other'],
    },
    idNumber: {
      type: String,
      trim: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    demoEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
    },
    demoSocietyName: {
      type: String,
      trim: true,
    },
    demoUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DemoUser",
    },
    demoExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (if implemented in future)
visitorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);

});

export default mongoose.model('DemoVisitor', visitorSchema);
