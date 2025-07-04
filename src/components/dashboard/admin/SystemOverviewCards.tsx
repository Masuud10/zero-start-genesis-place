import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface SystemOverviewCardsProps {
  schoolsCount: number;
  totalUsers: number;
  usersWithSchools: number;
  usersWithoutSchools: number;
  schoolsLoading: boolean;
  usersLoading: boolean;
  schoolsRefetching: boolean;
  usersRefetching: boolean;
  onStatsCardClick?: (cardType: string) => void;
}

const SystemOverviewCards: React.FC<SystemOverviewCardsProps> = ({
  schoolsCount,
  totalUsers,
  usersWithSchools,
  usersWithoutSchools,
  schoolsLoading,
  usersLoading,
  schoolsRefetching,
  usersRefetching,
  onStatsCardClick,
}) => {
  // Handle loading states
  const isLoading = schoolsLoading || usersLoading;
  const isRefetching = schoolsRefetching || usersRefetching;

  // Handle error states - if counts are negative or NaN, something went wrong
  const hasError =
    schoolsCount < 0 ||
    totalUsers < 0 ||
    isNaN(schoolsCount) ||
    isNaN(totalUsers);

  if (hasError) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error loading system statistics. Please refresh the page.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Schools",
      value: schoolsCount,
      icon: Building2,
      color: "bg-blue-500",
      loading: schoolsLoading,
      refetching: schoolsRefetching,
      type: "schools",
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "bg-green-500",
      loading: usersLoading,
      refetching: usersRefetching,
      type: "users",
    },
    {
      title: "Users with Schools",
      value: usersWithSchools,
      icon: GraduationCap,
      color: "bg-purple-500",
      loading: usersLoading,
      refetching: usersRefetching,
      type: "users-with-schools",
    },
    {
      title: "Users without Schools",
      value: usersWithoutSchools,
      icon: TrendingUp,
      color: "bg-orange-500",
      loading: usersLoading,
      refetching: usersRefetching,
      type: "users-without-schools",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isCardLoading = card.loading;
        const isCardRefetching = card.refetching;

        return (
          <Card
            key={card.title}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              onStatsCardClick ? "hover:scale-105" : ""
            }`}
            onClick={() => onStatsCardClick?.(card.type)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.color} text-white`}>
                {isCardLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isCardLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  </div>
                ) : (
                  card.value.toLocaleString()
                )}
              </div>
              {isCardRefetching && (
                <Badge variant="secondary" className="mt-2">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Updating...
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SystemOverviewCards;
