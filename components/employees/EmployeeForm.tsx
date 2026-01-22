"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function EmployeeForm() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [designation, setDesignation] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

  const router = useRouter();

  const submit = async () => {
    if (!name || !code || !designation || !joiningDate) {
      alert("All fields required");
      return;
    }

    await api.post("/employees/", {
      name,
      employee_code: code,
      designation,
      joining_date: joiningDate,
    });

    router.push("/employees");
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl mb-4">Add Employee</h1>

      <div className="space-y-4">
        <input
          placeholder="Name"
          className="w-full bg-gray-800 p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Employee Code"
          className="w-full bg-gray-800 p-2 rounded"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          placeholder="Designation"
          className="w-full bg-gray-800 p-2 rounded"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
        />

        <input
          type="date"
          className="w-full bg-gray-800 p-2 rounded"
          value={joiningDate}
          onChange={(e) => setJoiningDate(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
