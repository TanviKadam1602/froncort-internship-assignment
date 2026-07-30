import React from 'react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Ticket, GitPullRequest, Network, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Workspace Dashboard Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant insights across Support Hub, Review Console, & Cross-Org Collaboration
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/ai-digest">
            <Button variant="primary" size="sm" className="space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Progress Digest</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-indigo-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Support Tickets</p>
              <p className="text-3xl font-extrabold text-slate-100 mt-2">24</p>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">+12% this week</span>
            <Link to="/tickets" className="text-indigo-400 hover:underline flex items-center">
              View All <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </Card>

        <Card className="hover:border-purple-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Pull Requests</p>
              <p className="text-3xl font-extrabold text-slate-100 mt-2">8</p>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <GitPullRequest className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">N-Approval active</span>
            <Link to="/prs" className="text-purple-400 hover:underline flex items-center">
              Review PRs <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </Card>

        <Card className="hover:border-blue-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partner Connections</p>
              <p className="text-3xl font-extrabold text-slate-100 mt-2">3</p>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Network className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <Badge variant="success">Handshake Active</Badge>
            <Link to="/collaboration" className="text-blue-400 hover:underline flex items-center">
              Partners <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </Card>

        <Card className="hover:border-emerald-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Chain Integrity</p>
              <p className="text-xl font-bold text-emerald-400 mt-2">100% Valid</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400">SHA-256 Hash Chain</span>
            <Link to="/audit" className="text-emerald-400 hover:underline flex items-center">
              Audit Logs <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Infrastructure Note */}
      <Card>
        <CardHeader title="Frontend Foundation Status" subtitle="Reusable React Contexts, Theme System, & Service Client" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <p className="font-semibold text-indigo-400">Auth & Tenant Context</p>
            <p className="text-slate-400">
              JWT auto-refresh interceptors, multi-tenant organization switching, and role-based permissions.
            </p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <p className="font-semibold text-purple-400">Design System & Theme</p>
            <p className="text-slate-400">
              Custom CSS tokens, Glassmorphism panels, dark/light theme switching, and responsive navigation.
            </p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <p className="font-semibold text-emerald-400">API Service Layer</p>
            <p className="text-slate-400">
              Structured service clients for Auth, Tickets, PRs, Collaboration, Audit Logs, AI Digest, and Notifications.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
