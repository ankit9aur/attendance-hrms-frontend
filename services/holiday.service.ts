import api from "./api";
export const getHolidays = async () => {
  const res = await api.get("/attendance/holidays/");
  return res.data;
};
export const createHoliday = async (payload: {
  date: string;
  name: string;
  is_optional?: boolean;
}) => {
  const res = await api.post("/attendance/holidays/", payload);
  return res.data;
};
export const updateHoliday = async (id: number, payload: any) => {
  const res = await api.put(`/attendance/holidays/${id}/`, payload);
  return res.data;
};
export const deleteHoliday = async (id: number) => {
  const res = await api.delete(`/attendance/holidays/${id}/`);
  return res.data;
};