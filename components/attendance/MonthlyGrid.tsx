"use client";
import { useEffect, useMemo, useState } from "react";
import {
  getMonthlyAttendance,
  bulkAttendance,
  deleteAttendance,
} from "@/services/attendance.service";
import AttendanceModal from "./AttendanceModal";
type Employee = {
  id: number;
  name: string;
  designation: string;
  joining_date: string;
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
type OffDay = {
  date: string;
  name: string;
  is_optional: boolean;
};
export default function MonthlyGrid() {
  const [month, setMonth] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<Record<string, Attendance>>({});
  const [offDays, setOffDays] = useState<Record<string, OffDay>>({});
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
  // ✅ LOAD DATA
  const load = async () => {
    if (!month) return;
    const attRes = await getMonthlyAttendance(month);
    // attendance map
    const map: Record<string, Attendance> = {};
    attRes.records.forEach((a: Attendance) => {
      const d = new Date(a.date).getDate();
      map[`${a.employee}-${d}`] = a;
    });
    // off days map (month filtered)
    const hmap: Record<string, OffDay> = {};
    attRes.off_days.forEach((h: OffDay) => {
      const d = new Date(h.date).getDate();
      hmap[`${d}`] = h;
    });
    setEmployees(attRes.employees);
    setRecords(map);
    setOffDays(hmap);
  };
  useEffect(() => {
    if (month) load();
  }, [month]);
  // ✅ SUMMARY (holiday aware)
  const summary = (emp: Employee) => {
    let total = 0,
      ot = 0,
      ut = 0,
      p = 0,
      h = 0,
      a = 0;
    const joining = new Date(emp.joining_date);
    for (let d = 1; d <= daysInMonth; d++) {
      const fullDateStr = `${month}-${d.toString().padStart(2, '0')}`;
      const fullDate = new Date(fullDateStr);
      if (fullDate < joining) continue;
      const r = records[`${emp.id}-${d}`];
      const isHoliday = !!offDays[`${d}`];
      if (r) {
        total += r.work_hours;
        ot += r.overtime;
        ut += r.undertime;
        if (r.status === "PRESENT") p++;
        else if (r.status === "HALF") h++;
        else if (r.status === "ABSENT" && !isHoliday) a++;
      } else {
        if (!isHoliday) a++;
      }
    }
    return {
      total: total.toFixed(1),
      ot: ot.toFixed(1),
      ut: ut.toFixed(1),
      p,
      h,
      a,
    };
  };
  // ✅ CELL COLOR
  const cellColor = (
    status?: string,
    isHoliday?: boolean,
    worked?: boolean
  ) => {
    if (isHoliday && !worked) return "bg-purple-700/30";
    if (isHoliday && worked) return "bg-purple-900/40";
    if (status === "PRESENT") return "bg-green-700/30";
    if (status === "HALF") return "bg-yellow-700/30";
    if (status === "ABSENT") return "bg-red-700/30";
    return "";
  };
  // ✅ CSV EXPORT (holiday aware)
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
      const s = summary(e);
      const days: string[] = [];
      const joining = new Date(e.joining_date);
      for (let d = 1; d <= daysInMonth; d++) {
        const fullDateStr = `${month}-${d.toString().padStart(2, '0')}`;
        const fullDate = new Date(fullDateStr);
        if (fullDate < joining) {
          days.push("PRE-JOIN");
          continue;
        }
        const r = records[`${e.id}-${d}`];
        const holiday = offDays[`${d}`];
        if (holiday && !r) {
          days.push(holiday.name.toUpperCase());
        } else if (holiday && r && r.work_hours > 0) {
          days.push(`${holiday.name.toUpperCase()} OT (${r.overtime}h)`);
        } else if (r) {
          days.push(`${r.status} (${r.work_hours}h)`);
        } else {
          days.push("ABSENT");
        }
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
  const saveEntry = async (checkIn: string, checkOut: string, manual: boolean, manualStatus: string, work: number, ot: number, ut: number) => {
    if (!active) return;
    const entry = {
      employee_id: active.empId,
    };
    if (manual) {
      Object.assign(entry, {
        check_in: null,
        check_out: null,
        status: manualStatus,
        work_hours: work,
        overtime: ot,
        undertime: ut,
      });
    } else {
      Object.assign(entry, {
        check_in: checkIn || null,
        check_out: checkOut || null,
      });
    }
    const payload = {
      date: `${month}-${String(active.day).padStart(2, "0")}`,
      entries: [entry],
    };
    await bulkAttendance(payload);
    setActive(null);
    await load();
  };
  const deleteEntry = async () => {
    if (!active) return;
    const key = `${active.empId}-${active.day}`;
    const recId = records[key]?.id;
    if (recId) {
      await deleteAttendance(recId);
    }
    setActive(null);
    await load();
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
              const s = summary(e);
              const joining = new Date(e.joining_date);
              return (
                <tr key={e.id}>
                  <td className="p-2 border text-center">{i + 1}</td>
                  <td className="p-2 border">{e.name}</td>
                  <td className="p-2 border">{e.designation}</td>
                  {[...Array(daysInMonth)].map((_, d) => {
                    const day = d + 1;
                    const fullDateStr = `${month}-${day.toString().padStart(2, '0')}`;
                    const fullDate = new Date(fullDateStr);
                    if (fullDate < joining) {
                      return (
                        <td
                          key={day}
                          className="p-1 border bg-gray-900/50"
                        >
                          <div className="text-center text-xs font-semibold opacity-50">
                            PRE-JOIN
                          </div>
                        </td>
                      );
                    }
                    const r = records[`${e.id}-${day}`];
                    const holiday = offDays[`${day}`];
                    const worked = (r?.work_hours || 0) > 0;
                    let label = "";
                    if (holiday && !r) label = holiday.name.toUpperCase();
                    else if (holiday && worked)
                      label = `${holiday.name.toUpperCase()} OT ${r?.overtime ?? 0}`;
                    else if (r) label = r.status;
                    return (
                      <td
                        key={day}
                        className={`p-1 border cursor-pointer hover:bg-gray-700 ${cellColor(
                          r?.status,
                          !!holiday,
                          worked
                        )}`}
                        onClick={() =>
                          setActive({
                            empId: e.id,
                            day,
                            empName: e.name,
                          })
                        }
                      >
                        <div className="text-center text-xs font-semibold">
                          {label}
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
          initialOut={
            records[`${active.empId}-${active.day}`]?.check_out || ""
          }
          initialId={records[`${active.empId}-${active.day}`]?.id}
          onSave={saveEntry}
          onDelete={deleteEntry}
        />
      )}
    </div>
  );
}