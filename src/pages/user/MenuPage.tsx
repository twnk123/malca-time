import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Minus, Star, Clock, MapPin } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { CartSheet } from '@/components/cart/CartSheet';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { mockJedi, Restavracija, Jed } from '@/data/mockData';

interface MenuPageProps {
  restaurant: Restavracija;
  onBack: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ restaurant, onBack }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart } = useCart();

  const jediRestavracije = useMemo(() => 
    mockJedi.filter(jed => jed.restavracija_id === restaurant.id),
    [restaurant.id]
  );

  const kategorije = useMemo(() => 
    [...new Set(jediRestavracije.map(jed => jed.kategorija))],
    [jediRestavracije]
  );

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
        naziv: jed.naziv,
        cena: jed.cena,
        opis: jed.opis,
        restavracija_id: restaurant.id,
        restavracija_naziv: restaurant.naziv
      });
    }

    setQuantities(prev => ({ ...prev, [jed.id]: 0 }));
    
    toast({
      title: "Dodano v košarico",
      description: `${jed.naziv} (${kolicina}x) - ${(jed.cena * kolicina).toFixed(2)}€`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={restaurant.naziv} 
        showCart={true} 
        onCartClick={() => setCartOpen(true)} 
      />

      {/* Restaurant Header */}
      <div className="relative">
        <div className="aspect-[3/2] relative overflow-hidden">
          <img
            src={restaurant.slika}
            alt={restaurant.naziv}
            className="w-full h-full object-cover"
          />
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
                {restaurant.ocena}
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {restaurant.cas_dostave}
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
        <Tabs defaultValue={kategorije[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            {kategorije.map(kategorija => (
              <TabsTrigger key={kategorija} value={kategorija} className="text-sm">
                {kategorija}
              </TabsTrigger>
            ))}
          </TabsList>

          {kategorije.map(kategorija => (
            <TabsContent key={kategorija} value={kategorija}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {jediRestavracije
                  .filter(jed => jed.kategorija === kategorija)
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
                            <div className="flex-1 pr-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-foreground">
                                  {jed.naziv}
                                </h3>
                                <span className="font-bold text-lg text-foreground">
                                  {jed.cena.toFixed(2)}€
                                </span>
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
      </div>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
};