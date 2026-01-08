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
import { Trash2, ArrowRight } from "lucide-react";
import { Case } from "@/app/types/case";

// Interface for a single case from the API
interface PreAppealCase {
  caseId: string;
  taxpayerName: string;
  casePresenter: string;
  tin: string;
  caseStatus: "PRE_APPEAL" | "READY_FOR_AGENDA" | "PENDING" | "RESOLVED" | "SUBMITTED";
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

export default function PreAppealCases() {
  const [pageData, setPageData] = useState<Page<PreAppealCase> | null>(null);
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false); 
  const [statusFilter, setStatusFilter] = useState("All");
  const PAGE_SIZE = 5;

  useEffect(() => {
    const fetchPreAppealCases = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Page<PreAppealCase>>("/api/v1/auth/pre-appeal/", {
          params: { page: currentPage, size: PAGE_SIZE },
        });
        setPageData(response.data.data);
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || "Failed to fetch pre-appeal cases.";
        setError(`Error: ${message}`);
        console.error("Failed to fetch pre-appeal cases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreAppealCases();
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

  const handleMoveToAgenda = async (caseId: string) => {
    try {
      await api.post(`/api/v1/auth/pre-appeal/${caseId}/move-to-agenda`);
      
      // Refresh the data after moving to agenda
      const response = await api.get<Page<PreAppealCase>>("/api/v1/auth/pre-appeal/", {
        params: { page: currentPage, size: PAGE_SIZE },
      });
      setPageData(response.data.data);
      
      alert("Case moved to agenda successfully.");
    } catch (err: any) {
      console.error("Failed to move case to agenda:", err);
      const errorMessage = err.response?.data?.message || "Failed to move the case to agenda. Please try again.";
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
  
  const handleFilterByStatus = (status: string) => {
    setStatusFilter(status);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PRE_APPEAL": return "bg-purple-100 text-purple-800";
      case "READY_FOR_AGENDA": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "SUBMITTED": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Pre Appeal</h1>
        <p className="text-gray-600">View all cases in pre-appeal status</p>
      </div>

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
          <div className="flex space-x-2">
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("All")}>All</Button>
            <Button variant="secondary" className="hover:bg-[#18668D] hover:text-white" onClick={() => handleFilterByStatus("PRE_APPEAL")}>Pre Appeal</Button>
          </div>
        </div>
      )}

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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={11} className="h-24 text-center">Loading pre-appeal cases...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={11} className="h-24 text-center text-red-600">{error}</TableCell></TableRow>
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
                    <Link href={`/cases/new-case?editCaseId=${_case.caseId}`}>
                      view note
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(_case.caseStatus)}`}>
                      {_case.caseStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        onClick={() => handleMoveToAgenda(_case.caseId)}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Ready for Agenda
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteCase(_case.caseId)}>
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})
            ) : (
              <TableRow><TableCell colSpan={11} className="h-24 text-center">No pre-appeal cases found.</TableCell></TableRow>
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