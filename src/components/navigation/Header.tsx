import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ShoppingCart } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCartContext } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  showCart?: boolean;
  onCartClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showCart = false, onCartClick }) => {
  const { user, signOut } = useAuthContext();
  const { getTotalItems } = useCartContext();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
            >
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
              {user && (
                <p className="text-xs text-muted-foreground">
                  {user.ime} • {user.vloga === 'uporabnik' ? 'Uporabnik' : 'Admin restavracije'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showCart && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onCartClick}
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </motion.div>
            )}

            {user && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Odjava
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};