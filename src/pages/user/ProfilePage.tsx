import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Clock, CheckCircle, XCircle, RotateCcw, Heart, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';

interface OrderWithItems {
  id: string;
  created_at: string;
  cas_prevzema: string;
  skupna_cena: number;
  status: string;
  opomba?: string;
  postavke_narocila: Array<{
    id: string;
    kolicina: number;
    cena_na_kos: number;
    jedi: {
      id: string;
      ime: string;
      opis?: string;
      slika_url?: string;
    };
  }>;
  restavracije: {
    naziv: string;
  };
}

interface FavoriteFood {
  id: string;
  jed_id: string;
  jedi: {
    id: string;
    ime: string;
    opis?: string;
    cena: number;
    slika_url?: string;
    restavracija_id: string;
    restavracije: {
      naziv: string;
    };
  };
}

interface ProfilePageProps {
  onBack?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user } = useAuthContext();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [favorites, setFavorites] = useState<FavoriteFood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('narocila')
        .select(`
          *,
          postavke_narocila (
            *,
            jedi (id, ime, opis, slika_url)
          ),
          restavracije (naziv)
        `)
        .eq('uporabnik_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('priljubljene_jedi')
        .select(`
          *,
          jedi!inner (
            *,
            restavracije!inner (naziv)
          )
        `)
        .eq('uporabnik_id', user?.id);

      if (favoritesError) throw favoritesError;

      setOrders(ordersData || []);
      setFavorites(favoritesData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri nalaganju podatkov.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      novo: { label: 'Novo', variant: 'secondary' as const },
      potrjeno: { label: 'Potrjeno', variant: 'default' as const },
      pripravljeno: { label: 'Pripravljeno', variant: 'secondary' as const },
      prevzeto: { label: 'Prevzeto', variant: 'default' as const },
      preklicano: { label: 'Preklicano', variant: 'destructive' as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.novo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const reorderItems = async (order: OrderWithItems) => {
    try {
      // Add all items from the order to cart
      for (const item of order.postavke_narocila) {
        addToCart({
          id: item.jedi.id,
          naziv: item.jedi.ime,
          cena: item.cena_na_kos,
          opis: item.jedi.opis || '',
          restavracija_id: order.postavke_narocila[0]?.jedi.id || '', // This should be from restaurant data
          restavracija_naziv: order.restavracije.naziv
        });
      }
      
      toast({
        title: "Uspešno dodano",
        description: "Vsi izdelki iz naročila so bili dodani v košarico."
      });
    } catch (error) {
      console.error('Error reordering:', error);
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri ponovnem naročilu.",
        variant: "destructive"
      });
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('priljubljene_jedi')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast({
        title: "Odstranjeno",
        description: "Jed je bila odstranjena iz priljubljenih."
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Napaka",
        description: "Prišlo je do napake pri odstranjevanju.",
        variant: "destructive"
      });
    }
  };

  const addFavoriteToCart = (favorite: FavoriteFood) => {
    addToCart({
      id: favorite.jedi.id,
      naziv: favorite.jedi.ime,
      cena: favorite.jedi.cena,
      opis: favorite.jedi.opis || '',
      restavracija_id: favorite.jedi.restavracija_id,
      restavracija_naziv: favorite.jedi.restavracije.naziv
    });
    
    toast({
      title: "Dodano v košarico",
      description: `${favorite.jedi.ime} je bila dodana v košarico.`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazaj
        </Button>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{user?.ime} {user?.priimek}</CardTitle>
                <CardDescription className="flex items-center space-x-4 mt-2">
                  <span>{user?.email}</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    Član od {new Date().toLocaleDateString('sl-SI')}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs for Orders and Favorites */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Zgodovina naročil</TabsTrigger>
            <TabsTrigger value="favorites">Priljubljene jedi</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Še nimate nobenih naročil.</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{order.restavracije.naziv}</CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-2">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(order.created_at).toLocaleDateString('sl-SI')}
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              Prevzem: {new Date(order.cas_prevzema).toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(order.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reorderItems(order)}
                            className="ml-2"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Ponovi
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.postavke_narocila.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <div>
                              <span className="font-medium">{item.kolicina}x {item.jedi.ime}</span>
                              {item.jedi.opis && (
                                <p className="text-sm text-muted-foreground">{item.jedi.opis}</p>
                              )}
                            </div>
                            <span className="font-medium">{(item.cena_na_kos * item.kolicina).toFixed(2)}€</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 text-lg font-bold">
                          <span>Skupaj:</span>
                          <span>{order.skupna_cena.toFixed(2)}€</span>
                        </div>
                        {order.opomba && (
                          <div className="mt-2 p-2 bg-muted rounded">
                            <p className="text-sm"><strong>Opomba:</strong> {order.opomba}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Še nimate priljubljenih jedi.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((favorite, index) => (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full">
                      {favorite.jedi.slika_url && (
                        <div className="aspect-square relative overflow-hidden rounded-t-lg">
                          <img
                            src={favorite.jedi.slika_url}
                            alt={favorite.jedi.ime}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{favorite.jedi.ime}</CardTitle>
                        <CardDescription>
                          {favorite.jedi.restavracije.naziv} • {favorite.jedi.cena.toFixed(2)}€
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {favorite.jedi.opis && (
                          <p className="text-sm text-muted-foreground mb-4">{favorite.jedi.opis}</p>
                        )}
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => addFavoriteToCart(favorite)}
                            className="flex-1"
                          >
                            Dodaj v košarico
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFavorite(favorite.id)}
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};