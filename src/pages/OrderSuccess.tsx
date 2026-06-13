import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Download, Package, ArrowRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data: orderData } = await supabase.from('orders').select('*').eq('id', id).single();
      const { data: itemsData } = await supabase.from('order_items').select('*, product:products(name)').eq('order_id', id);
      
      if (orderData) setOrder(orderData);
      if (itemsData) setItems(itemsData);
    };
    fetchOrder();
  }, [id]);

  const downloadReceipt = () => {
    if (!order) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('ShopZone Order Receipt', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 20, 40);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 50);
    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 60);
    doc.text(`Payment: Cash on Delivery (COD)`, 20, 70);
    
    doc.text('Shipping Address:', 20, 90);
    const splitAddress = doc.splitTextToSize(order.shipping_address, 160);
    doc.text(splitAddress, 20, 100);
    
    doc.text('Items:', 20, 130);
    let y = 140;
    items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.product.name} (Qty: ${item.quantity}) - ₹${item.price_at_time * item.quantity}`, 25, y);
      y += 10;
    });
    
    doc.setFontSize(16);
    doc.text(`Total Amount: ₹${order.total_amount}`, 20, y + 10);
    
    doc.save(`ShopZone_Receipt_${order.id.slice(0, 8)}.pdf`);
  };

  if (!order) return <div className="text-center py-20">Loading order details...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100"
      >
        <CheckCircle size={80} className="text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-8">Thank you for shopping with ShopZone. Your order ID is <span className="font-bold text-[#131921]">#{order.id.slice(0, 8)}</span></p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={20} className="text-orange-500" /> Order Summary
          </h3>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                <span className="font-bold">₹{item.price_at_time * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
            <span>Total Amount (COD)</span>
            <span>₹{order.total_amount}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={downloadReceipt}
            className="flex items-center justify-center gap-2 bg-[#131921] text-white font-bold py-3 px-8 rounded-md hover:bg-gray-800 transition-colors"
          >
            <Download size={20} /> Download Receipt
          </button>
          <Link 
            to="/orders"
            className="flex items-center justify-center gap-2 bg-orange-400 text-[#131921] font-bold py-3 px-8 rounded-md hover:bg-orange-500 transition-colors"
          >
            Track Order <ArrowRight size={20} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
