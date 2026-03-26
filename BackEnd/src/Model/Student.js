const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  roll: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // Hashed password
  course: String,
  year: String,

  photoUrl: String,
  faceEmbedding: [Number], // Array of floats representing face encoding
  faceRegisteredAt: Date, // When face was registered

  // Admin pre-registration fields
  isPreRegistered: { type: Boolean, default: false },
  courseFee: Number,
  preRegisteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  preRegisteredAt: Date,
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Internal Wallet
  walletBalance: { type: Number, default: 0 },

  // E-ID storage with daily expiration
  eid: {
    isActive: { type: Boolean, default: false },
    generatedAt: Date,
    expiresAt: Date,
    qrCode: String // Optional: for QR code representation
  },

  // Password Reset OTP
  resetPasswordOtp: { type: String, select: false },
  resetPasswordOtpExpires: { type: Date, select: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', StudentSchema);


