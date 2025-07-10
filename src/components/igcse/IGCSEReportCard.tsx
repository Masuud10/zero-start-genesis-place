import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IGCSEReportCardProps {
  studentName: string;
  admissionNumber: string;
  className: string;
  term: string;
  academicYear: string;
  grades: Array<{
    subject_name: string;
    subject_code: string;
    component: string;
    marks?: number;
    letter_grade: string;
    teacher_remarks?: string;
  }>;
  schoolInfo: {
    name: string;
    logo_url?: string;
    address?: string;
  };
}

interface GroupedGrade {
  subject_name: string;
  subject_code: string;
  components: Array<{
    component: string;
    marks?: number;
    letter_grade: string;
    teacher_remarks?: string;
  }>;
}

interface GradeScaleItem {
  grade: string;
  desc: string;
}

const GRADE_COLORS: Record<string, string> = {
  "A*": "bg-purple-100 text-purple-800",
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-cyan-100 text-cyan-800",
  D: "bg-yellow-100 text-yellow-800",
  E: "bg-orange-100 text-orange-800",
  F: "bg-red-100 text-red-800",
  G: "bg-red-100 text-red-800",
  U: "bg-gray-100 text-gray-800",
};

export const IGCSEReportCard: React.FC<IGCSEReportCardProps> = ({
  studentName,
  admissionNumber,
  className,
  term,
  academicYear,
  grades,
  schoolInfo,
}) => {
  // Group grades by subject
  const groupedGrades = grades.reduce((acc, grade) => {
    const key = `${grade.subject_name}-${grade.subject_code}`;
    if (!acc[key]) {
      acc[key] = {
        subject_name: grade.subject_name,
        subject_code: grade.subject_code,
        components: [],
      };
    }
    acc[key].components.push({
      component: grade.component,
      marks: grade.marks,
      letter_grade: grade.letter_grade,
      teacher_remarks: grade.teacher_remarks,
    });
    return acc;
  }, {} as Record<string, GroupedGrade>);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white print:p-0">
      {/* Header */}
      <div className="text-center mb-8 border-b pb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          {schoolInfo.logo_url && (
            <img
              src={schoolInfo.logo_url}
              alt="School Logo"
              className="h-16 w-16 object-contain"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {schoolInfo.name}
            </h1>
            {schoolInfo.address && (
              <p className="text-sm text-gray-600">{schoolInfo.address}</p>
            )}
          </div>
        </div>
        <h2 className="text-xl font-semibold text-purple-800 mb-2">
          IGCSE Student Report Card
        </h2>
        <Badge className="bg-purple-100 text-purple-800">
          IGCSE Curriculum
        </Badge>
      </div>

      {/* Student Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Student Name</p>
              <p className="font-semibold">{studentName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Admission Number
              </p>
              <p className="font-semibold">{admissionNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Class</p>
              <p className="font-semibold">{className}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Term</p>
              <p className="font-semibold">
                {term} - {academicYear}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Academic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Subject</th>
                  <th className="text-center p-3 font-medium">Component</th>
                  <th className="text-center p-3 font-medium">Marks</th>
                  <th className="text-center p-3 font-medium">Grade</th>
                  <th className="text-left p-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(groupedGrades).map((subject: GroupedGrade) =>
                  subject.components.map((component, index: number) => (
                    <tr
                      key={`${subject.subject_code}-${component.component}`}
                      className="border-b hover:bg-gray-50"
                    >
                      {index === 0 && (
                        <td
                          className="p-3 font-medium"
                          rowSpan={subject.components.length}
                        >
                          <div>
                            <div className="font-semibold">
                              {subject.subject_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subject.subject_code}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="p-3 text-center">
                        <span className="capitalize text-sm bg-gray-100 px-2 py-1 rounded">
                          {component.component}
                        </span>
                      </td>
                      <td className="p-3 text-center font-medium">
                        {component.marks !== undefined
                          ? `${component.marks}/100`
                          : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          className={
                            GRADE_COLORS[component.letter_grade] ||
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {component.letter_grade}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {component.teacher_remarks || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Grade Scale */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">IGCSE Grade Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
            {(
              [
                { grade: "A*", desc: "Outstanding" },
                { grade: "A", desc: "Excellent" },
                { grade: "B", desc: "Very Good" },
                { grade: "C", desc: "Good" },
                { grade: "D", desc: "Satisfactory" },
                { grade: "E", desc: "Pass" },
                { grade: "F", desc: "Fail" },
                { grade: "G", desc: "Fail" },
                { grade: "U", desc: "Ungraded" },
              ] as GradeScaleItem[]
            ).map((item: GradeScaleItem) => (
              <div key={item.grade} className="text-center">
                <Badge className={`${GRADE_COLORS[item.grade]} mb-1`}>
                  {item.grade}
                </Badge>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        <p>Generated on {new Date().toLocaleDateString()}</p>
        <p className="mt-1">
          This is an official IGCSE report card from {schoolInfo.name}
        </p>
      </div>
    </div>
  );
};
