import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attendance HRMS",
  description: "HR Attendance Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
