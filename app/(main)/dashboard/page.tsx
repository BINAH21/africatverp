'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, ChevronRight, Radio, FileText, Video, Camera, Edit, Package, DollarSign, Users, Settings, BarChart3, Clock, Shield, HardDrive, Server, UserCheck, Video as VideoIcon, TrendingUp, TrendingDown, LineChart as LineChartIcon } from 'lucide-react';
import Link from 'next/link';

type TimeInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';
type SocialMediaMetric = 'videos' | 'followers' | 'views';
type ProductionMetric = 'hours' | 'programs';
type ChartType = 'line' | 'bar';
type SocialMediaType = 'facebook' | 'youtube' | 'tiktok' | 'telegram';
type ProductionType = 'recorded' | 'live' | 'archive';

// Seeded random function for consistent data generation
const seededRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

// Mock data generators based on time interval and date
const generateSocialMediaData = (interval: TimeInterval, metric: SocialMediaMetric, selectedDate: Date, type: SocialMediaType) => {
  const data: any[] = [];
  const seed = selectedDate.getTime() + metric.charCodeAt(0) + type.charCodeAt(0);
  const random = seededRandom(seed);
  
  // Different base values for different platforms
  const platformMultipliers = {
    facebook: { videos: 1.2, followers: 1.5, views: 1.3 },
    youtube: { videos: 1.0, followers: 1.0, views: 1.0 },
    tiktok: { videos: 1.5, followers: 0.8, views: 1.8 },
    telegram: { videos: 0.7, followers: 0.6, views: 0.5 },
  };
  
  const multiplier = platformMultipliers[type][metric];
  
  if (interval === 'daily') {
    for (let i = 0; i < 24; i++) {
      const hour = String(i).padStart(2, '0') + ':00';
      data.push({
        time: hour,
        videos: metric === 'videos' ? Math.floor((random() * 20 + 5) * multiplier) : 0,
        followers: metric === 'followers' ? Math.floor((random() * 500 + 1000) * multiplier) : 0,
        views: metric === 'views' ? Math.floor((random() * 5000 + 10000) * multiplier) : 0,
      });
    }
  } else if (interval === 'weekly') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach((day, idx) => {
      data.push({
        time: day,
        videos: metric === 'videos' ? Math.floor((random() * 50 + 20) * multiplier) : 0,
        followers: metric === 'followers' ? Math.floor((random() * 2000 + 5000) * multiplier) : 0,
        views: metric === 'views' ? Math.floor((random() * 20000 + 50000) * multiplier) : 0,
      });
    });
  } else if (interval === 'monthly') {
    for (let i = 1; i <= 12; i++) {
      data.push({
        time: `Month ${i}`,
        videos: metric === 'videos' ? Math.floor((random() * 200 + 100) * multiplier) : 0,
        followers: metric === 'followers' ? Math.floor((random() * 10000 + 20000) * multiplier) : 0,
        views: metric === 'views' ? Math.floor((random() * 100000 + 200000) * multiplier) : 0,
      });
    }
  } else if (interval === 'yearly') {
    const startYear = selectedDate.getFullYear() - 3;
    for (let i = startYear; i <= selectedDate.getFullYear(); i++) {
      data.push({
        time: String(i),
        videos: metric === 'videos' ? Math.floor((random() * 2000 + 1000) * multiplier) : 0,
        followers: metric === 'followers' ? Math.floor((random() * 50000 + 100000) * multiplier) : 0,
        views: metric === 'views' ? Math.floor((random() * 1000000 + 2000000) * multiplier) : 0,
      });
    }
  }
  
  return data;
};

const generateProductionData = (interval: TimeInterval, metric: ProductionMetric, selectedDate: Date, type: ProductionType) => {
  const data: any[] = [];
  const seed = selectedDate.getTime() + metric.charCodeAt(0) + type.charCodeAt(0);
  const random = seededRandom(seed);
  
  // Different base values for different production types
  const typeMultipliers = {
    recorded: { hours: 1.2, programs: 1.0 },
    live: { hours: 0.8, programs: 1.5 },
    archive: { hours: 1.0, programs: 0.7 },
  };
  
  const multiplier = typeMultipliers[type][metric];
  
  if (interval === 'daily') {
    for (let i = 0; i < 24; i++) {
      const hour = String(i).padStart(2, '0') + ':00';
      data.push({
        time: hour,
        hours: metric === 'hours' ? Math.floor((random() * 8 + 2) * multiplier) : 0,
        programs: metric === 'programs' ? Math.floor((random() * 5 + 1) * multiplier) : 0,
      });
    }
  } else if (interval === 'weekly') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach((day) => {
      data.push({
        time: day,
        hours: metric === 'hours' ? Math.floor((random() * 40 + 20) * multiplier) : 0,
        programs: metric === 'programs' ? Math.floor((random() * 10 + 5) * multiplier) : 0,
      });
    });
  } else if (interval === 'monthly') {
    for (let i = 1; i <= 12; i++) {
      data.push({
        time: `Month ${i}`,
        hours: metric === 'hours' ? Math.floor((random() * 200 + 100) * multiplier) : 0,
        programs: metric === 'programs' ? Math.floor((random() * 50 + 20) * multiplier) : 0,
      });
    }
  } else if (interval === 'yearly') {
    const startYear = selectedDate.getFullYear() - 3;
    for (let i = startYear; i <= selectedDate.getFullYear(); i++) {
      data.push({
        time: String(i),
        hours: metric === 'hours' ? Math.floor((random() * 2000 + 1000) * multiplier) : 0,
        programs: metric === 'programs' ? Math.floor((random() * 500 + 200) * multiplier) : 0,
      });
    }
  }
  
  return data;
};

export default function DashboardPage() {
  const [socialMediaInterval, setSocialMediaInterval] = useState<TimeInterval>('daily');
  const [socialMediaMetric, setSocialMediaMetric] = useState<SocialMediaMetric>('videos');
  const [socialMediaDate, setSocialMediaDate] = useState<Date>(new Date());
  const [socialMediaChartType, setSocialMediaChartType] = useState<ChartType>('line');
  const [socialMediaType, setSocialMediaType] = useState<SocialMediaType>('facebook');
  const [showSocialMediaCalendar, setShowSocialMediaCalendar] = useState(false);

  const [productionInterval, setProductionInterval] = useState<TimeInterval>('daily');
  const [productionMetric, setProductionMetric] = useState<ProductionMetric>('hours');
  const [productionDate, setProductionDate] = useState<Date>(new Date());
  const [productionChartType, setProductionChartType] = useState<ChartType>('bar');
  const [productionType, setProductionType] = useState<ProductionType>('recorded');
  const [showProductionCalendar, setShowProductionCalendar] = useState(false);

  // Memoize data generation to prevent unnecessary recalculations
  const socialMediaData = useMemo(
    () => generateSocialMediaData(socialMediaInterval, socialMediaMetric, socialMediaDate, socialMediaType),
    [socialMediaInterval, socialMediaMetric, socialMediaDate, socialMediaType]
  );

  const productionData = useMemo(
    () => generateProductionData(productionInterval, productionMetric, productionDate, productionType),
    [productionInterval, productionMetric, productionDate, productionType]
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleDateChange = (date: Date, type: 'social' | 'production') => {
    if (type === 'social') {
      setSocialMediaDate(date);
      setShowSocialMediaCalendar(false);
    } else {
      setProductionDate(date);
      setShowProductionCalendar(false);
    }
  };

  // Generate calendar days for popup
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      days.push(currentDate);
    }
    return days;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Media Graph - Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glossy-card rounded-2xl p-6 relative"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Social Media Analytics</h2>
            <div className="relative">
              <button
                onClick={() => setShowSocialMediaCalendar(!showSocialMediaCalendar)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {formatDate(socialMediaDate)}
              </button>
              
              {/* Calendar Popup */}
              <AnimatePresence>
                {showSocialMediaCalendar && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowSocialMediaCalendar(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Select Date</h3>
                        <button
                          onClick={() => handleDateChange(new Date(), 'social')}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Today
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {generateCalendarDays(socialMediaDate).map((day, idx) => {
                          const isCurrentMonth = day.getMonth() === socialMediaDate.getMonth();
                          const isSelected = day.toDateString() === socialMediaDate.toDateString();
                          const isToday = day.toDateString() === new Date().toDateString();
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => handleDateChange(day, 'social')}
                              className={`aspect-square text-xs font-medium rounded transition-colors ${
                                !isCurrentMonth
                                  ? 'text-gray-300'
                                  : isSelected
                                  ? 'bg-primary-600 text-white'
                                  : isToday
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <input
                          type="date"
                          value={socialMediaDate.toISOString().split('T')[0]}
                          onChange={(e) => handleDateChange(new Date(e.target.value), 'social')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Metric Selector */}
          <div className="flex gap-2 mb-4">
            {[
              { value: 'videos' as SocialMediaMetric, label: 'Videos Uploaded' },
              { value: 'followers' as SocialMediaMetric, label: 'Followers' },
              { value: 'views' as SocialMediaMetric, label: 'Views' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSocialMediaMetric(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  socialMediaMetric === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Time Interval Selector */}
          <div className="flex gap-2 mb-6">
            {(['daily', 'weekly', 'monthly', 'yearly'] as TimeInterval[]).map((interval) => (
              <button
                key={interval}
                onClick={() => setSocialMediaInterval(interval)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  socialMediaInterval === interval
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interval}
              </button>
            ))}
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={400}>
            {socialMediaChartType === 'line' ? (
              <LineChart data={socialMediaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={socialMediaMetric}
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={socialMediaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={socialMediaMetric} fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>

          {/* Type Selector - Bottom Center */}
          <div className="flex justify-center gap-2 mt-4">
            {[
              { value: 'facebook' as SocialMediaType, label: 'Facebook' },
              { value: 'youtube' as SocialMediaType, label: 'YouTube' },
              { value: 'tiktok' as SocialMediaType, label: 'TikTok' },
              { value: 'telegram' as SocialMediaType, label: 'Telegram' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSocialMediaType(option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  socialMediaType === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector - Bottom Right */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => setSocialMediaChartType('line')}
              className={`p-2 rounded-lg transition-colors ${
                socialMediaChartType === 'line'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Line Chart"
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSocialMediaChartType('bar')}
              className={`p-2 rounded-lg transition-colors ${
                socialMediaChartType === 'bar'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Production Graph - Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glossy-card rounded-2xl p-6 relative"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Production Analytics</h2>
            <div className="relative">
              <button
                onClick={() => setShowProductionCalendar(!showProductionCalendar)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {formatDate(productionDate)}
              </button>
              
              {/* Calendar Popup */}
              <AnimatePresence>
                {showProductionCalendar && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProductionCalendar(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Select Date</h3>
                        <button
                          onClick={() => handleDateChange(new Date(), 'production')}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Today
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {generateCalendarDays(productionDate).map((day, idx) => {
                          const isCurrentMonth = day.getMonth() === productionDate.getMonth();
                          const isSelected = day.toDateString() === productionDate.toDateString();
                          const isToday = day.toDateString() === new Date().toDateString();
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => handleDateChange(day, 'production')}
                              className={`aspect-square text-xs font-medium rounded transition-colors ${
                                !isCurrentMonth
                                  ? 'text-gray-300'
                                  : isSelected
                                  ? 'bg-primary-600 text-white'
                                  : isToday
                                  ? 'bg-primary-100 text-primary-700'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <input
                          type="date"
                          value={productionDate.toISOString().split('T')[0]}
                          onChange={(e) => handleDateChange(new Date(e.target.value), 'production')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Metric Selector */}
          <div className="flex gap-2 mb-4">
            {[
              { value: 'hours' as ProductionMetric, label: 'Hours' },
              { value: 'programs' as ProductionMetric, label: 'Programs' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setProductionMetric(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  productionMetric === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Time Interval Selector */}
          <div className="flex gap-2 mb-6">
            {(['daily', 'weekly', 'monthly', 'yearly'] as TimeInterval[]).map((interval) => (
              <button
                key={interval}
                onClick={() => setProductionInterval(interval)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  productionInterval === interval
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interval}
              </button>
            ))}
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={400}>
            {productionChartType === 'line' ? (
              <LineChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={productionMetric}
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            ) : (
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={productionMetric} fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>

          {/* Type Selector - Bottom Center */}
          <div className="flex justify-center gap-2 mt-4">
            {[
              { value: 'recorded' as ProductionType, label: 'Recorded' },
              { value: 'live' as ProductionType, label: 'Live' },
              { value: 'archive' as ProductionType, label: 'Archive' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setProductionType(option.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                  productionType === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector - Bottom Right */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => setProductionChartType('line')}
              className={`p-2 rounded-lg transition-colors ${
                productionChartType === 'line'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Line Chart"
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setProductionChartType('bar')}
              className={`p-2 rounded-lg transition-colors ${
                productionChartType === 'bar'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Today's Schedule & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glossy-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Today&apos;s Schedule</h2>
            <Link href="/scheduling" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { time: '08:00', program: 'Morning News', status: 'Live', type: 'broadcast', viewers: '2.1K' },
              { time: '10:00', program: 'Editorial Meeting', status: 'Upcoming', type: 'meeting', attendees: '12' },
              { time: '12:00', program: 'Lunch Break', status: 'Upcoming', type: 'break' },
              { time: '14:00', program: 'Afternoon News', status: 'Upcoming', type: 'broadcast' },
              { time: '16:00', program: 'Sports Coverage', status: 'Upcoming', type: 'broadcast' },
              { time: '18:00', program: 'Evening News', status: 'Upcoming', type: 'broadcast' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 text-center">
                    <p className="font-semibold text-primary-600">{item.time}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.program}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.type === 'broadcast' && item.viewers && `${item.viewers} viewers`}
                      {item.type === 'meeting' && item.attendees && `${item.attendees} attendees`}
                      {item.type === 'break' && 'All staff'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'Live' && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Live'
                        ? 'bg-red-100 text-red-600'
                        : item.status === 'Upcoming'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glossy-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
            <Link href="/notifications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {[
              { module: 'Content', action: 'New video uploaded', user: 'John Doe', time: '2 min ago', icon: VideoIcon, color: 'bg-orange-100 text-orange-600', link: '/content' },
              { module: 'Broadcast', action: 'Live stream started', user: 'Sarah Smith', time: '15 min ago', icon: Radio, color: 'bg-green-100 text-green-600', link: '/broadcast' },
              { module: 'News', action: 'Article published', user: 'Mike Johnson', time: '1 hour ago', icon: FileText, color: 'bg-blue-100 text-blue-600', link: '/news' },
              { module: 'CCTV', action: 'Camera 3 recording', user: 'System', time: '2 hours ago', icon: Camera, color: 'bg-purple-100 text-purple-600', link: '/cctv' },
              { module: 'Attendance', action: '12 employees checked in', user: 'System', time: '3 hours ago', icon: UserCheck, color: 'bg-indigo-100 text-indigo-600', link: '/attendance' },
              { module: 'Finance', action: 'Payment received', user: 'Finance Team', time: '4 hours ago', icon: DollarSign, color: 'bg-yellow-100 text-yellow-600', link: '/finance' },
              { module: 'Editing', action: 'Video edit completed', user: 'Editor Team', time: '5 hours ago', icon: Edit, color: 'bg-pink-100 text-pink-600', link: '/editing' },
              { module: 'Inventory', action: 'Equipment added', user: 'Tech Team', time: '6 hours ago', icon: Package, color: 'bg-teal-100 text-teal-600', link: '/inventory' },
            ].map((activity, index) => {
              const ActivityIcon = activity.icon;
              return (
                <Link key={index} href={activity.link}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className={`${activity.color} p-2 rounded-lg`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.module}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{activity.user}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glossy-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Content', icon: FileText, color: 'bg-orange-500', link: '/content' },
              { label: 'Schedule', icon: Calendar, color: 'bg-blue-500', link: '/scheduling' },
              { label: 'Broadcast', icon: Radio, color: 'bg-green-500', link: '/broadcast' },
              { label: 'News Article', icon: FileText, color: 'bg-purple-500', link: '/news' },
              { label: 'Add Employee', icon: Users, color: 'bg-indigo-500', link: '/personnel' },
              { label: 'View Reports', icon: BarChart3, color: 'bg-yellow-500', link: '/reports' },
            ].map((action, index) => {
              const ActionIcon = action.icon;
              return (
                <Link key={index} href={action.link}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${action.color} p-4 rounded-xl text-white hover:shadow-lg transition-all flex flex-col items-center gap-2`}
                  >
                    <ActionIcon className="w-5 h-5" />
                    <span className="text-xs font-medium text-center">{action.label}</span>
                  </motion.button>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glossy-card rounded-2xl p-6 lg:col-span-2"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Broadcast System', status: 'Operational', health: 98, icon: Radio, color: 'green' },
              { label: 'CCTV System', status: 'Operational', health: 95, icon: Video, color: 'green' },
              { label: 'Network', status: 'Operational', health: 99, icon: Server, color: 'green' },
              { label: 'Storage', status: 'Warning', health: 78, icon: HardDrive, color: 'yellow' },
              { label: 'Backup System', status: 'Operational', health: 100, icon: HardDrive, color: 'green' },
              { label: 'Security', status: 'Operational', health: 100, icon: Shield, color: 'green' },
              { label: 'Attendance', status: 'Operational', health: 92, icon: Clock, color: 'green' },
              { label: 'IT Services', status: 'Operational', health: 97, icon: Server, color: 'green' },
            ].map((system, index) => {
              const SystemIcon = system.icon;
              const statusColor = system.color === 'green' ? 'text-green-600' : system.color === 'yellow' ? 'text-yellow-600' : 'text-red-600';
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <SystemIcon className={`w-4 h-4 ${statusColor}`} />
                    <span className="text-xs font-medium text-gray-700">{system.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${statusColor}`}>{system.status}</span>
                    <span className="text-xs text-gray-500">{system.health}%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${system.health}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                      className={`h-1.5 rounded-full ${
                        system.color === 'green' ? 'bg-green-500' : system.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
