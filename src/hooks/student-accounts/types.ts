
import { Student, FeeRecord } from '@/hooks/fee-management/types';

export interface StudentAccount {
  student: Student;
  totalFees: number;
  totalPaid: number;
  outstanding: number;
  fees: FeeRecord[];
}
