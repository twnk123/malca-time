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
        onProfileClick={onProfileClick}
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
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse mb-4 w-3/4" />
                  <div className="h-8 bg-muted rounded animate-pulse w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Napaka pri nalaganju menija: {error}</p>
          </div>
        ) : kategorije.length > 0 ? (
          <Tabs defaultValue={kategorije[0]?.naziv} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              {kategorije.map(kategorija => (
                <TabsTrigger key={kategorija.id} value={kategorija.naziv} className="text-sm">
                  {kategorija.naziv}
                </TabsTrigger>
              ))}
            </TabsList>

            {kategorije.map(kategorija => (
              <TabsContent key={kategorija.id} value={kategorija.naziv}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {jedi
                    .filter(jed => jed.kategorija_id === kategorija.id)
                    .map((jed, index) => (
                    <motion.div
                      key={jed.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            {jed.slika_url && (
                              <div className="w-20 h-20 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                                <img
                                  src={jed.slika_url}
                                  alt={jed.ime}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 pr-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-foreground">
                                  {jed.ime}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  {(() => {
                                    const discount = getDiscountForFood(jed.id);
                                    const originalPrice = Number(jed.cena);
                                    const discountedPrice = discount ? calculateDiscountedPrice(originalPrice, discount) : originalPrice;
                                    
                                    return (
                                      <div className="text-right">
                                        {discount && (
                                          <div className="text-xs text-destructive line-through">
                                            {originalPrice.toFixed(2)}€
                                          </div>
                                        )}
                                        <span className="font-bold text-lg text-foreground">
                                          {discountedPrice.toFixed(2)}€
                                        </span>
                                        {discount && (
                                          <Badge variant="destructive" className="ml-1 text-xs">
                                            -{discount.tip_popusta === 'procent' ? `${discount.vrednost}%` : `${discount.vrednost}€`}
                                          </Badge>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => toggleFavorite(jed.id)}
                                  >
                                    <Heart className={`h-4 w-4 ${isFavorite(jed.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-muted-foreground text-sm mb-4">
                                {jed.opis}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleQuantityChange(jed.id, -1)}
                                    disabled={!quantities[jed.id]}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  
                                  <span className="w-8 text-center text-sm font-medium">
                                    {quantities[jed.id] || 0}
                                  </span>
                                  
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleQuantityChange(jed.id, 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddToCart(jed)}
                                    disabled={!jed.na_voljo}
                                  >
                                    {!jed.na_voljo ? 'Ni na voljo' : 'Dodaj v košarico'}
                                  </Button>
                                </motion.div>
                              </div>
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
            <div className="text-center py-8">
              <p className="text-muted-foreground">Ta restavracija nima dodanih jedi.</p>
            </div>
          )}
        </div>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
};