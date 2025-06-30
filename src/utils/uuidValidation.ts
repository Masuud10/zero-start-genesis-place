
/**
 * UUID Validation Utilities
 * Provides secure UUID validation and sanitization for database queries
 */

export interface UuidValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

/**
 * Validates UUID format and prevents SQL injection
 */
export const validateUuid = (value: any): UuidValidationResult => {
  // Handle null, undefined, or empty values
  if (!value || value === 'null' || value === 'undefined' || value === '') {
    return {
      isValid: false,
      error: 'UUID is required but was null or undefined'
    };
  }

  // Convert to string and trim
  const stringValue = String(value).trim();

  // Check for common invalid patterns
  if (stringValue === 'null' || stringValue === 'undefined' || stringValue === '' || stringValue === '0') {
    return {
      isValid: false,
      error: 'UUID cannot be null, undefined, empty, or zero'
    };
  }

  // Validate UUID format (RFC 4122)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(stringValue)) {
    return {
      isValid: false,
      error: `Invalid UUID format: ${stringValue}`
    };
  }

  return {
    isValid: true,
    sanitizedValue: stringValue.toLowerCase()
  };
};

/**
 * Validates school access for the current user
 */
export const validateSchoolAccess = (userSchoolId: any, requestedSchoolId?: any): UuidValidationResult => {
  // Validate user's school ID
  const userValidation = validateUuid(userSchoolId);
  if (!userValidation.isValid) {
    return {
      isValid: false,
      error: 'User is not associated with a valid school'
    };
  }

  // If specific school requested, validate it matches user's school
  if (requestedSchoolId) {
    const requestedValidation = validateUuid(requestedSchoolId);
    if (!requestedValidation.isValid) {
      return {
        isValid: false,
        error: 'Invalid school ID requested'
      };
    }

    if (userValidation.sanitizedValue !== requestedValidation.sanitizedValue) {
      return {
        isValid: false,
        error: 'Access denied: Cannot access data for other schools'
      };
    }
  }

  return {
    isValid: true,
    sanitizedValue: userValidation.sanitizedValue
  };
};

/**
 * Safely validates and returns a UUID or null
 */
export const safeUuidOrNull = (value: any): string | null => {
  const validation = validateUuid(value);
  return validation.isValid ? validation.sanitizedValue! : null;
};

/**
 * Creates a secure error response for invalid UUIDs
 */
export const createUuidError = (context: string, validationResult: UuidValidationResult) => {
  console.error(`UUID Validation Error in ${context}:`, validationResult.error);
  return new Error(`${context}: ${validationResult.error}`);
};
