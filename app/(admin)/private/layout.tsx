"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/adminSidebar";
import Loading from "@/app/loading";
import { DashboardData } from "@/components/admin/AdminDashboard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const loadDashboard = async () =>{
    try{
      const response = await fetch("/api/admin/", 
        {
          cache : "no-store"
        }
      );
      switch(response.status){
        case 401 : {
          window.location.href = "/login";
        };
        case 403 : {
          window.location.href = "/403";
        }
      };

      if(!response.ok){
        throw new Error("Failed to load dashboard!");
      };

      const data = await response.json();

      setDashboard(data);
    }
    catch(e){
      console.error(
        "Admin dashboard error : ",
        e
      );
    }
    finally{
      setTimeout(()=>{
        setLoading(false);
      }, 2000);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);


  return (
      isLoading ? <Loading /> :
      (
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
      )
  );
}