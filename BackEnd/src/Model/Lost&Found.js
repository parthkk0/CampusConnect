const mongoose = require('mongoose');



const LostFoundSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  title: { type: String, required: true },
  description: String,
  image: { type: String }, // Base64 or URL
  location: { type: String, required: true },
  date: { type: Date, required: true },
  contactPhone: { type: String },
  reportedBy: { type: String }, // Student Roll Number
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  },
  claims: [{
    studentId: String, // Roll number
    name: String,
    at: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LostFound', LostFoundSchema);
