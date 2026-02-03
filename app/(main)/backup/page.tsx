'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HardDrive, Download, Clock } from 'lucide-react';

export default function BackupPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
        <p className="text-gray-500 mt-1">Manage system backups and restore points</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Backups', count: 45, icon: HardDrive, color: 'bg-blue-500' },
          { title: 'Last Backup', value: '2h ago', icon: Clock, color: 'bg-green-500' },
          { title: 'Storage Used', value: '245 GB', icon: Download, color: 'bg-purple-500' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glossy-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value || stat.count}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

