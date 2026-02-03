'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen, checkAuth } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router, checkAuth]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[300px]' : 'lg:ml-[80px]'
        }`}
      >
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

