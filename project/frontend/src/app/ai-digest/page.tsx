import React from 'react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Sparkles } from 'lucide-react';

export const AIDigestPlaceholderPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>AI Executive Progress Digest</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Pluggable OpenAI & Gemini progress summaries and BullMQ jobs</p>
        </div>
        <Badge variant="info">AI Provider Factory Active</Badge>
      </div>

      <Card>
        <CardHeader title="AI Digest Module Placeholder" subtitle="API Route /api/v1/ai connected" />
        <p className="text-xs text-slate-400 leading-relaxed">
          This route is mounted to the workspace navigation. Configured with pluggable AI providers (OpenAI / Gemini) and BullMQ background job monitoring.
        </p>
      </Card>
    </div>
  );
};

export default AIDigestPlaceholderPage;
