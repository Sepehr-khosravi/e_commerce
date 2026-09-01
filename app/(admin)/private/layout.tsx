"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/adminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-50 overflow-x-hidden"
    >
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <AdminSidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        {/* Content */}
        <div
          className="
            min-w-0 flex-1
            transition-all duration-300 ease-in-out
          "
        >
          <div className="mx-auto max-w-7xl p-5 sm:p-8">
            {children}
          </div>
        </div>

      </div>
    </main>
  );
}