'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '../../hooks/useAuthHooks';
import { Card, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AlertCircle } from 'lucide-react';

export const RegisterCard: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const { register, isLoading, error } = useRegister();

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    if (!orgSlug) {
      setOrgSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !orgName || !orgSlug) return;
    await register({ fullName, email, password, orgName, orgSlug });
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader title="Create Organization Workspace" subtitle="Register administrator account & initial organization" />

      {error && (
        <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center space-x-2 text-xs text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Tony Stark"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <Input
          label="Work Email Address"
          type="email"
          placeholder="tony@stark.com"
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

        <div className="pt-2 border-t border-slate-800 space-y-4">
          <Input
            label="Organization Name"
            type="text"
            placeholder="Stark Industries"
            value={orgName}
            onChange={(e) => handleOrgNameChange(e.target.value)}
            required
          />

          <Input
            label="Organization URL Slug"
            type="text"
            placeholder="stark-industries"
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.target.value)}
            required
          />
        </div>

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Create Workspace & Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </Card>
  );
};
