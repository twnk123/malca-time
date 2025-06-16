import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Discount {
  id: string;
  jed_id: string;
  tip_popusta: 'procent' | 'znesek';
  vrednost: number;
  naziv?: string;
  opis?: string;
  aktiven: boolean;
  veljavnost_od?: string;
  veljavnost_do?: string;
}

export const useDiscounts = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('popusti')
        .select('*')
        .eq('aktiven', true);

      if (error) throw error;

      setDiscounts((data || []) as Discount[]);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const getDiscountForFood = (jedId: string) => {
    return discounts.find(discount => discount.jed_id === jedId);
  };

  const calculateDiscountedPrice = (originalPrice: number, discount: Discount) => {
    if (discount.tip_popusta === 'procent') {
      return originalPrice * (1 - discount.vrednost / 100);
    } else {
      return Math.max(0, originalPrice - discount.vrednost);
    }
  };

  return {
    discounts,
    loading,
    getDiscountForFood,
    calculateDiscountedPrice,
    refetch: fetchDiscounts
  };
};