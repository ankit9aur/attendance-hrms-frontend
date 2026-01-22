"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import DailyEntryTable from "@/components/attendance/DailyEntryTable";

export default function DailyAttendancePage() {
  return (
    <DashboardLayout>
      <DailyEntryTable />
    </DashboardLayout>
  );
}
