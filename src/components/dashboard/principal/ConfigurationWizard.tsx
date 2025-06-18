
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Calendar, Users, BookOpen, UserCheck, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConfigurationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  required: boolean;
}

interface ConfigurationWizardProps {
  onStepSelect: (stepId: string) => void;
  currentStep?: string;
}

const ConfigurationWizard: React.FC<ConfigurationWizardProps> = ({ 
  onStepSelect, 
  currentStep 
}) => {
  const [steps] = useState<ConfigurationStep[]>([
    {
      id: 'academic-setup',
      title: 'Academic Calendar',
      description: 'Set up academic years, terms, and assessment periods',
      icon: Calendar,
      completed: false,
      required: true
    },
    {
      id: 'class-management',
      title: 'Class Structure',
      description: 'Create classes, set capacity limits, and assign rooms',
      icon: GraduationCap,
      completed: false,
      required: true
    },
    {
      id: 'subject-setup',
      title: 'Subject Configuration',
      description: 'Define subjects, categories, and assessment weights',
      icon: BookOpen,
      completed: false,
      required: true
    },
    {
      id: 'teacher-assignment',
      title: 'Teacher Assignments',
      description: 'Assign teachers to subjects and classes',
      icon: UserCheck,
      completed: false,
      required: true
    },
    {
      id: 'student-enrollment',
      title: 'Student Enrollment',
      description: 'Add students and link them to classes and parents',
      icon: Users,
      completed: false,
      required: false
    }
  ]);

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">School Configuration Wizard</CardTitle>
            <CardDescription>
              Complete these steps to set up your school management system
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {completedSteps}/{totalSteps}
            </div>
            <div className="text-sm text-muted-foreground">Steps Complete</div>
          </div>
        </div>
        <Progress value={progressPercentage} className="w-full mt-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            
            return (
              <div
                key={step.id}
                className={`
                  flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${isActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : step.completed 
                    ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => onStepSelect(step.id)}
              >
                <div className="flex-shrink-0 mr-4">
                  {step.completed ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <Circle className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-shrink-0 mr-4">
                  <div className={`
                    p-3 rounded-lg
                    ${step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    {step.required && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {isActive && (
                      <Badge className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                
                <div className="flex-shrink-0">
                  <Button
                    variant={step.completed ? "outline" : "default"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStepSelect(step.id);
                    }}
                  >
                    {step.completed ? 'Review' : 'Configure'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {progressPercentage === 100 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-semibold text-green-800">Configuration Complete!</h4>
            </div>
            <p className="text-green-700 mt-1">
              Your school management system is now fully configured and ready to use.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfigurationWizard;
