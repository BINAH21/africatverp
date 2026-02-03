'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { User, Lock, AlertCircle, Loader2, Globe, ChevronDown, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { socialAuthenticate } from '@/lib/auth';
import { useAppStore } from '@/lib/store';
import { GoogleIcon } from '@/components/SocialIcons';

export default function SignupPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setUser, checkAuth } = useAppStore();
  
  const [signupMethod, setSignupMethod] = useState<'google' | 'manual'>('google');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvalSent, setApprovalSent] = useState(false);

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Redirect to Google OAuth initiation endpoint
      window.location.href = `/api/auth/oauth/google`;
    } catch (err) {
      setError('Failed to initiate Google sign-up. Please try again.');
      setLoading(false);
    }
  };

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.terms) {
      setError('Please accept the Terms & Conditions');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate sending approval code/link
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Generate approval code (6 digits)
      const approvalCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // In production, send this code via email/SMS
      // For now, we'll store it and show it to the user
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingApproval', JSON.stringify({
          username: formData.username,
          password: formData.password,
          approvalCode,
          timestamp: Date.now(),
        }));
      }
      
      setApprovalSent(true);
      setError(null);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };


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
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Learn From World&apos;s Best
                <br />
                <span className="flex items-center gap-2">
                  Instructors
                  <Globe className="w-8 h-8 text-orange-200" />
                </span>
                <br />
                Around The World.
              </h2>
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

      {/* Right Section - Signup Form */}
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
            </motion.div>

            {/* Error Message from URL params */}
            {typeof window !== 'undefined' && (() => {
              const urlParams = new URLSearchParams(window.location.search);
              const urlError = urlParams.get('error');
              if (urlError && !error) {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-lg flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{decodeURIComponent(urlError)}</p>
                      <p className="text-xs mt-1 text-yellow-700">
                        You can also create an account manually with username and password.
                      </p>
                    </div>
                  </motion.div>
                );
              }
              return null;
            })()}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 rounded-lg flex items-center gap-3 bg-red-50 border border-red-200 text-red-700"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Signup Method Selection */}
            {!approvalSent ? (
              <>
                {/* Signup Method Tabs */}
                <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSignupMethod('google')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      signupMethod === 'google'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupMethod('manual')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      signupMethod === 'manual'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Manual
                  </button>
                </div>

                {signupMethod === 'google' ? (
                  <div className="space-y-5">
                    <motion.button
                      type="button"
                      onClick={handleGoogleSignup}
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3.5 rounded-lg font-semibold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      <GoogleIcon className="w-5 h-5" />
                      Sign up with Google
                    </motion.button>

                    <div className="text-center pt-4">
                      <p className="text-gray-600 text-sm">
                        Already Have an account?{' '}
                        <Link
                          href="/login"
                          className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onSubmit={handleManualSignup}
                    className="space-y-5"
                  >
                    {/* Username Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="Choose a username"
                          disabled={loading}
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
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Create a password"
                          disabled={loading}
                          className="pl-10 w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Confirm your password"
                          disabled={loading}
                          className="pl-10 w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.terms}
                        onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                        disabled={loading}
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                          terms of service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                          privacy policy
                        </a>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-lg font-semibold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending approval...
                        </span>
                      ) : (
                        'Sign Up'
                      )}
                    </motion.button>

                    {/* Login Link */}
                    <div className="text-center pt-4">
                      <p className="text-gray-600 text-sm">
                        Already Have an account?{' '}
                        <Link
                          href="/login"
                          className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </motion.form>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Approval Code Sent!</h3>
                  </div>
                  <p className="text-sm text-green-800 mb-4">
                    An approval code has been sent to your email. Please check your inbox and enter the code below to complete your registration.
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-green-300">
                    <p className="text-xs text-gray-600 mb-2">Your approval code:</p>
                    <p className="text-2xl font-bold text-primary-600 font-mono">
                      {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('pendingApproval') || '{}').approvalCode}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">(In production, this would be sent via email/SMS)</p>
                  </div>
                </div>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                  >
                    Go to Login
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
