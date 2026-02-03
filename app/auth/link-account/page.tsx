'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Mail, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/lib/store';
import { register } from '@/lib/auth';

export default function LinkAccountPage() {
  const router = useRouter();
  const { setUser, checkAuth } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthData, setOauthData] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'User',
  });

  useEffect(() => {
    // Get OAuth session data from cookie (will be set by server)
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setOauthData(data);
          setFormData({
            email: data.user.email || '',
            name: data.user.name || data.user.username || '',
            role: 'User',
          });
          setLoading(false);
        } else {
          router.push('/login?error=no_oauth_session');
        }
      })
      .catch(() => {
        router.push('/login?error=session_error');
      });
  }, [router]);

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLinking(true);

    try {
      // Create or link account
      const result = await register(
        formData.name || oauthData.user.name,
        formData.email || oauthData.user.email,
        '', // No password for OAuth accounts
        formData.role,
        undefined,
        undefined
      );

      if (result.success && result.user) {
        // Update user with OAuth provider info
        const linkedUser = {
          ...result.user,
          provider: oauthData.provider,
          oauthId: oauthData.user.id,
          picture: oauthData.user.picture,
        };

        setUser(linkedUser);
        checkAuth();

        // Clear OAuth session
        await fetch('/api/auth/session', { method: 'DELETE' });

        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to link account');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Promotional Panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
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

          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                Link Your
                <br />
                <span className="text-orange-200">{oauthData?.provider?.charAt(0).toUpperCase() + oauthData?.provider?.slice(1)} Account</span>
              </h2>
              <p className="text-xl text-white/90">
                Connect your {oauthData?.provider} account to Africa TV
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Section - Link Account Form */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                {oauthData?.user?.picture && (
                  <img
                    src={oauthData.user.picture}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-primary-200"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Link Account</h1>
                  <p className="text-gray-600 text-sm">
                    Connected via {oauthData?.provider?.charAt(0).toUpperCase() + oauthData?.provider?.slice(1)}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 rounded-lg flex items-center gap-3 bg-red-50 border border-red-200 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleLinkAccount} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                      className="pl-10 w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                      className="pl-10 w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={linking}
                  whileHover={!linking ? { scale: 1.02 } : {}}
                  whileTap={!linking ? { scale: 0.98 } : {}}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3.5 rounded-lg font-semibold text-lg shadow-lg transition-all disabled:opacity-50"
                >
                  {linking ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Linking account...
                    </span>
                  ) : (
                    'Link Account'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

