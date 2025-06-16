import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { OrderTimeSelector } from '@/components/orders/OrderTimeSelector';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useDiscounts } from '@/hooks/useDiscounts';
import { Badge } from '@/components/ui/badge';

type Restavracija = Database['public']['Tables']['restavracije']['Row'];

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ open, onOpenChange }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [komentar, setKomentar] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [restaurant, setRestaurant] = useState<Restavracija | null>(null);
  const { user } = useAuthContext();
  const { createOrder } = useOrders();
  const { getDiscountForFood, calculateDiscountedPrice } = useDiscounts();

  // Fetch restaurant data when items change
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (items.length > 0) {
        const restavracijaId = items[0].restavracija_id;
        try {
          const { data, error } = await supabase
            .from('restavracije')
            .select('*')
            .eq('id', restavracijaId)
            .single();

          if (error) throw error;
          setRestaurant(data);
        } catch (error) {
          console.error('Error fetching restaurant:', error);
        }
      } else {
        setRestaurant(null);
        setSelectedTime('');
      }
    };

    fetchRestaurant();
  }, [items]);

  const handleOrderSubmit = async () => {
    if (items.length === 0) {
      toast({
        title: "Košarica je prazna",
        description: "Dodajte jedi v košarico pred oddajo naročila.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Niste prijavljeni",
        description: "Za oddajo naročila se morate prijaviti.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTime) {
      toast({
        title: "Izberite čas prevzema",
        description: "Morate izbrati čas prevzema naročila.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('CartSheet: Starting order submission...');
      
      // Get restaurant ID from first item
      const restavracijaId = items[0].restavracija_id;
      
      // Convert cart items to the format expected by orderService
      const cartItems = items.map(item => ({
        jed: {
          id: item.id,
          ime: item.naziv,
          cena: item.cena,
          restavracija_id: item.restavracija_id,
          kategorija_id: '', // Not needed for order creation
          opis: item.opis || '',
          na_voljo: true,
          slika_url: '',
          vrstni_red: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        kolicina: item.kolicina,
        opomba: undefined
      }));

      console.log('CartSheet: Calling createOrder with:', { restavracijaId, cartItems });
      
      // Convert selected time to a full timestamp for today
      const today = new Date();
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const pickupTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
      
      // Use the orderService to create order and send emails
      await createOrder(
        user.user_id,
        restavracijaId,
        pickupTime.toISOString(),
        cartItems,
        komentar.trim() || undefined
      );

      console.log('CartSheet: Order created successfully');
      
      clearCart();
      setKomentar('');
      setSelectedTime('');
      onOpenChange(false);

    } catch (error) {
      console.error('CartSheet: Error creating order:', error);
      toast({
        title: "Napaka pri oddaji naročila",
        description: "Prišlo je do napake. Poskusite znova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col max-h-screen">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">Vaša košarica</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100vh-8rem)] mt-6">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </motion.div>
                <p className="text-muted-foreground">Vaša košarica je prazna</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Dodajte jedi iz menija restavracije
                </p>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6 max-h-[50vh]">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="py-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.naziv}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.restavracija_naziv}
                          </p>
                          <div className="mt-2">
                            {(() => {
                              const discount = getDiscountForFood(item.id);
                              if (discount) {
                                // Calculate original price from discounted price
                                let originalPrice: number;
                                if (discount.tip_popusta === 'procent') {
                                  originalPrice = item.cena / (1 - discount.vrednost / 100);
                                } else {
                                  originalPrice = item.cena + discount.vrednost;
                                }
                                
                                return (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground line-through">
                                        {originalPrice.toFixed(2)}€
                                      </span>
                                      <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
                                        -{discount.tip_popusta === 'procent' ? `${discount.vrednost}%` : `${discount.vrednost}€`}
                                      </Badge>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">
                                      {item.cena.toFixed(2)}€
                                    </p>
                                  </div>
                                );
                              } else {
                                return (
                                  <p className="text-sm font-medium">
                                    {item.cena.toFixed(2)}€
                                  </p>
                                );
                              }
                            })()}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.kolicina - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center text-sm font-medium">
                            {item.kolicina}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.kolicina + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {index < items.length - 1 && <Separator className="mt-4" />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>

              <div className="mt-6 space-y-4 pb-4 sticky bottom-0 bg-background border-t pt-4">
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Skupaj:</span>
                  <span className="text-lg font-bold">{getTotalPrice().toFixed(2)}€</span>
                </div>

                {restaurant && (
                  <OrderTimeSelector
                    delovniCasOd={restaurant.delovni_cas_od}
                    delovniCasDo={restaurant.delovni_cas_do}
                    selectedTime={selectedTime}
                    onTimeChange={setSelectedTime}
                  />
                )}

                <div className="space-y-2">
                  <Label htmlFor="komentar">Komentar k naročilu (opcijsko)</Label>
                  <Textarea
                    id="komentar"
                    placeholder="Dodajte komentar k naročilu..."
                    value={komentar}
                    onChange={(e) => setKomentar(e.target.value.slice(0, 250))}
                    maxLength={250}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {komentar.length}/250 znakov
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleOrderSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Oddajam...' : 'Oddaj naročilo'}
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
