"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InvitationTemplateModal } from "./InvitationTemplateModal"; // 1. Import the modal

import { Copy } from "lucide-react";

// Zod schema for form validation
const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


interface UserData {
  id: string;
  fullName: string;
  email: string;
  title: string;
  phoneNumber: string;
  committeeRole: string;
  committeeGroup: string;
  availabilityStatus: boolean;
}

interface MemberAvailabilityDTO {
  id: string;
  fullName: string;
  title: string;
  committeeRole: string;
  availabilityStatus: boolean;
}

const mockUser = {
  passwordLastChanged: "2 months ago",
  emailNotifications: true,
  smsNotifications: false,
  availabilityStatus:false,
};

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isAvailable, setIsAvailable] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState<MemberAvailabilityDTO[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
 const [proxyCreds, setProxyCreds] = useState<{email: string, password: string} | null>(null);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
    },
    mode: "onChange",
  });

    useEffect(() => {
    const isProxy = localStorage.getItem("staff_is_proxy") === "true";
    if (isProxy) {
      alert("Access Denied: Representatives cannot view or edit the committee member's profile.");
      router.push("/cases"); // Redirect to a safe page
    }
  }, [router]);

  
  useEffect(() => {
  if (userData?.committeeRole === 'COMMITTEE_LEADER') {
    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const res = await api.get('/api/v1/committee/members-availability');
        setCommitteeMembers(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load committee members");
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }
}, [userData]);

const handleUpdateMemberStatus = async (memberId: string, newStatus: boolean) => {
  const original = committeeMembers.find(m => m.id === memberId);
  if (!original) return;

  // Optimistic update
  setCommitteeMembers(prev =>
    prev.map(m => m.id === memberId ? { ...m, availabilityStatus: newStatus } : m)
  );

  try {
    await api.put(`/api/v1/committee/member/${memberId}/availability`, {
      availabilityStatus: newStatus
    });
  } catch (err) {
    alert("Failed to update status");
    // Revert
    setCommitteeMembers(prev =>
      prev.map(m => m.id === memberId ? { ...m, availabilityStatus: original.availabilityStatus } : m)
    );
  }
};

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/api/v1/user/');
        if (response.data && response.data.data) {
          const fetchedUser: UserData = response.data.data;
          setUserData(fetchedUser);
          setIsAvailable(fetchedUser.availabilityStatus);
          form.reset({
            fullName: fetchedUser.fullName,
            email: fetchedUser.email,
            phoneNumber: fetchedUser.phoneNumber,
          });
        } else {
          throw new Error("User data not found.");
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Could not load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form]);

  const handleAvailabilityChange = async (newStatus: boolean) => {
    if (!userData) return;

    // Disable the switch to prevent multiple clicks
    setIsUpdatingAvailability(true);
    
    // Optimistic UI update for instant feedback
    const originalStatus = isAvailable;
    setIsAvailable(newStatus);

    try {
      // Send the boolean value directly in the request body
      await api.put(`/api/v1/user/${userData.id}/availability-status`, newStatus, {
        headers: {
          // Explicitly set content type for raw boolean
          'Content-Type': 'application/json',
        },
      });
      // Optionally show a success toast/message here
    } catch (error) {
      console.error("Failed to update availability status:", error);
      alert("Failed to update status. Reverting change.");
      // Rollback UI on error
      setIsAvailable(originalStatus);
    } finally {
      // Re-enable the switch
      setIsUpdatingAvailability(false);
    }
  };

  async function onSubmit(values: ProfileFormValues) {
    if (!userData) return;
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        title: userData.title,
        committee_role: userData.committeeRole,
        committeeGroup: userData.committeeGroup,
      };
      await api.put(`/api/v1/user/${userData.id}`, payload);
      localStorage.setItem("staff_name", values.fullName);
      alert("Profile updated successfully!");
      setUserData(prev => prev ? { ...prev, ...values } : null);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Error updating profile.");
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (error) {
       console.error("Server logout failed, clearing session locally.", error);
    } finally {
      localStorage.clear();
      router.push('/staff-login');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 max-w-2xl space-y-8 text-center">Loading Profile...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 max-w-2xl space-y-8 text-center text-red-500">{error}</div>;
  }
  
  const getAvatarFallback = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const formatRole = (role: string = "") => role.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());


const handleGenerateProxy = async () => {
    if(!window.confirm("Generate temporary credentials for a representative? Valid for 24 hours.")) return;
    
    try {
        const response = await api.post('/api/v1/user/generate-proxy');
        if(response.data.data) {
            setProxyCreds({
                email: response.data.data.email,
                password: response.data.data.temporaryPassword
            });
        }
    } catch (e) {
        alert("Failed to generate credentials");
    }
};

  return (
    // Use a Fragment to wrap the page content and the modal
    <>
      <div className="container mx-auto p-4 max-w-2xl space-y-8">
        {/* Profile Header */}
        <div className="rounded-lg border p-6 flex items-center space-x-4 bg-white">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/profile-image.jpeg" alt={userData?.fullName || ''} />
            <AvatarFallback>{userData ? getAvatarFallback(userData.fullName) : 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{userData?.fullName}</h1>
            <p className="text-gray-600">{userData?.title}</p>
            <div className="flex items-center text-gray-500 mt-1 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span>{formatRole(userData?.committeeRole)}</span>
            </div>
          </div>
        </div>
        
        {/* Personal Information Section */}
        <div className="rounded-lg border p-6 space-y-4 bg-white">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          <p className="text-gray-600 text-sm">Update your personal details and profile information.</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Names</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="bg-[#18668D]">edit profile</Button>
            </form>
          </Form>
        </div>

        {/* Security Settings Section */}
        <div className="rounded-lg border p-6 space-y-4 bg-white">
          <h2 className="text-xl font-semibold">Security Settings</h2>
          <p className="text-gray-600 text-sm">Manage your account security and authentication.</p>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Password</h3>
              <p className="text-sm text-gray-500">Last changed {mockUser.passwordLastChanged}</p>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6V3a3 3 0 00-6 0v3m0 0a3 3 0 00-6 0v3a3 3 0 006 0m0 0v3a3 3 0 006 0v-3m0 0a3 3 0 00-6 0" />
              </svg>
              <span>change Password</span>
            </Button>
          </div>
        </div>
        {/* Notification Preferences Section */}
        <div className="rounded-lg border p-6 space-y-6 bg-white">
          <div>
            <h2 className="text-xl font-semibold">Notification Preferences</h2>
            <p className="text-gray-600 text-sm mt-1">Choose what notifications you want to receive.</p>
          </div>

          {/* Email & SMS Notifications */}
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <div>
                <h3 className="font-medium">Email notification</h3>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch defaultChecked={mockUser.emailNotifications} />
            </div>

            <div className="flex justify-between items-center py-2">
              <div>
                <h3 className="font-medium">SMS notification</h3>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <Switch defaultChecked={mockUser.smsNotifications} />
            </div>

            {/* Personal Availability Status */}
            <div className="flex justify-between items-center py-2 border-t pt-4">
              <div>
                <h3 className="font-medium">Availability Status</h3>
                <p className="text-sm text-gray-500">Indicate your availability this week</p>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={handleAvailabilityChange}
                disabled={isUpdatingAvailability}
              />
            </div>
          </div>

          {/* Leader-Only Features */}
          {userData?.committeeRole === 'COMMITTEE_LEADER' && (
            <>
              {/* Invitation Template */}
              <div className="flex justify-between items-center py-4 border-t">
                <div>
                  <h3 className="font-medium">Invitation Template</h3>
                  <p className="text-sm text-gray-500">Edit invitation hour and venue</p>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => setIsModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  <span>Edit</span>
                </Button>
              </div>

              {/* Committee Members Availability List */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Committee Members Availability</h3>

                {loadingMembers ? (
                  <p className="text-sm text-gray-500 italic">Loading members...</p>
                ) : committeeMembers.length === 0 ? (
                  <p className="text-sm text-gray-500">No members found in your committee group.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {committeeMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                          member.id === userData.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{getAvatarFallback(member.fullName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{member.fullName}</p>
                            <p className="text-xs text-gray-500">
                              {member.title || formatRole(member.committeeRole)}
                              {member.id === userData.id && <span className="ml-2 text-blue-600">(You)</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span
                            className={`text-sm font-medium ${
                              member.availabilityStatus ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {member.availabilityStatus ? 'Available' : 'Unavailable'}
                          </span>
                          <Switch
                            checked={member.availabilityStatus}
                            onCheckedChange={(checked) =>
                              handleUpdateMemberStatus(member.id, checked)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

            <div className="rounded-lg border p-6 space-y-4 bg-white mt-4">
          <h2 className="text-xl font-semibold text-[#18668D]">Delegate Representative</h2>
          <p className="text-gray-600 text-sm">
              Generate temporary login credentials for a representative to attend and vote on your behalf.
              These credentials expire in 24 hours.
          </p>
          
          <Button 
            onClick={handleGenerateProxy} 
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Generate Temporary Credentials
          </Button>

          {proxyCreds && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-bold text-green-800 mb-2">Credentials Generated!</h3>
                  <p className="text-sm text-gray-700 mb-2">Share these details with your representative immediately. You cannot see the password again.</p>
                  
                  <div className="space-y-2">
                      <div className="flex items-center gap-2">
                          <span className="font-semibold w-20">Email:</span>
                          <code className="bg-white px-2 py-1 rounded border">{proxyCreds.email}</code>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="font-semibold w-20">Password:</span>
                          <code className="bg-white px-2 py-1 rounded border text-red-600 font-bold">{proxyCreds.password}</code>
                      </div>
                  </div>
              </div>
          )}
      </div>
      

        {/* Log out button */}
        <div className="flex justify-end mt-8">
          <Button onClick={handleLogout} variant="ghost" className="text-red-600 hover:text-white hover:bg-red-500  bg-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="21" y2="12" x2="9" />
            </svg>
            Log out
          </Button>
        </div>
      </div>
      
      {/* 4. Render the modal and pass state to control it */}
      <InvitationTemplateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}