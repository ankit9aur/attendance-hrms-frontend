"use client";

import { useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/auth/signup/", {
        username,
        email,
        password,
      });
      alert("Account created. Please login.");
      router.push("/auth/login");
    } catch (err: any) {
      alert("Signup failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-6 rounded w-80 space-y-3">
        <h1 className="text-xl font-bold text-white">Sign Up</h1>

        <input
          placeholder="Username"
          className="w-full p-2 bg-gray-800"
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input
          placeholder="Email"
          className="w-full p-2 bg-gray-800"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 bg-gray-800"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-blue-600 p-2 rounded"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}
