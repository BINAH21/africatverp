'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const analyticsData = [
  { name: 'Mon', viewers: 4000 },
  { name: 'Tue', viewers: 3000 },
  { name: 'Wed', viewers: 5000 },
  { name: 'Thu', viewers: 4500 },
  { name: 'Fri', viewers: 6000 },
  { name: 'Sat', viewers: 5500 },
  { name: 'Sun', viewers: 4800 },
];

export default function AnalyticsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Detailed analytics and insights</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Views', value: '2.4M', icon: Eye, color: 'bg-blue-500' },
          { title: 'Growth Rate', value: '+25%', icon: TrendingUp, color: 'bg-green-500' },
          { title: 'Engagement', value: '68%', icon: BarChart3, color: 'bg-purple-500' },
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
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glossy-card rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Viewer Analytics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="viewers" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

