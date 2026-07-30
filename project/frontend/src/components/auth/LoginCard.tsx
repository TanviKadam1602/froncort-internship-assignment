'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLogin } from '../../hooks/useAuthHooks';
import { Card, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Lock, Mail, Building2, AlertCircle } from 'lucide-react';

export const LoginCard: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const { login, isLoading, error } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login({ email, password, orgSlug: orgSlug || undefined });
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader title="Welcome Back" subtitle="Sign in to your Unified Workspace account" />

      {error && (
        <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center space-x-2 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Organization Slug (Optional)"
          type="text"
          placeholder="stark-industries"
          value={orgSlug}
          onChange={(e) => setOrgSlug(e.target.value)}
          helperText="Specify slug to sign directly into a specific tenant org"
        />

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
        Don't have an organization workspace yet?{' '}
        <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
          Create Workspace
        </Link>
      </div>
    </Card>
  );
};
