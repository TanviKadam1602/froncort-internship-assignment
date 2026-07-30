'use client';

import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { usePRs } from '../../hooks/usePRHooks';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { GitPullRequest, GitBranch, CheckCircle2, Clock } from 'lucide-react';

export default function PRsPage() {
  const { prs, meta, isLoading } = usePRs();

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <GitPullRequest className="w-6 h-6 text-purple-400" />
              <span>Review Console — Pull Requests</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Code review, N-approval voting engine, & version history diffs</p>
          </div>
          <Badge variant="info">N-Approval Active</Badge>
        </div>

        {/* PR List Card */}
        <Card>
          <CardHeader title="Pull Requests" subtitle={`Showing ${prs.length} of ${meta?.totalRecords || 0} PRs`} />

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading pull requests...</span>
            </div>
          ) : prs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No Pull Requests found in your tenant workspace.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {prs.map((pr) => (
                <div key={pr.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/40 p-3 rounded-xl transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold text-purple-400">#{pr.prNumber}</span>
                      <Link href={`/prs/${pr.id}`} className="text-sm font-semibold text-slate-100 hover:text-purple-400 transition-all">
                        {pr.title}
                      </Link>
                    </div>
                    <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1 font-mono text-slate-300">
                        <GitBranch className="w-3 h-3 text-purple-400" />
                        <span>{pr.sourceBranch || 'main'} → {pr.targetBranch || 'main'}</span>
                      </span>
                      <span>Author: {pr.author?.fullName}</span>
                      <span>Approvals Required: {pr.requiresNApprovals}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <Badge variant={pr.status === 'APPROVED' || pr.status === 'MERGED' ? 'success' : pr.status === 'OPEN' ? 'warning' : 'neutral'}>
                      {pr.status}
                    </Badge>
                    <Link href={`/prs/${pr.id}`}>
                      <Button variant="outline" size="sm">
                        Review & Diff
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
