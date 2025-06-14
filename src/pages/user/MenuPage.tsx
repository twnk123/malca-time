import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Star, Clock, MapPin, Heart } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { CartSheet } from '@/components/cart/CartSheet';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useCart } from '@/contexts/CartContext';
import { useMenu } from '@/hooks/useMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useFavorites } from '@/hooks/useFavorites';
import { useDiscounts } from '@/hooks/useDiscounts';
import { Database } from '@/integrations/supabase/types';

type Restavracija = Database['public']['Tables']['restavracije']['Row'];
type Jed = Database['public']['Tables']['jedi']['Row'];

interface MenuPageProps {
  restaurant: Restavracija;
  onBack: () => void;
  onProfileClick?: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ restaurant, onBack, onProfileClick }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart } = useCart();
  const { kategorije, jedi, isLoading, error } = useMenu(restaurant.id);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { getDiscountForFood, calculateDiscountedPrice } = useDiscounts();

  const handleQuantityChange = (jedId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [jedId]: Math.max(0, (prev[jedId] || 0) + change)
    }));
  };

  const handleAddToCart = (jed: Jed) => {
    const kolicina = quantities[jed.id] || 1;
    
    for (let i = 0; i < kolicina; i++) {
      addToCart({
        id: jed.id,
        naziv: jed.ime,
        cena: Number(jed.cena),
        opis: jed.opis || '',
        restavracija_id: restaurant.id,
        restavracija_naziv: restaurant.naziv
      });
    }

    setQuantities(prev => ({ ...prev, [jed.id]: 0 }));
    
    toast({
      title: "Dodano v košarico",
      description: `${jed.ime} (${kolicina}x) - ${(Number(jed.cena) * kolicina).toFixed(2)}€`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={restaurant.naziv} 
        showCart={true} 
        onCartClick={() => setCartOpen(true)} 
        onProfileClick={() => {
          console.log('Profile clicked in MenuPage');
          onProfileClick?.();
        }}
      />

      {/* Restaurant Header */}
      <div className="relative">
        <div className="aspect-[3/2] relative overflow-hidden bg-gradient-to-br from-primary to-primary/80">
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-primary-foreground/30">{restaurant.naziv.charAt(0)}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <Button
            variant="secondary"
            size="icon"
            onClick={onBack}
            className="absolute top-4 left-4 bg-background/90 backdrop-blur"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl font-bold mb-2">{restaurant.naziv}</h1>
            <p className="text-sm opacity-90 mb-3">{restaurant.opis}</p>
            
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center">
                <Star className="h-3 w-3 mr-1 fill-current" />
                4.5
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {restaurant.delovni_cas_od} - {restaurant.delovni_cas_do}
              </div>
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {restaurant.lokacija}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 py-4 pb-20">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse mb-3 w-3/4" />
                  <div className="h-8 bg-muted rounded animate-pulse w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Napaka pri nalaganju menija: {error}</p>
          </div>
        ) : kategorije.length > 0 ? (
          <Tabs defaultValue={kategorije[0]?.naziv} className="w-full">
            {/* Dynamic Tabs - responsive grid */}
            <TabsList className={`grid w-full mb-4 ${kategorije.length === 1 ? 'grid-cols-1' : kategorije.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {kategorije.map(kategorija => (
                <TabsTrigger 
                  key={kategorija.id} 
                  value={kategorija.naziv} 
                  className="text-xs px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {kategorija.naziv}
                </TabsTrigger>
              ))}
            </TabsList>

            {kategorije.map(kategorija => (
              <TabsContent key={kategorija.id} value={kategorija.naziv} className="mt-0">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {jedi
                    .filter(jed => jed.kategorija_id === kategorija.id)
                    .map((jed, index) => (
                    <motion.div
                      key={jed.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden border-border/50">
                        <CardContent className="p-0">
                          {/* Mobile-first layout */}
                          <div className="space-y-3">
                            {/* Header with image, title, price, favorite */}
                            <div className="flex gap-3 p-3 pb-0">
                              {jed.slika_url && (
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                  <img
                                    src={jed.slika_url}
                                    alt={jed.ime}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-foreground text-sm leading-tight">
                                    {jed.ime}
                                  </h3>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {(() => {
                                      const discount = getDiscountForFood(jed.id);
                                      const originalPrice = Number(jed.cena);
                                      const discountedPrice = discount ? calculateDiscountedPrice(originalPrice, discount) : originalPrice;
                                      
                                      return (
                                        <div className="text-right">
                                          {discount && (
                                            <div className="text-xs text-muted-foreground line-through">
                                              {originalPrice.toFixed(2)}€
                                            </div>
                                          )}
                                          <div className="font-bold text-sm text-foreground">
                                            {discountedPrice.toFixed(2)}€
                                          </div>
                                          {discount && (
                                            <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
                                              -{discount.tip_popusta === 'procent' ? `${discount.vrednost}%` : `${discount.vrednost}€`}
                                            </Badge>
                                          )}
                                        </div>
                                      );
                                    })()}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 p-0"
                                      onClick={() => toggleFavorite(jed.id)}
                                    >
                                      <Heart className={`h-3 w-3 ${isFavorite(jed.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Description */}
                            <div className="px-3">
                              <p className="text-muted-foreground text-xs leading-relaxed">
                                {jed.opis}
                              </p>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between px-3 pb-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleQuantityChange(jed.id, -1)}
                                  disabled={!quantities[jed.id]}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                
                                <span className="w-6 text-center text-sm font-medium">
                                  {quantities[jed.id] || 0}
                                </span>
                                
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleQuantityChange(jed.id, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  size="sm"
                                  onClick={() => handleAddToCart(jed)}
                                  disabled={!jed.na_voljo}
                                  className="h-7 px-3 text-xs"
                                >
                                  {!jed.na_voljo ? 'Ni na voljo' : 'Dodaj'}
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                }
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">Ta restavracija nima dodanih jedi.</p>
          </div>
        )}
      </div>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
};