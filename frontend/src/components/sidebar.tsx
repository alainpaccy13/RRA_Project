"use client";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { FileText, FolderKanban, LayoutDashboard, MessageSquare, UserCog } from "lucide-react"; // Import a suitable icon
import Link from "next/link";
import { useEffect, useState } from "react";


export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [userName, setUserName] = useState("User");
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isProxy, setIsProxy] = useState(false);

    const allNavItems = [
        { name: "Cases", icon: FolderKanban, path: "/cases" },
        { name: "Pre Appeal", icon: FileText, path: "/pre-appeal" },
        { name: "Meetings", icon: LayoutDashboard, path: "/meetings" },
        { name: "Reports", icon: FileText, path: "/reports" },
        { name: "Chat", icon: MessageSquare, path: "/chat" },
    ];

    // Define the new admin navigation item
    const adminNavItem = { name: "Admin", icon: UserCog, path: "/admin" }; // Using UserCog as an example icon

   // Load user name and role from localStorage
  useEffect(() => {
    const name = localStorage.getItem("staff_name");
    const role = localStorage.getItem("staff_role");
    const proxyStatus = localStorage.getItem("staff_is_proxy") === "true"; // Check status
    if (name) setUserName(name);
    if (role) setUserRole(role);
    setIsProxy(proxyStatus);
  }, []);

    // Filter and conditionally add nav items based on user role
    const navItems = allNavItems.filter((item) => {
        // Hide "Cases" for regular COMMITTEE_MEMBER
        if (item.name === "Cases" && userRole === "COMMITTEE_MEMBER") {
            return false;
        }
        // Hide "Chat" for everyone except COMMITTEE_LEADER
        if (item.name === "Chat" && userRole !== "COMMITTEE_LEADER") {
            return false;
        }
        return true;
    });

    // Add the admin link if the user is a COMMITTEE_LEADER
    if (userRole === "COMMITTEE_LEADER") {
        navItems.push(adminNavItem);
    }


  return (
    <div>
<aside className=" w-64 h-full p-4 border-r border-gray-300 bg-white flex flex-col justify-between">
  <div className="flex justify-center mb-6">
    <img src="/Rralogo.png" alt="Logo" className="h-20 w-20 p-2 bg-white" />
  </div>

  <nav className="flex flex-col space-y-0">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.path);

        return (

          <Button
            key={item.name}
            variant={isActive ? "default" : "ghost"}
            className={`w-full justify-start space-x-2 ${
              isActive
                ? "bg-[#134E70] text-white hover:bg-[#063854]"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => router.push(item.path)}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Button>
        );
      })}
    </nav>
   
  {!isProxy ? ( <Link href={"/profile"} className="flex items-center mt-auto shadow-lg rounded-md p-3">
  <img src="/profile-image.jpeg" alt="Profile" className="rounded-full h-10 w-10" />
  <div className="ml-3 ">
    <h1 className="font-bold">{userName}</h1>
  </div>
</Link>
  ):(<div className="flex items-center mt-auto shadow-lg rounded-md p-3 bg-gray-50 opacity-70 cursor-not-allowed" title="Profile access restricted for representatives">
                         <img src="/profile-image.jpeg" alt="Profile" className="rounded-full h-10 w-10 grayscale" />
                         <div className="ml-3">
                             <h1 className="font-bold text-gray-500">{userName}</h1>
                             <p className="text-xs text-orange-600 font-semibold">(Representative)</p>
                         </div>
                    </div>)}

</aside>

    </div>

  );
}
