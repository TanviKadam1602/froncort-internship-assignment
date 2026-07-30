import React from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Ticket } from 'lucide-react';

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Ticket className="w-5 h-5 text-indigo-400" />
            <span>Support Hub — Tickets</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Tenant-scoped support ticket management & resolution workflows</p>
        </div>
        <Badge variant="info">Route Ready</Badge>
      </div>

      <Card>
        <CardHeader title="Support Hub Module Placeholder" subtitle="API Route /api/v1/tickets connected" />
        <p className="text-xs text-slate-400 leading-relaxed">
          This route is mounted to the Next.js App Router. Reusable services, DTO schemas, and API client hooks are initialized.
        </p>
      </Card>
    </div>
  );
}
