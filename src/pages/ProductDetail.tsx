import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Product } from '../types/supabase';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, addToWishlist, wishlist } = useCart();
  const { t } = useTranslation();

  const isWishlisted = wishlist.some(item => item.product_id === id);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      window.scrollTo(0, 0);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, category:categories(name)')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setProduct(data);
          
          const { data: related } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', data.category_id)
            .neq('id', id)
            .limit(4);
          
          if (related) setRelatedProducts(related as Product[]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product.id);
  };

  const handleAddToWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToWishlist(product.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#131921] text-white px-6 py-2 rounded-md font-bold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center"
        >
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-auto object-contain max-h-[500px] hover:scale-105 transition-transform duration-500"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <div className="mb-6">
            <p className="text-sm text-orange-500 font-bold uppercase tracking-wider mb-2">
              {product.category?.name}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-green-700 text-white px-2 py-0.5 rounded text-sm font-bold">
                {product.rating} <Star size={14} fill="currentColor" />
              </div>
              <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                {product.review_count.toLocaleString()} {t('product.reviews')}
              </span>
            </div>
          </div>

          <div className="border-y border-gray-100 py-6 mb-6">
            <div className="flex items-baseline gap-4 mb-1">
              <span className="text-4xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
              <span className="text-lg text-gray-400 line-through">₹{(product.price * 1.2).toFixed(0).toLocaleString()}</span>
              <span className="text-green-600 font-bold text-lg">20% OFF</span>
            </div>
            <p className="text-sm text-gray-500">Inclusive of all taxes</p>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-2">About this item</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button 
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 bg-orange-400 text-[#131921] font-bold py-4 rounded-md hover:bg-orange-500 transition-all shadow-md active:scale-95"
            >
              <ShoppingCart size={20} /> {t('product.addToCart')}
            </button>
            <button 
              onClick={handleAddToWishlist}
              className={`flex items-center justify-center gap-2 border-2 py-4 rounded-md font-bold transition-all active:scale-95 ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} /> 
              {isWishlisted ? 'Wishlisted' : t('nav.wishlist')}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck size={24} className="text-orange-500" />
              <span className="text-[10px] font-bold text-gray-600 uppercase">Free Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RotateCcw size={24} className="text-orange-500" />
              <span className="text-[10px] font-bold text-gray-600 uppercase">7 Days Return</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck size={24} className="text-orange-500" />
              <span className="text-[10px] font-bold text-gray-600 uppercase">1 Year Warranty</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="pt-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-8">{t('product.related')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <Link 
              key={p.id} 
              to={`/product/${p.id}`} 
              className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all group"
            >
              <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-50 p-2">
                <img 
                  src={p.image_url} 
                  alt={p.name} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <h3 className="font-bold text-gray-800 line-clamp-1 mb-1 text-sm group-hover:text-orange-600">
                {p.name}
              </h3>
              <div className="flex items-center gap-1 mb-2">
                <Star size={12} className="text-orange-400" fill="currentColor" />
                <span className="text-xs text-gray-500">{p.rating}</span>
              </div>
              <p className="text-gray-900 font-bold">₹{p.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
