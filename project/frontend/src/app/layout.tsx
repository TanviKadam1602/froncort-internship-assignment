'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppProvider } from '../providers/AppProvider';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  LayoutDashboard,
  Ticket,
  GitPullRequest,
  Network,
  ShieldCheck,
  Sparkles,
  Bell,
  Sun,
  Moon,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import '../styles/globals.css';

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({
  to,
  icon,
  label,
  active,
}) => (
  <Link
    href={to}
    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`}
  >
    <span className="w-5 h-5">{icon}</span>
    <span>{label}</span>
  </Link>
);

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, activeOrg, memberships, switchOrg, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
            U
          </div>
          <span className="font-bold text-slate-100">Unified Workspace</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-900/90 border-r border-slate-800/80 p-4 flex flex-col justify-between backdrop-blur-xl shrink-0`}
      >
        <div className="space-y-6">
          {/* Logo & Brand */}
          <div className="hidden md:flex items-center space-x-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-500/25">
              U
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 leading-tight">Unified Workspace</h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Enterprise Next.js 15</p>
            </div>
          </div>

          {/* Organization Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all text-left"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">{activeOrg?.name || 'Select Org'}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{activeOrg?.slug}</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {orgDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
                <p className="text-[10px] uppercase font-semibold text-slate-500 px-2.5 py-1">Switch Organization</p>
                {memberships.map((m) => (
                  <button
                    key={m.orgId}
                    onClick={() => {
                      switchOrg(m.orgId);
                      setOrgDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      m.orgId === activeOrg?.id
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{m.org.name}</span>
                    <Badge variant="neutral" className="text-[10px]">
                      {m.role}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <SidebarLink to="/" icon={<LayoutDashboard />} label="Dashboard" active={pathname === '/'} />
            <SidebarLink
              to="/tickets"
              icon={<Ticket />}
              label="Support Hub"
              active={pathname.startsWith('/tickets')}
            />
            <SidebarLink
              to="/prs"
              icon={<GitPullRequest />}
              label="Review Console"
              active={pathname.startsWith('/prs')}
            />
            <SidebarLink
              to="/collaboration"
              icon={<Network />}
              label="Cross-Org Partner"
              active={pathname.startsWith('/collaboration')}
            />
            <SidebarLink
              to="/audit"
              icon={<ShieldCheck />}
              label="Audit Logs"
              active={pathname.startsWith('/audit')}
            />
            <SidebarLink
              to="/ai-digest"
              icon={<Sparkles />}
              label="AI Progress Digest"
              active={pathname.startsWith('/ai-digest')}
            />
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-xs border border-slate-700">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.fullName || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleTheme}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => logout()}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-medium text-slate-200">{activeOrg?.name || 'Dashboard'}</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/notifications"
              className="relative p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </Link>
          </div>
        </header>

        {/* Page Children Container */}
        <div className="p-6 flex-1">{children}</div>
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <title>Unified Workspace Platform — Next.js 15</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <AppProvider>
          <DashboardShell>{children}</DashboardShell>
        </AppProvider>
      </body>
    </html>
  );
}
