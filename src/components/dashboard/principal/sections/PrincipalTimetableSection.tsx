import React from "react";
import PrincipalTimetableCard from "../PrincipalTimetableCard";

interface PrincipalTimetableSectionProps {
  onModalOpen?: (modalType: string) => void;
}

const PrincipalTimetableSection: React.FC<PrincipalTimetableSectionProps> = ({
  onModalOpen,
}) => {
  return (
    <section className="w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Timetable Management
      </h2>
      <div className="w-full">
        <PrincipalTimetableCard onModalOpen={onModalOpen} />
      </div>
    </section>
  );
};

export default PrincipalTimetableSection;
