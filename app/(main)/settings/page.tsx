'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">{t('common.settings')}</h1>
        <p className="text-gray-500 mt-1">Configure system settings and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Profile Settings', icon: User, color: 'bg-blue-500' },
          { title: 'Notifications', icon: Bell, color: 'bg-yellow-500' },
          { title: 'Security', icon: Shield, color: 'bg-red-500' },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glossy-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className={`${item.color} p-3 rounded-lg w-fit mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

