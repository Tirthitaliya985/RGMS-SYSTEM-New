import api from "./api";

export const getMyBills = () => api.get("/resident/bills");
export const createRazorpayOrder = (data) => api.post("/resident/bills/razorpay/order", data);
export const verifyPayment = (data) => api.post("/resident/bills/razorpay/verify", data);
