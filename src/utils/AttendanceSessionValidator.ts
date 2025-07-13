export interface AttendanceSessionValidatorProps {
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const AttendanceSessionValidator = {
  validateSession: (session: string): boolean => {
    return ['morning', 'afternoon', 'full_day'].includes(session);
  },
  
  getSessionOptions: () => [
    { value: 'morning', label: 'Morning Session' },
    { value: 'afternoon', label: 'Afternoon Session' },
    { value: 'full_day', label: 'Full Day' }
  ]
};