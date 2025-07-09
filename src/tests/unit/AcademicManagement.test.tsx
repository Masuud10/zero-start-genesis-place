import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AcademicManagementModule from "../../components/modules/AcademicManagementModule";

// Mock the hooks
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "test-user-id",
      email: "principal@school.com",
      role: "principal",
      school_id: "test-school-id",
    },
  }),
}));

jest.mock("../../hooks/useSchoolScopedData", () => ({
  useSchoolScopedData: () => ({
    schoolId: "test-school-id",
    isReady: true,
    userRole: "principal",
  }),
}));

jest.mock("../../hooks/useClasses", () => ({
  useClasses: () => ({
    classes: [
      { id: "class-1", name: "Grade 1A" },
      { id: "class-2", name: "Grade 1B" },
      { id: "class-3", name: "Grade 2A" },
    ],
    loading: false,
    error: null,
    retry: jest.fn(),
  }),
}));

jest.mock("../../hooks/useStudents", () => ({
  useStudents: () => ({
    students: [
      {
        id: "student-1",
        name: "John Doe",
        admission_number: "2024001",
        class_id: "class-1",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
    loading: false,
    error: null,
    retry: jest.fn(),
  }),
}));

jest.mock("../../hooks/useParents", () => ({
  useParents: () => ({
    parents: [],
    loading: false,
    error: null,
    retry: jest.fn(),
  }),
}));

jest.mock("../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("AcademicManagementModule", () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it("renders the Academic Management module with correct title", () => {
    renderWithRouter(<AcademicManagementModule />);

    expect(screen.getByText("Academic Management")).toBeInTheDocument();
  });

  it("renders all sub-feature tabs", () => {
    renderWithRouter(<AcademicManagementModule />);

    expect(screen.getByText("Admission")).toBeInTheDocument();
    expect(screen.getByText("Promotion")).toBeInTheDocument();
    expect(screen.getByText("Information")).toBeInTheDocument();
    expect(screen.getByText("Transfers")).toBeInTheDocument();
    expect(screen.getByText("Exit")).toBeInTheDocument();
  });

  it("renders overview cards for each sub-feature", () => {
    renderWithRouter(<AcademicManagementModule />);

    expect(screen.getByText("Student Admission")).toBeInTheDocument();
    expect(screen.getByText("Student Promotion")).toBeInTheDocument();
    expect(screen.getByText("Student Information")).toBeInTheDocument();
    expect(screen.getByText("Transfer Management")).toBeInTheDocument();
  });

  it("shows principal access badge", () => {
    renderWithRouter(<AcademicManagementModule />);

    expect(screen.getByText("Principal Access")).toBeInTheDocument();
  });

  it("renders student admission form by default", () => {
    renderWithRouter(<AcademicManagementModule />);

    expect(screen.getByText("Student Admission")).toBeInTheDocument();
    expect(
      screen.getByText("Enroll new students with comprehensive information")
    ).toBeInTheDocument();
  });
});
