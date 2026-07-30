'use client';

import React from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuditLogs, useAuditVerification } from '../../hooks/useAuditHooks';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Download, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { AuditService } from '../../services/audit.service';

export default function AuditPage() {
  const { logs, meta, isLoading, refetch } = useAuditLogs();
  const { verification, isLoading: isVerifying, verify } = useAuditVerification();

  const handleExportCSV = async () => {
    const blob = await AuditService.exportCSV();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>Immutable Audit Logs</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Cryptographic SHA-256 Hash Chain integrity & downloadable CSV exports</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={verify} isLoading={isVerifying} className="space-x-1.5">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>Verify Hash Chain</span>
            </Button>
            <Button variant="primary" size="sm" onClick={handleExportCSV} className="space-x-1.5">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Hash Chain Verification Status Card */}
        {verification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
              verification.isChainValid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {verification.isChainValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span>{verification.message}</span>
            </div>
            <Badge variant={verification.isChainValid ? 'success' : 'danger'}>
              {verification.isChainValid ? 'Chain Intact' : 'Tampered'}
            </Badge>
          </div>
        )}

        {/* Audit Log Table */}
        <Card>
          <CardHeader title="Tenant Audit History" subtitle={`Showing ${logs.length} of ${meta?.totalRecords || 0} audit entries`} />

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading audit logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No audit entries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">Resource Type</th>
                    <th className="p-3">Current Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/40 transition-all">
                      <td className="p-3 text-slate-400">{new Date(l.timestamp).toLocaleString()}</td>
                      <td className="p-3 font-sans text-slate-200">{l.actorEmail || l.actor?.email}</td>
                      <td className="p-3 text-emerald-400 font-semibold">{l.actionType}</td>
                      <td className="p-3 text-slate-400">{l.module || 'SYSTEM'}</td>
                      <td className="p-3 text-slate-300">{l.resourceType}</td>
                      <td className="p-3 text-[10px] text-slate-500 truncate max-w-[120px]">{l.currentHash?.slice(0, 16)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
