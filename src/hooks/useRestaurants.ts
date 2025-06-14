import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Restavracija } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restavracija[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('restavracije')
        .select('*')
        .eq('aktivna', true)
        .order('naziv');

      if (supabaseError) {
        throw supabaseError;
      }

      setRestaurants(data || []);
    } catch (err: any) {
      console.error('Error fetching restaurants:', err);
      setError(err.message);
      toast({
        title: "Napaka pri nalaganju restavracij",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return {
    restaurants,
    isLoading,
    error,
    refetch: fetchRestaurants
  };
};