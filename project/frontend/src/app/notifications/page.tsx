import React from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>User In-App Notifications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time alerts, unread counters, & user delivery preferences</p>
        </div>
        <Badge variant="info">Notifications Queue Ready</Badge>
      </div>

      <Card>
        <CardHeader title="Notifications Module Placeholder" subtitle="API Route /api/v1/notifications connected" />
        <p className="text-xs text-slate-400 leading-relaxed">
          This route is mounted to the Next.js App Router. Unread count tracking, preferences, and delivery queues are initialized.
        </p>
      </Card>
    </div>
  );
}
