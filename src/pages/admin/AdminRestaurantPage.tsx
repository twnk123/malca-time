import React from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import { RestaurantBasicInfo } from '@/components/admin/restaurant/RestaurantBasicInfo';
import { RestaurantContactInfo } from '@/components/admin/restaurant/RestaurantContactInfo';
import { RestaurantOperatingHours } from '@/components/admin/restaurant/RestaurantOperatingHours';
import { RestaurantLogoUpload } from '@/components/admin/restaurant/RestaurantLogoUpload';

export const AdminRestaurantPage: React.FC = () => {
  const { user } = useAuthContext();
  const {
    restaurant,
    loading,
    saving,
    updateRestaurant,
    saveRestaurant,
    handleLogoUpload
  } = useRestaurantData(user?.user_id);

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
            <p className="text-muted-foreground mb-4">Vam ni dodeljena nobena restavracija.</p>
            <p className="text-sm text-muted-foreground">Kontaktirajte administratorja sistema za dodelitev restavracije.</p>
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
          <Button onClick={saveRestaurant} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Shranjujem...' : 'Shrani'}
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <RestaurantBasicInfo 
            restaurant={restaurant} 
            onUpdate={updateRestaurant} 
          />
          
          <RestaurantContactInfo 
            restaurant={restaurant} 
            onUpdate={updateRestaurant} 
          />

          <RestaurantOperatingHours 
            restaurant={restaurant} 
            onUpdate={updateRestaurant} 
          />

          <RestaurantLogoUpload 
            logoUrl={restaurant.logo_url} 
            onUpload={handleLogoUpload} 
          />
        </div>
      </motion.div>
    </div>
  );
};