'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import {
  Users, Tv, DollarSign, Calendar, TrendingUp, Eye, Radio, FileText, Video, Camera,
  Edit, Palette, Archive, BookOpen, Zap, Monitor, Mic,
  Wrench, HardDrive, Server, Building2, Clock, Shield, Package, Mail, Bell, Settings,
  AlertCircle, CheckCircle, X, ChevronRight, Play, Pause, Circle, ArrowRight, Activity,
  BarChart3, LineChart as LineChartIcon, Calendar as CalendarIcon, Clock as ClockIcon,
  TrendingDown, UserCheck, FileCheck, Video as VideoIcon, Film, Headphones, Printer,
  Download, Upload, RefreshCw, Power, AlertTriangle, Info, Star, Award, Target
} from 'lucide-react';

// Create aliases for icons that don't exist directly
const BroadcastIcon = Radio;
const NewspaperIcon = FileText;
import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getCalendarEvents, getHolidays, getUpcomingAnnouncements, isHolidayOrClosed } from '@/lib/calendar';
import Link from 'next/link';

// Comprehensive stats from all modules
const getAllStats = () => ({
  // Main KPIs
  viewers: { value: '2.4M', change: '+12.5%', trend: 'up' },
  livePrograms: { value: '8', change: '+2', trend: 'up' },
  revenue: { value: '₦45.2M', change: '+8.3%', trend: 'up' },
  employees: { value: '156', change: '+5', trend: 'up' },
  
  // Content & Production
  contentItems: { value: '1,247', change: '+23', trend: 'up' },
  scheduledPrograms: { value: '342', change: '+12', trend: 'up' },
  editingTasks: { value: '18', change: '-3', trend: 'down' },
  graphicsProjects: { value: '45', change: '+8', trend: 'up' },
  archivedItems: { value: '8,923', change: '+156', trend: 'up' },
  libraryItems: { value: '12,456', change: '+234', trend: 'up' },
  
  // Broadcast & Transmission
  activeBroadcasts: { value: '3', change: '+1', trend: 'up' },
  liveStreams: { value: '5', change: '0', trend: 'neutral' },
  transmissionStatus: { value: 'Active', change: '100%', trend: 'up' },
  monitoringAlerts: { value: '2', change: '-5', trend: 'down' },
  
  // News & Journalism
  newsArticles: { value: '127', change: '+15', trend: 'up' },
  activeJournalists: { value: '24', change: '+2', trend: 'up' },
  assignments: { value: '38', change: '+6', trend: 'up' },
  reports: { value: '89', change: '+12', trend: 'up' },
  
  // Technical & Engineering
  cctvCameras: { value: '12', change: '0', trend: 'neutral' },
  activeCameras: { value: '10', change: '+1', trend: 'up' },
  equipmentItems: { value: '456', change: '+12', trend: 'up' },
  maintenanceTasks: { value: '7', change: '-2', trend: 'down' },
  itServices: { value: 'All Systems', change: 'Operational', trend: 'up' },
  
  // Personnel & Administration
  departments: { value: '9', change: '0', trend: 'neutral' },
  userAccounts: { value: '178', change: '+8', trend: 'up' },
  attendanceToday: { value: '142', change: '89%', trend: 'up' },
  roles: { value: '12', change: '0', trend: 'neutral' },
  
  // Business & Finance
  totalRevenue: { value: '₦45.2M', change: '+8.3%', trend: 'up' },
  advertisingContracts: { value: '67', change: '+5', trend: 'up' },
  activeContracts: { value: '34', change: '+3', trend: 'up' },
  pendingBills: { value: '12', change: '-4', trend: 'down' },
  
  // Operations
  inventoryItems: { value: '2,345', change: '+45', trend: 'up' },
  newContacts: { value: '23', change: '+8', trend: 'up' },
  notifications: { value: '15', change: '+3', trend: 'up' },
  analyticsReports: { value: '28', change: '+5', trend: 'up' },
  
  // System
  systemHealth: { value: '98%', change: '+2%', trend: 'up' },
  securityAlerts: { value: '0', change: '0', trend: 'neutral' },
  backupStatus: { value: 'Latest', change: '2h ago', trend: 'up' },
});

const chartData = [
  { time: '00:00', viewers: 1200, revenue: 45000 },
  { time: '03:00', viewers: 800, revenue: 32000 },
  { time: '06:00', viewers: 1500, revenue: 58000 },
  { time: '09:00', viewers: 2200, revenue: 89000 },
  { time: '12:00', viewers: 3200, revenue: 125000 },
  { time: '15:00', viewers: 2800, revenue: 110000 },
  { time: '18:00', viewers: 4500, revenue: 180000 },
  { time: '21:00', viewers: 3800, revenue: 150000 },
  { time: '24:00', viewers: 2000, revenue: 78000 },
];

const performanceData = [
  { name: 'Mon', viewers: 400, programs: 12, revenue: 45000 },
  { name: 'Tue', viewers: 8250, programs: 18, revenue: 320000 },
  { name: 'Wed', viewers: 200, programs: 8, revenue: 18000 },
  { name: 'Thu', viewers: 3200, programs: 15, revenue: 125000 },
  { name: 'Fri', viewers: 3500, programs: 16, revenue: 140000 },
  { name: 'Sat', viewers: 4200, programs: 20, revenue: 168000 },
  { name: 'Sun', viewers: 3800, programs: 18, revenue: 152000 },
];

const departmentData = [
  { name: 'Content', value: 28, color: '#f97316' },
  { name: 'Broadcast', value: 22, color: '#3b82f6' },
  { name: 'News', value: 18, color: '#10b981' },
  { name: 'Technical', value: 15, color: '#8b5cf6' },
  { name: 'Finance', value: 12, color: '#f59e0b' },
  { name: 'Operations', value: 5, color: '#ef4444' },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | null>(null);
  const stats = getAllStats();
  
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Get holiday for a specific date
  const getHolidayForDate = (date: Date) => {
    return holidays.find(h => {
      const holidayDate = new Date(h.date);
      holidayDate.setFullYear(date.getFullYear());
      return holidayDate.toDateString() === date.toDateString();
    });
  };

  useEffect(() => {
    // Update time every second for live clock
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Load calendar data
    const loadCalendarData = async () => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        
        const [events, upcomingHolidays, announcementsData] = await Promise.all([
          getCalendarEvents(startDate, endDate),
          getHolidays(new Date().getFullYear()),
          getUpcomingAnnouncements(14),
        ]);
        
        setCalendarEvents(events || []);
        setHolidays(upcomingHolidays || []);
        setAnnouncements(announcementsData || []);
        
        // Check if today is a holiday
        const todayHoliday = await isHolidayOrClosed(new Date());
        setIsHoliday(!!todayHoliday);
      } catch (error) {
        console.error('Error loading calendar data:', error);
        // Set defaults on error
        setCalendarEvents([]);
        setHolidays([]);
        setAnnouncements([]);
        setIsHoliday(false);
      }
    };
    
    loadCalendarData();
    
    return () => clearInterval(timeInterval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Holiday/Closed Day Announcement */}
      <AnimatePresence>
        {isHoliday && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">Station Closed Today</h2>
                <p className="text-white/90">
                  Today is a holiday. Regular operations are suspended. Emergency contacts are available.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Holidays Announcements */}
      <AnimatePresence>
        {announcements.length > 0 && !isHoliday && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-start gap-4">
              <CalendarIcon className="w-6 h-6 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-3">Upcoming Holidays & Events</h3>
                <div className="space-y-2">
                  {announcements.slice(0, 3).map((announcement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm"
                    >
                      <div>
                        <p className="font-semibold">{announcement.name}</p>
                        <p className="text-sm text-white/80">
                          {announcement.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        {announcement.daysUntil === 0 ? 'Today' : `${announcement.daysUntil} day${announcement.daysUntil > 1 ? 's' : ''}`}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner with Live Time */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm p-2 flex items-center justify-center"
            >
              <Logo variant="dark" size="md" animated={false} />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to Africa TV ERP</h1>
              <p className="text-primary-100 mb-2">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
              <p className="text-primary-100 text-sm">
                Monitor and manage your television station operations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              className="text-right"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Circle className="w-3 h-3 fill-red-500 text-red-500 animate-pulse" />
                <span className="text-sm font-semibold">LIVE</span>
              </div>
              <p className="text-xs text-primary-100">8 Active Broadcasts</p>
            </motion.div>
            <motion.div
              className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Tv className="w-12 h-12" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Viewers', value: stats.viewers.value, change: stats.viewers.change, icon: Eye, color: 'bg-blue-500', link: '/analytics' },
          { label: 'Live Programs', value: stats.livePrograms.value, change: stats.livePrograms.change, icon: Radio, color: 'bg-green-500', link: '/broadcast' },
          { label: 'Total Revenue', value: stats.revenue.value, change: stats.revenue.change, icon: DollarSign, color: 'bg-yellow-500', link: '/finance' },
          { label: 'Active Employees', value: stats.employees.value, change: stats.employees.change, icon: Users, color: 'bg-purple-500', link: '/personnel' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.link}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glossy-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-500 text-sm font-semibold">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm mb-1">{stat.label}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Comprehensive Module Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Content & Production', icon: FileText, color: 'from-orange-500 to-red-500', stats: [
            { label: 'Content Items', value: stats.contentItems.value, change: stats.contentItems.change, link: '/content' },
            { label: 'Scheduled Programs', value: stats.scheduledPrograms.value, change: stats.scheduledPrograms.change, link: '/scheduling' },
            { label: 'Editing Tasks', value: stats.editingTasks.value, change: stats.editingTasks.change, link: '/editing' },
            { label: 'Graphics Projects', value: stats.graphicsProjects.value, change: stats.graphicsProjects.change, link: '/graphics' },
          ]},
          { title: 'Broadcast & Transmission', icon: BroadcastIcon, color: 'from-blue-500 to-cyan-500', stats: [
            { label: 'Active Broadcasts', value: stats.activeBroadcasts.value, change: stats.activeBroadcasts.change, link: '/broadcast' },
            { label: 'Live Streams', value: stats.liveStreams.value, change: stats.liveStreams.change, link: '/live-streaming' },
            { label: 'Transmission', value: stats.transmissionStatus.value, change: stats.transmissionStatus.change, link: '/transmission' },
            { label: 'Monitoring Alerts', value: stats.monitoringAlerts.value, change: stats.monitoringAlerts.change, link: '/monitoring' },
          ]},
          { title: 'News & Journalism', icon: NewspaperIcon, color: 'from-green-500 to-emerald-500', stats: [
            { label: 'News Articles', value: stats.newsArticles.value, change: stats.newsArticles.change, link: '/news' },
            { label: 'Journalists', value: stats.activeJournalists.value, change: stats.activeJournalists.change, link: '/journalists' },
            { label: 'Assignments', value: stats.assignments.value, change: stats.assignments.change, link: '/assignments' },
            { label: 'Reports', value: stats.reports.value, change: stats.reports.change, link: '/reports' },
          ]},
          { title: 'Technical & Engineering', icon: Wrench, color: 'from-purple-500 to-pink-500', stats: [
            { label: 'CCTV Cameras', value: stats.cctvCameras.value, change: stats.cctvCameras.change, link: '/cctv' },
            { label: 'Active Cameras', value: stats.activeCameras.value, change: stats.activeCameras.change, link: '/cameras' },
            { label: 'Equipment', value: stats.equipmentItems.value, change: stats.equipmentItems.change, link: '/equipment' },
            { label: 'Maintenance', value: stats.maintenanceTasks.value, change: stats.maintenanceTasks.change, link: '/maintenance' },
          ]},
          { title: 'Personnel & Admin', icon: Users, color: 'from-indigo-500 to-blue-500', stats: [
            { label: 'Departments', value: stats.departments.value, change: stats.departments.change, link: '/departments' },
            { label: 'User Accounts', value: stats.userAccounts.value, change: stats.userAccounts.change, link: '/user-management' },
            { label: 'Attendance Today', value: stats.attendanceToday.value, change: stats.attendanceToday.change, link: '/attendance' },
            { label: 'Roles', value: stats.roles.value, change: stats.roles.change, link: '/roles' },
          ]},
          { title: 'Business & Finance', icon: DollarSign, color: 'from-yellow-500 to-orange-500', stats: [
            { label: 'Total Revenue', value: stats.totalRevenue.value, change: stats.totalRevenue.change, link: '/finance' },
            { label: 'Ad Contracts', value: stats.advertisingContracts.value, change: stats.advertisingContracts.change, link: '/advertising' },
            { label: 'Active Contracts', value: stats.activeContracts.value, change: stats.activeContracts.change, link: '/contracts' },
            { label: 'Pending Bills', value: stats.pendingBills.value, change: stats.pendingBills.change, link: '/billing' },
          ]},
          { title: 'Operations', icon: Package, color: 'from-teal-500 to-cyan-500', stats: [
            { label: 'Inventory Items', value: stats.inventoryItems.value, change: stats.inventoryItems.change, link: '/inventory' },
            { label: 'New Contacts', value: stats.newContacts.value, change: stats.newContacts.change, link: '/contacts' },
            { label: 'Notifications', value: stats.notifications.value, change: stats.notifications.change, link: '/notifications' },
            { label: 'Analytics', value: stats.analyticsReports.value, change: stats.analyticsReports.change, link: '/analytics' },
          ]},
          { title: 'System', icon: Settings, color: 'from-gray-500 to-slate-500', stats: [
            { label: 'System Health', value: stats.systemHealth.value, change: stats.systemHealth.change, link: '/settings' },
            { label: 'Security Alerts', value: stats.securityAlerts.value, change: stats.securityAlerts.change, link: '/security' },
            { label: 'Backup Status', value: stats.backupStatus.value, change: stats.backupStatus.change, link: '/backup' },
            { label: 'IT Services', value: stats.itServices.value, change: stats.itServices.change, link: '/it-services' },
          ]},
        ].map((module, moduleIndex) => {
          const ModuleIcon = module.icon;
          return (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: moduleIndex * 0.05 }}
              className={`glossy-card rounded-2xl p-5 bg-gradient-to-br ${module.color} text-white relative overflow-hidden`}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ModuleIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm">{module.title}</h3>
                </div>
                <div className="space-y-2">
                  {module.stats.map((stat, statIndex) => (
                    <Link key={statIndex} href={stat.link}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-2 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        <span className="text-xs font-medium">{stat.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{stat.value}</span>
                          <span className="text-xs opacity-80">{stat.change}</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Calendar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Viewers Performance Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glossy-card rounded-2xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Viewers Performance (24h)</h2>
            <div className="flex items-center gap-2 text-green-500">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">+25.02%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="viewers"
                stroke="#f97316"
                fillOpacity={1}
                fill="url(#colorViewers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Google Calendar Widget with Visual Calendar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glossy-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-600" />
              Calendar
            </h2>
            <Link href="/scheduling" className="text-primary-600 hover:text-primary-700">
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          {/* Current Date & Time - Prominent Display */}
          <motion.div 
            className="mb-4 p-5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg text-white"
            animate={{ 
              boxShadow: [
                '0 10px 25px -5px rgba(249, 115, 22, 0.3)',
                '0 10px 30px -5px rgba(249, 115, 22, 0.4)',
                '0 10px 25px -5px rgba(249, 115, 22, 0.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white/90 uppercase tracking-wide flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Live Time
              </p>
              <CalendarIcon className="w-5 h-5 text-white/80" />
            </div>
            <p className="text-sm font-medium text-white/90 mb-2">{formatDate(currentTime)}</p>
            <motion.p 
              key={currentTime.getTime()}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-white drop-shadow-lg"
            >
              {formatTime(currentTime)}
            </motion.p>
          </motion.div>

          {/* Visual Calendar Grid */}
          <div className="mb-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {(() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - startDate.getDay());
                
                const days = [];
                for (let i = 0; i < 35; i++) {
                  const date = new Date(startDate);
                  date.setDate(startDate.getDate() + i);
                  const isCurrentMonth = date.getMonth() === today.getMonth();
                  const isToday = date.toDateString() === today.toDateString();
                  const hasEvent = calendarEvents.some(e => {
                    const eventDate = new Date(e.start);
                    return eventDate.toDateString() === date.toDateString();
                  });
                  const isHolidayDate = holidays.some(h => {
                    const holidayDate = new Date(h.date);
                    holidayDate.setFullYear(today.getFullYear());
                    return holidayDate.toDateString() === date.toDateString();
                  });
                  
                  // Count events on this date
                  const eventCount = calendarEvents.filter(e => {
                    const eventDate = new Date(e.start);
                    return eventDate.toDateString() === date.toDateString();
                  }).length;
                  
                  const dateEvents = getEventsForDate(date);
                  const dateHoliday = getHolidayForDate(date);
                  
                  days.push(
                    <div key={i} className="relative group">
                      <motion.div
                        whileHover={{ scale: 1.1, zIndex: 10 }}
                        onClick={() => {
                          if (hasEvent || isHolidayDate || isToday) {
                            setSelectedDateForModal(date);
                          }
                        }}
                        onMouseEnter={() => {
                          if (hasEvent || isHolidayDate) {
                            setHoveredDate(date);
                          }
                        }}
                        onMouseLeave={() => setHoveredDate(null)}
                        className={`
                          aspect-square flex flex-col items-center justify-center text-xs font-medium rounded-lg transition-all relative cursor-pointer
                          ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                          ${isToday ? 'bg-primary-500 text-white font-bold ring-2 ring-primary-300 shadow-lg' : ''}
                          ${hasEvent && !isToday ? 'bg-primary-100 text-primary-700 font-semibold border-2 border-primary-400 shadow-md' : ''}
                          ${isHolidayDate && !isToday && !hasEvent ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400' : ''}
                          ${!isToday && !hasEvent && !isHolidayDate && isCurrentMonth ? 'hover:bg-gray-100' : ''}
                        `}
                      >
                        <span>{date.getDate()}</span>
                        {hasEvent && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center gap-0.5">
                            {eventCount > 1 ? (
                              <>
                                <span className="w-1 h-1 bg-primary-500 rounded-full"></span>
                                <span className="w-1 h-1 bg-primary-500 rounded-full"></span>
                                {eventCount > 2 && <span className="w-1 h-1 bg-primary-500 rounded-full"></span>}
                              </>
                            ) : (
                              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                            )}
                          </div>
                        )}
                        {isHolidayDate && !hasEvent && (
                          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                        )}
                      </motion.div>
                      
                      {/* Hover Tooltip */}
                      {hoveredDate && hoveredDate.toDateString() === date.toDateString() && (hasEvent || isHolidayDate) && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 pointer-events-none"
                        >
                          <div className="text-xs font-semibold text-gray-700 mb-2">
                            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                          </div>
                          {dateHoliday && (
                            <div className="mb-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-xs font-medium text-yellow-800">{dateHoliday.name}</span>
                              </div>
                              {dateHoliday.type === 'closed' && (
                                <span className="text-xs text-yellow-600 mt-1 block">Station Closed</span>
                              )}
                            </div>
                          )}
                          {dateEvents.length > 0 && (
                            <div className="space-y-1.5">
                              {dateEvents.slice(0, 3).map((event) => (
                                <div key={event.id} className="p-2 bg-gray-50 rounded border-l-2 border-primary-500">
                                  <div className="flex items-start gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${event.type === 'broadcast' ? 'bg-primary-500' : event.type === 'meeting' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-gray-900">{event.title}</p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {dateEvents.length > 3 && (
                                <p className="text-xs text-gray-500 text-center pt-1">
                                  +{dateEvents.length - 3} more event{dateEvents.length - 3 > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          )}
                          {dateEvents.length === 0 && !dateHoliday && (
                            <p className="text-xs text-gray-400 text-center py-2">No events scheduled</p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                }
                return days;
              })()}
            </div>
            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary-500"></div>
                <span className="text-gray-600">Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary-100 border border-primary-400"></div>
                <span className="text-gray-600">Scheduled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-400"></div>
                <span className="text-gray-600">Holiday</span>
              </div>
            </div>
          </div>

          {/* Date Details Modal */}
          <AnimatePresence>
            {selectedDateForModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedDateForModal(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {selectedDateForModal.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </h3>
                        <p className="text-primary-100 text-sm">
                          {selectedDateForModal.toDateString() === new Date().toDateString() ? 'Today' : 'Scheduled Events'}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedDateForModal(null)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {(() => {
                      const selectedEvents = getEventsForDate(selectedDateForModal);
                      const selectedHoliday = getHolidayForDate(selectedDateForModal);
                      const isSelectedToday = selectedDateForModal.toDateString() === new Date().toDateString();

                      return (
                        <div className="space-y-4">
                          {/* Holiday Info */}
                          {selectedHoliday && (
                            <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                                  <CalendarIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-yellow-900">{selectedHoliday.name}</h4>
                                  <p className="text-xs text-yellow-700 capitalize">{selectedHoliday.type} Holiday</p>
                                </div>
                              </div>
                              {selectedHoliday.type === 'closed' && (
                                <div className="mt-2 p-2 bg-yellow-100 rounded-lg">
                                  <p className="text-xs font-medium text-yellow-800">⚠️ Station will be closed on this day</p>
                                </div>
                              )}
                              {selectedHoliday.description && (
                                <p className="text-sm text-yellow-800 mt-2">{selectedHoliday.description}</p>
                              )}
                            </div>
                          )}

                          {/* Events List */}
                          {selectedEvents.length > 0 ? (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary-600" />
                                {selectedEvents.length} Event{selectedEvents.length > 1 ? 's' : ''} Scheduled
                              </h4>
                              <div className="space-y-3">
                                {selectedEvents.map((event) => (
                                  <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 bg-gray-50 rounded-xl border-l-4 border-primary-500 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`w-3 h-3 rounded-full mt-1.5 ${event.type === 'broadcast' ? 'bg-primary-500' : event.type === 'meeting' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                                      <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900 mb-1">{event.title}</h5>
                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                          <div className="flex items-center gap-1">
                                            <ClockIcon className="w-3 h-3" />
                                            <span>{formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}</span>
                                          </div>
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            event.type === 'broadcast' ? 'bg-primary-100 text-primary-700' :
                                            event.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                          }`}>
                                            {event.type}
                                          </span>
                                        </div>
                                        {event.description && (
                                          <p className="text-xs text-gray-500 mt-2">{event.description}</p>
                                        )}
                                        {event.location && (
                                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <span>📍</span>
                                            <span>{event.location}</span>
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ) : !selectedHoliday && (
                            <div className="text-center py-8">
                              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 font-medium">No events scheduled</p>
                              <p className="text-sm text-gray-400 mt-1">This day is free</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedDateForModal(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <Link
                      href="/scheduling"
                      onClick={() => setSelectedDateForModal(null)}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                    >
                      View Full Schedule
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Today's Events */}
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-600" />
              Today&apos;s Events
            </h3>
            {calendarEvents.filter(e => {
              const eventDate = new Date(e.start);
              return eventDate.toDateString() === new Date().toDateString();
            }).length > 0 ? (
              calendarEvents.filter(e => {
                const eventDate = new Date(e.start);
                return eventDate.toDateString() === new Date().toDateString();
              }).slice(0, 3).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-primary-500"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${event.type === 'broadcast' ? 'bg-primary-500' : event.type === 'meeting' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-2">No events scheduled for today</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/scheduling"
              className="flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors group"
            >
              <span className="text-sm font-medium text-primary-700">View Full Schedule</span>
              <ArrowRight className="w-4 h-4 text-primary-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Performance Overview and Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glossy-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="viewers" fill="#f97316" radius={[8, 8, 0, 0]} name="Viewers" />
              <Bar dataKey="programs" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Programs" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glossy-card rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Department Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip />
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {departmentData.map((dept, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                <span className="text-sm text-gray-600">{dept.name}</span>
              </div>
            ))}
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

        {/* Recent Activities from All Modules */}
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
              { module: 'News', action: 'Article published', user: 'Mike Johnson', time: '1 hour ago', icon: NewspaperIcon, color: 'bg-blue-100 text-blue-600', link: '/news' },
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
              { label: 'News Article', icon: NewspaperIcon, color: 'bg-purple-500', link: '/news' },
              { label: 'Add Employee', icon: Users, color: 'bg-indigo-500', link: '/personnel' },
              { label: 'View Reports', icon: BarChart3, color: 'bg-yellow-500', link: '/reports' },
              { label: 'CCTV Monitor', icon: Video, color: 'bg-red-500', link: '/cctv' },
              { label: 'Settings', icon: Settings, color: 'bg-gray-500', link: '/settings' },
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
