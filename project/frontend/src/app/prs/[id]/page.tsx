'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { usePRDetails } from '../../../hooks/usePRHooks';
import { PRService } from '../../../services/pr.service';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { GitPullRequest, GitBranch, CheckCircle, XCircle, ArrowLeft, FileCode } from 'lucide-react';
import Link from 'next/link';

export default function PRDetailPage() {
  const params = useParams();
  const prId = params.id as string;
  const { pr, isLoading, refetch } = usePRDetails(prId);
  const [isApproving, setIsApproving] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await PRService.approvePR(prId, 'LGTM! Looks good to merge.');
      await refetch();
    } finally {
      setIsApproving(false);
    }
  };

  const handleMerge = async () => {
    setIsMerging(true);
    try {
      await PRService.mergePR(prId);
      await refetch();
    } finally {
      setIsMerging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading Pull Request details...</span>
      </div>
    );
  }

  if (!pr) {
    return <div className="p-12 text-center text-slate-400 text-xs">Pull Request not found.</div>;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <Link href="/prs" className="text-xs text-purple-400 hover:underline flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pull Requests</span>
          </Link>
          <Badge variant={pr.status === 'MERGED' ? 'success' : pr.status === 'APPROVED' ? 'info' : 'warning'}>
            {pr.status}
          </Badge>
        </div>

        {/* PR Details Card */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm font-bold text-purple-400">#{pr.prNumber}</span>
              <h1 className="text-xl font-bold text-slate-100">{pr.title}</h1>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {pr.description}
            </p>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
              <div className="flex items-center space-x-4">
                <span className="font-mono text-purple-400 font-bold">{pr.sourceBranch || 'feature'} → {pr.targetBranch || 'main'}</span>
                <span>Version: <strong className="text-slate-200">v{pr.currentVersionNumber}</strong></span>
              </div>

              {pr.status !== 'MERGED' && (
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" onClick={handleApprove} isLoading={isApproving} className="space-x-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Approve PR</span>
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleMerge} isLoading={isMerging} className="space-x-1">
                    <GitPullRequest className="w-4 h-4" />
                    <span>Merge PR</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Reviewers List */}
        <Card>
          <CardHeader title="Reviewers & Voting Engine" subtitle={`Requires ${pr.requiresNApprovals} approvals to merge`} />
          <div className="space-y-2">
            {pr.reviewers?.map((r: any) => (
              <div key={r.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{r.reviewer?.fullName}</span>
                <Badge variant={r.status === 'APPROVED' ? 'success' : 'neutral'}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
