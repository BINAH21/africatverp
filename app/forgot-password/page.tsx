'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowLeft, Globe, ChevronDown, User } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { requestPasswordReset, checkRateLimit } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Check rate limit
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      setRateLimitMessage(rateLimit.message || 'Too many requests. Please try again later.');
      return;
    }

    setLoading(true);
    
    try {
      const result = await requestPasswordReset(email);
      
      if (result.success) {
        setSuccess(true);
        setRateLimitMessage(null);
      } else {
        setError(result.message || 'Failed to send reset email');
      }
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
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Reset Your
                <br />
                <span className="text-orange-200">Password</span>
              </h2>
              <p className="text-xl text-white/90 mb-8">
                No worries! We&apos;ll help you get back into your account.
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
          </motion.div>
        </div>
      </div>

      {/* Right Section - Forgot Password Form */}
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

            {/* Back Button */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to login</span>
            </Link>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600 mb-8">
                No worries! Enter your email and we&apos;ll send you reset instructions.
              </p>
            </motion.div>

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

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 rounded-lg flex items-center gap-3 bg-green-50 border border-green-200 text-green-700"
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Email sent successfully!</p>
                    <p className="text-xs mt-1">
                      We&apos;ve sent password reset instructions to <strong>{email}</strong>. Please check your inbox.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            {!success ? (
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
                      disabled={loading}
                      className="pl-10 w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500 disabled:opacity-50"
                    />
                  </div>
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
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <p className="text-gray-600 mb-6">
                    If an account exists with this email, you&apos;ll receive password reset instructions shortly.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                  >
                    Back to login
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
