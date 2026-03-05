"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import HolidayManager from "@/components/holidays/HolidayManager";

export default function HolidaysPage() {
  return (
    <DashboardLayout>
      <HolidayManager />
    </DashboardLayout>
  );
}