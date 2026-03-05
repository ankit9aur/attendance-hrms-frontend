"use client";
import { useEffect, useState } from "react";
import {
  getHolidays,
  createHoliday,
  deleteHoliday,
} from "@/services/holiday.service";
export default function HolidayManager() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [isOptional, setIsOptional] = useState(false);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    const data = await getHolidays();
    setHolidays(data);
  };
  useEffect(() => {
    load();
  }, []);
  const addHoliday = async () => {
    if (!date || !name) {
      alert("Date and name required");
      return;
    }
    setLoading(true);
    await createHoliday({ date, name, is_optional: isOptional });
    setDate("");
    setName("");
    setIsOptional(false);
    await load();
    setLoading(false);
  };
  const removeHoliday = async (id: number) => {
    if (!confirm("Delete holiday?")) return;
    await deleteHoliday(id);
    load();
  };
  return (
    <div>
      <h1 className="text-2xl mb-4">Holiday Management</h1>
      {/* Add form */}
      <div className="flex gap-2 mb-6">
        <input
          type="date"
          className="bg-gray-800 p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Holiday name"
          className="bg-gray-800 p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={isOptional}
            onChange={(e) => setIsOptional(e.target.checked)}
          />
          <label>Optional</label>
        </div>
        <button
          onClick={addHoliday}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          {loading ? "Adding..." : "Add Holiday"}
        </button>
      </div>
      {/* Table */}
      <table className="w-full border border-gray-700 text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Optional</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((h) => (
            <tr key={h.id}>
              <td className="p-2 border">{h.date}</td>
              <td className="p-2 border">{h.name}</td>
              <td className="p-2 border">{h.is_optional ? "Yes" : "No"}</td>
              <td className="p-2 border">
                <button
                  onClick={() => removeHoliday(h.id)}
                  className="bg-red-600 px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}