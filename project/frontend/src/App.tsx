import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './app/layout';
import DashboardPage from './app/page';
import TicketsPlaceholderPage from './app/tickets/page';
import PRsPlaceholderPage from './app/prs/page';
import CollaborationPlaceholderPage from './app/collaboration/page';
import AuditPlaceholderPage from './app/audit/page';
import AIDigestPlaceholderPage from './app/ai-digest/page';
import NotificationsPlaceholderPage from './app/notifications/page';

export const App: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Initializing Unified Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tickets/*" element={<TicketsPlaceholderPage />} />
        <Route path="/prs/*" element={<PRsPlaceholderPage />} />
        <Route path="/collaboration/*" element={<CollaborationPlaceholderPage />} />
        <Route path="/audit/*" element={<AuditPlaceholderPage />} />
        <Route path="/ai-digest/*" element={<AIDigestPlaceholderPage />} />
        <Route path="/notifications/*" element={<NotificationsPlaceholderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
};
