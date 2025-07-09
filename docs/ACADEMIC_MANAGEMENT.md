# Academic Management Feature

## Overview

The Academic Management feature provides principals with centralized access to all academic administrative operations. This comprehensive module includes student admission, promotion, information management, transfers, and exit management.

## Features

### 1. Student Admission

- **Purpose**: Enroll new students with comprehensive information
- **Access**: Principal only
- **Features**:
  - Responsive admission form
  - Automatic class assignment
  - Curriculum type selection (CBC, IGCSE, Standard)
  - Parent contact integration
  - Academic year and term assignment
  - Duplicate admission number validation

### 2. Student Promotion

- **Purpose**: Bulk promotion of students between classes
- **Access**: Principal only
- **Features**:
  - Bulk selection and promotion
  - Filtering by stream and curriculum
  - Promotion validation
  - Academic year progression
  - Option to retain or repeat students

### 3. Student Information

- **Purpose**: Comprehensive student records management
- **Access**: Principal only
- **Features**:
  - Detailed student list view
  - Advanced filtering options
  - Student profile details
  - Academic history tracking
  - Export and print capabilities

### 4. Transfer Management

- **Purpose**: Manage student transfers within the school
- **Access**: Principal only
- **Features**:
  - Inter-class transfers
  - Transfer reason documentation
  - Approval workflow
  - Transfer history tracking
  - Data consistency validation

### 5. Exit Management

- **Purpose**: Archive students who leave or graduate
- **Access**: Principal only
- **Features**:
  - Exit reason categorization
  - Certificate tracking
  - Records transfer management
  - Archived student viewing
  - Historical data preservation

## Database Schema

### New Tables

#### `student_transfers`

```sql
CREATE TABLE student_transfers (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  from_class_id UUID REFERENCES classes(id),
  to_class_id UUID REFERENCES classes(id),
  reason TEXT NOT NULL,
  transfer_date DATE NOT NULL,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  school_id UUID REFERENCES schools(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `student_exits`

```sql
CREATE TABLE student_exits (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  exit_reason TEXT NOT NULL,
  exit_date DATE NOT NULL,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  additional_notes TEXT,
  certificate_issued BOOLEAN DEFAULT false,
  records_transferred BOOLEAN DEFAULT false,
  school_id UUID REFERENCES schools(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Modified Tables

#### `students`

- Added `status` column for tracking student state

## Access Control

### Role-Based Access

- **Principal**: Full access to all features
- **Other Roles**: Access denied with appropriate message

### Row Level Security (RLS)

- School isolation for all operations
- EduFam admin override for system-wide access

## File Structure

```
src/components/modules/
├── AcademicManagementModule.tsx          # Main module container
└── academic-management/
    ├── StudentAdmissionTab.tsx           # Student admission form
    ├── StudentPromotionTab.tsx           # Bulk promotion interface
    ├── StudentInformationTab.tsx         # Student records view
    ├── TransferManagementTab.tsx         # Transfer management
    └── ExitManagementTab.tsx             # Exit management
```

## Navigation Integration

### Sidebar Menu

The Academic Management feature is integrated into the principal's sidebar navigation:

```typescript
{
  id: "academic-management",
  label: "Academic Management",
  icon: BookOpen,
  roles: ["principal"],
  subItems: [
    { id: "student-admission", label: "Student Admission", icon: UserPlus },
    { id: "student-promotion", label: "Student Promotion", icon: ArrowUpDown },
    { id: "student-information", label: "Student Information", icon: Users },
    { id: "transfer-management", label: "Transfer Management", icon: TrendingUp },
    { id: "exit-management", label: "Exit Management", icon: Archive }
  ]
}
```

## API Integration

### Hooks Used

- `useClasses()` - Class data management
- `useStudents()` - Student data management
- `useParents()` - Parent data management
- `useSchoolScopedData()` - School context
- `useToast()` - User notifications

### Database Operations

- Student CRUD operations
- Transfer record management
- Exit record management
- Bulk operations for promotions

## Validation Rules

### Student Admission

- Required fields: Full name, admission number, class, curriculum type
- Admission number uniqueness validation
- Date of birth validation
- Parent contact validation

### Student Promotion

- Target class must be different from current class
- Academic year progression validation
- Bulk operation confirmation

### Transfer Management

- Transfer reason required
- Approval workflow validation
- Data consistency checks

### Exit Management

- Exit reason categorization
- Certificate and records tracking
- Historical data preservation

## Error Handling

### User-Friendly Messages

- Validation errors with specific field guidance
- Database operation failures with retry options
- Access denied messages for unauthorized users

### Error Boundaries

- Component-level error boundaries
- Graceful degradation for failed operations
- Retry mechanisms for transient failures

## Performance Considerations

### Lazy Loading

- All sub-components are lazy loaded
- Code splitting for optimal bundle size
- Progressive enhancement

### Database Optimization

- Indexed queries for performance
- Pagination for large datasets
- Efficient filtering and sorting

## Testing

### Unit Tests

- Component rendering tests
- Hook integration tests
- Form validation tests
- Error handling tests

### Integration Tests

- Database operation tests
- API integration tests
- User workflow tests

## Future Enhancements

### Planned Features

- Advanced reporting and analytics
- Bulk import/export capabilities
- Automated promotion workflows
- Integration with external systems
- Mobile-responsive optimizations

### Scalability Considerations

- Database query optimization
- Caching strategies
- Performance monitoring
- Load testing

## Migration Guide

### Database Migration

Run the migration file to create necessary tables:

```bash
supabase db push
```

### Code Deployment

1. Deploy new components
2. Update navigation configuration
3. Test role-based access
4. Verify database operations

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
