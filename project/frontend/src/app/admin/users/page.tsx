'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Users, ArrowLeft, Shield } from 'lucide-react';
import { AdminService } from '../../../services/admin.service';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AdminService.listUsers()
      .then((res) => setUsers(res.data || []))
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <Link href="/admin" className="text-xs text-rose-400 hover:underline flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Panel</span>
          </Link>
          <Badge variant="danger">System Directory</Badge>
        </div>

        <Card>
          <CardHeader title="System Users Directory" subtitle="Manage all registered platform accounts" />
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading platform users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No users found.</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <div key={u.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{u.fullName}</p>
                    <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                  </div>
                  <Badge variant={u.isPlatformSuperAdmin ? 'danger' : 'neutral'}>
                    {u.isPlatformSuperAdmin ? 'Platform SuperAdmin' : 'Standard User'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
