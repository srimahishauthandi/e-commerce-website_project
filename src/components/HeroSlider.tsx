import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 1,
    subtitle: "MOBILE EXCELLENCE",
    title: "Halo X Ultra",
    description: "Redefining the smartphone experience with custom dark aesthetics.",
    image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1600&auto=format&fit=crop",
    cta: "EXPLORE COLLECTION",
    link: "/?category=electronics"
  },
  {
    id: 2,
    subtitle: "TIMELESS PRECISION",
    title: "Vanguard Chrono",
    description: "Crafted for those who value every second of their journey.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop",
    cta: "SHOP WATCHES",
    link: "/?category=electronics"
  },
  {
    id: 3,
    subtitle: "SONIC PERFECTION",
    title: "Aura Studio Pro",
    description: "Immerse yourself in pure sound with active noise cancellation.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop",
    cta: "DISCOVER AUDIO",
    link: "/?category=electronics"
  }
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative h-[500px] md:h-[650px] w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80 z-10" />
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="h-full w-full object-cover opacity-60"
          />

          {/* Content */}
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs md:text-sm font-bold tracking-[0.3em] text-white/80 mb-4"
            >
              {slides[current].subtitle}
            </motion.p>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-8xl font-serif text-white mb-6"
              style={{ fontFamily: 'serif' }}
            >
              {slides[current].title}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="max-w-2xl text-sm md:text-lg text-white/70 mb-10 font-light"
            >
              {slides[current].description}
            </motion.p>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(slides[current].link)}
              className="bg-white/90 text-black px-8 py-3 rounded-full text-xs font-bold tracking-widest flex items-center gap-2 hover:bg-white transition-all shadow-2xl"
            >
              {slides[current].cta} <ArrowRight size={14} />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 z-30 -translate-y-1/2 p-3 rounded-full border border-white/20 bg-black/20 text-white hover:bg-white/10 transition-all backdrop-blur-sm"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 z-30 -translate-y-1/2 p-3 rounded-full border border-white/20 bg-black/20 text-white hover:bg-white/10 transition-all backdrop-blur-sm"
      >
        <ChevronRight size={24} />
      </button>

      {/* Bottom Search Bar */}
      <div className="absolute bottom-12 left-1/2 z-30 w-full max-w-xl -translate-x-1/2 px-4">
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SHOPZONE..."
            className="w-full bg-white/10 border border-white/20 backdrop-blur-md px-6 py-4 rounded-full text-white placeholder:text-white/40 outline-none focus:bg-white/20 focus:border-white/40 transition-all text-center text-sm"
          />
          <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 group-hover:text-white transition-colors">
            <Search size={20} />
          </button>
        </form>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 transition-all duration-500 rounded-full ${i === current ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
