"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/services/api";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    employees: 0,
    present: 0,
    absent: 0,
    hours: 0,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const today = new Date().toISOString().slice(0, 10);

    const [empRes, attRes] = await Promise.all([
      api.get("/employees/"),
      api.get("/attendance/daily/", { params: { date: today } }),
    ]);

    const employees = empRes.data.length;
    const records = attRes.data;

    let present = 0;
    let hours = 0;

    records.forEach((r: any) => {
      if (r.status === "PRESENT" || r.status === "HALF") present++;
      hours += r.work_hours;
    });

    setStats({
      employees,
      present,
      absent: employees - present,
      hours: Number(hours.toFixed(1)),
    });
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card title="Total Employees" value={stats.employees} color="bg-blue-600" />
        <Card title="Present Today" value={stats.present} color="bg-green-600" />
        <Card title="Absent Today" value={stats.absent} color="bg-red-600" />
        <Card title="Total Hours Today" value={stats.hours} color="bg-purple-600" />
      </div>
    </DashboardLayout>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`${color} rounded-xl p-5 shadow`}>
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}
