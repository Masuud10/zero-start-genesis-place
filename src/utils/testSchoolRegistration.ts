// Test script for school registration functionality
export const testSchoolRegistration = {
  // Test data for school registration
  getTestSchoolData: () => ({
    school_name: 'Test Academy',
    school_email: 'test@academy.com',
    school_phone: '+254 700 123 456',
    school_address: '123 Test Street, Nairobi, Kenya',
    registration_number: 'TEST/2024/001',
    school_type: 'secondary' as const,
    term_structure: '3-term' as const,
    year_established: 2020,
    max_students: 500,
    timezone: 'Africa/Nairobi',
    logo_url: 'https://example.com/logo.png',
    website_url: 'https://testacademy.com',
    motto: 'Excellence in Education',
    slogan: 'Nurturing Future Leaders',
    owner_name: 'John Doe',
    owner_email: 'owner@testacademy.com',
    owner_phone: '+254 700 654 321',
    owner_information: 'Experienced educator with 15 years in school management',
    mpesa_enabled: true,
    mpesa_paybill_number: '123456',
    mpesa_business_name: 'Test Academy',
    mpesa_callback_url: 'https://testacademy.com/api/mpesa/callback',
    mpesa_shortcode: '123456',
    mpesa_confirmation_key: 'test_confirmation_key'
  }),

  // Validate form data
  validateFormData: (data: Record<string, unknown>) => {
    const errors: string[] = [];
    
    if (!(data.school_name as string)?.trim()) errors.push('School name is required');
    if (!(data.school_email as string)?.trim()) errors.push('School email is required');
    if (!(data.school_phone as string)?.trim()) errors.push('School phone is required');
    if (!(data.school_address as string)?.trim()) errors.push('School address is required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if ((data.school_email as string) && !emailRegex.test(data.school_email as string)) {
      errors.push('Invalid email format');
    }
    
    // Year validation
    const currentYear = new Date().getFullYear();
    const yearEstablished = data.year_established as number;
    if (yearEstablished < 1800 || yearEstablished > currentYear) {
      errors.push(`Year must be between 1800 and ${currentYear}`);
    }
    
    // Max students validation
    const maxStudents = data.max_students as number;
    if (maxStudents < 1 || maxStudents > 10000) {
      errors.push('Maximum students must be between 1 and 10,000');
    }
    
    // MPESA validation if enabled
    if (data.mpesa_enabled as boolean) {
      if (!(data.mpesa_paybill_number as string)?.trim()) {
        errors.push('Paybill number is required when MPESA is enabled');
      }
      if (!(data.mpesa_business_name as string)?.trim()) {
        errors.push('Business name is required when MPESA is enabled');
      }
      if (!(data.mpesa_shortcode as string)?.trim()) {
        errors.push('Shortcode is required when MPESA is enabled');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Test the form validation
  testFormValidation: () => {
    console.log('🧪 Testing school registration form validation...');
    
    const testData = testSchoolRegistration.getTestSchoolData();
    const validation = testSchoolRegistration.validateFormData(testData);
    
    console.log('✅ Form validation test:', validation);
    
    // Test with invalid data
    const invalidData = { ...testData, school_name: '', school_email: 'invalid-email' };
    const invalidValidation = testSchoolRegistration.validateFormData(invalidData);
    
    console.log('❌ Invalid data validation test:', invalidValidation);
    
    return {
      validDataTest: validation,
      invalidDataTest: invalidValidation
    };
  },

  // Run all tests
  runAllTests: () => {
    console.log('🚀 Running all school registration tests...');
    
    const results = {
      validation: testSchoolRegistration.testFormValidation()
    };
    
    console.log('📊 Test results:', results);
    
    return results;
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).testSchoolRegistration = testSchoolRegistration;
} 