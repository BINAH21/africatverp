'use client';

import { LogoWithText } from '@/components/LogoWithText';
import { motion } from 'framer-motion';
import { AlertCircle, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <LogoWithText variant="light" size="lg" textSize="lg" showText={true} />
        </div>

        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6 flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          Oops! Something went wrong
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8"
        >
          We're sorry, but something unexpected happened. Please try again later.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-center"
        >
          <motion.button
            onClick={() => router.push('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

