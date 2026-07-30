'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Building2, ArrowLeft } from 'lucide-react';
import { AdminService } from '../../../services/admin.service';

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AdminService.listOrganizations()
      .then((res) => setOrgs(res.data || []))
      .catch(() => setOrgs([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <Link href="/admin" className="text-xs text-indigo-400 hover:underline flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Panel</span>
          </Link>
          <Badge variant="info">Tenant Organizations</Badge>
        </div>

        <Card>
          <CardHeader title="All Tenant Organizations" subtitle="Platform tenant lifecycle & slug directory" />
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading tenant organizations...</div>
          ) : orgs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No tenant organizations found.</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {orgs.map((o) => (
                <div key={o.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{o.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{o.slug}</p>
                    </div>
                  </div>
                  <Badge variant="success">Active Tenant</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
