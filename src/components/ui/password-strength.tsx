import React from 'react';
import { Progress } from '@/components/ui/progress';
import { getPasswordStrength } from '@/utils/security';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, className = '' }) => {
  if (!password) return null;

  const { score, feedback, color } = getPasswordStrength(password);
  const progressValue = (score / 6) * 100;

  const getColorClass = (color: string) => {
    switch (color) {
      case 'destructive':
        return 'bg-destructive';
      case 'warning':
        return 'bg-orange-500';
      case 'secondary':
        return 'bg-secondary';
      case 'primary':
        return 'bg-primary';
      case 'success':
        return 'bg-green-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Moč gesla:</span>
        <span className={`text-xs font-medium ${
          color === 'destructive' ? 'text-destructive' :
          color === 'warning' ? 'text-orange-500' :
          color === 'success' ? 'text-green-500' :
          'text-foreground'
        }`}>
          {feedback}
        </span>
      </div>
      <Progress 
        value={progressValue} 
        className="h-1"
      />
    </div>
  );
};