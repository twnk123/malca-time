import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const { user } = useAuthContext();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('priljubljene_jedi')
        .select('jed_id')
        .eq('uporabnik_id', user.id);

      if (error) throw error;

      setFavorites(data.map(item => item.jed_id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (jedId: string) => {
    if (!user) {
      toast({
        title: "Potrebna je prijava",
        description: "Za dodajanje priljubljenih se morate prijaviti.",
        variant: "destructive"
      });
      return;
    }

    try {
      const isFavorite = favorites.includes(jedId);

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('priljubljene_jedi')
          .delete()
          .eq('uporabnik_id', user.id)
          .eq('jed_id', jedId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== jedId));
        toast({
          title: "Odstranjeno",
          description: "Jed je bila odstranjena iz priljubljenih."
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('priljubljene_jedi')
          .insert({
            uporabnik_id: user.id,
            jed_id: jedId
          });

        if (error) throw error;

        setFavorites(prev => [...prev, jedId]);
        toast({
          title: "Dodano",
          description: "Jed je bila dodana med priljubljene."
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri upravljanju priljubljenih.",
        variant: "destructive"
      });
    }
  };

  const isFavorite = (jedId: string) => favorites.includes(jedId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites
  };
};