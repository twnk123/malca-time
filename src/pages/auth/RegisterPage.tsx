import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [geslo, setGeslo] = useState('');
  const [potrdiGeslo, setPotrdiGeslo] = useState('');
  const [ime, setIme] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { registracija, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !geslo || !ime || !potrdiGeslo) {
      toast({
        title: "Napaka",
        description: "Prosimo, izpolnite vsa polja.",
        variant: "destructive"
      });
      return;
    }

    if (geslo !== potrdiGeslo) {
      toast({
        title: "Napaka",
        description: "Gesli se ne ujemata.",
        variant: "destructive"
      });
      return;
    }

    if (geslo.length < 6) {
      toast({
        title: "Napaka",
        description: "Geslo mora imeti vsaj 6 znakov.",
        variant: "destructive"
      });
      return;
    }

    try {
      await registracija(email, geslo, ime);
      toast({
        title: "Uspešna registracija",
        description: "Vaš račun je bil uspešno ustvarjen!",
      });
    } catch (error) {
      toast({
        title: "Napaka pri registraciji",
        description: "Prišlo je do napake. Poskusite znova.",
        variant: "destructive"
      });
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
            <div className="flex items-center justify-center mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onSwitchToLogin}
                className="absolute left-4 top-4"
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
            <CardTitle className="text-2xl font-bold">Registracija</CardTitle>
            <CardDescription>
              Ustvarite nov račun za naročanje malic
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ime">Ime in priimek</Label>
                <Input
                  id="ime"
                  type="text"
                  placeholder="Vnesite ime in priimek"
                  value={ime}
                  onChange={(e) => setIme(e.target.value)}
                  required
                />
              </div>

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
                    placeholder="Najmanj 6 znakov"
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

              <div className="space-y-2">
                <Label htmlFor="potrdi-geslo">Potrdite geslo</Label>
                <div className="relative">
                  <Input
                    id="potrdi-geslo"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ponovite geslo"
                    value={potrdiGeslo}
                    onChange={(e) => setPotrdiGeslo(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                  {isLoading ? "Ustvarjam račun..." : "Ustvari račun"}
                </Button>
              </motion.div>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Že imate račun?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-primary hover:underline"
                  onClick={onSwitchToLogin}
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