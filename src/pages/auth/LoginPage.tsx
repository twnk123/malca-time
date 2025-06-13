import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [geslo, setGeslo] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { prijava, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !geslo) {
      toast({
        title: "Napaka",
        description: "Prosimo, vnesite email in geslo.",
        variant: "destructive"
      });
      return;
    }

    try {
      await prijava(email, geslo);
      toast({
        title: "Uspešna prijava",
        description: "Dobrodošli v MalcaTime!",
      });
    } catch (error) {
      toast({
        title: "Napaka pri prijavi",
        description: "Preverite email in geslo ter poskusite znova.",
        variant: "destructive"
      });
    }
  };

  const handleDemoLogin = (role: 'uporabnik' | 'admin') => {
    if (role === 'uporabnik') {
      setEmail('test@uporabnik.si');
      setGeslo('123456');
    } else {
      setEmail('admin@restavracija.si');
      setGeslo('123456');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-primary-foreground font-bold text-2xl">M</span>
            </motion.div>
            <CardTitle className="text-2xl font-bold">MalcaTime</CardTitle>
            <CardDescription>
              Prijavite se v svoj račun
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vase.ime@email.si"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="geslo">Geslo</Label>
                <div className="relative">
                  <Input
                    id="geslo"
                    type={showPassword ? "text" : "password"}
                    placeholder="Vnesite geslo"
                    value={geslo}
                    onChange={(e) => setGeslo(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Prijavljam..." : "Prijava"}
                </Button>
              </motion.div>
            </form>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Demo računi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('uporabnik')}
                  disabled={isLoading}
                >
                  Demo uporabnik
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={isLoading}
                >
                  Demo admin
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Nimate računa?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-primary hover:underline"
                  onClick={onSwitchToRegister}
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