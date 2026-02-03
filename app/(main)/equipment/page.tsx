'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wrench, Package, AlertCircle } from 'lucide-react';

export default function EquipmentPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Equipment Management</h1>
        <p className="text-gray-500 mt-1">Track and manage broadcast equipment</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Equipment', count: 456, icon: Package, color: 'bg-blue-500' },
          { title: 'In Use', count: 234, icon: Wrench, color: 'bg-green-500' },
          { title: 'Maintenance', count: 12, icon: AlertCircle, color: 'bg-yellow-500' },
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
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

