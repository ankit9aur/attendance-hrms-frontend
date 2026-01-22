"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  employeeName: string;
  dateLabel: string;
  initialIn?: string;
  initialOut?: string;
  onSave: (checkIn: string, checkOut: string) => void;
};

const STANDARD = 8;
const HALF = 4;

export default function AttendanceModal({
  open,
  onClose,
  employeeName,
  dateLabel,
  initialIn = "",
  initialOut = "",
  onSave,
}: Props) {
  const [checkIn, setCheckIn] = useState(initialIn);
  const [checkOut, setCheckOut] = useState(initialOut);

  useEffect(() => {
    setCheckIn(initialIn);
    setCheckOut(initialOut);
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

  let status = "ABSENT";
  if (work >= STANDARD) status = "PRESENT";
  else if (work >= HALF) status = "HALF";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl w-full max-w-md p-6 space-y-4 border border-gray-700">
        <h2 className="text-xl font-semibold">Attendance Entry</h2>

        <div className="text-sm text-gray-400">
          <div><b>Employee:</b> {employeeName}</div>
          <div><b>Date:</b> {dateLabel}</div>
        </div>

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

        <div className="bg-gray-800 rounded p-3 text-sm space-y-1">
          <div>Work Hours: <b>{work}</b></div>
          <div>Overtime: <b>{ot}</b></div>
          <div>Undertime: <b>{ut}</b></div>
          <div>
            Status:{" "}
            <b
              className={
                status === "PRESENT"
                  ? "text-green-400"
                  : status === "HALF"
                  ? "text-yellow-400"
                  : "text-red-400"
              }
            >
              {status}
            </b>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(checkIn, checkOut)}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
