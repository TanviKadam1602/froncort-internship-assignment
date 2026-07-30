import React from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck } from 'lucide-react';

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Immutable Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">SHA-256 Hash Chain verification, timeline view, & CSV exports</p>
        </div>
        <Badge variant="success">Hash Chain Enabled</Badge>
      </div>

      <Card>
        <CardHeader title="Audit System Module Placeholder" subtitle="API Route /api/v1/audit connected" />
        <p className="text-xs text-slate-400 leading-relaxed">
          This route is mounted to the Next.js App Router. Cryptographic hash chain verification and CSV export services are ready.
        </p>
      </Card>
    </div>
  );
}
