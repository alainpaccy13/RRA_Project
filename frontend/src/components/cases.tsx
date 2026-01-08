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
import { Trash2 } from "lucide-react";
import { Case } from "@/app/types/case";

// Interface for a single case from the API
interface AgendaCase {
  caseId: string;
  taxpayerName: string;
  casePresenter: string;
  tin: string;
  caseStatus: "PENDING" | "RESOLVED" | "SUBMITTED" | "PRE_APPEAL" | "READY_FOR_AGENDA";
  daysLeft: number;
  appealDate: string;
  amountDischarged: number;
  taxToBePaid: number;
  auditor: string;
}

// Interface for the paginated response from the API
interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; 
}

export default function AgendaCasesPage() {
  const [pageData, setPageData] = useState<Page<AgendaCase> | null>(null);
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false); 
  const [statusFilter, setStatusFilter] = useState("All");
  const PAGE_SIZE = 5;

  useEffect(() => {
    const fetchAgenda = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Page<AgendaCase>>("/api/v1/agenda/", {
          params: { page: currentPage, size: PAGE_SIZE },
        });
        setPageData(response.data);
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || "Failed to fetch agenda.";
        setError(`Error: ${message}`);
        console.error("Failed to fetch agenda:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgenda();
  }, [currentPage]);

  const handleDeleteCase = async (caseId: string) => {
    // 1. Confirm with the user before deleting
    if (!window.confirm(`Are you sure you want to delete case ${caseId}? This action cannot be undone.`)) {
      return;
    }

    try {
      // 2. Make the API call to the DELETE endpoint
      await api.delete(`/api/v1/auth/explanatory_note/${caseId}`);

      // 3. On success, update the state to remove the case from the UI
      setAllCases(currentCases => currentCases.filter(c => c.caseId !== caseId));

      alert("Case deleted successfully.");

    } catch (err: any) {
      console.error("Failed to delete case:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete the case. Please try again.";
      alert(errorMessage);
    }
  };

  const filteredCases = pageData?.content.filter((_case) => {
    const matchesSearch =
      _case.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (_case.taxpayerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      _case.tin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || _case.caseStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handlePageChange = (newPage: number) => {
    if (pageData && newPage >= 0 && newPage < pageData.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Restore the handleFilterByStatus function
  const handleFilterByStatus = (status: string) => {
    setStatusFilter(status);
  };

  // Restore the getStatusStyle function
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "SUBMITTED": return "bg-blue-100 text-blue-800";
      case "PRE_APPEAL": return "bg-purple-100 text-purple-800";
      case "READY_FOR_AGENDA": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <p className="text-gray-600">View all cases to be discussed this week</p>
      </div>

      {/* --- THIS IS YOUR ORIGINAL FILTER UI --- */}
      <div className="flex items-center space-x-2 mb-4">
        <Input
          placeholder="Search by Case ID, Name, or TIN..."
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
          <h3 className="font-semibold mb-2">Filter by Status</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("All")}>All</Button>
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("PENDING")}>Pending</Button>
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("RESOLVED")}>Resolved</Button>
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("SUBMITTED")}>Submitted</Button>
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("PRE_APPEAL")}>Pre Appeal</Button>
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("READY_FOR_AGENDA")}>Ready for Agenda</Button>
          </div>
        </div>
      )}
      {/* --- END OF FILTER UI --- */}

      <div className="rounded-lg border overflow-x-auto bg-white">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-white hover:bg-gray-50">
              <TableHead>No</TableHead>
              <TableHead>Tax Payer</TableHead>
              <TableHead>Days Left</TableHead>
              <TableHead>Tax Assessed (RWF)</TableHead>
              <TableHead>Amount Discharged</TableHead>
              <TableHead>Tax To Be Paid (RWF)</TableHead>
              <TableHead>Case Presenter</TableHead>
              <TableHead>Auditor</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10} className="h-24 text-center">Loading agenda cases...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={10} className="h-24 text-center text-red-600">{error}</TableCell></TableRow>
            ) : filteredCases.length > 0 ? (
              filteredCases.map((_case, index) => {
                const taxOriginal = (_case.taxToBePaid || 0) + (_case.amountDischarged || 0);
                return (
                <TableRow key={_case.caseId}>
                  <TableCell className="font-medium">{(currentPage * PAGE_SIZE) + index + 1}</TableCell>
                  <TableCell>{_case.taxpayerName || 'N/A'}</TableCell>
                  <TableCell>{_case.daysLeft} days</TableCell>
                  <TableCell>{taxOriginal.toLocaleString()}</TableCell>
                  <TableCell>{_case.amountDischarged.toLocaleString()}</TableCell>
                  <TableCell>{_case.taxToBePaid.toLocaleString()}</TableCell>
                  <TableCell>{_case.casePresenter}</TableCell>
                  <TableCell>{_case.auditor}</TableCell>
                  <TableCell className="text-blue-500 cursor-pointer hover:underline">
                    <Link href={`/meetings/case-details?caseId=${_case.caseId}`}>
                      view case
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(_case.caseStatus)}`}>
                      {_case.caseStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteCase(_case.caseId)}>
                            <Trash2 className="h-5 w-5 text-red-500" />
                        </Button>
                  </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow><TableCell colSpan={10} className="h-24 text-center">No cases found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <span>
            Showing {filteredCases.length} of {pageData?.totalElements || 0} cases
        </span>
        {pageData && pageData.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                    aria-disabled={currentPage === 0}
                    className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {[...Array(pageData.totalPages).keys()].map(pageNumber => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink 
                      href="#"
                      onClick={(e) => { e.preventDefault(); handlePageChange(pageNumber); }}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                    aria-disabled={currentPage >= pageData.totalPages - 1}
                    className={currentPage >= pageData.totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
        )}
      </div>
    </div>
  );
}
