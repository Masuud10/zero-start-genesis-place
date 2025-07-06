import { renderHook, act, waitFor } from '@testing-library/react';
import { useExaminations } from '@/hooks/useExaminations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/integrations/supabase/client');
jest.mock('@/contexts/AuthContext');
jest.mock('@/hooks/useSchoolScopedData');
jest.mock('@/hooks/use-toast');

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseSchoolScopedData = useSchoolScopedData as jest.MockedFunction<typeof useSchoolScopedData>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

// Type for mock Supabase query builder
type MockQueryBuilder = {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  order: jest.Mock;
};

describe('useExaminations', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'principal' as const,
    school_id: 'school-123'
  };

  const mockSchoolData = {
    schoolId: 'school-123',
    isSystemAdmin: false,
    isReady: true
  };

  const mockToast = {
    toast: jest.fn()
  };

  const mockExamination = {
    id: 'exam-123',
    name: 'Mid-Term Exam',
    type: 'Written' as const,
    term: 'Term 1',
    academic_year: '2024',
    classes: ['class-1', 'class-2'],
    start_date: '2024-03-01',
    end_date: '2024-03-05',
    coordinator_id: 'teacher-123',
    remarks: 'Important examination',
    school_id: 'school-123',
    created_by: 'user-123',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      error: null,
      isInitialized: true,
      signIn: jest.fn(),
      signOut: jest.fn()
    });

    mockUseSchoolScopedData.mockReturnValue({
      schoolId: 'school-123',
      isReady: true,
      isLoading: false,
      hasSchool: true,
      isMultiTenantUser: false,
      isSystemAdmin: false,
      userRole: 'principal',
      validateSchoolAccess: jest.fn()
    });

    mockUseToast.mockReturnValue({
      toast: jest.fn(),
      dismiss: jest.fn(),
      toasts: []
    });

    // Mock Supabase responses with proper typing
    const mockQueryBuilder: MockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockExamination, error: null }),
      order: jest.fn().mockReturnThis()
    };

    mockSupabase.from.mockReturnValue(mockQueryBuilder as unknown as ReturnType<typeof mockSupabase.from>);
  });

  describe('fetchExaminations', () => {
    it('should fetch examinations successfully', async () => {
      const mockData = [mockExamination];
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockData, error: null })
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      } as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHook(() => useExaminations());

      await waitFor(() => {
        expect(result.current.examinations).toEqual(mockData);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('examinations');
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Database error');
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: mockError })
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      } as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHook(() => useExaminations());

      await waitFor(() => {
        expect(result.current.error).toBe('Database error');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should not fetch if school context is not ready', () => {
      mockUseSchoolScopedData.mockReturnValue({
        schoolId: 'school-123',
        isReady: false,
        isLoading: false,
        hasSchool: true,
        isMultiTenantUser: false,
        isSystemAdmin: false,
        userRole: 'principal',
        validateSchoolAccess: jest.fn()
      });

      const { result } = renderHook(() => useExaminations());

      expect(result.current.examinations).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should apply school filter for non-admin users', async () => {
      const mockData = [mockExamination];
      const mockEq = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockData, error: null })
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      } as unknown as ReturnType<typeof mockSupabase.from>);

      renderHook(() => useExaminations());

      await waitFor(() => {
        expect(mockEq).toHaveBeenCalledWith('school_id', 'school-123');
      });
    });

    it('should not apply school filter for system admins', async () => {
      mockUseSchoolScopedData.mockReturnValue({
        schoolId: 'school-123',
        isReady: true,
        isLoading: false,
        hasSchool: true,
        isMultiTenantUser: true,
        isSystemAdmin: true,
        userRole: 'edufam_admin',
        validateSchoolAccess: jest.fn()
      });

      const mockData = [mockExamination];
      const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null });

      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      } as unknown as ReturnType<typeof mockSupabase.from>);

      renderHook(() => useExaminations());

      await waitFor(() => {
        expect(mockOrder).toHaveBeenCalled();
      });
    });
  });

  describe('createExamination', () => {
    const mockCreateData = {
      name: 'New Exam',
      type: 'Written' as const,
      term: 'Term 1' as const,
      academic_year: '2024',
      classes: ['class-1'],
      start_date: '2024-03-01',
      end_date: '2024-03-05',
      coordinator_id: '',
      remarks: 'Test examination'
    };

    it('should create examination successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockExamination,
        error: null
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      } as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHook(() => useExaminations());

      await act(async () => {
        await result.current.createExamination(mockCreateData);
      });

      expect(mockInsert).toHaveBeenCalledWith({
        ...mockCreateData,
        school_id: 'school-123',
        created_by: 'user-123',
        coordinator_id: null
      });

      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Examination created successfully',
        variant: 'default'
      });
    });

    it('should handle creation errors', async () => {
      const mockError = new Error('Creation failed');
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: mockError
      });

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: mockSingle
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      } as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHook(() => useExaminations());

      await act(async () => {
        await expect(result.current.createExamination(mockCreateData)).rejects.toThrow('Creation failed');
      });

      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Creation failed',
        variant: 'destructive'
      });
    });

    it('should validate required fields', async () => {
      const { result } = renderHook(() => useExaminations());

      await act(async () => {
        await expect(result.current.createExamination({
          ...mockCreateData,
          name: ''
        })).rejects.toThrow('Examination name is required');
      });
    });

    it('should require at least one class', async () => {
      const { result } = renderHook(() => useExaminations());

      await act(async () => {
        await expect(result.current.createExamination({
          ...mockCreateData,
          classes: []
        })).rejects.toThrow('At least one target class is required');
      });
    });

    it('should require start and end dates', async () => {
      const { result } = renderHook(() => useExaminations());

      await act(async () => {
        await expect(result.current.createExamination({
          ...mockCreateData,
          start_date: '',
          end_date: ''
        })).rejects.toThrow('Start date and end date are required');
      });
    });
  });

  describe('updateExamination', () => {
    const mockUpdateData = {
      id: 'exam-123',
      name: 'Updated Exam',
      remarks: 'Updated remarks'
    };

    it('should update examination successfully', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...mockExamination, ...mockUpdateData },
        error: null
      });

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate
      } as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHook(() => useExaminations());

      await act(async () => {
        await result.current.updateExamination(mockUpdateData);
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        ...mockUpdateData,
        updated_at: expect.any(String)
      });

      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Examination updated successfully',
        variant: 'default'
      });
    });

    it('should handle update errors', async () => {
      const mockError = new Error('Update failed');
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: mockError
      });

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: mockSingle
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate
      } as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHook(() => useExaminations());

      await act(async () => {
        await expect(result.current.updateExamination(mockUpdateData)).rejects.toThrow('Update failed');
      });

      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Update failed',
        variant: 'destructive'
      });
    });
  });

  describe('deleteExamination', () => {
    it('should delete examination successfully', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete
      } as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHook(() => useExaminations());

      await act(async () => {
        await result.current.deleteExamination('exam-123');
      });

      expect(mockDelete).toHaveBeenCalled();
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Examination deleted successfully',
        variant: 'default'
      });
    });

    it('should handle deletion errors', async () => {
      const mockError = new Error('Deletion failed');
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: mockError })
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete
      } as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHook(() => useExaminations());

      await act(async () => {
        await expect(result.current.deleteExamination('exam-123')).rejects.toThrow('Deletion failed');
      });

      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Deletion failed',
        variant: 'destructive'
      });
    });
  });

  describe('retry', () => {
    it('should refresh examinations data', async () => {
      const mockData = [mockExamination];
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockData, error: null })
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      } as unknown as ReturnType<typeof mockSupabase.from>);

      const { result } = renderHook(() => useExaminations());

      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.examinations).toEqual(mockData);
    });
  });
}); 