import React, { useState } from 'react';
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

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ open, onOpenChange }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [komentar, setKomentar] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const { createOrder } = useOrders();

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
          created_at: '',
          updated_at: ''
        },
        kolicina: item.kolicina,
        opomba: null
      }));

      console.log('CartSheet: Calling createOrder with:', { restavracijaId, cartItems });
      
      // Use the orderService to create order and send emails
      await createOrder(
        user.id,
        restavracijaId,
        new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        cartItems,
        komentar.trim() || undefined
      );

      console.log('CartSheet: Order created successfully');
      
      clearCart();
      setKomentar('');
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
                          <p className="text-sm font-medium mt-2">
                            {item.cena.toFixed(2)}€
                          </p>
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
