import { redirect } from "next/navigation";

export default function Home() {
  redirect("/staff-login"); // sends users to login by default
}
