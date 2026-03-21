const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    receipt: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    transactionId: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    status: {
        type: String,
        enum: ["created", "paid", "failed"],
        default: "created"
    },
    purpose: {
        type: String,
        enum: ["eid_generation", "fee_payment", "other"],
        default: "other"
    },
    paymentMethod: {
        type: String,
        enum: ["upi_qr", "upi_id", "upi_intent", "other"],
        default: "upi_qr"
    },
    upiId: {
        type: String,
        default: null
    },
    upiRef: {
        type: String,
        default: null
    },
    meta: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Payment", PaymentSchema);
