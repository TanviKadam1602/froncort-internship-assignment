'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useTickets } from '../../hooks/useTicketHooks';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Ticket, Plus, Search, Filter, MessageSquare, Clock } from 'lucide-react';

export default function TicketsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { tickets, meta, isLoading, refetch } = useTickets({ search, status });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch({ search, status });
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center space-x-2">
              <Ticket className="w-6 h-6 text-indigo-400" />
              <span>Support Hub — Tickets</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Tenant-scoped support tickets with auto-incrementing sequential numbers</p>
          </div>
          <Button variant="primary" size="sm" className="space-x-1.5">
            <Plus className="w-4 h-4" />
            <span>Create New Ticket</span>
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <Card>
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search tickets by title, description, or ticket #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <Button type="submit" variant="secondary" className="space-x-1.5">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Button>
          </form>
        </Card>

        {/* Ticket List Data Table */}
        <Card>
          <CardHeader
            title="Tenant Support Tickets"
            subtitle={`Showing ${tickets.length} of ${meta?.totalRecords || 0} total tickets`}
          />

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading tickets...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No support tickets found matching your criteria.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {tickets.map((t) => (
                <div key={t.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-900/40 p-3 rounded-xl transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold text-indigo-400">#{t.ticketNumber}</span>
                      <Link href={`/tickets/${t.id}`} className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-all">
                        {t.title}
                      </Link>
                      <Badge variant={t.priority === 'URGENT' || t.priority === 'HIGH' ? 'danger' : 'info'}>
                        {t.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                      <span>Author: {t.author?.fullName || 'User'}</span>
                      <span>Assignee: {t.assignee?.fullName || 'Unassigned'}</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <Badge variant={t.status === 'RESOLVED' ? 'success' : t.status === 'OPEN' ? 'warning' : 'neutral'}>
                      {t.status}
                    </Badge>
                    <Link href={`/tickets/${t.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
