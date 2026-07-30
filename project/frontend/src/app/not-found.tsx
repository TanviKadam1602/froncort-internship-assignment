import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <h1 className="text-4xl font-extrabold text-indigo-400">404</h1>
      <div>
        <h2 className="text-base font-bold text-slate-100">Page Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The route you are looking for does not exist in this workspace.</p>
      </div>
      <Link href="/">
        <Button variant="primary" size="sm">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
