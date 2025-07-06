import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface GradeChangeData {
  score?: number | null;
  percentage?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
}

interface GradeCellProps {
  curriculumType: "cbc" | "igcse" | "standard";
  grade: {
    score?: number | null;
    letter_grade?: string | null;
    cbc_performance_level?: string | null;
    percentage?: number | null;
  };
  onGradeChange: (grade: GradeChangeData) => void;
  isReadOnly?: boolean;
}

const GradeCell: React.FC<GradeCellProps> = ({
  curriculumType,
  grade,
  onGradeChange,
  isReadOnly = false,
}) => {
  const [scoreInput, setScoreInput] = useState(grade.score?.toString() || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setScoreInput(grade.score?.toString() || "");
  }, [grade.score]);

  const calculateGrades = (score: number) => {
    const percentage = Math.round(score);
    let letterGrade = "";
    let cbcLevel = "";

    // Calculate letter grade for standard curriculum
    if (curriculumType === "standard") {
      if (score >= 90) letterGrade = "A+";
      else if (score >= 80) letterGrade = "A";
      else if (score >= 70) letterGrade = "B+";
      else if (score >= 60) letterGrade = "B";
      else if (score >= 50) letterGrade = "C+";
      else if (score >= 40) letterGrade = "C";
      else if (score >= 30) letterGrade = "D+";
      else if (score >= 20) letterGrade = "D";
      else letterGrade = "E";
    }

    // Calculate CBC performance level
    if (curriculumType === "cbc") {
      if (score >= 90) cbcLevel = "Exceeds Expectations";
      else if (score >= 70) cbcLevel = "Meets Expectations";
      else if (score >= 50) cbcLevel = "Approaches Expectations";
      else cbcLevel = "Below Expectations";
    }

    return { percentage, letterGrade, cbcLevel };
  };

  const handleScoreChange = (value: string) => {
    if (isReadOnly) return;

    setScoreInput(value);

    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
      const { percentage, letterGrade, cbcLevel } =
        calculateGrades(numericValue);

      onGradeChange({
        score: numericValue,
        percentage,
        letter_grade: letterGrade || null,
        cbc_performance_level: cbcLevel || null,
      });
    } else if (value === "") {
      onGradeChange({
        score: null,
        percentage: null,
        letter_grade: null,
        cbc_performance_level: null,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (isReadOnly) return;

    // Allow navigation with Tab and Enter
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      const nextCell = e.currentTarget
        .closest("td")
        ?.nextElementSibling?.querySelector("input");
      if (nextCell) {
        (nextCell as HTMLElement).focus();
      } else {
        // Move to next row
        const currentRow = e.currentTarget.closest("tr");
        const nextRow = currentRow?.nextElementSibling;
        const firstCellInNextRow = nextRow?.querySelector(
          "td:nth-child(2) input"
        );
        if (firstCellInNextRow) {
          (firstCellInNextRow as HTMLElement).focus();
        }
      }
    }
  };

  const getGradeColor = (percentage: number | null) => {
    if (!percentage) return "text-muted-foreground";
    if (percentage >= 70) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getLetterGradeColor = (letterGrade: string | null) => {
    if (!letterGrade) return "default";
    if (["A+", "A"].includes(letterGrade)) return "default";
    if (["B+", "B"].includes(letterGrade)) return "secondary";
    return "destructive";
  };

  if (curriculumType === "cbc") {
    return (
      <div className="space-y-1">
        <Input
          ref={inputRef}
          type="number"
          min="0"
          max="100"
          value={scoreInput}
          onChange={(e) => handleScoreChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="0-100"
          className={`h-8 text-center ${isReadOnly ? "bg-gray-50" : ""}`}
          disabled={isReadOnly}
        />
        {grade.cbc_performance_level && (
          <div className="text-xs text-center">
            <Badge variant="outline" className="text-xs">
              {grade.cbc_performance_level}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  if (curriculumType === "igcse") {
    return (
      <div className="space-y-1">
        <Input
          ref={inputRef}
          type="number"
          min="0"
          max="100"
          value={scoreInput}
          onChange={(e) => handleScoreChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="0-100"
          className={`h-8 text-center ${isReadOnly ? "bg-gray-50" : ""}`}
          disabled={isReadOnly}
        />
        <Select
          value={grade.letter_grade || ""}
          onValueChange={(value) =>
            !isReadOnly &&
            onGradeChange({
              score: grade.score || null,
              percentage: grade.percentage || null,
              letter_grade: value,
              cbc_performance_level: grade.cbc_performance_level || null,
            })
          }
          disabled={isReadOnly}
        >
          <SelectTrigger className="h-6 text-xs">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A*">A*</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
            <SelectItem value="D">D</SelectItem>
            <SelectItem value="E">E</SelectItem>
            <SelectItem value="F">F</SelectItem>
            <SelectItem value="G">G</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Standard curriculum
  return (
    <div className="space-y-1">
      <Input
        ref={inputRef}
        type="number"
        min="0"
        max="100"
        value={scoreInput}
        onChange={(e) => handleScoreChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="0-100"
        className={`h-8 text-center ${isReadOnly ? "bg-gray-50" : ""}`}
        disabled={isReadOnly}
      />
      {grade.letter_grade && (
        <div className="text-center">
          <Badge
            variant={getLetterGradeColor(grade.letter_grade)}
            className="text-xs"
          >
            {grade.letter_grade}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default GradeCell;
