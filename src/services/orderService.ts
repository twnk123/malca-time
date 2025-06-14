import { supabase } from '@/integrations/supabase/client';
import { NarociloInsert, PostavkaNarocilaInsert, OrderStatus } from '@/types/database';
import { CartItem } from '@/hooks/useCart';
import { OrderWithItems } from '@/types/orders';

export const orderService = {
  async fetchOrders(restaurantId?: string): Promise<OrderWithItems[]> {
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

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createOrder(
    uporabnikId: string,
    restavracijaId: string,
    casPrevzema: string,
    cartItems: CartItem[],
    opomba?: string
  ) {
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

    // Send confirmation emails
    try {
      console.log('About to call send-order-confirmation function for order:', order.id);
      const emailResult = await supabase.functions.invoke('send-order-confirmation', {
        body: { orderId: order.id }
      });
      console.log('Email function called successfully:', emailResult);
      if (emailResult.error) {
        console.error('Email function returned error:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Error calling send-order-confirmation function:', emailError);
    }

    return order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const { error } = await supabase
      .from('narocila')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  }
};