"use client";

import { useEffect, useMemo, useState } from "react";
import { getEmployees } from "@/services/employee.service";
import {
  getMonthlyAttendance,
  bulkAttendance,
} from "@/services/attendance.service";
import AttendanceModal from "./AttendanceModal";

type Employee = {
  id: number;
  name: string;
  designation: string;
};

type Attendance = {
  id: number;
  employee: number;
  employee_name: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: number;
  overtime: number;
  undertime: number;
  status: string;
};

export default function MonthlyGrid() {
  const [month, setMonth] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Record<string, Attendance>>({});

  const [active, setActive] = useState<{
    empId: number;
    day: number;
    empName: string;
  } | null>(null);

  const daysInMonth = useMemo(() => {
    if (!month) return 31;
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  }, [month]);

  const load = async () => {
    if (!month) return;

    const [emps, att] = await Promise.all([
      getEmployees(),
      getMonthlyAttendance(month),
    ]);

    const map: Record<string, Attendance> = {};
    att.forEach((a: Attendance) => {
      const d = new Date(a.date).getDate();
      map[`${a.employee}-${d}`] = a;
    });

    setEmployees(emps);
    setRecords(map);
  };

  useEffect(() => {
    if (month) load();
  }, [month]);

  const summary = (empId: number) => {
    let total = 0,
      ot = 0,
      ut = 0,
      p = 0,
      h = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const r = records[`${empId}-${d}`];
      if (r) {
        total += r.work_hours;
        ot += r.overtime;
        ut += r.undertime;
        if (r.status === "PRESENT") p++;
        if (r.status === "HALF") h++;
      }
    }

    return {
      total: total.toFixed(1),
      ot: ot.toFixed(1),
      ut: ut.toFixed(1),
      p,
      h,
      a: daysInMonth - p - h,
    };
  };

  const exportCSV = () => {
    if (!month) return;

    const headers = [
      "S.No",
      "Name",
      "Designation",
      ...Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`),
      "Total",
      "OT",
      "UT",
      "Present",
      "Half",
      "Absent",
    ];

    const rows: string[] = [];
    rows.push(headers.join(","));

    employees.forEach((e, idx) => {
      const s = summary(e.id);
      const days: string[] = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const r = records[`${e.id}-${d}`];
        days.push(r ? `${r.status} (${r.work_hours}h)` : "");
      }

      rows.push(
        [
          idx + 1,
          e.name,
          e.designation,
          ...days,
          s.total,
          s.ot,
          s.ut,
          s.p,
          s.h,
          s.a,
        ].join(",")
      );
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveEntry = async (checkIn: string, checkOut: string) => {
    if (!active) return;

    const payload = {
      date: `${month}-${String(active.day).padStart(2, "0")}`,
      entries: [
        {
          employee_id: active.empId,
          check_in: checkIn || null,
          check_out: checkOut || null,
        },
      ],
    };

    await bulkAttendance(payload);
    setActive(null);
    await load();
  };

  const cellColor = (status?: string) => {
    if (status === "PRESENT") return "bg-green-700/30";
    if (status === "HALF") return "bg-yellow-700/30";
    if (status === "ABSENT") return "bg-red-700/30";
    return "";
  };

  return (
    <div>
      <h1 className="text-2xl mb-4 print:text-black">
        Monthly Attendance — {month}
      </h1>

      <div className="flex gap-3 items-center mb-4 print:hidden">
        <input
          type="month"
          className="bg-gray-800 p-2 rounded"
          onChange={(e) => setMonth(e.target.value)}
        />
        <button onClick={load} className="bg-blue-600 px-4 py-2 rounded">
          Load
        </button>

        <button
          onClick={exportCSV}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Export CSV
        </button>

        <button
          onClick={() => window.print()}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      <div className="overflow-auto border border-gray-700 rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="p-2 border">S.No</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Designation</th>

              {[...Array(daysInMonth)].map((_, i) => (
                <th key={i} className="p-2 border text-center">
                  {i + 1}
                </th>
              ))}

              <th className="p-2 border">Total</th>
              <th className="p-2 border">OT</th>
              <th className="p-2 border">UT</th>
              <th className="p-2 border">P</th>
              <th className="p-2 border">H</th>
              <th className="p-2 border">A</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((e, i) => {
              const s = summary(e.id);
              return (
                <tr key={e.id}>
                  <td className="p-2 border text-center">{i + 1}</td>
                  <td className="p-2 border">{e.name}</td>
                  <td className="p-2 border">{e.designation}</td>

                  {[...Array(daysInMonth)].map((_, d) => {
                    const day = d + 1;
                    const r = records[`${e.id}-${day}`];

                    return (
                      <td
                        key={day}
                        className={`p-1 border cursor-pointer hover:bg-gray-700 ${cellColor(
                          r?.status
                        )}`}
                        onClick={() =>
                          setActive({
                            empId: e.id,
                            day,
                            empName: e.name,
                          })
                        }
                      >
                        <div className="text-center text-xs">
                          {r ? r.status : ""}
                        </div>
                        <div className="text-center text-[10px] opacity-70">
                          {r ? `${r.work_hours}h` : ""}
                        </div>
                      </td>
                    );
                  })}

                  <td className="p-2 border text-center">{s.total}</td>
                  <td className="p-2 border text-center">{s.ot}</td>
                  <td className="p-2 border text-center">{s.ut}</td>
                  <td className="p-2 border text-center">{s.p}</td>
                  <td className="p-2 border text-center">{s.h}</td>
                  <td className="p-2 border text-center">{s.a}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {active && (
        <AttendanceModal
          open={true}
          onClose={() => setActive(null)}
          employeeName={active.empName}
          dateLabel={`${month}-${String(active.day).padStart(2, "0")}`}
          initialIn={records[`${active.empId}-${active.day}`]?.check_in || ""}
          initialOut={records[`${active.empId}-${active.day}`]?.check_out || ""}
          onSave={saveEntry}
        />
      )}
    </div>
  );
}
