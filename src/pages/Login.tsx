import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    setMessage(null);
  }, [isSignUp]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (error) throw error;
        
        if (data.user && data.session) {
          navigate('/');
        } else {
          setMessage("Verification link sent! Please check your email inbox to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed. Please ensure it is configured in Supabase.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] px-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[420px] w-full bg-white p-8 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)]"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-0.5 text-4xl font-black tracking-tighter mb-1">
            <span className="text-[#f97316]">Shop</span>
            <span className="text-[#131921]">Zone</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            {isSignUp ? 'Join our community today' : 'Sign in to continue shopping'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-start gap-3"
            >
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-xs text-red-700 font-medium leading-relaxed">{error}</p>
            </motion.div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 flex items-start gap-3"
            >
              <CheckCircle2 className="text-green-500 shrink-0" size={18} />
              <p className="text-xs text-green-700 font-medium leading-relaxed">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f97316] transition-colors" size={18} />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all text-sm"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
              {!isSignUp && (
                <button type="button" className="text-[10px] font-bold text-blue-600 hover:underline">Forgot Password?</button>
              )}
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f97316] transition-colors" size={18} />
              <input 
                type="password" 
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] outline-none transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#131921] text-white font-bold py-3 rounded-md hover:bg-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="px-3 bg-white text-gray-400 font-bold uppercase tracking-widest">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full border border-gray-300 py-3 rounded-md font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.98] text-sm text-gray-700"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span>Google</span>
        </button>

        <p className="text-center mt-8 text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "New to ShopZone?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-[#f97316] font-bold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Create an account'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
