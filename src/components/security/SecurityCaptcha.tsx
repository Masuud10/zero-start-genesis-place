
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface SecurityCaptchaProps {
  onVerify: (verified: boolean) => void;
  disabled?: boolean;
}

export const SecurityCaptcha: React.FC<SecurityCaptchaProps> = ({ onVerify, disabled = false }) => {
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 5;
        num2 = 3;
        answer = 8;
    }
    
    setCaptchaQuestion(`${num1} ${operation} ${num2} = ?`);
    setCaptchaAnswer(answer.toString());
    setUserAnswer('');
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = () => {
    const verified = userAnswer.trim() === captchaAnswer;
    setIsVerified(verified);
    onVerify(verified);
    
    if (!verified) {
      generateCaptcha();
    }
  };

  if (disabled) {
    return null;
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Security Verification
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateCaptcha}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="bg-white p-2 border rounded font-mono text-center min-w-[100px]">
          {captchaQuestion}
        </div>
        
        <input
          type="text"
          placeholder="Answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
        />
        
        <Button
          type="button"
          onClick={handleVerify}
          size="sm"
          variant={isVerified ? "default" : "outline"}
          disabled={!userAnswer.trim()}
        >
          {isVerified ? '✓' : 'Verify'}
        </Button>
      </div>
      
      {isVerified && (
        <p className="text-sm text-green-600">✓ Verification successful</p>
      )}
    </div>
  );
};
