"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const res = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);
    router.push("/employees");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-6 rounded w-80">
        <h2 className="text-xl mb-4">Login</h2>

        <input
          className="w-full p-2 mb-3 bg-gray-800"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full p-2 mb-3 bg-gray-800"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={submit} className="bg-blue-600 w-full py-2 rounded">
          Login
        </button>
      </div>
    </div>
  );
}
