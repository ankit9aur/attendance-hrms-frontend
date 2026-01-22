// services/auth.service.ts
import api from "./api";

export const login = async (username: string, password: string) => {
  const res = await api.post("/auth/login/", { username, password });

  if (typeof window !== "undefined") {
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
  }

  return res.data;
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }
};
