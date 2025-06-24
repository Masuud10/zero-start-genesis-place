
export class InputSanitizer {
  static sanitizeHtml(input: string): string {
    // Remove script tags and javascript: protocols
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    
    // Replace HTML entities
    const entityMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
    
    return sanitized.replace(/[&<>"'\/]/g, (s) => entityMap[s]);
  }

  static sanitizeEmail(email: string): string {
    // Remove whitespace and convert to lowercase
    let sanitized = email.trim().toLowerCase();
    
    // Basic email validation pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    return sanitized;
  }

  static sanitizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let sanitized = phone.replace(/[^\d+]/g, '');
    
    // Ensure it starts with + for international format
    if (!sanitized.startsWith('+')) {
      // Assume Kenyan number if no country code
      if (sanitized.startsWith('0')) {
        sanitized = '+254' + sanitized.substring(1);
      } else if (sanitized.startsWith('7') || sanitized.startsWith('1')) {
        sanitized = '+254' + sanitized;
      } else {
        sanitized = '+' + sanitized;
      }
    }
    
    return sanitized;
  }

  static sanitizeNumeric(input: string): number {
    const num = parseFloat(input.replace(/[^\d.-]/g, ''));
    if (isNaN(num)) {
      throw new Error('Invalid numeric input');
    }
    return num;
  }

  static sanitizeAlphanumeric(input: string): string {
    // Allow letters, numbers, spaces, and basic punctuation
    return input.replace(/[^a-zA-Z0-9\s\-_.,']/g, '').trim();
  }

  static validateInputLength(input: string, maxLength: number, fieldName: string): void {
    if (input.length > maxLength) {
      throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
    }
  }

  static preventSQLInjection(input: string): string {
    // Remove common SQL injection patterns
    const sqlPatterns = [
      /('|(\\')|('')|([^a-zA-Z0-9_\-@. ]|[A-Za-z0-9_\-]{0,}['][\s]*[select|update|delete|insert|drop|create|alter|exec|execute|union|script])/gi,
      /(union|select|insert|delete|update|drop|create|alter|exec|execute|script)/gi
    ];
    
    let sanitized = input;
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
    
    return sanitized.trim();
  }
}
