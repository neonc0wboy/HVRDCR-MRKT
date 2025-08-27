import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { CartItem, Cpu } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (cpu: Cpu) => void;
  removeFromCart: (cpuId: string) => void;
  updateQuantity: (cpuId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const item = window.localStorage.getItem('hvrdcr-market-cart');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading cart from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('hvrdcr-market-cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error writing cart to localStorage', error);
    }
  }, [cartItems]);

  const addToCart = (cpu: Cpu) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.cpu.id === cpu.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.cpu.id === cpu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { cpu, quantity: 1 }];
    });
  };

  const removeFromCart = (cpuId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.cpu.id !== cpuId));
  };

  const updateQuantity = (cpuId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cpuId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.cpu.id === cpuId ? { ...item, quantity } : item
        )
      );
    }
  };
  
  const clearCart = () => {
      setCartItems([]);
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};