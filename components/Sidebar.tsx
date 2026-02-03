'use client';

import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Radio,
  Users,
  DollarSign,
  Package,
  Video,
  Clock,
  Mail,
  BarChart3,
  Settings,
  ChevronRight,
  Menu,
  X,
  UserCog,
  Building2,
  Camera,
  Edit,
  Palette,
  FileText as NewspaperIcon,
  Film,
  Wrench,
  Volume2,
  Scale,
  Server,
  Archive,
  Radio as BroadcastIcon,
  Monitor as TvIcon,
  Mic,
  Monitor,
  HardDrive,
  Shield,
  Bell,
  Zap,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { Logo } from './Logo';
import { useState } from 'react';

interface MenuSection {
  title: string;
  items: Array<{
    id: string;
    icon: any;
    path: string;
  }>;
}

const menuSections: MenuSection[] = [
  {
    title: 'Main',
    items: [
      { id: 'dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ],
  },
  {
    title: 'Content & Production',
    items: [
      { id: 'content', icon: FileText, path: '/content' },
      { id: 'scheduling', icon: Calendar, path: '/scheduling' },
      { id: 'programs', icon: TvIcon, path: '/programs' },
      { id: 'editing', icon: Edit, path: '/editing' },
      { id: 'graphics', icon: Palette, path: '/graphics' },
      { id: 'archive', icon: Archive, path: '/archive' },
      { id: 'library', icon: BookOpen, path: '/library' },
    ],
  },
  {
    title: 'Broadcast & Transmission',
    items: [
      { id: 'broadcast', icon: Radio, path: '/broadcast' },
      { id: 'live-streaming', icon: BroadcastIcon, path: '/live-streaming' },
      { id: 'transmission', icon: Zap, path: '/transmission' },
      { id: 'monitoring', icon: Monitor, path: '/monitoring' },
    ],
  },
  {
    title: 'News & Journalism',
    items: [
      { id: 'news', icon: NewspaperIcon, path: '/news' },
      { id: 'reports', icon: BarChart3, path: '/reports' },
      { id: 'journalists', icon: Mic, path: '/journalists' },
      { id: 'assignments', icon: FileText, path: '/assignments' },
    ],
  },
  {
    title: 'Technical & Engineering',
    items: [
      { id: 'cctv', icon: Video, path: '/cctv' },
      { id: 'cameras', icon: Camera, path: '/cameras' },
      { id: 'equipment', icon: Wrench, path: '/equipment' },
      { id: 'maintenance', icon: HardDrive, path: '/maintenance' },
      { id: 'it-services', icon: Server, path: '/it-services' },
    ],
  },
  {
    title: 'Personnel & Administration',
    items: [
      { id: 'personnel', icon: Users, path: '/personnel' },
      { id: 'user-management', icon: UserCog, path: '/user-management' },
      { id: 'departments', icon: Building2, path: '/departments' },
      { id: 'attendance', icon: Clock, path: '/attendance' },
      { id: 'roles', icon: Shield, path: '/roles' },
    ],
  },
  {
    title: 'Business & Finance',
    items: [
      { id: 'finance', icon: DollarSign, path: '/finance' },
      { id: 'advertising', icon: Volume2, path: '/advertising' },
      { id: 'contracts', icon: FileText, path: '/contracts' },
      { id: 'billing', icon: DollarSign, path: '/billing' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'inventory', icon: Package, path: '/inventory' },
      { id: 'contacts', icon: Mail, path: '/contacts' },
      { id: 'notifications', icon: Bell, path: '/notifications' },
      { id: 'analytics', icon: TrendingUp, path: '/analytics' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'settings', icon: Settings, path: '/settings' },
      { id: 'security', icon: Shield, path: '/security' },
      { id: 'backup', icon: HardDrive, path: '/backup' },
    ],
  },
];

export function Sidebar() {
  const { t } = useTranslation();
  const { sidebarOpen, setSidebarOpen, setCurrentModule } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  // Sections are always expanded now - removed toggle functionality

  const handleNavigation = (item: { id: string; path: string }) => {
    setCurrentModule(item.id);
    router.push(item.path);
  };


  const sidebarVariants = {
    open: {
      width: 300,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      },
    },
    closed: {
      width: 80,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      },
    },
  };

  const allItems = menuSections.flatMap((section) => section.items);
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-primary-500 text-white shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <motion.aside
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        initial={false}
        className="fixed left-0 top-0 h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl z-40 overflow-hidden backdrop-blur-xl border-r border-slate-700/50"
        style={{
          background: sidebarOpen
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        {/* Animated background gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="flex flex-col h-full relative z-10">
          {/* Logo Section */}
          <motion.div
            className="p-4 border-b border-slate-700/50 relative overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          >
            <div className="flex items-center gap-3 relative z-10">
              <motion.div
                className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg p-1"
                whileHover={{ 
                  scale: 1.15, 
                  rotate: [0, -5, 5, -5, 0],
                  boxShadow: '0 0 20px rgba(249, 115, 22, 0.6)',
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400,
                  damping: 15,
                }}
              >
                <Logo
                  variant="dark"
                  size="md"
                  animated={false}
                  className="rounded-lg"
                />
              </motion.div>
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.8 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 400,
                      damping: 25,
                    }}
                    className="text-white font-bold text-xl bg-gradient-to-r from-white via-primary-100 to-white bg-clip-text text-transparent"
                  >
                    Africa TV
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 sidebar-scroll">
            {menuSections.map((section, sectionIndex) => {
              const hasActiveItem = section.items.some((item) => isActive(item.path));

              return (
                <div key={section.title} className="mb-2">
                  {/* Section Header - Unclickable, faint text with arrow */}
                  {sidebarOpen && section.title !== 'Main' && (
                    <motion.div
                      className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-slate-500/60 uppercase tracking-wider pointer-events-none"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: sectionIndex * 0.05 }}
                    >
                      <span className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-slate-500/40" />
                        <span>{section.title}</span>
                      </span>
                    </motion.div>
                  )}

                  {/* Section Items - Always visible */}
                  <div className="space-y-1">
                        {section.items.map((item, itemIndex) => {
                          const Icon = item.icon;
                          const active = isActive(item.path);
                          const isHovered = hoveredItem === item.id;

                          return (
                            <motion.button
                              key={item.id}
                              onClick={() => handleNavigation(item)}
                              onHoverStart={() => setHoveredItem(item.id)}
                              onHoverEnd={() => setHoveredItem(null)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative overflow-hidden group ${
                                active
                                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                              } ${!sidebarOpen ? 'justify-center' : ''}`}
                              whileHover={{ 
                                scale: sidebarOpen ? 1.02 : 1.1,
                                x: sidebarOpen ? 4 : 0,
                                transition: { type: 'spring', stiffness: 400, damping: 20 }
                              }}
                              whileTap={{ scale: 0.98 }}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.03) }}
                            >
                              {/* Active indicator */}
                              {active && (
                                <motion.div
                                  className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
                                  layoutId="activeIndicator"
                                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                              )}

                              {/* Icon - Always visible */}
                              <motion.div
                                className="relative z-10"
                                animate={active ? {
                                  scale: [1, 1.1, 1],
                                } : {}}
                                transition={{
                                  duration: 0.5,
                                  delay: active ? 0.2 : 0,
                                }}
                              >
                                <Icon 
                                  className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${
                                    active ? 'drop-shadow-lg' : 'group-hover:scale-110'
                                  }`}
                                />
                              </motion.div>

                              {/* Text - Only show when expanded */}
                              <AnimatePresence>
                                {sidebarOpen && (
                                  <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ 
                                      type: 'spring',
                                      stiffness: 300,
                                      damping: 25,
                                    }}
                                    className="font-medium text-sm relative z-10 whitespace-nowrap"
                                  >
                                    {t(`sidebar.${item.id}`)}
                                  </motion.span>
                                )}
                              </AnimatePresence>

                              {/* Tooltip when collapsed */}
                              {!sidebarOpen && (
                                <motion.div
                                  className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 pointer-events-none z-50 shadow-xl border border-slate-700"
                                  initial={{ opacity: 0, x: -10 }}
                                  whileHover={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {t(`sidebar.${item.id}`)}
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-slate-800" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Toggle Button */}
          <motion.div
            className="p-3 border-t border-slate-700/50 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 shadow-lg relative overflow-hidden group"
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{
                  rotate: sidebarOpen ? 180 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <ChevronRight className="w-4 h-4 relative z-10" />
              </motion.div>
              
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, x: -10 }}
                    animate={{ opacity: 1, width: 'auto', x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -10 }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                    }}
                    className="text-xs font-medium relative z-10"
                  >
                    {t('common.collapse')}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}
