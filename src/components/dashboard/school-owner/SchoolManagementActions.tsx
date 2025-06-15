
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, BarChart3, Settings } from "lucide-react";

interface Props {
  onAction: (action: string) => void;
}

const actions = [
  {
    id: "manage-users",
    icon: <Users className="h-8 w-8" />,
    label: "Manage Users",
    sub: "Teachers & Staff"
  },
  {
    id: "financial-reports",
    icon: <DollarSign className="h-8 w-8" />,
    label: "Financial Reports",
    sub: "Revenue & Expenses"
  },
  {
    id: "analytics",
    icon: <BarChart3 className="h-8 w-8" />,
    label: "Analytics",
    sub: "Performance Insights"
  }
];

const SchoolManagementActions: React.FC<Props> = ({ onAction }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {actions.map(a => (
      <Button
        key={a.id}
        variant="outline"
        className="h-24 flex-col gap-2 hover:bg-muted-50"
        onClick={() => onAction(a.id)}
        data-testid={`schooladmin-action-btn-${a.id}`}
      >
        {a.icon}
        <span className="font-medium">{a.label}</span>
        <span className="text-xs text-gray-500">{a.sub}</span>
      </Button>
    ))}
  </div>
);

export default SchoolManagementActions;
