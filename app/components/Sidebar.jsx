"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItem = (href, label) => {
    const active = pathname === href;

    return (
      <Link href={href}>
        <div
          className={`px-3 py-2 rounded cursor-pointer transition ${
            active
              ? "bg-pink-600 text-white"
              : "hover:bg-gray-800"
          }`}
        >
          {label}
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-[#1f1f1f] text-white min-h-screen p-4">
      <h1 className="text-lg font-bold mb-6">
        Jewellery ERP
      </h1>

      <nav className="space-y-2 text-sm">
        <p className="text-gray-400 uppercase text-xs mt-4">
          Dashboards
        </p>

        {menuItem("/dashboard", "Analytics")}
        {menuItem("/billing", "Billing")}
        {menuItem("/stock", "Stock Maintain")}
        {menuItem("/alerts", "Alerts")}
        {menuItem("/customers", "Customer")}

        <p className="text-gray-400 uppercase text-xs mt-6">
          Account
        </p>

        {menuItem("/settings", "Settings")}
        {menuItem("/profile", "Profile")}
      </nav>
    </aside>
  );
}
