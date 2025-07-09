import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PrincipalGradesModule from "../../components/modules/PrincipalGradesModule";
import { AuthProvider } from "../../contexts/AuthContext";
import { SchoolProvider } from "../../contexts/SchoolContext";
import { GradeManagementService } from "../../services/gradeManagementService";

// Mock the hooks and services
jest.mock("../../hooks/useClasses", () => ({
  useClasses: () => ({
    classes: [
      { id: "class1", name: "Class 1A" },
      { id: "class2", name: "Class 2B" },
    ],
    loading: false,
    error: null,
  }),
}));

jest.mock("../../hooks/useSubjects", () => ({
  useSubjects: () => ({
    subjects: [
      { id: "subject1", name: "Mathematics", code: "MATH" },
      { id: "subject2", name: "English", code: "ENG" },
    ],
    loading: false,
    error: null,
  }),
}));

jest.mock("../../hooks/useClassCurriculum", () => ({
  useClassCurriculum: () => ({
    curriculumType: "standard",
    loading: false,
    error: null,
  }),
}));

jest.mock("../../hooks/useCurrentAcademicInfo", () => ({
  useCurrentAcademicInfo: () => ({
    academicInfo: { term: "Term 1", year: "2024" },
    loading: false,
  }),
}));

jest.mock("../../hooks/useAcademicModuleIntegration", () => ({
  useAcademicModuleIntegration: () => ({
    context: {
      academic_year_id: "2024",
      term_id: "term1",
      school_id: "school1",
    },
    isLoading: false,
    error: null,
    data: {},
    isValid: true,
    refreshData: jest.fn(),
    currentPeriod: { year: { id: "2024" }, term: { id: "term1" } },
    validation: {},
  }),
}));

jest.mock("../../services/gradeManagementService", () => ({
  GradeManagementService: {
    getGradesForPrincipal: jest.fn().mockResolvedValue({
      data: [
        {
          id: "grade1",
          student_id: "student1",
          subject_id: "subject1",
          class_id: "class1",
          score: 85,
          max_score: 100,
          percentage: 85,
          letter_grade: "A",
          status: "submitted",
          submitted_at: "2024-01-01T00:00:00Z",
          term: "Term 1",
          exam_type: "END_TERM",
          curriculum_type: "standard",
          students: { name: "John Doe", admission_number: "ST001" },
          subjects: { name: "Mathematics", code: "MATH" },
          classes: { name: "Class 1A" },
          profiles: { name: "Teacher Smith" },
        },
      ],
      error: null,
    }),
    approveGrades: jest.fn().mockResolvedValue({ success: true }),
    rejectGrades: jest.fn().mockResolvedValue({ success: true }),
    overrideGrades: jest.fn().mockResolvedValue({ success: true }),
    releaseGrades: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock("../../integrations/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            then: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}));

jest.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <SchoolProvider>{component}</SchoolProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("PrincipalGradesModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Grade Management module with correct title", () => {
    renderWithProviders(<PrincipalGradesModule />);

    expect(screen.getByText("Grade Management")).toBeInTheDocument();
    expect(screen.getByText("Principal Access")).toBeInTheDocument();
  });

  it("displays filter dropdowns for class, subject, term, exam type, and status", () => {
    renderWithProviders(<PrincipalGradesModule />);

    expect(screen.getByText("Class")).toBeInTheDocument();
    expect(screen.getByText("Subject")).toBeInTheDocument();
    expect(screen.getByText("Term")).toBeInTheDocument();
    expect(screen.getByText("Exam Type")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("shows action buttons when grades are selected", async () => {
    renderWithProviders(<PrincipalGradesModule />);

    // Wait for grades to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Select a grade
    const checkbox = screen.getByRole("checkbox", { name: /select grade/i });
    fireEvent.click(checkbox);

    // Check if bulk action buttons appear
    expect(screen.getByText("1 grade(s) selected")).toBeInTheDocument();
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
    expect(screen.getByText("Override")).toBeInTheDocument();
    expect(screen.getByText("Release")).toBeInTheDocument();
  });

  it("displays grades in tabs with correct counts", async () => {
    renderWithProviders(<PrincipalGradesModule />);

    await waitFor(() => {
      expect(screen.getByText("Pending (1)")).toBeInTheDocument();
      expect(screen.getByText("Approved (0)")).toBeInTheDocument();
      expect(screen.getByText("Rejected (0)")).toBeInTheDocument();
      expect(screen.getByText("Released (0)")).toBeInTheDocument();
    });
  });

  it("shows grade details in the table", async () => {
    renderWithProviders(<PrincipalGradesModule />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("ST001")).toBeInTheDocument();
      expect(screen.getByText("Mathematics")).toBeInTheDocument();
      expect(screen.getByText("MATH")).toBeInTheDocument();
      expect(screen.getByText("Class 1A")).toBeInTheDocument();
      expect(screen.getByText("85/100")).toBeInTheDocument();
      expect(screen.getByText("85.0%")).toBeInTheDocument();
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("Term 1")).toBeInTheDocument();
      expect(screen.getByText("END_TERM")).toBeInTheDocument();
    });
  });

  it("shows correct status badges", async () => {
    renderWithProviders(<PrincipalGradesModule />);

    await waitFor(() => {
      expect(screen.getByText("Pending Review")).toBeInTheDocument();
    });
  });

  it("enables grading sheet button when all required filters are selected", async () => {
    renderWithProviders(<PrincipalGradesModule />);

    const gradingSheetButton = screen.getByText("Open Grading Sheet");
    expect(gradingSheetButton).toBeDisabled();

    // Select specific class, term, and exam type
    const classSelect = screen.getByText("All Classes");
    fireEvent.click(classSelect);
    fireEvent.click(screen.getByText("Class 1A"));

    const termSelect = screen.getByText("All Terms");
    fireEvent.click(termSelect);
    fireEvent.click(screen.getByText("Term 1"));

    const examTypeSelect = screen.getByText("All Exams");
    fireEvent.click(examTypeSelect);
    fireEvent.click(screen.getByText("END_TERM"));

    // Button should now be enabled
    expect(gradingSheetButton).toBeEnabled();
  });

  it("shows curriculum warning when curriculum type is missing", () => {
    // Mock curriculum error
    const useClassCurriculum =
      require("../../hooks/useClassCurriculum").useClassCurriculum;
    jest.mocked(useClassCurriculum).mockReturnValue({
      curriculumType: "standard",
      loading: false,
      error: "No curriculum type assigned to this class",
    });

    renderWithProviders(<PrincipalGradesModule />);

    expect(
      screen.getByText(
        "Curriculum type not assigned to this class. Please update class settings."
      )
    ).toBeInTheDocument();
  });

  it("handles bulk approve action", async () => {
    renderWithProviders(<PrincipalGradesModule />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Select a grade
    const checkbox = screen.getByRole("checkbox", { name: /select grade/i });
    fireEvent.click(checkbox);

    // Click approve button
    const approveButton = screen.getByText("Approve");
    fireEvent.click(approveButton);

    // Should call the service
    expect(GradeManagementService.approveGrades).toHaveBeenCalled();
  });

  it("handles bulk reject action", async () => {
    renderWithProviders(<PrincipalGradesModule />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Select a grade
    const checkbox = screen.getByRole("checkbox", { name: /select grade/i });
    fireEvent.click(checkbox);

    // Click reject button
    const rejectButton = screen.getByText("Reject");
    fireEvent.click(rejectButton);

    // Should call the service
    expect(GradeManagementService.rejectGrades).toHaveBeenCalled();
  });

  it("handles bulk override action", async () => {
    renderWithProviders(<PrincipalGradesModule />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Select a grade
    const checkbox = screen.getByRole("checkbox", { name: /select grade/i });
    fireEvent.click(checkbox);

    // Click override button
    const overrideButton = screen.getByText("Override");
    fireEvent.click(overrideButton);

    // Should call the service
    expect(GradeManagementService.overrideGrades).toHaveBeenCalled();
  });

  it("handles bulk release action", async () => {
    renderWithProviders(<PrincipalGradesModule />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Select a grade
    const checkbox = screen.getByRole("checkbox", { name: /select grade/i });
    fireEvent.click(checkbox);

    // Click release button
    const releaseButton = screen.getByText("Release");
    fireEvent.click(releaseButton);

    // Should call the service
    expect(GradeManagementService.releaseGrades).toHaveBeenCalled();
  });

  it("shows loading state while fetching grades", () => {
    // Mock loading state
    jest
      .mocked(GradeManagementService.getGradesForPrincipal)
      .mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<PrincipalGradesModule />);

    expect(screen.getByText("Loading grades...")).toBeInTheDocument();
  });

  it("shows empty state when no grades are found", async () => {
    // Mock empty data
    jest
      .mocked(GradeManagementService.getGradesForPrincipal)
      .mockResolvedValue({ data: [], error: null });

    renderWithProviders(<PrincipalGradesModule />);

    await waitFor(() => {
      expect(
        screen.getByText("No grades found for the selected filters.")
      ).toBeInTheDocument();
    });
  });

  it("handles filter changes correctly", async () => {
    renderWithProviders(<PrincipalGradesModule />);

    // Change class filter
    const classSelect = screen.getByText("All Classes");
    fireEvent.click(classSelect);
    fireEvent.click(screen.getByText("Class 1A"));

    // Should refetch grades with new filter
    expect(GradeManagementService.getGradesForPrincipal).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        classId: "class1",
      })
    );
  });
});
