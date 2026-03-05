import api from "./api";
// ---------------- HR Manual Bulk Entry ----------------
export const bulkAttendance = async (payload: any) => {
  const res = await api.post("/attendance/bulk-entry/", payload);
  return res.data;
};
// ---------------- ✅ Biometric CSV Upload ----------------
export const biometricUploadAttendance = async (payload: any) => {
  console.log("Sending biometric upload to backend:", payload);
  const res = await api.post("/attendance/biometric-upload/", payload);
  return res.data;
};
// ---------------- Daily View ----------------
export const getDailyAttendance = async (date: string) => {
  const res = await api.get("/attendance/daily/", { params: { date } });
  return res.data;
};
// ---------------- Monthly View ----------------
export const getMonthlyAttendance = async (month: string) => {
  const res = await api.get("/attendance/monthly/", { params: { month } });
  return res.data;
};
// ---------------- Delete Attendance ----------------
export const deleteAttendance = async (id: number) => {
  const res = await api.delete(`/attendance/attendance-records/${id}/`);
  return res.data;
};