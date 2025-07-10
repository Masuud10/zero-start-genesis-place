import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  FileText,
  Loader2,
  Building2,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useBillingActions } from "@/hooks/useBillingActions";
import { useAllSchools } from "@/hooks/useBillingManagement";
import { useToast } from "@/hooks/use-toast";

interface BillingQuickActionsProps {
  onRefresh?: () => void;
  onShowCreateModal?: () => void;
}

const BillingQuickActions: React.FC<BillingQuickActionsProps> = ({
  onRefresh,
  onShowCreateModal,
}) => {
  const { toast } = useToast();
  const { createSetupFees, createMonthlySubscriptions } = useBillingActions();
  const { data: schools, isLoading: schoolsLoading } = useAllSchools();

  // State for manual input amounts
  const [setupFeeAmount, setSetupFeeAmount] = useState("20000");
  const [subscriptionRate, setSubscriptionRate] = useState("150");

  const handleCreateSetupFees = async () => {
    try {
      const amount = parseFloat(setupFeeAmount) || 20000;
      const result = await createSetupFees.mutateAsync(amount);
      toast({
        title: "Setup Fees Created",
        description: `Successfully created setup fees for ${result.length} schools.`,
      });
      onRefresh?.();
    } catch (error) {
      console.error("Failed to create setup fees:", error);
      toast({
        title: "Error",
        description: "Failed to create setup fees. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateMonthlySubscriptions = async () => {
    try {
      const rate = parseFloat(subscriptionRate) || 150;
      const result = await createMonthlySubscriptions.mutateAsync(rate);
      toast({
        title: "Monthly Subscriptions Created",
        description: `Successfully created monthly subscriptions for ${result.length} schools.`,
      });
      onRefresh?.();
    } catch (error) {
      console.error("Failed to create monthly subscriptions:", error);
      toast({
        title: "Error",
        description:
          "Failed to create monthly subscriptions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateIndividualRecord = () => {
    onShowCreateModal?.();
  };

  // Calculate quick stats
  const activeSchoolsCount =
    schools?.filter((s) => s.status === "active").length || 0;
  const totalSchoolsCount = schools?.length || 0;

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <TrendingUp className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription className="text-blue-700">
          Quickly create billing records for schools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Active Schools
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {activeSchoolsCount}
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                Total Schools
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {totalSchoolsCount}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Create Setup Fees */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label
                htmlFor="setup-fee-amount"
                className="text-sm font-medium text-gray-700"
              >
                Setup Fee Amount (KES)
              </Label>
              <Input
                id="setup-fee-amount"
                type="number"
                placeholder="20000"
                value={setupFeeAmount}
                onChange={(e) => setSetupFeeAmount(e.target.value)}
                min="0"
                step="100"
                className="text-sm"
              />
            </div>
            <Button
              onClick={handleCreateSetupFees}
              disabled={createSetupFees.isPending || schoolsLoading}
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300"
            >
              {createSetupFees.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              ) : (
                <CreditCard className="h-5 w-5 text-blue-600" />
              )}
              <div className="text-center">
                <div className="font-medium text-sm">Create Setup Fees</div>
                <div className="text-xs text-gray-500">
                  KES {parseFloat(setupFeeAmount) || 20000} per school
                </div>
              </div>
              {createSetupFees.isPending && (
                <Badge variant="secondary" className="text-xs">
                  Creating...
                </Badge>
              )}
            </Button>
          </div>

          {/* Create Monthly Subscriptions */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label
                htmlFor="subscription-rate"
                className="text-sm font-medium text-gray-700"
              >
                Per Student Rate (KES)
              </Label>
              <Input
                id="subscription-rate"
                type="number"
                placeholder="150"
                value={subscriptionRate}
                onChange={(e) => setSubscriptionRate(e.target.value)}
                min="0"
                step="10"
                className="text-sm"
              />
            </div>
            <Button
              onClick={handleCreateMonthlySubscriptions}
              disabled={createMonthlySubscriptions.isPending || schoolsLoading}
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-white hover:bg-green-50 border-green-200 hover:border-green-300"
            >
              {createMonthlySubscriptions.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
              ) : (
                <FileText className="h-5 w-5 text-green-600" />
              )}
              <div className="text-center">
                <div className="font-medium text-sm">
                  Create Monthly Subscriptions
                </div>
                <div className="text-xs text-gray-500">
                  KES {parseFloat(subscriptionRate) || 150} per student
                </div>
              </div>
              {createMonthlySubscriptions.isPending && (
                <Badge variant="secondary" className="text-xs">
                  Creating...
                </Badge>
              )}
            </Button>
          </div>

          {/* Create Individual Record */}
          <Button
            onClick={handleCreateIndividualRecord}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 bg-white hover:bg-purple-50 border-purple-200 hover:border-purple-300"
          >
            <DollarSign className="h-5 w-5 text-purple-600" />
            <div className="text-center">
              <div className="font-medium text-sm">
                Create Individual Record
              </div>
              <div className="text-xs text-gray-500">Custom billing record</div>
            </div>
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-1">
              <div>
                <strong>Setup Fees:</strong> One-time fee per school
                (configurable amount)
              </div>
              <div>
                <strong>Monthly Subscriptions:</strong> Per active student
                (configurable rate)
              </div>
              <div>
                <strong>Individual Records:</strong> Create custom billing
                records for specific schools
              </div>
              <div className="text-xs text-blue-600 mt-2">
                💡 You can now customize the amounts above before creating
                billing records
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Loading State */}
        {schoolsLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-600">
              Loading school data...
            </span>
          </div>
        )}

        {/* No Schools Warning */}
        {!schoolsLoading && totalSchoolsCount === 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              No schools found. Please register schools before creating billing
              records.
            </AlertDescription>
          </Alert>
        )}

        {/* Success Messages */}
        {createSetupFees.isSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Setup fees created successfully!
            </AlertDescription>
          </Alert>
        )}

        {createMonthlySubscriptions.isSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Monthly subscriptions created successfully!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingQuickActions;
