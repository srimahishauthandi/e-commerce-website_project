import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Package, Truck, CheckCircle2, Clock, ChevronRight, Search, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
      
      const subscription = supabase
        .channel('order_updates')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'orders', 
          filter: `user_id=eq.${user.id}` 
        }, fetchOrders)
        .subscribe();
        
      return () => { subscription.unsubscribe(); };
    }
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(quantity, price_at_time, product:products(id, name, image_url))')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending': return { icon: <Clock className="text-yellow-500" />, label: 'Order Pending', color: 'bg-yellow-500', progress: 20 };
      case 'confirmed': return { icon: <CheckCircle2 className="text-blue-500" />, label: 'Confirmed', color: 'bg-blue-500', progress: 40 };
      case 'processing': return { icon: <Package className="text-purple-500" />, label: 'Processing', color: 'bg-purple-500', progress: 60 };
      case 'shipped': return { icon: <Truck className="text-orange-500" />, label: 'Shipped', color: 'bg-orange-500', progress: 80 };
      case 'out_for_delivery': return { icon: <Truck className="text-indigo-500" />, label: 'Out for Delivery', color: 'bg-indigo-500', progress: 90 };
      case 'delivered': return { icon: <CheckCircle2 className="text-green-500" />, label: 'Delivered', color: 'bg-green-500', progress: 100 };
      default: return { icon: <Package className="text-gray-500" />, label: 'Unknown', color: 'bg-gray-500', progress: 0 };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h1>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search all orders" 
              className="pl-10 pr-4 py-2 border rounded-full text-sm focus:ring-2 focus:ring-orange-400 outline-none w-64"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          {orders.map((order) => {
            const status = getStatusDetails(order.status);
            return (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-gray-500 uppercase font-bold mb-1">Order Placed</p>
                    <p className="text-sm font-medium text-gray-800">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase font-bold mb-1">Total</p>
                    <p className="text-sm font-bold text-gray-800">₹{order.total_amount.toLocaleString()}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-gray-500 uppercase font-bold mb-1">Ship To</p>
                    <div className="group relative cursor-help">
                      <p className="text-sm font-medium text-blue-600 hover:text-orange-600 hover:underline flex items-center gap-1">
                        View Address <ChevronRight size={12} />
                      </p>
                      <div className="absolute left-0 top-full mt-2 w-64 bg-white p-4 rounded-lg shadow-2xl border border-gray-200 hidden group-hover:block z-20 text-gray-700">
                        <p className="font-bold mb-2">Shipping Details:</p>
                        <p className="text-xs leading-relaxed">{order.shipping_address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 uppercase font-bold mb-1">Order # {order.id.slice(0, 8)}</p>
                    <Link to={`/order-success/${order.id}`} className="text-sm text-blue-600 hover:text-orange-600 hover:underline">
                      View Receipt
                    </Link>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-6">
                      {/* Status & Progress */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {status.icon}
                          <h3 className="text-lg font-bold text-gray-900">
                            {t(`orders.status.${order.status}`)}
                          </h3>
                        </div>
                        
                        <div className="relative">
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${status.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full ${status.color}`}
                            />
                          </div>
                          <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            <span>Ordered</span>
                            <span>Shipped</span>
                            <span>Delivered</span>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-4 pt-4">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-4 items-center group">
                            <Link to={`/product/${item.product.id}`} className="w-20 h-20 bg-gray-50 rounded border p-2 shrink-0">
                              <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                            </Link>
                            <div className="flex-1">
                              <Link to={`/product/${item.product.id}`} className="font-bold text-sm text-gray-800 hover:text-orange-600 line-clamp-1">
                                {item.product.name}
                              </Link>
                              <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                              <p className="text-sm font-bold text-orange-600 mt-1">₹{item.price_at_time.toLocaleString()}</p>
                            </div>
                            <div className="hidden sm:flex flex-col gap-2">
                              <Link 
                                to={`/product/${item.product.id}`}
                                className="bg-orange-400 text-[#131921] text-[10px] font-bold py-2 px-4 rounded shadow-sm hover:bg-orange-500 transition-colors text-center"
                              >
                                Buy it again
                              </Link>
                              <button className="bg-white border border-gray-300 text-[10px] font-bold py-2 px-4 rounded hover:bg-gray-50 transition-colors">
                                Track Package
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {orders.length === 0 && (
            <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={48} className="text-gray-200" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders found</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Looks like you haven't placed any orders yet. Start exploring our amazing collection!</p>
              <Link 
                to="/" 
                className="bg-orange-400 text-[#131921] font-bold py-3 px-10 rounded-md hover:bg-orange-500 transition-all shadow-lg shadow-orange-100"
              >
                Go Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
