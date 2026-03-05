import api from "./api";
export const getEmployees = async (params = {}) => {
  const res = await api.get("/employees/", { params });
  return res.data;
};
export const addEmployee = async (payload: any) => {
  const res = await api.post("/employees/", payload);
  return res.data;
};