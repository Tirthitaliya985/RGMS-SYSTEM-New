// api/billApi.js
import api from "./api";

export const generateBills = (data) => api.post("/society/bills/generate", data);
export const getBills = () => api.get("/society/bills");
export const updateBillStatus = (id, data) =>
  api.put(`/society/bills/${id}`, data);
export const deleteBill = (id) => api.delete(`/society/bills/${id}`);
