import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  X,
  Calendar,
  Building2,
  DollarSign,
} from "lucide-react";

interface BillingFiltersProps {
  filters: {
    search: string;
    status: string;
    billingType: string;
    dateRange: string;
  };
  onFiltersChange: (filters: {
    search: string;
    status: string;
    billingType: string;
    dateRange: string;
  }) => void;
}

const BillingFilters: React.FC<BillingFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      billingType: "all",
      dateRange: "all",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.billingType !== "all" ||
    filters.dateRange !== "all";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Search className="h-4 w-4" />
              Search Schools
            </label>
            <Input
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              School Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Billing Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Billing Type
            </label>
            <Select
              value={filters.billingType}
              onValueChange={(value) =>
                handleFilterChange("billingType", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="setup_fee">Setup Fees</SelectItem>
                <SelectItem value="subscription_fee">
                  Subscription Fees
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Date Range
            </label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange("dateRange", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  <Search className="h-3 w-3" />
                  Search: "{filters.search}"
                </div>
              )}
              {filters.status !== "all" && (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  <Building2 className="h-3 w-3" />
                  Status: {filters.status}
                </div>
              )}
              {filters.billingType !== "all" && (
                <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                  <DollarSign className="h-3 w-3" />
                  Type: {filters.billingType.replace("_", " ")}
                </div>
              )}
              {filters.dateRange !== "all" && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                  <Calendar className="h-3 w-3" />
                  Range: {filters.dateRange}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingFilters;
