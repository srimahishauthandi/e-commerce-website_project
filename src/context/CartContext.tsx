import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { CartItem, WishlistItem } from '../types/supabase';

interface CartContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(name, price, image_url)')
      .eq('user_id', user.id);
    if (data) setCart(data as any);
  }, [user]);

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wishlist_items')
      .select('*, product:products(name, price, image_url)')
      .eq('user_id', user.id);
    if (data) setWishlist(data as any);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();

      const cartSubscription = supabase
        .channel(`cart:${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user.id}` }, fetchCart)
        .subscribe();

      const wishlistSubscription = supabase
        .channel(`wishlist:${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlist_items', filter: `user_id=eq.${user.id}` }, fetchWishlist)
        .subscribe();

      return () => {
        cartSubscription.unsubscribe();
        wishlistSubscription.unsubscribe();
      };
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user, fetchCart, fetchWishlist]);

  const addToCart = async (productId: string) => {
    if (!user) return;
    const existing = cart.find(item => item.product_id === productId);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + 1);
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity: 1 });
    }
  };

  const removeFromCart = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
  };

  const addToWishlist = async (productId: string) => {
    if (!user) return;
    const existing = wishlist.find(item => item.product_id === productId);
    if (existing) {
      await removeFromWishlist(existing.id);
    } else {
      await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: productId });
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    await supabase.from('wishlist_items').delete().eq('id', itemId);
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
  };

  return (
    <CartContext.Provider value={{ cart, wishlist, addToCart, removeFromCart, updateQuantity, addToWishlist, removeFromWishlist, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
