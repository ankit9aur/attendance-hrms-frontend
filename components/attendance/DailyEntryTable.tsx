"use client";
import { useEffect, useState } from "react";
import { getEmployees } from "@/services/employee.service";
import {
  bulkAttendance,
  biometricUploadAttendance,
} from "@/services/attendance.service";
type Employee = {
  id: number;
  name: string;
  employee_code: string;
};
const STANDARD = 9;
const HALF = 6;
export default function DailyEntryTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [date, setDate] = useState("");
  const [entries, setEntries] = useState<
    Record<number, { in?: string; out?: string }>
  >({});
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  useEffect(() => {
    loadEmployees();
  }, []);
  const loadEmployees = async () => {
    const res = await getEmployees({active: "true"});
    setEmployees(res);
  };
  // ---------------- Time calc ----------------
  const diffHours = (i?: string, o?: string) => {
    if (!i || !o) return 0;
    const [ih, im] = i.split(":").map(Number);
    const [oh, om] = o.split(":").map(Number);
    const mins = oh * 60 + om - (ih * 60 + im);
    return mins > 0 ? +(mins / 60).toFixed(2) : 0;
  };
  const compute = (id: number) => {
    const r = entries[id] || {};
    const work = diffHours(r.in, r.out);
    const ot = Math.max(0, work - STANDARD);
    const ut = Math.max(0, STANDARD - work);
    let status = "ABSENT";
    if (work >= STANDARD) status = "PRESENT";
    else if (work >= HALF) status = "HALF";
    return { work, ot, ut, status };
  };
  // ---------------- CSV Upload → Backend ----------------
  const uploadCSV = async (file: File) => {
    console.log("Uploading file:", file);
    if (!date) {
      alert("Please select date first");
      return;
    }
    const text = await file.text();
    const lines = text.split("\n").slice(1);
    console.log("CSV Lines:", lines);
    const entriesPayload: any[] = [];
    lines
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [
          employee_code,
          employee_name,
          designation,
          check_in,
          check_out,
        ] = line.split(",");
        entriesPayload.push({
          employee_code: employee_code?.trim(),
          employee_name: employee_name?.trim(),
          designation: designation?.trim(),
          check_in: check_in?.trim(),
          check_out: check_out?.trim(),
        });
      });
    console.log("Sending payload:", entriesPayload);
    try {
      const res = await biometricUploadAttendance({
        date,
        entries: entriesPayload,
      });
      console.log("Backend response:", res);
      setUploadResult(res);
      await loadEmployees();
      alert("Biometric upload processed. See summary below.");
    } catch (err) {
      console.error(err);
      alert("CSV upload failed");
    }
  };
  // ---------------- Save Manual Attendance ----------------
  const submit = async () => {
    if (!date) {
      alert("Please select date");
      return;
    }
    setLoading(true);
    const payload = {
      date,
      entries: employees.map((e) => ({
        employee_id: e.id,
        check_in: entries[e.id]?.in || null,
        check_out: entries[e.id]?.out || null,
      })),
    };
    try {
      await bulkAttendance(payload);
      alert("Attendance saved successfully");
    } catch (err) {
      alert("Failed to save attendance");
    }
    setLoading(false);
  };
  return (
    <div>
      <h1 className="text-2xl mb-4">Daily Attendance</h1>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <input
          type="date"
          className="bg-gray-800 p-2 rounded"
          onChange={(e) => setDate(e.target.value)}
        />
        {/* ✅ Correct File Upload */}
        <label
          htmlFor="biometric-upload"
          className="bg-purple-700 px-4 py-2 rounded cursor-pointer"
        >
          Upload Biometric CSV
        </label>
        <input
          id="biometric-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) uploadCSV(e.target.files[0]);
          }}
        />
      </div>
      {/* Upload Result */}
      {uploadResult && (
        <div className="bg-gray-900 border border-gray-700 p-4 rounded mb-4 text-sm space-y-1">
          <div className="text-green-400">
            ✔ Employees Created: {uploadResult.created_employees}
          </div>
          <div className="text-blue-400">
            ✔ Attendance Saved: {uploadResult.saved_attendance}
          </div>
          {uploadResult.skipped?.length > 0 && (
            <div className="text-yellow-400">
              ⚠ Skipped Rows: {uploadResult.skipped.length}
            </div>
          )}
        </div>
      )}
      {/* Table */}
      <div className="overflow-auto border border-gray-700 rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-2 border">Employee</th>
              <th className="p-2 border">Code</th>
              <th className="p-2 border">Check In</th>
              <th className="p-2 border">Check Out</th>
              <th className="p-2 border">Work</th>
              <th className="p-2 border">OT</th>
              <th className="p-2 border">UT</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => {
              const c = compute(e.id);
              return (
                <tr key={e.id} className="hover:bg-gray-800">
                  <td className="p-2 border">{e.name}</td>
                  <td className="p-2 border">{e.employee_code}</td>
                  <td className="p-2 border">
                    <input
                      type="time"
                      className="bg-gray-900 p-1 rounded"
                      value={entries[e.id]?.in || ""}
                      onChange={(ev) =>
                        setEntries({
                          ...entries,
                          [e.id]: { ...entries[e.id], in: ev.target.value },
                        })
                      }
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="time"
                      className="bg-gray-900 p-1 rounded"
                      value={entries[e.id]?.out || ""}
                      onChange={(ev) =>
                        setEntries({
                          ...entries,
                          [e.id]: { ...entries[e.id], out: ev.target.value },
                        })
                      }
                    />
                  </td>
                  <td className="p-2 border text-center">{c.work}</td>
                  <td className="p-2 border text-center">{c.ot}</td>
                  <td className="p-2 border text-center">{c.ut}</td>
                  <td
                    className={`p-2 border text-center font-semibold ${
                      c.status === "PRESENT"
                        ? "text-green-400"
                        : c.status === "HALF"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {c.status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        onClick={submit}
        disabled={loading}
        className="mt-4 bg-blue-600 px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Attendance"}
      </button>
    </div>
  );
}