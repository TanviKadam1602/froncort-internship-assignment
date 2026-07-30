'use client';

import React from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RoleBadge } from '../../components/auth/RoleBadge';
import { User as UserIcon, Building2, Shield, LogOut, Key } from 'lucide-react';

export default function ProfilePage() {
  const { user, activeOrg, memberships, logout } = useAuth();
  const currentMembership = memberships.find((m) => m.orgId === activeOrg?.id);

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">User Profile</h1>
            <p className="text-xs text-slate-400 mt-1">Manage your account identity, security, & organization memberships</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => logout()} className="space-x-1.5">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>

        {/* User Card */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-indigo-500/20">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-bold text-slate-100">{user?.fullName}</h2>
                  {user?.isPlatformSuperAdmin && <Badge variant="danger">Platform SuperAdmin</Badge>}
                </div>
                <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
                <div className="pt-1 flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Role in Active Org:</span>
                  {currentMembership && <RoleBadge role={currentMembership.role} />}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="space-x-1.5">
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Organization Memberships List */}
        <Card>
          <CardHeader title="Organization Memberships" subtitle="Organizations you currently belong to" />
          <div className="space-y-3">
            {memberships.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  m.orgId === activeOrg?.id
                    ? 'bg-indigo-600/10 border-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-800 rounded-lg text-indigo-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">{m.org.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{m.org.slug}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <RoleBadge role={m.role} />
                  {m.orgId === activeOrg?.id && <Badge variant="success">Active Session</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
