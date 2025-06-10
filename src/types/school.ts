
export interface School {
  id: string;
  name: string;
  ownerId: string;
  principalId: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  settings: SchoolSettings;
}

export interface SchoolSettings {
  academicYear: string;
  terms: Term[];
  gradeReleaseEnabled: boolean;
  attendanceEnabled: boolean;
}

export interface Term {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}
