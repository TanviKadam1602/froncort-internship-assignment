'use client';

import React, { useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App Router Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-100">Something went wrong!</h2>
        <p className="text-xs text-slate-400 max-w-md mt-1">{error.message || 'An unexpected error occurred.'}</p>
      </div>
      <Button variant="primary" size="sm" onClick={() => reset()}>
        Try Again
      </Button>
    </div>
  );
}
