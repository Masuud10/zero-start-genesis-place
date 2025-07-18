import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DatabaseQueryPerformanceService } from "@/services/mockAdvancedFeaturesService";
import { DatabaseQueryPerformance } from "@/types/advanced-features";
import {
  Database,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Timer,
  BarChart3,
} from "lucide-react";

const DatabaseQueryInspectorPage: React.FC = () => {
  const [slowestQueries, setSlowestQueries] = useState<
    DatabaseQueryPerformance[]
  >([]);
  const [frequentQueries, setFrequentQueries] = useState<
    DatabaseQueryPerformance[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const getPerformanceIcon = (executionTime: number) => {
    if (executionTime < 100)
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (executionTime < 500)
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getPerformanceBadgeVariant = (executionTime: number) => {
    if (executionTime < 100) return "default" as const;
    if (executionTime < 500) return "secondary" as const;
    return "destructive" as const;
  };

  const getPerformanceColor = (executionTime: number) => {
    if (executionTime < 100) return "text-green-600";
    if (executionTime < 500) return "text-yellow-600";
    return "text-red-600";
  };

  const formatQueryText = (queryText: string) => {
    // Truncate long queries and add ellipsis
    if (queryText.length > 80) {
      return queryText.substring(0, 80) + "...";
    }
    return queryText;
  };

  const fetchQueryPerformance = async () => {
    try {
      setLoading(true);
      const response =
        await DatabaseQueryPerformanceService.getSlowestQueries();

      if (response.success) {
        // Sort by execution time for slowest queries
        const sortedByTime = [...response.data].sort(
          (a, b) => b.average_execution_time - a.average_execution_time
        );
        setSlowestQueries(sortedByTime.slice(0, 10));

        // Sort by execution count for frequent queries
        const sortedByCount = [...response.data].sort(
          (a, b) => b.execution_count - a.execution_count
        );
        setFrequentQueries(sortedByCount.slice(0, 10));
      } else {
        toast({
          title: "Error",
          description:
            response.error || "Failed to fetch query performance data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching query performance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch query performance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchQueryPerformance();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Query performance data updated",
    });
  };

  useEffect(() => {
    fetchQueryPerformance();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchQueryPerformance, 60000);
    return () => clearInterval(interval);
  }, []);

  const averageExecutionTime =
    slowestQueries.length > 0
      ? slowestQueries.reduce(
          (sum, query) => sum + query.average_execution_time,
          0
        ) / slowestQueries.length
      : 0;

  const totalExecutions =
    frequentQueries.length > 0
      ? frequentQueries.reduce((sum, query) => sum + query.execution_count, 0)
      : 0;

  const slowestQuery = slowestQueries.length > 0 ? slowestQueries[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Database Query Inspector
          </h1>
          <p className="text-muted-foreground">
            Monitor database performance and identify optimization opportunities
          </p>
        </div>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Execution Time
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getPerformanceColor(
                averageExecutionTime
              )}`}
            >
              {averageExecutionTime.toFixed(1)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Across top 10 slowest queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Executions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalExecutions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Top 10 frequent queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slowest Query</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                slowestQuery
                  ? getPerformanceColor(slowestQuery.average_execution_time)
                  : "text-gray-600"
              }`}
            >
              {slowestQuery
                ? `${slowestQuery.average_execution_time.toFixed(1)}ms`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average execution time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Status
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageExecutionTime < 100 ? (
                <Badge variant="default" className="text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Optimal
                </Badge>
              ) : averageExecutionTime < 500 ? (
                <Badge variant="secondary" className="text-yellow-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Warning
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" />
                  Critical
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Query Performance Tabs */}
      <Tabs defaultValue="slowest" className="space-y-4">
        <TabsList>
          <TabsTrigger value="slowest" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Slowest Queries
          </TabsTrigger>
          <TabsTrigger value="frequent" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Most Frequent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slowest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Slowest Queries</CardTitle>
              <CardDescription>
                Queries with the highest average execution time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Loading query data...
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead>Execution Count</TableHead>
                      <TableHead>Avg Time</TableHead>
                      <TableHead>Slowest Time</TableHead>
                      <TableHead>Total Time</TableHead>
                      <TableHead>Last Executed</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slowestQueries.map((query, index) => (
                      <TableRow key={query.query_hash}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-mono text-sm">
                              {formatQueryText(query.query_text)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Hash: {query.query_hash.slice(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-gray-500" />
                            {query.execution_count.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center gap-2 ${getPerformanceColor(
                              query.average_execution_time
                            )}`}
                          >
                            {getPerformanceIcon(query.average_execution_time)}
                            <span className="font-medium">
                              {query.average_execution_time.toFixed(1)}ms
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`font-medium ${getPerformanceColor(
                              query.slowest_execution_time
                            )}`}
                          >
                            {query.slowest_execution_time.toFixed(1)}ms
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {(query.total_execution_time / 1000).toFixed(2)}s
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {new Date(query.last_executed).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPerformanceBadgeVariant(
                              query.average_execution_time
                            )}
                          >
                            {query.average_execution_time < 100
                              ? "Fast"
                              : query.average_execution_time < 500
                              ? "Slow"
                              : "Critical"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Most Frequent Queries</CardTitle>
              <CardDescription>
                Queries executed most frequently
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Loading query data...
                    </p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead>Execution Count</TableHead>
                      <TableHead>Avg Time</TableHead>
                      <TableHead>Total Time</TableHead>
                      <TableHead>Last Executed</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {frequentQueries.map((query) => (
                      <TableRow key={query.query_hash}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-mono text-sm">
                              {formatQueryText(query.query_text)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Hash: {query.query_hash.slice(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">
                              {query.execution_count.toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center gap-2 ${getPerformanceColor(
                              query.average_execution_time
                            )}`}
                          >
                            {getPerformanceIcon(query.average_execution_time)}
                            <span className="font-medium">
                              {query.average_execution_time.toFixed(1)}ms
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {(query.total_execution_time / 1000).toFixed(2)}s
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {new Date(query.last_executed).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPerformanceBadgeVariant(
                              query.average_execution_time
                            )}
                          >
                            {query.average_execution_time < 100
                              ? "Fast"
                              : query.average_execution_time < 500
                              ? "Slow"
                              : "Critical"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
          <CardDescription>
            Suggested optimizations based on query analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slowestQueries
              .filter((q) => q.average_execution_time > 500)
              .map((query, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-600">
                      Critical Query Detected
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Query with hash {query.query_hash.slice(0, 8)}... has an
                      average execution time of{" "}
                      {query.average_execution_time.toFixed(1)}ms
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        • Consider adding database indexes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        • Review query optimization
                      </p>
                      <p className="text-xs text-muted-foreground">
                        • Check for N+1 query patterns
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {slowestQueries
              .filter(
                (q) =>
                  q.average_execution_time <= 500 &&
                  q.average_execution_time > 100
              )
              .map((query, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-600">
                      Query Optimization Opportunity
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Query with hash {query.query_hash.slice(0, 8)}... could be
                      optimized (avg: {query.average_execution_time.toFixed(1)}
                      ms)
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        • Consider query caching
                      </p>
                      <p className="text-xs text-muted-foreground">
                        • Review execution plan
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {slowestQueries.filter((q) => q.average_execution_time <= 100)
              .length > 0 && (
              <div className="flex items-start gap-4 p-4 border rounded-lg bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-600">
                    Good Performance
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {
                      slowestQueries.filter(
                        (q) => q.average_execution_time <= 100
                      ).length
                    }{" "}
                    queries are performing well
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseQueryInspectorPage;
