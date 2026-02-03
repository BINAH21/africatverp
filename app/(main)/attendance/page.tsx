'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Clock,
  Fingerprint,
  User,
  Calendar,
  TrendingUp,
  Download,
} from 'lucide-react';
import { formatTime, formatDate } from '@/lib/utils';

interface AttendanceRecord {
  id: number;
  employee: string;
  employeeId: string;
  checkIn: string;
  checkOut: string | null;
  morning: string | null;
  afternoon: string | null;
  evening: string | null;
  totalHours: number;
  overtime: number;
  status: 'present' | 'absent' | 'late';
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: 1,
    employee: 'John Doe',
    employeeId: 'EMP001',
    checkIn: '08:00',
    checkOut: '17:30',
    morning: '08:00',
    afternoon: '13:00',
    evening: '17:30',
    totalHours: 9.5,
    overtime: 1.5,
    status: 'present',
  },
  {
    id: 2,
    employee: 'Jane Smith',
    employeeId: 'EMP002',
    checkIn: '08:15',
    checkOut: '17:45',
    morning: '08:15',
    afternoon: '13:00',
    evening: '17:45',
    totalHours: 9.5,
    overtime: 1.75,
    status: 'late',
  },
  {
    id: 3,
    employee: 'Mike Johnson',
    employeeId: 'EMP003',
    checkIn: '07:45',
    checkOut: null,
    morning: '07:45',
    afternoon: null,
    evening: null,
    totalHours: 0,
    overtime: 0,
    status: 'present',
  },
];

export default function AttendancePage() {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const calculateOvertime = (checkIn: string, checkOut: string | null): number => {
    if (!checkOut) return 0;
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    const hours = totalMinutes / 60;
    // Overtime after 12:00 (noon) or after 8 hours
    const regularHours = 8;
    return hours > regularHours ? hours - regularHours : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('attendance.title')}</h1>
          <p className="text-gray-500 mt-1">Fingerprint-based attendance tracking</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Fingerprint className="w-5 h-5" />
            {t('attendance.register')}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download className="w-5 h-5" />
            {t('attendance.monthlyReport')}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Present Today', value: '142', icon: User, color: 'bg-green-500' },
          { label: 'Absent', value: '14', icon: User, color: 'bg-red-500' },
          { label: 'Late Arrivals', value: '8', icon: Clock, color: 'bg-yellow-500' },
          { label: 'Overtime Hours', value: '45.5h', icon: TrendingUp, color: 'bg-blue-500' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
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
              <h3 className="text-gray-500 text-sm mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Today's Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glossy-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t('attendance.todayAttendance')}</h2>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600">{formatDate(selectedDate)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold text-gray-700">{t('attendance.employee')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">ID</th>
                <th className="text-left p-3 font-semibold text-gray-700">{t('attendance.morning')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">{t('attendance.afternoon')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">{t('attendance.evening')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">{t('attendance.totalHours')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">{t('attendance.overtime')}</th>
                <th className="text-left p-3 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockAttendance.map((record, index) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="font-medium">{record.employee}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{record.employeeId}</td>
                  <td className="p-3">
                    {record.morning ? (
                      <span className="text-green-600 font-semibold">{record.morning}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {record.afternoon ? (
                      <span className="text-blue-600 font-semibold">{record.afternoon}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {record.evening ? (
                      <span className="text-purple-600 font-semibold">{record.evening}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 font-semibold">{record.totalHours}h</td>
                  <td className="p-3">
                    {record.overtime > 0 ? (
                      <span className="text-orange-600 font-semibold">+{record.overtime}h</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        record.status === 'present'
                          ? 'bg-green-100 text-green-700'
                          : record.status === 'late'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Fingerprint Registration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('attendance.fingerprint')}</h2>
            <p className="text-primary-100">
              Register employee fingerprints for automated attendance tracking
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <Fingerprint className="w-10 h-10" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

