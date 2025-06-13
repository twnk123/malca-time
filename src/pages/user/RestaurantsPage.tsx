import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { CartSheet } from '@/components/cart/CartSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockRestavracije, Restavracija } from '@/data/mockData';

interface RestaurantsPageProps {
  onSelectRestaurant: (restaurant: Restavracija) => void;
}

export const RestaurantsPage: React.FC<RestaurantsPageProps> = ({ onSelectRestaurant }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRestaurant = (restaurant: Restavracija) => {
    setIsLoading(true);
    // Simulacija nalaganja
    setTimeout(() => {
      onSelectRestaurant(restaurant);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Restavracije" 
        showCart={true} 
        onCartClick={() => setCartOpen(true)} 
      />
      
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Izberite restavracijo
          </h2>
          <p className="text-muted-foreground">
            Odkrijte okusne malice iz naših partnerskih restavracij
          </p>
        </motion.div>

        <div className="grid gap-4">
          {mockRestavracije.map((restavracija, index) => (
            <motion.div
              key={restavracija.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleSelectRestaurant(restavracija)}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={restavracija.slika}
                    alt={restavracija.naziv}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-background/90 text-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {restavracija.ocena}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        {restavracija.naziv}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {restavracija.opis}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {restavracija.lokacija}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {restavracija.cas_dostave}
                        </div>
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button variant="ghost" size="icon" className="ml-2">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-card p-6 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-foreground">Nalagam meni...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
};