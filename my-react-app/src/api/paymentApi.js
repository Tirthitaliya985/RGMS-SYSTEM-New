import api from "./api";

export const addPayment = (data) => api.post("/society/payments", data);
export const getPayments = () => api.get("/society/payments");
export const getPaymentById = (id) => api.get(`/society/payments/${id}`);
