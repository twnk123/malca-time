import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Narocilo, PostavkaNarocila, NarociloInsert, PostavkaNarocilaInsert, OrderStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from './useCart';

interface OrderWithItems extends Narocilo {
  postavke_narocila: (PostavkaNarocila & { jedi: { ime: string } })[];
  restavracije: { naziv: string };
  profili: { ime: string; priimek: string };
}

export const useOrders = (restaurantId?: string) => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('narocila')
        .select(`
          *,
          postavke_narocila (
            *,
            jedi (ime)
          ),
          restavracije (naziv),
          profili (ime, priimek)
        `)
        .order('created_at', { ascending: false });

      if (restaurantId) {
        query = query.eq('restavracija_id', restaurantId);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      toast({
        title: "Napaka pri nalaganju naročil",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (
    uporabnikId: string,
    restavracijaId: string,
    casPrevzema: string,
    cartItems: CartItem[],
    opomba?: string
  ) => {
    try {
      setIsLoading(true);

      const skupnaCena = cartItems.reduce((total, item) => total + (item.jed.cena * item.kolicina), 0);

      // Create order
      const orderData: NarociloInsert = {
        uporabnik_id: uporabnikId,
        restavracija_id: restavracijaId,
        cas_prevzema: casPrevzema,
        skupna_cena: skupnaCena,
        opomba,
        status: 'novo'
      };

      const { data: order, error: orderError } = await supabase
        .from('narocila')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems: PostavkaNarocilaInsert[] = cartItems.map(item => ({
        narocilo_id: order.id,
        jed_id: item.jed.id,
        kolicina: item.kolicina,
        cena_na_kos: item.jed.cena,
        opomba: item.opomba
      }));

      const { error: itemsError } = await supabase
        .from('postavke_narocila')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Naročilo oddano!",
        description: `Vaše naročilo za ${skupnaCena.toFixed(2)}€ je bilo uspešno oddano.`,
      });

      await fetchOrders();
      return order;
    } catch (err: any) {
      console.error('Error creating order:', err);
      toast({
        title: "Napaka pri oddaji naročila",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('narocila')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status posodobljen",
        description: `Status naročila je bil spremenjen na "${status}".`,
      });

      await fetchOrders();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      toast({
        title: "Napaka pri posodabljanju statusa",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  return {
    orders,
    isLoading,
    error,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders
  };
};