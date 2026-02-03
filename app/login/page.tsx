'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Globe, ChevronDown, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authenticate, socialAuthenticate, checkRateLimit } from '@/lib/auth';
import { useAppStore } from '@/lib/store';
import { GoogleIcon, FacebookIcon, InstagramIcon, TwitterIcon, LinkedInIcon } from '@/components/SocialIcons';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser, checkAuth } = useAppStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Check for OAuth errors in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get('error');
      if (urlError) {
        setOauthError(decodeURIComponent(urlError));
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // Check rate limit on email change
  useEffect(() => {
    if (email) {
      const rateLimit = checkRateLimit(email);
      if (!rateLimit.allowed) {
        setRateLimitMessage(rateLimit.message || 'Account is locked');
        setLockedUntil(rateLimit.lockedUntil || null);
      } else {
        setRateLimitMessage(null);
        setLockedUntil(null);
      }
    } else {
      setRateLimitMessage(null);
      setLockedUntil(null);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const result = await authenticate(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        checkAuth();
        router.push('/dashboard');
      } else {
        setError(result.error || 'Login failed');
        const rateLimit = checkRateLimit(email);
        if (!rateLimit.allowed) {
          setRateLimitMessage(rateLimit.message || 'Account is locked');
          setLockedUntil(rateLimit.lockedUntil || null);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'instagram' | 'linkedin') => {
    setError(null);
    
    try {
      // Redirect to OAuth initiation endpoint
      // This will redirect to the provider's OAuth page
      window.location.href = `/api/auth/oauth/${provider}`;
    } catch (err) {
      setError('Failed to initiate OAuth flow. Please try again.');
    }
  };

  const isLocked = lockedUntil && lockedUntil > Date.now();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Promotional Panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
              <Logo variant="dark" size="md" animated={false} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Africa TV</h1>
              <p className="text-sm text-white/90">Manage Your Station</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Welcome Back to
                <br />
                <span className="text-orange-200">Africa TV</span>
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Manage your television station operations with ease and efficiency.
              </p>
            </motion.div>

            {/* Placeholder for GIF Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="relative mt-8 w-full h-64 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center overflow-hidden"
            >
              {/* Placeholder text - will be replaced with GIF */}
              <div className="text-center text-white/60">
                <p className="text-sm mb-2">Animated Content</p>
                <p className="text-xs">GIF video will be inserted here</p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Africa TV</p>
                <p className="text-xs text-white/80">Television Station</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Language Selector */}
            <div className="flex justify-end mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer bg-white">
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700 font-medium">English (USA)</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign In</h1>
              <p className="text-gray-600 mb-8">Welcome back! Please enter your details.</p>
            </motion.div>

            {/* OAuth Error Message */}
            <AnimatePresence>
              {oauthError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 rounded-lg flex items-start gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{oauthError}</p>
                    <p className="text-xs mt-1 text-yellow-700">
                      OAuth is optional. You can still sign in with email and password below.
                    </p>
                    <button
                      onClick={() => setOauthError(null)}
                      className="text-xs text-yellow-600 hover:text-yellow-800 mt-2 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {(error || rateLimitMessage) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 rounded-lg flex items-center gap-3 bg-red-50 border border-red-200 text-red-700"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error || rateLimitMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isLocked || loading}
                    className="pl-10 w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLocked || loading}
                    className="pl-10 pr-10 w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked || loading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLocked || loading}
                whileHover={!isLocked && !loading ? { scale: 1.02 } : {}}
                whileTap={!isLocked && !loading ? { scale: 0.98 } : {}}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-lg font-semibold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </motion.button>

              {/* Social Login */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or Sign In With</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {[
                  { name: 'Google', provider: 'google' as const, Icon: GoogleIcon, color: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-gray-400' },
                  { name: 'Facebook', provider: 'facebook' as const, Icon: FacebookIcon, color: 'bg-[#1877F2] hover:bg-[#166FE5] text-white' },
                  { name: 'Instagram', provider: 'instagram' as const, Icon: InstagramIcon, color: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 text-white' },
                  { name: 'LinkedIn', provider: 'linkedin' as const, Icon: LinkedInIcon, color: 'bg-[#0077B5] hover:bg-[#006399] text-white' },
                ].map((item, index) => (
                  <motion.button
                    key={item.name}
                    type="button"
                    onClick={() => handleSocialLogin(item.provider)}
                    disabled={loading}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={!loading ? { scale: 1.1, y: -2 } : {}}
                    whileTap={!loading ? { scale: 0.9 } : {}}
                    className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center shadow-md transition-all disabled:opacity-50`}
                    title={item.name}
                  >
                    <item.Icon className="w-5 h-5" />
                  </motion.button>
                ))}
              </div>

              {/* Signup Link */}
              <div className="text-center pt-4">
                <p className="text-gray-600 text-sm">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}
