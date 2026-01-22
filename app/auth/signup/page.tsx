"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });

  const submit = async () => {
    await api.post("/auth/register/", form);
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-6 rounded w-80">
        <h2 className="text-xl mb-4">Sign Up</h2>

        <input
          className="w-full p-2 mb-3 bg-gray-800"
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          className="w-full p-2 mb-3 bg-gray-800"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button onClick={submit} className="bg-blue-600 w-full py-2 rounded">
          Create Account
        </button>
      </div>
    </div>
  );
}
