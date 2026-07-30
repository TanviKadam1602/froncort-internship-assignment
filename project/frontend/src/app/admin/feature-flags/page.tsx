'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Flag, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState([
    { key: 'AI_DIGEST_ENABLED', name: 'AI Progress Digest Service', enabled: true },
    { key: 'CROSS_ORG_COLLABORATION', name: 'Cross-Organization Resource Sharing', enabled: true },
    { key: 'IMMUTABLE_HASH_CHAIN_AUDIT', name: 'SHA-256 Hash Chain Audit Logging', enabled: true },
    { key: 'NOTIFICATIONS_QUEUE', name: 'BullMQ Background Notifications Worker', enabled: true },
  ]);

  const toggleFlag = (key: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <Link href="/admin" className="text-xs text-amber-400 hover:underline flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Panel</span>
          </Link>
          <Badge variant="warning">Runtime Feature Toggles</Badge>
        </div>

        <Card>
          <CardHeader title="System Feature Flags" subtitle="Enable or disable runtime capabilities across tenants" />
          <div className="divide-y divide-slate-800/60">
            {flags.map((f) => (
              <div key={f.key} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{f.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{f.key}</p>
                </div>
                <Button
                  variant={f.enabled ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => toggleFlag(f.key)}
                  className="space-x-1.5"
                >
                  {f.enabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                  <span>{f.enabled ? 'Enabled' : 'Disabled'}</span>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
