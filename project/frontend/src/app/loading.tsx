import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px] text-slate-400">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading workspace data...</span>
      </div>
    </div>
  );
}
