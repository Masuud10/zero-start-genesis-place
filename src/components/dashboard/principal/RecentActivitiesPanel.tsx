
import React from "react";
import RecentActivities from "./RecentActivities";

interface RecentActivitiesPanelProps {
  recentActivities: any[];
}

const RecentActivitiesPanel: React.FC<RecentActivitiesPanelProps> = ({ 
  recentActivities 
}) => (
  <div>
    <RecentActivities recentActivities={recentActivities} />
  </div>
);

export default RecentActivitiesPanel;
