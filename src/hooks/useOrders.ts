import { useState, useEffect } from 'react';
import { OrderStatus } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from './useCart';
import { OrderWithItems } from '@/types/orders';
import { orderService } from '@/services/orderService';
import { useOrderRealtime } from './useOrderRealtime';

export const useOrders = (restaurantId?: string) => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orderService.fetchOrders(restaurantId);
      setOrders(data);
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
      const order = await orderService.createOrder(
        uporabnikId,
        restavracijaId,
        casPrevzema,
        cartItems,
        opomba
      );

      const skupnaCena = cartItems.reduce((total, item) => total + (item.jed.cena * item.kolicina), 0);
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
      await orderService.updateOrderStatus(orderId, status);
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

  // Set up real-time subscription
  useOrderRealtime(restaurantId, setOrders);

  return {
    orders,
    isLoading,
    error,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders
  };
};