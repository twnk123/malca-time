import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Shield } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { sanitizeInput, validateInput, rateLimiting } from '@/utils/security';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const { signIn, isLoading } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Sanitize and validate email
    const sanitizedEmail = sanitizeInput.email(formData.email);
    if (!sanitizedEmail) {
      newErrors.email = 'Email je obvezen';
    } else if (!validateInput.email(sanitizedEmail)) {
      newErrors.email = 'Email ni veljaven';
    }

    if (!formData.password) {
      newErrors.password = 'Geslo je obvezno';
    }

    // Check rate limiting
    if (sanitizedEmail && !rateLimiting.canAttemptLogin(sanitizedEmail)) {
      const remaining = Math.ceil(rateLimiting.getTimeUntilNextAttempt(sanitizedEmail) / 1000 / 60);
      newErrors.general = `Preveč neuspešnih poskusov. Poskusite znova čez ${remaining} minut.`;
      setIsRateLimited(true);
      setTimeRemaining(remaining);
    } else {
      setIsRateLimited(false);
      setTimeRemaining(0);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const sanitizedEmail = sanitizeInput.email(formData.email);
      await signIn(sanitizedEmail, formData.password);
    } catch (error) {
      // Re-validate form to update rate limiting status
      setTimeout(() => validateForm(), 100);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-border">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto"
            >
              <span className="text-primary-foreground font-bold text-2xl">M</span>
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">MalcaTime</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Prijavite se v svoj račun
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vase.ime@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => {
                      const sanitized = sanitizeInput.email(e.target.value);
                      setFormData(prev => ({ ...prev, email: sanitized }));
                    }}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Geslo</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Vnesite geslo"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {errors.general && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <Shield className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{errors.general}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isRateLimited}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Prijavljanje...
                  </>
                ) : (
                  'Prijava'
                )}
              </Button>
            </form>


            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Pozabljeno geslo klik!');
                    onSwitchToForgotPassword();
                  }}
                  disabled={isLoading}
                  type="button"
                >
                  Pozabljeno geslo?
                </Button>
              </p>
              <p className="text-sm text-muted-foreground">
                Nimate računa?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-primary hover:underline"
                  onClick={onSwitchToRegister}
                  disabled={isLoading}
                >
                  Registrirajte se
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};