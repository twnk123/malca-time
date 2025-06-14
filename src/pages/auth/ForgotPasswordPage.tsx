import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToLogin }) => {
  const { resetPassword, isLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'E-poštni naslov je obvezen';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'E-poštni naslov ni veljaven';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (isSubmitted) {
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
                <Mail className="text-primary-foreground h-8 w-8" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">E-pošta poslana</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  Preverite svojo e-pošto in sledite navodilom za ponastavitev gesla
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Poslali smo vam e-pošto na naslov <strong>{email}</strong> z navodili za ponastavitev gesla.
                </p>
                <p className="text-xs text-muted-foreground mb-6">
                  Če ne vidite e-pošte, preverite tudi mapo z nezaželeno pošto.
                </p>
              </div>

              <Button
                onClick={onBackToLogin}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nazaj na prijavo
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
              <CardTitle className="text-2xl font-bold text-foreground">Pozabljeno geslo</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Vnesite vaš e-poštni naslov za ponastavitev gesla
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-poštni naslov</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vase.ime@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pošiljanje...
                  </>
                ) : (
                  'Pošlji navodila'
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="link"
                className="p-0 h-auto font-normal text-primary hover:underline"
                onClick={onBackToLogin}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nazaj na prijavo
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};