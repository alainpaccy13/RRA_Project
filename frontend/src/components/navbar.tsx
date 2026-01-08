"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectIcon } from "@radix-ui/react-select";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {

  const pathname = usePathname();
  const linkHref = pathname === "/staff-register" ? "/staff-login" : "/staff-register";
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-sm">
      
      <div className="flex items-center space-x-2">
        <Image src="/Rralogo.png" alt="RRA Logo" width={40} height={40} />
        <span className="text-xl font-bold text-[#18668D]">
          Tax Claim Review System
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Link href={linkHref}>
        <Button className="bg-white border-[#18668D] border-2 rounded-2xl text-[#18668D] hover:bg-[#18668D] hover:text-white">
          {pathname === "/staff-register" ? "Login" : "Register"}
        </Button>
        </Link>
        <Select >
              <SelectTrigger className="border-[#18668D] border-2 rounded-2xl text-white bg-[#18668D] hover:border-[#18668D] hover:border-2 hover:text-[#18668D] hover:bg-white">
                <SelectValue className="text-white" placeholder="🌐 Kinyarwanda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kinyarwanda">Kinyarwanda</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="french">French</SelectItem>
              </SelectContent>
            </Select>
      </div>
    </header>
  );
}
