import React from "react";
import { loadRazorpayScript } from "@/utils/razorpay";

const RazorpayCheckout = ({ order, onSuccess }) => {
  const openRazorpay = async () => {
    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.REACT_APP_RAZORPAY_KEY_ID || "";
    const razorpayReady = await loadRazorpayScript();
    if (!razorpayReady) {
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Society Management",
      description: "Maintenance Payment",
      order_id: order.id,
      handler: function (response) {
        onSuccess(response);
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button onClick={openRazorpay}>
      Pay Now
    </button>
  );
};

export default RazorpayCheckout;
