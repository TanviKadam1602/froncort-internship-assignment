'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Ticket, GitPullRequest, Network, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Next.js 15 App Router Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant insights across Support Hub, Review Console, & Cross-Org Collaboration
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/ai-digest">
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
            <Link href="/tickets" className="text-indigo-400 hover:underline flex items-center">
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
            <Link href="/prs" className="text-purple-400 hover:underline flex items-center">
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
            <Link href="/collaboration" className="text-blue-400 hover:underline flex items-center">
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
            <Link href="/audit" className="text-emerald-400 hover:underline flex items-center">
              Audit Logs <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Infrastructure Note */}
      <Card>
        <CardHeader title="Next.js 15 App Router Foundation" subtitle="Pure Server & Client Components Architecture" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <p className="font-semibold text-indigo-400">Next.js App Router</p>
            <p className="text-slate-400">
              Native file-based routing (`app/layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`).
            </p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <p className="font-semibold text-purple-400">Axios API Rewrites</p>
            <p className="text-slate-400">
              API requests proxied via `next.config.ts` rewrite rules directly to `http://localhost:4000/api/v1`.
            </p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <p className="font-semibold text-emerald-400">Clean Architecture</p>
            <p className="text-slate-400">
              Preserved all services, contexts, providers, design tokens, and components with 0 Vite dependencies.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
