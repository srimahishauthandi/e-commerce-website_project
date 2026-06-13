import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 inline-block">
          <ShoppingBag size={80} className="mx-auto text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('cart.empty')}</h2>
          <p className="text-gray-500 mb-8">Add something to make me happy!</p>
          <Link to="/" className="bg-orange-400 text-[#131921] font-bold py-3 px-8 rounded-md hover:bg-orange-500 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4"
            >
              <img src={item.product.image_url} alt={item.product.name} className="w-24 h-24 object-cover rounded-md" />
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{item.product.name}</h3>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={20} />
                  </button>
                </div>
                <p className="text-orange-500 font-bold mb-4">₹{item.product.price.toLocaleString()}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6">Price Details</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Price ({cart.length} items)</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges</span>
              <span className="text-green-600 font-bold">FREE</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between text-xl font-bold text-[#131921]">
              <span>{t('cart.total')}</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-orange-400 text-[#131921] font-bold py-4 rounded-md hover:bg-orange-500 transition-colors shadow-lg shadow-orange-200"
          >
            {t('cart.checkout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
