import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface RestaurantData {
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

export const useRestaurantData = (userId?: string) => {
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRestaurantData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Get restaurant for this admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_restavracije')
        .select('restavracija_id')
        .eq('admin_id', userId)
        .maybeSingle();

      if (adminError) throw adminError;
      if (!adminData) {
        toast({
          title: "Napaka",
          description: "Vam ni dodeljena nobena restavracija. Kontaktirajte administratorja.",
          variant: "destructive"
        });
        return;
      }

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

  const updateRestaurant = (updates: Partial<RestaurantData>) => {
    console.log('Updating restaurant data:', updates);
    setRestaurant(prev => {
      const updated = prev ? { ...prev, ...updates } : prev;
      console.log('New restaurant state:', updated);
      return updated;
    });
  };

  const saveRestaurant = async () => {
    if (!restaurant) {
      console.log('No restaurant data to save');
      return;
    }

    console.log('Starting save process for restaurant:', restaurant.id);

    try {
      setSaving(true);

      // Validate required fields
      if (!restaurant.naziv.trim()) {
        toast({
          title: "Napaka",
          description: "Naziv restavracije je obvezen.",
          variant: "destructive"
        });
        return;
      }

      // Validate time format and convert to 24-hour if needed
      const formatTime = (timeStr: string) => {
        if (!timeStr) return timeStr;
        
        // If already in HH:MM format, return as is
        if (/^\d{2}:\d{2}$/.test(timeStr)) {
          return timeStr + ':00';
        }
        
        // If in HH:MM:SS format, return as is
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
          return timeStr;
        }
        
        return timeStr;
      };

      const updatedData = {
        naziv: restaurant.naziv.trim(),
        opis: restaurant.opis?.trim() || '',
        lokacija: restaurant.lokacija?.trim() || '',
        kontakt: restaurant.kontakt?.trim() || '',
        email: restaurant.email?.trim() || '',
        delovni_cas_od: formatTime(restaurant.delovni_cas_od),
        delovni_cas_do: formatTime(restaurant.delovni_cas_do),
        logo_url: restaurant.logo_url
      };

      console.log('Sending update to database:', updatedData);

      const { error } = await supabase
        .from('restavracije')
        .update(updatedData)
        .eq('id', restaurant.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Database update successful');

      // Refetch data to ensure UI reflects database state
      await fetchRestaurantData();

      toast({
        title: "Uspešno shranjeno",
        description: "Podatki restavracije so bili uspešno posodobljeni."
      });
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast({
        title: "Napaka",
        description: `Prišlo je do napake pri shranjevanju: ${error instanceof Error ? error.message : 'Neznana napaka'}`,
        variant: "destructive"
      });
    } finally {
      console.log('Save process finished');
      setSaving(false);
    }
  };

  const handleLogoUpload = async (url: string) => {
    if (!restaurant) return;

    try {
      // Update local state immediately
      setRestaurant(prev => prev ? { ...prev, logo_url: url } : prev);
      
      // Save to database
      const { error } = await supabase
        .from('restavracije')
        .update({ logo_url: url })
        .eq('id', restaurant.id);

      if (error) throw error;

      toast({
        title: "Slika naložena",
        description: "Logotip restavracije je bil uspešno naložen in shranjen."
      });
    } catch (error) {
      console.error('Error updating logo:', error);
      // Revert local state on error
      setRestaurant(prev => prev ? { ...prev, logo_url: restaurant.logo_url } : prev);
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri shranjevanju slike.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRestaurantData();
  }, [userId]);

  // Add effect to refetch data after successful save
  const refetchData = () => {
    fetchRestaurantData();
  };

  return {
    restaurant,
    loading,
    saving,
    updateRestaurant,
    saveRestaurant,
    handleLogoUpload,
    refetchData
  };
};