"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import api from "@/lib/api"; 

interface Case {
  caseId: string;
  taxPayer: string; 
  submittedAt: string;
  daysLeft: string;
  status: "SUBMITTED" | "DISCUSSED" | "PRE_APPEAL" | "READY_FOR_AGENDA"; 
}

export default function YourCasesPage() {
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("staff_token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        const response = await api.get("/api/v1/my-cases/my-cases", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.data) {
          setAllCases(response.data.data);
        } else {
          setAllCases([]);
        }
      } catch (err: any) {
        if (err.response) {
          setError(`Error: ${err.response.data.message || 'Failed to fetch cases.'}`);
        } else {
          setError(err.message || "An unknown error occurred.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []); 

  const handleFilterByStatus = (status: string) => {
    setStatusFilter(status);
  };

  const filteredCases = allCases.filter((_case) => {
    const matchesSearch =
      _case.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      _case.taxPayer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || _case.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800";
      case "DISCUSSED":
        return "bg-green-100 text-green-800";
      case "PRE_APPEAL":
        return "bg-purple-100 text-purple-800";
      case "READY_FOR_AGENDA":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Your cases</h1>
        <p className="text-gray-600">Track explanatory note for each of your case</p>
      </div>

      <div className="flex items-center space-x-2 mb-4 ">
        <Input
          placeholder="Search by Case ID or TIN..."
          className="max-w-xs flex-grow bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </Button>
      </div>

      {showFilters && (
        <div className="rounded-lg border p-4 mb-4 bg-white">
          <h3 className="font-semibold mb-2 ">Filter by Status</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("All")}>All</Button>
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("SUBMITTED")}>Submitted</Button>
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("DISCUSSED")}>Discussed</Button>
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("PRE_APPEAL")}>Pre Appeal</Button>
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("READY_FOR_AGENDA")}>Ready for Agenda</Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case ID</TableHead>
              <TableHead>Tax Payer TIN</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Days left</TableHead>
              <TableHead>Explanatory note</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading cases...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredCases.length > 0 ? (
              filteredCases.map((_case, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{_case.caseId}</TableCell>
                  <TableCell>{_case.taxPayer}</TableCell>
                  <TableCell>{_case.submittedAt}</TableCell>
                  <TableCell>{_case.daysLeft} days</TableCell>
                  <TableCell className="text-blue-600 underline cursor-pointer">
                    <Link href={`/cases/new-case?editCaseId=${_case.caseId}`}>
                      view note
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(_case.status)}`}>
                      {_case.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No cases found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <span>Showing {filteredCases.length} of {allCases.length} cases</span>
        <Pagination className="w-auto mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
