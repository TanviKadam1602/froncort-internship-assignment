'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Shield, Users, Building2, Flag, ArrowUpRight } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-rose-400" />
              <span>Platform Administration</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">SuperAdmin control panel for tenant organizations, users, & feature flags</p>
          </div>
          <Badge variant="danger">Platform Admin Only</Badge>
        </div>

        {/* Admin Navigation Shortcuts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:border-rose-500/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">User Management</p>
                <p className="text-2xl font-extrabold text-slate-100 mt-2">All Users</p>
              </div>
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">System-wide directory</span>
              <Link href="/admin/users" className="text-rose-400 hover:underline flex items-center">
                Manage Users <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </Card>

          <Card className="hover:border-indigo-500/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tenant Organizations</p>
                <p className="text-2xl font-extrabold text-slate-100 mt-2">All Orgs</p>
              </div>
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">Tenant lifecycle</span>
              <Link href="/admin/organizations" className="text-indigo-400 hover:underline flex items-center">
                Manage Orgs <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </Card>

          <Card className="hover:border-amber-500/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Feature Flags</p>
                <p className="text-2xl font-extrabold text-slate-100 mt-2">System Flags</p>
              </div>
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                <Flag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">Runtime toggles</span>
              <Link href="/admin/feature-flags" className="text-amber-400 hover:underline flex items-center">
                Feature Flags <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
