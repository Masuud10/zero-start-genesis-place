
import React from 'react';
import PrincipalTimetableCard from '../PrincipalTimetableCard';

const PrincipalTimetableSection: React.FC = () => {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Timetable Management</h2>
      <div className="bg-white rounded-lg border shadow-sm">
        <PrincipalTimetableCard />
      </div>
    </section>
  );
};

export default PrincipalTimetableSection;
