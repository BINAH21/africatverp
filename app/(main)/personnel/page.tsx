'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, UserPlus, Briefcase } from 'lucide-react';

export default function PersonnelPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Personnel & HR</h1>
        <p className="text-gray-500 mt-1">Manage employees and human resources</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Employees', count: 156, icon: Users, color: 'bg-blue-500' },
          { title: 'New Hires', count: 12, icon: UserPlus, color: 'bg-green-500' },
          { title: 'Departments', count: 8, icon: Briefcase, color: 'bg-purple-500' },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glossy-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${item.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{item.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

