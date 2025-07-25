import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderWithItems } from '@/types/orders';

export const useOrderRealtime = (
  restaurantId: string | undefined,
  setOrders: React.Dispatch<React.SetStateAction<OrderWithItems[]>>
) => {
  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'narocila',
          filter: `restavracija_id=eq.${restaurantId}`
        },
        async (payload) => {
          console.log('New order received:', payload.new);
          
          // Fetch the complete order with relations for instant display
          const { data: newOrder, error } = await supabase
            .from('narocila')
            .select(`
              *,
              postavke_narocila (
                *,
                jedi (id, ime)
              ),
              restavracije (naziv),
              profili (ime, priimek)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (!error && newOrder) {
            // Fetch discounts for the new order items
            const foodIds = newOrder.postavke_narocila.map(item => item.jedi.id);
            if (foodIds.length > 0) {
              const { data: discounts } = await supabase
                .from('popusti')
                .select('*')
                .in('jed_id', foodIds)
                .eq('aktiven', true);
              
              // Add discount information to order items
              newOrder.postavke_narocila.forEach(item => {
                const discount = discounts?.find(d => d.jed_id === item.jedi.id);
                (item as any).discount = discount || null;
              });
            }
            
            setOrders(prevOrders => [newOrder as any, ...prevOrders]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'narocila',
          filter: `restavracija_id=eq.${restaurantId}`
        },
        (payload) => {
          console.log('Order updated:', payload.new);
          // Update existing order in list
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === payload.new.id 
                ? { ...order, ...payload.new }
                : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, setOrders]);
};