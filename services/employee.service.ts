import api from "./api";

export const getEmployees = async () => {
  const res = await api.get("/employees/");
  return res.data;
};

export const addEmployee = async (payload: any) => {
  const res = await api.post("/employees/", payload);
  return res.data;
};
