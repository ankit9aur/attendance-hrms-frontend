"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import MonthlyGrid from "@/components/attendance/MonthlyGrid";

export default function MonthlyAttendancePage() {
  return (
    <DashboardLayout>
      <MonthlyGrid />
    </DashboardLayout>
  );
}
