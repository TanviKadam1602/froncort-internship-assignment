'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { NotificationService } from '../../services/notification.service';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Bell, CheckCheck, Trash2, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await NotificationService.listNotifications();
      setNotifications(res.data || []);
      setUnreadCount(res.meta?.unreadCount || 0);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    await fetchNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    await fetchNotifications();
  };

  const handleDeleteRead = async () => {
    await NotificationService.deleteReadNotifications();
    await fetchNotifications();
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <Bell className="w-6 h-6 text-amber-400" />
              <span>User Notification Center</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Real-time alerts, unread counts, & delivery preferences</p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="space-x-1.5">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All Read</span>
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteRead} className="space-x-1.5">
              <Trash2 className="w-4 h-4" />
              <span>Clear Read</span>
            </Button>
          </div>
        </div>

        {/* Notifications List Card */}
        <Card>
          <CardHeader title="In-App Notifications" subtitle={`${unreadCount} unread notifications`} />

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No notifications found.</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                    !n.isRead ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={!n.isRead ? 'warning' : 'neutral'}>{n.type}</Badge>
                      <h3 className="text-sm font-semibold text-slate-100">{n.title}</h3>
                    </div>
                    <p className="text-xs text-slate-300">{n.message}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>

                  {!n.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)} className="text-xs text-indigo-400">
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
