const mongoose = require('mongoose');

const EidSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  cardId: { type: String, unique: true, required: true },
  issuedAt: { type: Date, default: Date.now },
  validTill: { type: Date, required: true },
  status: { type: String, enum: ['active','expired','revoked'], default: 'active' }
});

module.exports = mongoose.model('Eid', EidSchema);
