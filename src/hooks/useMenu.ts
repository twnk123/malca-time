import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KategorijaMenija, Jed } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface MenuData {
  kategorije: KategorijaMenija[];
  jedi: Jed[];
}

export const useMenu = (restaurantId: string | null) => {
  const [menuData, setMenuData] = useState<MenuData>({ kategorije: [], jedi: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMenu = async () => {
    if (!restaurantId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch categories
      const { data: kategorije, error: kategorijeError } = await supabase
        .from('kategorije_menija')
        .select('*')
        .eq('restavracija_id', restaurantId)
        .order('vrstni_red');

      if (kategorijeError) throw kategorijeError;

      // Fetch dishes
      const { data: jedi, error: jediError } = await supabase
        .from('jedi')
        .select('*')
        .eq('restavracija_id', restaurantId)
        .eq('na_voljo', true)
        .order('vrstni_red');

      if (jediError) throw jediError;

      setMenuData({
        kategorije: kategorije || [],
        jedi: jedi || []
      });
    } catch (err: any) {
      console.error('Error fetching menu:', err);
      setError(err.message);
      toast({
        title: "Napaka pri nalaganju menija",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  return {
    ...menuData,
    isLoading,
    error,
    refetch: fetchMenu
  };
};