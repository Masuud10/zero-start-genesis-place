
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Shield } from 'lucide-react';

interface SecurityCaptchaProps {
  onVerify: (verified: boolean) => void;
  disabled?: boolean;
}

const SecurityCaptcha: React.FC<SecurityCaptchaProps> = ({ onVerify, disabled }) => {
  const [challenge, setChallenge] = useState({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const generateChallenge = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer = 0;
    let question = '';
    
    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        answer = Math.max(num1, num2) - Math.min(num1, num2);
        question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;
        break;
      case '×':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
    }
    
    setChallenge({ question, answer });
    setUserAnswer('');
  };

  const handleVerify = () => {
    if (parseInt(userAnswer) === challenge.answer) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setAttempts(prev => prev + 1);
      generateChallenge();
      if (attempts >= 2) {
        onVerify(false);
      }
    }
  };

  useEffect(() => {
    generateChallenge();
  }, []);

  useEffect(() => {
    if (disabled) {
      setIsVerified(false);
      onVerify(false);
      generateChallenge();
    }
  }, [disabled, onVerify]);

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
        <Shield className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700">Security verification complete</span>
      </div>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Security Verification</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">What is {challenge.question}?</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateChallenge}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="Enter answer"
              disabled={disabled}
            />
            <Button
              type="button"
              onClick={handleVerify}
              disabled={!userAnswer || disabled}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              Verify
            </Button>
          </div>
          
          {attempts > 0 && (
            <p className="text-xs text-red-600">
              Incorrect answer. {3 - attempts} attempts remaining.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityCaptcha;
