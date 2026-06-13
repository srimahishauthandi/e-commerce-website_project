import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MapPin, Plus, CheckCircle2, CreditCard, ShieldCheck, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
    if (data) {
      setAddresses(data);
      if (data.length > 0) setSelectedAddress(data[0].id);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('addresses').insert({
      ...newAddress,
      user_id: user?.id
    }).select().single();

    if (data) {
      setAddresses([data, ...addresses]);
      setSelectedAddress(data.id);
      setIsAddingAddress(false);
      setNewAddress({ full_name: '', phone: '', street_address: '', city: '', state: '', pincode: '' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || cart.length === 0) return;
    setLoading(true);

    const totalAmount = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const address = addresses.find(a => a.id === selectedAddress);
    const shippingAddress = `${address.full_name}, ${address.street_address}, ${address.city}, ${address.state} - ${address.pincode}. Phone: ${address.phone}`;

    // Create Order
    const { data: order } = await supabase.from('orders').insert({
      user_id: user?.id,
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      status: 'pending',
      payment_status: 'unpaid'
    }).select().single();

    if (order) {
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.product.price
      }));

      await supabase.from('order_items').insert(orderItems);
      await clearCart();
      navigate(`/order-success/${order.id}`);
    }
    setLoading(false);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Checkout Steps Header */}
        <div className="flex items-center justify-center gap-4 mb-8 text-sm font-bold text-gray-400">
          <span className="text-orange-600 border-b-2 border-orange-600 pb-1">1. ADDRESS</span>
          <ChevronRight size={16} />
          <span>2. PAYMENT</span>
          <ChevronRight size={16} />
          <span>3. REVIEW</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="text-orange-500" size={20} /> Select Delivery Address
                </h2>
                {!isAddingAddress && (
                  <button 
                    onClick={() => setIsAddingAddress(true)}
                    className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus size={16} /> Add New
                  </button>
                )}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {isAddingAddress ? (
                    <motion.form 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleAddAddress} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                        <input 
                          type="text" required 
                          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
                          value={newAddress.full_name}
                          onChange={e => setNewAddress({...newAddress, full_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                        <input 
                          type="text" required 
                          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
                          value={newAddress.phone}
                          onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Street Address</label>
                        <input 
                          type="text" required 
                          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
                          value={newAddress.street_address}
                          onChange={e => setNewAddress({...newAddress, street_address: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                        <input 
                          type="text" required 
                          className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
                          value={newAddress.city}
                          onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">State</label>
                          <input 
                            type="text" required 
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
                            value={newAddress.state}
                            onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Pincode</label>
                          <input 
                            type="text" required 
                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
                            value={newAddress.pincode}
                            onChange={e => setNewAddress({...newAddress, pincode: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 flex gap-4 pt-4">
                        <button type="submit" className="bg-[#131921] text-white px-8 py-2 rounded-md font-bold hover:bg-gray-800">
                          Save Address
                        </button>
                        <button type="button" onClick={() => setIsAddingAddress(false)} className="text-gray-500 font-bold hover:text-gray-700">
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${selectedAddress === addr.id ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-800">{addr.full_name}</span>
                            {selectedAddress === addr.id && <CheckCircle2 size={20} className="text-orange-500" />}
                          </div>
                          <p className="text-sm text-gray-600 mb-1 line-clamp-2">{addr.street_address}</p>
                          <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-sm text-gray-900 mt-3 font-bold">Phone: {addr.phone}</p>
                        </div>
                      ))}
                      {addresses.length === 0 && (
                        <div className="md:col-span-2 text-center py-8 text-gray-500 italic">
                          No addresses found. Please add one to continue.
                        </div>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Payment Section */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="text-orange-500" size={20} /> Payment Method
                </h2>
              </div>
              <div className="p-6">
                <div className="p-4 rounded-lg border-2 border-orange-400 bg-orange-50 flex items-center gap-4">
                  <div className="h-6 w-6 rounded-full border-4 border-orange-500 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-gray-800">Cash on Delivery (COD)</span>
                    <p className="text-sm text-gray-600">Pay securely at your doorstep when your order arrives.</p>
                  </div>
                  <CheckCircle2 className="text-orange-500" />
                </div>
                
                <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-lg text-blue-800 text-sm">
                  <ShieldCheck size={20} className="shrink-0" />
                  <p>Your payment is 100% secure. We currently only support Cash on Delivery to ensure the best experience for our customers.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-6 border-b pb-2">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded border p-1 shrink-0">
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800 line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items Total</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>COD Charges</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Order Total</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || loading}
                className="w-full bg-orange-400 text-[#131921] font-bold py-4 rounded-md mt-8 hover:bg-orange-500 transition-all shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#131921] border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </div>
                ) : (
                  'Place Your Order'
                )}
              </button>
              
              <p className="text-[10px] text-gray-400 text-center mt-4">
                By placing your order, you agree to Flipzon's privacy notice and conditions of use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
