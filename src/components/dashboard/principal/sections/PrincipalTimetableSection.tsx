
import React from 'react';
import PrincipalTimetableCard from '../PrincipalTimetableCard';

const PrincipalTimetableSection: React.FC = () => {
  return (
    <section className="w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Timetable Management</h2>
      <div className="w-full">
        <PrincipalTimetableCard />
      </div>
    </section>
  );
};

export default PrincipalTimetableSection;
