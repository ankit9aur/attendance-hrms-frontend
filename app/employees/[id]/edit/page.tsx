"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/services/api";

export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    designation: "",
    employee_code: "",
    joining_date: "",
    is_active: true,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get(`/employees/${id}/`);
      setForm({
        name: res.data.name,
        designation: res.data.designation,
        employee_code: res.data.employee_code,
        joining_date: res.data.joining_date,
        is_active: res.data.is_active,
      });
    } catch (e) {
      alert("Failed to load employee");
      router.push("/employees");
    }
    setLoading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/employees/${id}/`, form);
      router.push("/employees");
    } catch (e) {
      alert("Failed to save employee");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl mb-4">Edit Employee</h1>

      <div className="max-w-xl space-y-4">
        <div>
          <label className="text-sm">Name</label>
          <input
            className="w-full bg-gray-800 p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm">Employee Code</label>
          <input
            className="w-full bg-gray-800 p-2 rounded"
            value={form.employee_code}
            disabled
          />
        </div>

        <div>
          <label className="text-sm">Designation</label>
          <input
            className="w-full bg-gray-800 p-2 rounded"
            value={form.designation}
            onChange={(e) =>
              setForm({ ...form, designation: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm">Joining Date</label>
          <input
            type="date"
            className="w-full bg-gray-800 p-2 rounded"
            value={form.joining_date}
            onChange={(e) =>
              setForm({ ...form, joining_date: e.target.value })
            }
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
