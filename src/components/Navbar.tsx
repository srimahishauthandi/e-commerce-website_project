import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, User, LogOut, Globe, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { cart, wishlist } = useCart();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="bg-[#131921] text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 font-bold text-2xl">
            <span className="text-orange-400">Shop</span>Zone
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
            <div className="flex w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full px-4 py-2 text-black rounded-l-md focus:outline-none"
              />
              <button type="submit" className="bg-orange-400 px-5 rounded-r-md hover:bg-orange-500 transition-colors">
                <Search className="text-[#131921]" size={20} />
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={toggleLanguage} className="flex items-center gap-1 hover:text-orange-400 transition-colors">
              <Globe size={18} />
              <span>{i18n.language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            <Link to="/wishlist" className="hover:text-orange-400 transition-colors relative">
              <Heart size={24} />
              {user && wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-400 text-[#131921] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="hover:text-orange-400 transition-colors relative">
              <ShoppingCart size={24} />
              {user && cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-400 text-[#131921] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>

            <div className="group relative">
              {user ? (
                <>
                  <button className="flex flex-col items-start">
                    <span className="text-xs text-gray-400">{t('nav.hello')}, {user?.email?.split('@')[0]}</span>
                    <span className="text-sm font-bold flex items-center gap-1">
                      Account <User size={14} />
                    </span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 hidden group-hover:block border">
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">{t('nav.orders')}</Link>
                    <button onClick={signOut} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2">
                      <LogOut size={16} /> {t('nav.logout')}
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="bg-orange-400 text-[#131921] px-4 py-1.5 rounded-md font-bold text-sm hover:bg-orange-500 transition-colors">
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#232f3e] p-4 space-y-4">
          <form onSubmit={handleSearch} className="flex w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nav.search')}
              className="w-full px-4 py-2 text-black rounded-l-md"
            />
            <button type="submit" className="bg-orange-400 px-4 rounded-r-md">
              <Search className="text-[#131921]" size={20} />
            </button>
          </form>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/cart" className="flex items-center gap-2 py-2 border-b border-gray-700">
              <ShoppingCart size={20} /> {t('nav.cart')}
            </Link>
            <Link to="/wishlist" className="flex items-center gap-2 py-2 border-b border-gray-700">
              <Heart size={20} /> {t('nav.wishlist')}
            </Link>
            <Link to="/orders" className="flex items-center gap-2 py-2 border-b border-gray-700">
              <User size={20} /> {t('nav.orders')}
            </Link>
            <button onClick={toggleLanguage} className="flex items-center gap-2 py-2 border-b border-gray-700">
              <Globe size={20} /> {i18n.language === 'en' ? 'தமிழ்' : 'English'}
            </button>
          </div>
          {user ? (
            <button onClick={signOut} className="w-full text-left py-2 text-red-400 flex items-center gap-2">
              <LogOut size={20} /> {t('nav.logout')}
            </button>
          ) : (
            <Link to="/login" className="block w-full text-center bg-orange-400 text-[#131921] font-bold py-2 rounded-md">
              {t('nav.login')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
