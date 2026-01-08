"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, FolderKanban } from "lucide-react";
import AuthGuard from "@/components/authguard";

export default function CasesPage() {
  const [userName, setUserName] = useState("User");

  // Load user name from localStorage
  useEffect(() => {
    const name = localStorage.getItem("staff_name");
    if (name) setUserName(name);
  }, []);

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <main className="flex flex-1">
          <Sidebar />
          <div className="w-full pt-6 bg-[#F9FAFB]">
            <h1 className="text-4xl font-bold text-center text-gray-900 mt-2">
              Welcome, {userName}
            </h1>
            <p className="text-lg text-center text-gray-500 mb-12">
              What would you like to do today?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <Link href={"/cases/new-case"}>
                <Card className="text-center p-6 transition-transform transform hover:scale-105 hover:shadow-lg">
                  <CardHeader className="flex flex-col items-center p-0">
                    <div className="p-4 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                      <PlusCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-xl font-semibold mb-2">Submit New Case</CardTitle>
                    <CardDescription className="text-gray-500">
                      Generate an explanatory note for your case.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href={"/cases/all-cases"}>
                <Card className="text-center p-6 transition-transform transform hover:scale-105 hover:shadow-lg">
                  <CardHeader className="flex flex-col items-center p-0">
                    <div className="p-4 rounded-full bg-blue-100 text-blue-600 mb-4">
                      <FolderKanban className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-xl font-semibold mb-2">View All My Cases</CardTitle>
                    <CardDescription className="text-gray-500">
                      Check the status of your existing cases.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
