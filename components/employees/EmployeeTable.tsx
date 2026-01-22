"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { getEmployees } from "@/services/employee.service";

type Employee = {
  id: number;
  name: string;
  employee_code: string;
  designation: string;
};

export default function EmployeeTable() {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    const res = await getEmployees();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const deactivate = async (id: number) => {
    const ok = confirm("Are you sure you want to deactivate this employee?");
    if (!ok) return;

    try {
      await api.patch(`/employees/${id}/`, { is_active: false });
      await load();
    } catch (e) {
      alert("Failed to deactivate employee");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Employees</h1>

        <button
          onClick={() => router.push("/employees/add")}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          + Add Employee
        </button>
      </div>

      <table className="w-full border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Code</th>
            <th className="p-2 border">Designation</th>
            <th className="p-2 border text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((e) => (
            <tr key={e.id} className="hover:bg-gray-800">
              <td className="p-2 border">{e.name}</td>
              <td className="p-2 border">{e.employee_code}</td>
              <td className="p-2 border">{e.designation}</td>

              <td className="p-2 border text-center space-x-2">
                <button
                  className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-sm"
                  onClick={() => router.push(`/employees/${e.id}/edit`)}
                >
                  Edit
                </button>

                <button
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
                  onClick={() => deactivate(e.id)}
                >
                  Deactivate
                </button>
              </td>
            </tr>
          ))}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-400">
                No employees found
              </td>
            </tr>
          )}

          {loading && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-400">
                Loading...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
