'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { Clock, BarChart2, LayoutDashboard, LogOut, Settings, Link2 } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale || 'en';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  const isActive = (path) => pathname.includes(path);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)', color: 'var(--text)' }}>
      {/* Dashboard Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Clock size={16} color="white" />
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">Crono</span>
            </Link>

            {/* Main Links */}
            <div className="flex items-center gap-2">
              <Link 
                href={`/${locale}/dashboard`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/dashboard') && !isActive('/analytics') && !isActive('/settings') && !isActive('/integrations')
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard size={16} /> <span className="hidden md:block">My Entries</span>
              </Link>

              <Link 
                href={`/${locale}/analytics`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/analytics') 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart2 size={16} /> <span className="hidden md:block">Analytics</span>
              </Link>

              {/* 🔥 NEW INTEGRATIONS LINK 🔥 */}
              <Link 
                href={`/${locale}/dashboard/integrations`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/integrations') 
                    ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Link2 size={16} /> <span className="hidden md:block">Intégrations</span>
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <Link 
              href={`/${locale}/dashboard/settings`}
              className={`p-2.5 rounded-xl transition-all ${
                isActive('/settings') 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title="Settings"
            >
              <Settings size={18} />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={16} /> <span className="hidden sm:block">Logout</span>
            </button>
          </div>
          
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <main className="flex-1">{children}</main>
    </div>
  );
}