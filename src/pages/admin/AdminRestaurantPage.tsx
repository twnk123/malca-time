import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Clock } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RestaurantData {
  id: string;
  naziv: string;
  opis: string;
  lokacija: string;
  kontakt: string;
  email: string;
  delovni_cas_od: string;
  delovni_cas_do: string;
  logo_url?: string;
}

export const AdminRestaurantPage: React.FC = () => {
  const { user } = useAuthContext();
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRestaurantData();
    }
  }, [user]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      
      // Get restaurant for this admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_restavracije')
        .select('restavracija_id')
        .eq('admin_id', user?.id)
        .single();

      if (adminError) throw adminError;

      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restavracije')
        .select('*')
        .eq('id', adminData.restavracija_id)
        .single();

      if (restaurantError) throw restaurantError;

      setRestaurant(restaurantData);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri nalaganju podatkov restavracije.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurant) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('restavracije')
        .update({
          naziv: restaurant.naziv,
          opis: restaurant.opis,
          lokacija: restaurant.lokacija,
          kontakt: restaurant.kontakt,
          email: restaurant.email,
          delovni_cas_od: restaurant.delovni_cas_od,
          delovni_cas_do: restaurant.delovni_cas_do,
          logo_url: restaurant.logo_url
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      toast({
        title: "Uspešno shranjeno",
        description: "Podatki restavracije so bili uspešno posodobljeni."
      });
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri shranjevanju.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (url: string) => {
    if (!restaurant) return;

    try {
      setRestaurant(prev => prev ? { ...prev, logo_url: url } : prev);
      
      toast({
        title: "Slika naložena",
        description: "Logotip restavracije je bil uspešno naložen."
      });
    } catch (error) {
      console.error('Error updating logo:', error);
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri posodabljanju slike.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Restavracija ni najdena.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Urejanje restavracije</h1>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Shranjujem...' : 'Shrani'}
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Osnovni podatki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="naziv">Naziv restavracije</Label>
                <Input
                  id="naziv"
                  value={restaurant.naziv}
                  onChange={(e) => setRestaurant(prev => prev ? {...prev, naziv: e.target.value} : prev)}
                />
              </div>
              
              <div>
                <Label htmlFor="opis">Opis</Label>
                <Textarea
                  id="opis"
                  value={restaurant.opis}
                  onChange={(e) => setRestaurant(prev => prev ? {...prev, opis: e.target.value} : prev)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="lokacija">Lokacija</Label>
                <Input
                  id="lokacija"
                  value={restaurant.lokacija}
                  onChange={(e) => setRestaurant(prev => prev ? {...prev, lokacija: e.target.value} : prev)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Kontaktni podatki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={restaurant.email}
                  onChange={(e) => setRestaurant(prev => prev ? {...prev, email: e.target.value} : prev)}
                />
              </div>

              <div>
                <Label htmlFor="kontakt">Telefon</Label>
                <Input
                  id="kontakt"
                  value={restaurant.kontakt}
                  onChange={(e) => setRestaurant(prev => prev ? {...prev, kontakt: e.target.value} : prev)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Delovni čas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="delovni_cas_od">Odprtje</Label>
                <Input
                  id="delovni_cas_od"
                  type="time"
                  value={restaurant.delovni_cas_od}
                  onChange={(e) => setRestaurant(prev => prev ? {...prev, delovni_cas_od: e.target.value} : prev)}
                />
              </div>

              <div>
                <Label htmlFor="delovni_cas_do">Zaprtje</Label>
                <Input
                  id="delovni_cas_do"
                  type="time"
                  value={restaurant.delovni_cas_do}
                  onChange={(e) => setRestaurant(prev => prev ? {...prev, delovni_cas_do: e.target.value} : prev)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Logotip restavracije
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                currentImage={restaurant.logo_url}
                onUpload={handleLogoUpload}
                bucket="restaurant-logos"
                maxSize={1}
                acceptedFormats={['.jpg', '.jpeg', '.png']}
                className="w-full h-48"
              />
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};