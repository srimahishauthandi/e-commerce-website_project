import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Product } from '../types/supabase';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, addToWishlist, wishlist } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isWishlisted = wishlist.some(item => item.product_id === product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product.id);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    addToWishlist(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleCardClick}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer relative"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 border-b border-gray-100">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
        />
        
        <button 
          onClick={handleAddToWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors z-20 ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {product.is_featured && (
          <span className="absolute top-3 left-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-r-full shadow-sm z-10">
            BEST SELLER
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-800 mb-2 group-hover:text-orange-600 line-clamp-2 min-h-[40px] leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-orange-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-xs text-blue-600 hover:underline ml-1">
            {product.review_count.toLocaleString()}
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-xs font-bold align-top mt-1">₹</span>
            <span className="text-2xl font-bold text-gray-900">{product.price.toLocaleString()}</span>
            <span className="text-xs text-gray-400 line-through ml-2">₹{(product.price * 1.2).toFixed(0).toLocaleString()}</span>
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-full bg-orange-400 hover:bg-orange-500 text-[#131921] font-bold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95 z-20"
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
