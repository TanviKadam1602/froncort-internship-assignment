'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { AIService } from '../../services/ai.service';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sparkles, RefreshCw, Clock } from 'lucide-react';

export default function AIDigestPage() {
  const [digests, setDigests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchDigests = async () => {
    setIsLoading(true);
    try {
      const res = await AIService.listDigests();
      setDigests(res.data || []);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDigests();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await AIService.generateDigest('DAILY');
      await fetchDigests();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <span>AI Executive Progress Digest</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Pluggable OpenAI & Gemini progress summaries and BullMQ job status</p>
          </div>
          <Button variant="primary" size="sm" onClick={handleGenerate} isLoading={isGenerating} className="space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Generate Executive Summary</span>
          </Button>
        </div>

        {/* AI Digests List */}
        <Card>
          <CardHeader title="AI Progress Summaries" subtitle={`${digests.length} executive digests generated`} />

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading digests...</div>
          ) : digests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No AI Progress Digests generated yet.</div>
          ) : (
            <div className="space-y-4">
              {digests.map((d) => (
                <div key={d.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="info">{d.intervalType} DIGEST</Badge>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(d.createdAt).toLocaleString()}</span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-3.5 rounded-lg border border-slate-850">
                    {d.summaryText}
                  </p>

                  {d.metricsSnapshot && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <span>Total Tickets: <strong className="text-slate-200">{d.metricsSnapshot.totalTickets}</strong></span>
                      <span>Resolved: <strong className="text-emerald-400">{d.metricsSnapshot.resolvedTickets}</strong></span>
                      <span>Total PRs: <strong className="text-slate-200">{d.metricsSnapshot.totalPRs}</strong></span>
                      <span>Merged PRs: <strong className="text-purple-400">{d.metricsSnapshot.mergedPRs}</strong></span>
                    </div>
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
