'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { RoleGuard } from '../../components/auth/RoleGuard';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RoleBadge } from '../../components/auth/RoleBadge';
import { Building2, Users, UserPlus, Shield, Globe } from 'lucide-react';

export default function SettingsPage() {
  const { activeOrg, memberships } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('SUPPORT_AGENT');
  const [inviteSent, setInviteSent] = useState(false);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteEmail('');
    }, 3000);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Organization Settings</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage organization preferences, members, roles, & invitations for {activeOrg?.name}
            </p>
          </div>
          <Badge variant="info">Tenant Isolation Active</Badge>
        </div>

        {/* Organization Overview Card */}
        <Card>
          <CardHeader title="Organization Profile" subtitle="General details and domain configuration" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Organization Name</span>
              <p className="text-sm font-bold text-slate-100">{activeOrg?.name}</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">URL Slug</span>
              <p className="text-sm font-mono text-indigo-400 font-bold">{activeOrg?.slug}</p>
            </div>
          </div>
        </Card>

        {/* Invite Member UI Guarded by ORG_ADMIN & SUPPORT_MANAGER */}
        <RoleGuard roles={['ORG_ADMIN', 'SUPPORT_MANAGER']}>
          <Card>
            <CardHeader title="Invite New Member" subtitle="Send an invitation to join your tenant organization" />

            {inviteSent && (
              <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
                Invitation sent successfully to {inviteEmail}!
              </div>
            )}

            <form onSubmit={handleSendInvite} className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1">
                <Input
                  label="Member Email Address"
                  type="email"
                  placeholder="agent@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="SUPPORT_AGENT">Support Agent</option>
                  <option value="SUPPORT_MANAGER">Support Manager</option>
                  <option value="REVIEWER_APPROVER">Reviewer Approver</option>
                  <option value="USER">User</option>
                </select>
              </div>
              <Button type="submit" variant="primary" className="space-x-1.5">
                <UserPlus className="w-4 h-4" />
                <span>Send Invite</span>
              </Button>
            </form>
          </Card>
        </RoleGuard>

        {/* Organization Members List */}
        <Card>
          <CardHeader title="Active Members & Roles" subtitle="Users with access to this tenant organization" />
          <div className="space-y-3">
            {memberships
              .filter((m) => m.orgId === activeOrg?.id)
              .map((m) => (
                <div key={m.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/20">
                      U
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Current User Session</p>
                      <p className="text-[10px] text-slate-400 font-mono">Member ID: {m.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  <RoleBadge role={m.role} />
                </div>
              ))}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
