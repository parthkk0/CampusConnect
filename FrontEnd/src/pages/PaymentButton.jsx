import React from "react";

function PaymentButton({ amount, receipt, userId }) {
  
  async function pay(amountInRupees, receipt, userId) {
    /* paste entire pay() function here */
  }

  return (
    <button
      onClick={() => pay(amount, receipt, userId)}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Pay
    </button>
  );
}

export default PaymentButton;
