"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/employees", label: "Employees" },
  { href: "/attendance/daily", label: "Daily Attendance" },
  { href: "/attendance/monthly", label: "Monthly Report" },
  { href: "/reports/payroll", label: "Payroll" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/auth/login");
  };

  return (
    <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6">HR Dashboard</h2>

      <nav className="flex-1 space-y-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`block px-3 py-2 rounded ${
              pathname === l.href ? "bg-blue-600" : "hover:bg-slate-700"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-4 bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
      >
        Logout
      </button>
    </aside>
  );
}
