import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { signUp, isLoading } = useAuthContext();
  const [formData, setFormData] = useState({
    ime: '',
    priimek: '',
    email: '',
    telefon: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ime.trim()) {
      newErrors.ime = 'Ime je obvezno';
    }

    if (!formData.priimek.trim()) {
      newErrors.priimek = 'Priimek je obvezen';
    }

    if (!formData.email) {
      newErrors.email = 'Email je obvezen';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email ni veljaven';
    }

    if (!formData.password) {
      newErrors.password = 'Geslo je obvezno';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Geslo mora imeti vsaj 6 znakov';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potrditev gesla je obvezna';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Gesli se ne ujemata';
    }

    if (formData.telefon && !/^[\d\s\+\-\(\)]+$/.test(formData.telefon)) {
      newErrors.telefon = 'Telefonska številka ni veljavna';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.ime,
        formData.priimek,
        formData.telefon || undefined
      );
    } catch (error) {
      // Error handling is done in the hook
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
            <div className="flex items-center justify-center relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onSwitchToLogin}
                className="absolute left-0"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center"
              >
                <span className="text-primary-foreground font-bold text-2xl">M</span>
              </motion.div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Registracija</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Ustvarite nov račun za naročanje malic
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ime">Ime</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ime"
                      type="text"
                      placeholder="Ime"
                      className="pl-10"
                      value={formData.ime}
                      onChange={(e) => setFormData(prev => ({ ...prev, ime: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.ime && <p className="text-xs text-destructive">{errors.ime}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priimek">Priimek</Label>
                  <Input
                    id="priimek"
                    type="text"
                    placeholder="Priimek"
                    value={formData.priimek}
                    onChange={(e) => setFormData(prev => ({ ...prev, priimek: e.target.value }))}
                    disabled={isLoading}
                  />
                  {errors.priimek && <p className="text-xs text-destructive">{errors.priimek}</p>}
                </div>
              </div>

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
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon (neobvezno)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefon"
                    type="tel"
                    placeholder="+386 XX XXX XXX"
                    className="pl-10"
                    value={formData.telefon}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefon: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                {errors.telefon && <p className="text-sm text-destructive">{errors.telefon}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Geslo</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Najmanj 6 znakov"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potrdite geslo</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ponovite geslo"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ustvarjam račun...
                  </>
                ) : (
                  'Ustvari račun'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Že imate račun?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-primary hover:underline"
                  onClick={onSwitchToLogin}
                  disabled={isLoading}
                >
                  Prijavite se
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};