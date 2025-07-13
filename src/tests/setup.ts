import '@testing-library/jest-dom';

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
    mark: jest.fn(),
    measure: jest.fn(),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(() => null),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(() => null),
};
global.sessionStorage = sessionStorageMock as any;

// Mock fetch
global.fetch = jest.fn();

// Mock console methods in tests to reduce noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: componentWillReceiveProps') ||
        args[0].includes('Warning: componentWillUpdate'))
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    storage: {
      from: jest.fn(),
    },
  },
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    refreshUser: jest.fn(),
  }),
}));

// Mock school context
jest.mock('@/hooks/useSchoolScopedData', () => ({
  useSchoolScopedData: () => ({
    schoolId: 'test-school-id',
    isSystemAdmin: false,
    isReady: true,
    refreshSchoolData: jest.fn(),
  }),
}));

// Custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null;
    if (pass) {
      return {
        message: () => `expected ${received} not to be in the document`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in the document`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.testUtils = {
  // Wait for a condition to be true
  waitFor: (condition: () => boolean, timeout = 5000) => {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },

  // Mock user data
  mockUser: {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'principal' as const,
    school_id: 'test-school-id',
    name: 'Test User',
    status: 'active' as const,
  },

  // Mock school data
  mockSchool: {
    id: 'test-school-id',
    name: 'Test School',
    email: 'school@example.com',
    phone: '+1234567890',
    address: '123 Test Street',
    school_type: 'primary',
    status: 'active' as const,
  },

  // Mock student data
  mockStudent: {
    id: 'test-student-id',
    name: 'Test Student',
    admission_number: 'STU001',
    class_id: 'test-class-id',
    parent_id: 'test-parent-id',
    school_id: 'test-school-id',
    is_active: true,
  },

  // Mock class data
  mockClass: {
    id: 'test-class-id',
    name: 'Class 1A',
    level: '1',
    stream: 'A',
    school_id: 'test-school-id',
    capacity: 30,
    is_active: true,
  },

  // Mock examination data
  mockExamination: {
    id: 'test-exam-id',
    name: 'Mid-Term Exam',
    type: 'Written' as const,
    term: 'Term 1',
    academic_year: '2024',
    classes: ['test-class-id'],
    start_date: '2024-03-01',
    end_date: '2024-03-05',
    coordinator_id: 'test-teacher-id',
    remarks: 'Important examination',
    school_id: 'test-school-id',
    created_by: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

// Type declarations for global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }

  var testUtils: {
    waitFor: (condition: () => boolean, timeout?: number) => Promise<void>;
    mockUser: {
      id: string;
      email: string;
      role: 'principal';
      school_id: string;
      name: string;
      status: 'active';
    };
    mockSchool: {
      id: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      school_type: string;
      status: 'active';
    };
    mockStudent: {
      id: string;
      name: string;
      admission_number: string;
      class_id: string;
      parent_id: string;
      school_id: string;
      is_active: boolean;
    };
    mockClass: {
      id: string;
      name: string;
      level: string;
      stream: string;
      school_id: string;
      capacity: number;
      is_active: boolean;
    };
    mockExamination: {
      id: string;
      name: string;
      type: 'Written';
      term: string;
      academic_year: string;
      classes: string[];
      start_date: string;
      end_date: string;
      coordinator_id: string;
      remarks: string;
      school_id: string;
      created_by: string;
      created_at: string;
      updated_at: string;
    };
  }
} 