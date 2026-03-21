import React from "react";
import { BACKEND_URL } from "./config";

export default function TestPay() {

  async function payTest() {
    const res = await fetch(`${BACKEND_URL}/pay/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 10000,
        receipt: "test1"
      })
    });

    const data = await res.json();
    console.log("ORDER:", data);

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      order_id: data.id,
      name: "Campus Connect",
      handler: function () {
        alert("Payment success!");
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <button onClick={payTest} style={{ padding: "10px", background: "blue", color: "white" }}>
      Test Razorpay
    </button>
  );
}
