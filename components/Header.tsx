'use client';

import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoWithText } from './LogoWithText';
import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/Input';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-black/5"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo - Light background, use brand color logo */}
        <div className="flex-shrink-0 mr-6">
          <LogoWithText
            variant="light"
            size="md"
            textSize="md"
            showText={true}
            href="/dashboard"
          />
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t('common.search')}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </motion.button>

          <div className="relative" ref={menuRef}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </motion.div>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl glossy-card shadow-2xl border border-gray-200/50 overflow-hidden z-50"
                >
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-gray-200/50">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email || 'africatv1@africatv.net'}</p>
                      <p className="text-xs text-primary-600 mt-1 font-medium">{user?.role || 'Administrator'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

