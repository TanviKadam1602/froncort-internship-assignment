'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { CollaborationService } from '../../services/collaboration.service';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Network, Plus, CheckCircle, Share2, Building2 } from 'lucide-react';

export default function CollaborationPage() {
  const [connections, setConnections] = useState<any[]>([]);
  const [shares, setShares] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetSlug, setTargetSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [connRes, shareRes] = await Promise.all([
        CollaborationService.listConnections(),
        CollaborationService.listSharedResources(),
      ]);
      setConnections(connRes.data || []);
      setShares(shareRes.data || []);
    } catch {
      // Handle fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestConn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSlug) return;
    setIsSubmitting(true);
    try {
      await CollaborationService.requestConnection(targetSlug);
      setTargetSlug('');
      await fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <Network className="w-6 h-6 text-blue-400" />
              <span>Cross-Organization Partner Collaboration</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Partner organization handshakes & cross-tenant resource sharing</p>
          </div>
          <Badge variant="info">Handshake Active</Badge>
        </div>

        {/* Partner Connection Form Card */}
        <Card>
          <CardHeader title="Request Partner Connection" subtitle="Initiate cross-org connection with another tenant organization" />
          <form onSubmit={handleRequestConn} className="flex gap-3">
            <Input
              placeholder="Enter partner organization slug (e.g. stark-industries)..."
              value={targetSlug}
              onChange={(e) => setTargetSlug(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="space-x-1">
              <Plus className="w-4 h-4" />
              <span>Send Request</span>
            </Button>
          </form>
        </Card>

        {/* Partner Connections List */}
        <Card>
          <CardHeader title="Partner Connections" subtitle={`${connections.length} active connection handshakes`} />
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading connections...</div>
          ) : connections.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No partner organization connections found.</div>
          ) : (
            <div className="space-y-3">
              {connections.map((c) => (
                <div key={c.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">
                        {c.requesterOrg?.name} ↔ {c.targetOrg?.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">Requested: {new Date(c.requestedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={c.status === 'ACCEPTED' ? 'success' : 'warning'}>{c.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
