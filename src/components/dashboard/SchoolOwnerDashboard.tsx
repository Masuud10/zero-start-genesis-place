
import React from "react";
import SchoolOwnerMetricsFetcher from "./school-owner/SchoolOwnerMetricsFetcher";

const SchoolOwnerDashboard = () => {
  console.log('🏫 SchoolOwnerDashboard: Rendering with navigation-enabled management actions');
  
  return <SchoolOwnerMetricsFetcher />;
};

export default SchoolOwnerDashboard;
