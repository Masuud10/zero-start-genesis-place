import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Edit,
  MoreHorizontal,
  Building2,
  DollarSign,
  Calendar,
  Users,
  Search,
  Filter,
} from "lucide-react";

interface SchoolBillingData {
  id: string;
  name: string;
  email: string;
  status: string;
  setupCost: number;
  subscriptionCost: number;
  totalPaid: number;
  outstandingBalance: number;
  studentCount: number;
  lastBilledDate: string;
  billingStatus: "active" | "inactive" | "suspended";
  totalRecords: number;
}

interface SchoolBillingTableProps {
  schools: SchoolBillingData[];
  onSelectSchool: (schoolId: string) => void;
  onEditRecord: (record: SchoolBillingData) => void;
}

const SchoolBillingTable: React.FC<SchoolBillingTableProps> = ({
  schools,
  onSelectSchool,
  onEditRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", label: "Active" },
      inactive: { color: "bg-gray-100 text-gray-800", label: "Inactive" },
      suspended: { color: "bg-red-100 text-red-800", label: "Suspended" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getBillingStatusBadge = (balance: number) => {
    if (balance === 0) {
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    } else if (balance > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }
  };

  // Filter schools based on search and status
  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || school.billingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchools = filteredSchools.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (schools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            School Billing Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No schools found with billing records</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            School Billing Overview
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-64"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Setup Cost</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Billed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{school.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {school.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-blue-600">
                      {formatCurrency(school.setupCost)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-green-600">
                      {formatCurrency(school.subscriptionCost)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-emerald-600">
                      {formatCurrency(school.totalPaid)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-orange-600">
                      {formatCurrency(school.outstandingBalance)}
                    </div>
                    {getBillingStatusBadge(school.outstandingBalance)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{school.studentCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(school.billingStatus)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(school.lastBilledDate)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onSelectSchool(school.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditRecord(school)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Billing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredSchools.length)} of{" "}
              {filteredSchools.length} schools
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Schools:</span>
              <span className="ml-2 font-medium">{filteredSchools.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Revenue:</span>
              <span className="ml-2 font-medium text-emerald-600">
                {formatCurrency(
                  filteredSchools.reduce(
                    (sum, school) =>
                      sum + school.setupCost + school.subscriptionCost,
                    0
                  )
                )}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Outstanding:</span>
              <span className="ml-2 font-medium text-orange-600">
                {formatCurrency(
                  filteredSchools.reduce(
                    (sum, school) => sum + school.outstandingBalance,
                    0
                  )
                )}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Students:</span>
              <span className="ml-2 font-medium">
                {filteredSchools
                  .reduce((sum, school) => sum + school.studentCount, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolBillingTable;
