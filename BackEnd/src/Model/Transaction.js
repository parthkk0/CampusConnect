const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    studentId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ["credit", "debit"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["success", "failed"],
        default: "success"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
