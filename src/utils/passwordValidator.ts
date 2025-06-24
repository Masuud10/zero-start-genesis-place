
export interface PasswordValidationResult {
  isValid: boolean;
  score: number;
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    noCommon: boolean;
  };
}

export class PasswordValidator {
  private static readonly COMMON_PASSWORDS = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'iloveyou'
  ];

  static validate(password: string): PasswordValidationResult {
    const requirements = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommon: !this.COMMON_PASSWORDS.some(common => 
        password.toLowerCase().includes(common.toLowerCase())
      )
    };

    const score = Object.values(requirements).reduce((acc, met) => acc + (met ? 1 : 0), 0);
    const isValid = score >= 5; // At least 5 out of 6 requirements

    const feedback: string[] = [];
    if (!requirements.length) feedback.push('Use at least 12 characters');
    if (!requirements.uppercase) feedback.push('Include uppercase letters (A-Z)');
    if (!requirements.lowercase) feedback.push('Include lowercase letters (a-z)');
    if (!requirements.numbers) feedback.push('Include numbers (0-9)');
    if (!requirements.symbols) feedback.push('Include special characters (!@#$%^&*)');
    if (!requirements.noCommon) feedback.push('Avoid common passwords');

    return {
      isValid,
      score,
      feedback,
      requirements
    };
  }

  static getStrengthText(score: number): { text: string; color: string } {
    if (score <= 2) return { text: 'Very Weak', color: 'text-red-600' };
    if (score <= 3) return { text: 'Weak', color: 'text-orange-600' };
    if (score <= 4) return { text: 'Fair', color: 'text-yellow-600' };
    if (score <= 5) return { text: 'Good', color: 'text-blue-600' };
    return { text: 'Excellent', color: 'text-green-600' };
  }

  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*(),.?":{}|<>';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    const requiredChars = [
      uppercase[Math.floor(Math.random() * uppercase.length)],
      lowercase[Math.floor(Math.random() * lowercase.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];

    const remainingLength = length - requiredChars.length;
    const randomChars = Array.from({ length: remainingLength }, () =>
      allChars[Math.floor(Math.random() * allChars.length)]
    );

    const passwordArray = [...requiredChars, ...randomChars];
    
    // Shuffle the array
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join('');
  }
}
