import React from "react";
import SchoolOwnerMetricsFetcher from "./school-owner/SchoolOwnerMetricsFetcher";

const SchoolDirectorDashboard = () => {
  console.log('🏫 SchoolDirectorDashboard: Rendering with school director access and functionality');

  return <SchoolOwnerMetricsFetcher />;
};

export default SchoolDirectorDashboard;
