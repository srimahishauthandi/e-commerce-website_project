import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import { Product, Category } from '../types/supabase';

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const searchQuery = searchParams.get('search');
  const categoryId = searchParams.get('category');
  const sortBy = searchParams.get('sort') || 'featured';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: catData } = await supabase.from('categories').select('*').order('name');
      if (catData) setCategories(catData as Category[]);

      let query = supabase.from('products').select('*');
      
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      // Sorting logic
      if (sortBy === 'price_low') query = query.order('price', { ascending: true });
      else if (sortBy === 'price_high') query = query.order('price', { ascending: false });
      else if (sortBy === 'rating') query = query.order('rating', { ascending: false });
      else query = query.order('is_featured', { ascending: false });

      const { data: prodData } = await query;
      if (prodData) setProducts(prodData as Product[]);
      
      setLoading(false);
    };

    fetchData();
  }, [searchQuery, categoryId, sortBy]);

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Category Navigation Bar */}
      <div className="bg-[#131921] text-white/80 overflow-x-auto no-scrollbar border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-8 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap">
          <Link to="/" className={`hover:text-white transition-colors ${!categoryId ? 'text-orange-400' : ''}`}>
            All Collections
          </Link>
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/?category=${cat.id}`} 
              className={`hover:text-white transition-colors ${categoryId === cat.id ? 'text-orange-400' : ''}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Slider */}
      {!searchQuery && !categoryId && <HeroSlider />}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-orange-500 rounded-full" />
            <h2 className="font-bold text-2xl text-gray-900 tracking-tight">
              {searchQuery ? `Results for "${searchQuery}"` : categoryId ? categories.find(c => c.id === categoryId)?.name : t('home.all')}
              <span className="ml-3 text-sm font-medium text-gray-400">({products.length} items)</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <select 
              value={sortBy}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                params.set('sort', e.target.value);
                setSearchParams(params);
              }}
              className="bg-white border border-gray-200 text-gray-900 text-xs font-bold rounded-full focus:ring-orange-500 focus:border-orange-500 block w-full p-3 outline-none shadow-sm"
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
            </select>

            {(searchQuery || categoryId) && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-600 font-bold hover:underline whitespace-nowrap"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-[450px] animate-pulse shadow-sm">
                <div className="h-64 bg-gray-50 mb-4 rounded-t-2xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-50 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-50 rounded w-1/2"></div>
                  <div className="h-12 bg-gray-50 rounded-xl mt-6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 shadow-inner">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter size={40} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-500 mb-8">Try adjusting your filters or search terms.</p>
            <button 
              onClick={clearFilters}
              className="bg-[#131921] text-white px-10 py-3 rounded-full font-bold hover:bg-black transition-all shadow-xl"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
