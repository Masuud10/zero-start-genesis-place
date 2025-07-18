import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FinancialForecastingService } from "@/services/advancedFeaturesService";
import { FinancialForecast, FinancialMetrics } from "@/types/advanced-features";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calendar,
  BarChart3,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const FinancialForecastingPage: React.FC = () => {
  const [forecasts, setForecasts] = useState<FinancialForecast[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newForecast, setNewForecast] = useState({
    forecast_date: "",
    mrr: 0,
    growth_rate: 0,
    churn_rate: 0,
    projected_revenue: 0,
    notes: "",
  });

  const getGrowthIcon = (growthRate: number) => {
    return growthRate > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthBadgeVariant = (growthRate: number) => {
    return growthRate > 0 ? ("default" as const) : ("destructive" as const);
  };

  const getChurnBadgeVariant = (churnRate: number) => {
    return churnRate < 5
      ? ("default" as const)
      : churnRate < 10
      ? ("secondary" as const)
      : ("destructive" as const);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const [forecastsResponse, metricsResponse] = await Promise.all([
        FinancialForecastingService.getFinancialForecasts(),
        FinancialForecastingService.getFinancialMetrics(),
      ]);

      if (forecastsResponse.success) {
        setForecasts(forecastsResponse.data);
      } else {
        toast({
          title: "Error",
          description: forecastsResponse.error || "Failed to fetch forecasts",
          variant: "destructive",
        });
      }

      if (metricsResponse.success) {
        setMetrics(metricsResponse.data);
      } else {
        toast({
          title: "Error",
          description: metricsResponse.error || "Failed to fetch metrics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch financial data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createForecast = async () => {
    try {
      const response =
        await FinancialForecastingService.createFinancialForecast(newForecast);

      if (response.success) {
        toast({
          title: "Success",
          description: "Financial forecast created successfully",
        });
        setCreateDialogOpen(false);
        setNewForecast({
          forecast_date: "",
          mrr: 0,
          growth_rate: 0,
          churn_rate: 0,
          projected_revenue: 0,
          notes: "",
        });
        fetchForecasts();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create forecast",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating forecast:", error);
      toast({
        title: "Error",
        description: "Failed to create forecast",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    await fetchForecasts();
    toast({
      title: "Refreshed",
      description: "Financial data updated",
    });
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const latestForecast = forecasts.length > 0 ? forecasts[0] : null;
  const totalForecasts = forecasts.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Forecasting
          </h1>
          <p className="text-muted-foreground">
            Project future revenue based on current metrics and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Forecast
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Financial Forecast</DialogTitle>
                <DialogDescription>
                  Add a new revenue projection based on current metrics
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="forecast_date"
                    className="text-sm font-medium"
                  >
                    Forecast Date
                  </label>
                  <Input
                    id="forecast_date"
                    type="date"
                    value={newForecast.forecast_date}
                    onChange={(e) =>
                      setNewForecast((prev) => ({
                        ...prev,
                        forecast_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="mrr" className="text-sm font-medium">
                      Current MRR
                    </label>
                    <Input
                      id="mrr"
                      type="number"
                      placeholder="0"
                      value={newForecast.mrr}
                      onChange={(e) =>
                        setNewForecast((prev) => ({
                          ...prev,
                          mrr: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label
                      htmlFor="growth_rate"
                      className="text-sm font-medium"
                    >
                      Growth Rate (%)
                    </label>
                    <Input
                      id="growth_rate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newForecast.growth_rate}
                      onChange={(e) =>
                        setNewForecast((prev) => ({
                          ...prev,
                          growth_rate: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="churn_rate" className="text-sm font-medium">
                      Churn Rate (%)
                    </label>
                    <Input
                      id="churn_rate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newForecast.churn_rate}
                      onChange={(e) =>
                        setNewForecast((prev) => ({
                          ...prev,
                          churn_rate: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <label
                      htmlFor="projected_revenue"
                      className="text-sm font-medium"
                    >
                      Projected Revenue
                    </label>
                    <Input
                      id="projected_revenue"
                      type="number"
                      placeholder="0"
                      value={newForecast.projected_revenue}
                      onChange={(e) =>
                        setNewForecast((prev) => ({
                          ...prev,
                          projected_revenue: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this forecast..."
                    value={newForecast.notes}
                    onChange={(e) =>
                      setNewForecast((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createForecast}
                  disabled={!newForecast.forecast_date || newForecast.mrr <= 0}
                >
                  Create Forecast
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Metrics Summary */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.current_mrr)}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly recurring revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              {getGrowthIcon(metrics.growth_rate)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={getGrowthBadgeVariant(metrics.growth_rate)}>
                  {formatPercentage(metrics.growth_rate)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly growth rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={getChurnBadgeVariant(metrics.churn_rate)}>
                  {formatPercentage(metrics.churn_rate)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly churn rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Forecasts
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalForecasts}
              </div>
              <p className="text-xs text-muted-foreground">Forecasts created</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Projections */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                3-Month Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(metrics.projected_revenue_3_months)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on current growth and churn rates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                6-Month Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {formatCurrency(metrics.projected_revenue_6_months)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Mid-term revenue forecast
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                12-Month Projection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(metrics.projected_revenue_12_months)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Long-term revenue forecast
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forecasts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Forecasts</CardTitle>
          <CardDescription>
            Historical and current revenue projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Loading financial data...
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Forecast Date</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Growth Rate</TableHead>
                  <TableHead>Churn Rate</TableHead>
                  <TableHead>Projected Revenue</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts.map((forecast) => (
                  <TableRow key={forecast.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(forecast.forecast_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        {formatCurrency(forecast.mrr)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getGrowthIcon(forecast.growth_rate)}
                        <Badge
                          variant={getGrowthBadgeVariant(forecast.growth_rate)}
                        >
                          {formatPercentage(forecast.growth_rate)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getChurnBadgeVariant(forecast.churn_rate)}
                      >
                        {formatPercentage(forecast.churn_rate)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        {formatCurrency(forecast.projected_revenue)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {forecast.notes || "No notes"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Revenue Trends Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>
            Historical revenue and projection trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Revenue trends chart coming soon</p>
              <p className="text-sm text-gray-400">
                Will show historical revenue and projections
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialForecastingPage;
