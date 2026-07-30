import React from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { GitPullRequest } from 'lucide-react';

export const PRsPlaceholderPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <GitPullRequest className="w-5 h-5 text-purple-400" />
            <span>Review Console — Pull Requests</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Code review, N-approval engine, & version diff viewer</p>
        </div>
        <Badge variant="info">Route Ready</Badge>
      </div>

      <Card>
        <CardHeader title="Review Console Module Placeholder" subtitle="API Route /api/v1/prs connected" />
        <p className="text-xs text-slate-400 leading-relaxed">
          This route is mounted to the workspace navigation. Reusable services, version snapshot handlers, and diff builders are initialized.
        </p>
      </Card>
    </div>
  );
};

export default PRsPlaceholderPage;
