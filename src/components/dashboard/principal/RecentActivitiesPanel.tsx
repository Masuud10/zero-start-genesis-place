
import React from "react";
import RecentActivities from "./RecentActivities";

type Props = {
  recentActivities: any[];
};

const RecentActivitiesPanel: React.FC<Props> = ({ recentActivities }) => (
  <div>
    <RecentActivities recentActivities={recentActivities} />
  </div>
);

export default RecentActivitiesPanel;
