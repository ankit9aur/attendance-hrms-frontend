"use client";
import { useEffect, useState } from "react";
import { STANDARD_DAY_HOURS, statusFromWorkedHours } from "@/lib/attendance-status";
type Props = {
  open: boolean;
  onClose: () => void;
  employeeName: string;
  dateLabel: string;
  initialIn?: string;
  initialOut?: string;
  initialId?: number;
  onSave: (checkIn: string, checkOut: string, manual: boolean, status: string, work: number, ot: number, ut: number) => void;
  onDelete: () => void;
};
const STANDARD = STANDARD_DAY_HOURS;
const NOMINAL_HALF_WORK = 5;
export default function AttendanceModal({
  open,
  onClose,
  employeeName,
  dateLabel,
  initialIn = "",
  initialOut = "",
  initialId,
  onSave,
  onDelete,
}: Props) {
  const [checkIn, setCheckIn] = useState(initialIn);
  const [checkOut, setCheckOut] = useState(initialOut);
  const [manual, setManual] = useState(false);
  const [status, setStatus] = useState("ABSENT");
  const [workHours, setWorkHours] = useState(0);
  const [overtime, setOvertime] = useState(0);
  const [undertime, setUndertime] = useState(0);
  useEffect(() => {
    setCheckIn(initialIn);
    setCheckOut(initialOut);
    setManual(false);
    setStatus("ABSENT");
    setWorkHours(0);
    setOvertime(0);
    setUndertime(0);
  }, [initialIn, initialOut]);
  if (!open) return null;
  const diffHours = () => {
    if (!checkIn || !checkOut) return 0;
    const [ih, im] = checkIn.split(":").map(Number);
    const [oh, om] = checkOut.split(":").map(Number);
    const mins = oh * 60 + om - (ih * 60 + im);
    return mins > 0 ? +(mins / 60).toFixed(2) : 0;
  };
  const work = diffHours();
  const ot = Math.max(0, work - STANDARD);
  const ut = Math.max(0, STANDARD - work);
  const autoStatus = statusFromWorkedHours(work);
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus === "PRESENT") {
      setWorkHours(STANDARD);
      setOvertime(0);
      setUndertime(0);
    } else if (newStatus === "HALF") {
      setWorkHours(NOMINAL_HALF_WORK);
      setOvertime(0);
      setUndertime(STANDARD - NOMINAL_HALF_WORK);
    } else if (newStatus === "ABSENT") {
      setWorkHours(0);
      setOvertime(0);
      setUndertime(STANDARD);
    }
  };
  const save = () => {
    onSave(checkIn, checkOut, manual, status, workHours, overtime, undertime);
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-md p-6 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold">Attendance Entry</h2>
        <div className="text-sm text-gray-400">
          <div><b>Employee:</b> {employeeName}</div>
          <div><b>Date:</b> {dateLabel}</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={manual}
            onChange={(e) => setManual(e.target.checked)}
          />
          <label>Manual Override</label>
        </div>
        {!manual ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Check In</label>
              <input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-gray-800 p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Check Out</label>
              <input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-gray-800 p-2 rounded mt-1"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm">Status</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-gray-800 p-2 rounded mt-1"
              >
                <option value="PRESENT">Present</option>
                <option value="HALF">Half Day</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Work Hours</label>
              <input
                type="number"
                value={workHours}
                onChange={(e) => setWorkHours(Number(e.target.value))}
                className="w-full bg-gray-800 p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Overtime</label>
              <input
                type="number"
                value={overtime}
                onChange={(e) => setOvertime(Number(e.target.value))}
                className="w-full bg-gray-800 p-2 rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm">Undertime</label>
              <input
                type="number"
                value={undertime}
                onChange={(e) => setUndertime(Number(e.target.value))}
                className="w-full bg-gray-800 p-2 rounded mt-1"
              />
            </div>
          </div>
        )
        }
        {!manual && (
          <div className="bg-gray-800 rounded p-3 text-sm space-y-1">
            <div>Work Hours: <b>{work}</b></div>
            <div>Overtime: <b>{ot}</b></div>
            <div>Undertime: <b>{ut}</b></div>
            <div>
              Status:{" "}
              <b
                className={
                  autoStatus === "PRESENT"
                    ? "text-green-400"
                    : autoStatus === "HALF"
                    ? "text-yellow-400"
                    : "text-red-400"
                }
              >
                {autoStatus}
              </b>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            Cancel
          </button>
          {initialId && (
            <button
              onClick={onDelete}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          )}
          <button
            onClick={save}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}