import { useState, useCallback } from 'react';
import { Jed } from '@/types/database';

export interface CartItem {
  jed: Jed;
  kolicina: number;
  opomba?: string;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((jed: Jed, kolicina: number = 1, opomba?: string) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.jed.id === jed.id);
      
      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          kolicina: updated[existingIndex].kolicina + kolicina,
          opomba: opomba || updated[existingIndex].opomba
        };
        return updated;
      } else {
        // Add new item
        return [...prev, { jed, kolicina, opomba }];
      }
    });
  }, []);

  const updateCartItem = useCallback((jedId: string, kolicina: number, opomba?: string) => {
    setCartItems(prev => 
      prev.map(item => 
        item.jed.id === jedId 
          ? { ...item, kolicina, opomba }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((jedId: string) => {
    setCartItems(prev => prev.filter(item => item.jed.id !== jedId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.jed.cena * item.kolicina), 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.kolicina, 0);
  }, [cartItems]);

  return {
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems
  };
};