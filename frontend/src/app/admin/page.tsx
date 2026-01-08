"use client";
import AdminGuard from "@/components/AdminGuard";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import AuthGuard from "@/components/authguard";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function AdminHomePage() {
  return (
    <AuthGuard>
      <AdminGuard>
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex flex-1">
        <Sidebar />
        <div className="w-full px-8 py-6">
          <AnalyticsDashboard />
        </div>
      </main>
    </div>
    </AdminGuard>
    </AuthGuard>
  );
}