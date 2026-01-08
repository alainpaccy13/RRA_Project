"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
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
import { meetingminutes } from "@/app/types/minutes-mock-data";
import Link from "next/link";

export default function MeetingMinutesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterPreparedBy, setFilterPreparedBy] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Filtering logic
  const filteredCases = meetingminutes.filter((m) =>
    (filterPreparedBy === "" ||
      m.preparedBy.toLowerCase().includes(filterPreparedBy.toLowerCase())) &&
    (filterDate === "" || m.date === filterDate)
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">This week Cases</h1>
        <p className="text-gray-600">
          View all minutes of cases discussed this week
        </p>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Input
          placeholder="Search minutes ..."
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </Button>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="rounded-lg border p-4 mb-4 bg-white">
          <h3 className="font-semibold mb-2">Filter Options</h3>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
            {/* Filter by Prepared By */}
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-600">
                Prepared By
              </label>
              <Input
                type="text"
                placeholder="Enter name..."
                className="bg-white border-gray-300"
                value={filterPreparedBy}
                onChange={(e) => setFilterPreparedBy(e.target.value)}
              />
            </div>

            {/* Filter by Date */}
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-600">Date</label>
              <Input
                type="date"
                className="bg-white border-gray-300"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="rounded-lg border overflow-x-auto bg-white">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-white hover:bg-gray-50">
              <TableHead className="w-[50px] text-gray-500 font-normal whitespace-normal">
                No
              </TableHead>
              <TableHead className="text-gray-500 font-normal whitespace-normal">
                Prepared By
              </TableHead>
              <TableHead className="text-gray-500 font-normal whitespace-normal">
                Date
              </TableHead>
              <TableHead className="text-gray-500 font-normal whitespace-normal">
                Type
              </TableHead>
              <TableHead className="text-gray-500 font-normal whitespace-normal">
                Doc
              </TableHead>
              <TableHead className="text-gray-500 font-normal whitespace-normal">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredCases.length > 0 ? (
              filteredCases.map((_minute, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium whitespace-normal">
                    {index + 1}
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {_minute.preparedBy}
                  </TableCell>
                  <TableCell>{_minute.date}</TableCell>
                  <TableCell className="whitespace-normal">
                    {_minute.type}
                  </TableCell>
                  <TableCell className="text-blue-500 cursor-pointer">
                    <a href="/reports/minute-details">view minute</a>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Link href="/file.pdf" download>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No matching minutes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Generate Button */}
      <Button className="my-4 bg-[#18668D] hover:bg-[#053852] hover:underline">
        <a href="/reports/new-minutes">Generate Meeting minutes</a>
      </Button>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <span>showing 3 of 5 pages</span>
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
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
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
