import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { CartSheet } from '@/components/cart/CartSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRestaurants } from '@/hooks/useRestaurants';
import { getOrderingStatus } from '@/utils/workingHours';
import { Database } from '@/integrations/supabase/types';

type Restavracija = Database['public']['Tables']['restavracije']['Row'];

interface RestaurantsPageProps {
  onSelectRestaurant: (restaurant: Restavracija) => void;
  onProfileClick: () => void;
}

export const RestaurantsPage: React.FC<RestaurantsPageProps> = ({ onSelectRestaurant, onProfileClick }) => {
  const [cartOpen, setCartOpen] = useState(false);
    const { restaurants, isLoading, error } = useRestaurants();

  const handleSelectRestaurant = (restaurant: Restavracija) => {
    onSelectRestaurant(restaurant);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        title="Restavracije" 
        showCart={true} 
        onCartClick={() => setCartOpen(true)} 
        onProfileClick={() => {
          console.log('Profile clicked in RestaurantsPage');
          onProfileClick();
        }}
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

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse mb-3 w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Napaka pri nalaganju restavracij: {error}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {restaurants.map((restavracija, index) => {
              const orderingStatus = getOrderingStatus(restavracija.delovni_cas_od, restavracija.delovni_cas_do);
              const isClosed = orderingStatus === 'closed';
              
              return (
                <motion.div
                  key={restavracija.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`overflow-hidden transition-all duration-300 cursor-pointer ${
                      isClosed 
                        ? 'opacity-60 hover:shadow-md' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => !isClosed && handleSelectRestaurant(restavracija as any)}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/30">{restavracija.naziv.charAt(0)}</span>
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="secondary" className="bg-background/90 text-foreground">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          4.5
                        </Badge>
                        {isClosed && (
                          <Badge variant="destructive" className="bg-destructive/90 text-destructive-foreground">
                            Zaprto
                          </Badge>
                        )}
                        {orderingStatus === 'closing_soon' && (
                          <Badge variant="outline" className="bg-yellow-500/90 text-white">
                            Kmalu zapiramo
                          </Badge>
                        )}
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
                          {restavracija.delovni_cas_od} - {restavracija.delovni_cas_do}
                        </div>
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2"
                        disabled={isClosed}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
              );
            })}
          </div>
        )}

        {false && (
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