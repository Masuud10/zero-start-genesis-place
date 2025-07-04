# Dynamic Grading Sheet Implementation

## Overview

The dynamic grading sheet system automatically generates the appropriate grading format based on the selected class's curriculum type. This ensures that teachers and principals always see the correct grading interface for their specific curriculum.

## Features Implemented

### ✅ Dynamic Curriculum Detection

- **Class-Specific Detection**: Uses `useClassCurriculum` hook to detect curriculum type for each class
- **Fallback Logic**: Falls back to school-wide curriculum if class-specific type is not set
- **Error Handling**: Shows helpful message if no curriculum type is found

### ✅ Curriculum-Specific Grading Sheets

#### CBC (Competency-Based Curriculum)

- **Performance Levels**: EM (Emerging), AP (Approaching), PR (Proficient), EX (Exemplary)
- **Strand Assessment**: Individual strand and sub-strand scoring
- **Competency Tracking**: Tracks learning outcomes and competencies
- **Database**: Uses `cbc_strand_assessments` table

#### IGCSE (International General Certificate of Secondary Education)

- **Letter Grades**: A\*, A, B, C, D, E, F, G, U
- **Component Scoring**: Coursework and examination components
- **Grade Boundaries**: Configurable grade boundaries per subject
- **Database**: Uses `grades` table with IGCSE-specific fields

#### Standard (8-4-4 or Traditional)

- **Numeric Scoring**: 0-100% with automatic grade calculation
- **Letter Grades**: A+, A, B+, B, C+, C, D+, D, E
- **Position Calculation**: Automatic class ranking
- **Database**: Uses `grades` table

### ✅ Integration Points

#### Teacher Dashboard

- **My Class Grades**: Integrated in `TeacherGradesManager.tsx`
- **Dynamic Selection**: Class → Term → Exam Type → Dynamic Sheet
- **Subject Filtering**: Shows only teacher's assigned subjects

#### Principal Dashboard

- **Grades Management**: Integrated in `PrincipalGradesModule.tsx`
- **Full Access**: Can view and edit all subjects
- **Approval Workflow**: Compatible with grade approval system

### ✅ Database Persistence

- **Secure Storage**: All grades persist to database
- **Workflow Compatible**: Works with approval, override, and release workflows
- **Audit Trail**: Maintains grading history and changes

## Technical Implementation

### Core Components

1. **`useClassCurriculum` Hook** (`src/hooks/useClassCurriculum.ts`)

   - Detects curriculum type for specific class
   - Handles loading states and errors
   - Provides fallback to school curriculum

2. **`DynamicGradingSheet` Component** (`src/components/grading/DynamicGradingSheet.tsx`)

   - Main orchestrator component
   - Renders appropriate grading sheet based on curriculum type
   - Handles data loading and submission

3. **Curriculum-Specific Sheets**:
   - `CBCGradingSheet`: CBC strand assessments
   - `IGCSEGradingSheet`: IGCSE letter grades
   - `EnhancedGradingSheet`: Standard numeric grades

### Data Flow

```
Class Selection → Curriculum Detection → Data Loading → Dynamic Sheet Rendering
     ↓                    ↓                    ↓                    ↓
Teacher/Principal → useClassCurriculum → Load Students/Subjects → CBC/IGCSE/Standard
```

### Error Handling

- **No Curriculum Type**: Shows helpful message to update class information
- **Loading States**: Proper loading indicators during data fetch
- **Database Errors**: User-friendly error messages with retry options

## Testing Instructions

### 1. Test with Different Curriculum Types

#### CBC Testing

1. Select a class tagged as "CBC"
2. Choose Term and Assessment Type
3. Verify CBC grading sheet appears with:
   - Performance level options (EM, AP, PR, EX)
   - Strand and sub-strand fields
   - Competency tracking

#### IGCSE Testing

1. Select a class tagged as "IGCSE"
2. Choose Term and Exam Type
3. Verify IGCSE grading sheet appears with:
   - Coursework and exam score fields
   - Letter grade calculation (A\*, A, B, C, D, E, F, G, U)
   - Component weighting

#### Standard Testing

1. Select a class tagged as "Standard"
2. Choose Term and Exam Type
3. Verify Standard grading sheet appears with:
   - Numeric score fields (0-100)
   - Automatic letter grade calculation
   - Position ranking

### 2. Test Error Scenarios

#### No Curriculum Type

1. Select a class without curriculum type
2. Verify helpful message appears:
   "No curriculum type set for this class. Please update the class information."

#### Database Connectivity

1. Test with network issues
2. Verify proper error handling and retry options

### 3. Test Integration Points

#### Teacher Workflow

1. Login as teacher
2. Navigate to "My Class Grades"
3. Select class, term, exam type
4. Verify dynamic grading sheet loads correctly
5. Enter grades and submit
6. Verify grades persist to database

#### Principal Workflow

1. Login as principal
2. Navigate to "Grades Management"
3. Select class, term, exam type
4. Verify dynamic grading sheet loads correctly
5. Review and approve grades
6. Verify approval workflow works

### 4. Test Component

Use the `DynamicGradingSheetTest` component for quick testing:

```tsx
import { DynamicGradingSheetTest } from "@/components/grading/DynamicGradingSheetTest";

// Add to any page for testing
<DynamicGradingSheetTest />;
```

## Database Schema Requirements

### Classes Table

```sql
ALTER TABLE classes ADD COLUMN curriculum_type VARCHAR(20) DEFAULT 'standard';
```

### Curriculum Types

- `'cbc'`: Competency-Based Curriculum
- `'igcse'`: International General Certificate of Secondary Education
- `'standard'`: Standard curriculum (8-4-4 or traditional)

### Required Tables

- `classes` (with curriculum_type field)
- `students` (linked to classes)
- `subjects` (linked to classes)
- `grades` (for standard/IGCSE)
- `cbc_strand_assessments` (for CBC)
- `subject_teacher_assignments` (for teacher access control)

## Console Logging

The implementation includes comprehensive console logging for debugging:

- `🎓 DynamicGradingSheet: Loading data for class:` - Shows when data loading starts
- `🎓 DynamicGradingSheet: Loaded X students` - Shows student count
- `🎓 DynamicGradingSheet: Loaded X subjects` - Shows subject count
- `🎓 DynamicGradingSheet: Loaded X grades/assessments` - Shows existing data
- `🎓 DynamicGradingSheet: Data loaded successfully` - Confirms successful load

## Future Enhancements

1. **Bulk Operations**: Add bulk grade entry for efficiency
2. **Grade Templates**: Pre-configured grading templates per curriculum
3. **Advanced Analytics**: Curriculum-specific performance analytics
4. **Mobile Support**: Responsive design for mobile devices
5. **Offline Support**: Offline grade entry with sync

## Support

For issues or questions about the dynamic grading sheet implementation:

1. Check console logs for debugging information
2. Verify class curriculum type is set correctly
3. Ensure database tables exist and are properly configured
4. Test with the provided test component

## Conclusion

The dynamic grading sheet system provides a seamless, curriculum-aware grading experience for teachers and principals. It automatically adapts to the selected class's curriculum type, ensuring the correct grading format is always displayed while maintaining compatibility with existing approval and release workflows.
