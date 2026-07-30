'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { useTicketDetails } from '../../../hooks/useTicketHooks';
import { TicketService } from '../../../services/ticket.service';
import { Card, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Ticket, MessageSquare, User, Clock, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const { ticket, isLoading, refetch } = useTicketDetails(ticketId);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      await TicketService.addComment(ticketId, commentText);
      setCommentText('');
      await refetch();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading ticket details...</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Ticket not found or access denied.
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <Link href="/tickets" className="text-xs text-indigo-400 hover:underline flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tickets</span>
          </Link>
          <Badge variant={ticket.status === 'RESOLVED' ? 'success' : 'warning'}>{ticket.status}</Badge>
        </div>

        {/* Ticket Header & Content */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm font-bold text-indigo-400">#{ticket.ticketNumber}</span>
              <h1 className="text-xl font-bold text-slate-100">{ticket.title}</h1>
              <Badge variant={ticket.priority === 'URGENT' ? 'danger' : 'info'}>{ticket.priority}</Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {ticket.description}
            </p>

            <div className="flex items-center space-x-6 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
              <span>Author: <strong className="text-slate-200">{ticket.author?.fullName}</strong></span>
              <span>Assignee: <strong className="text-slate-200">{ticket.assignee?.fullName || 'Unassigned'}</strong></span>
              <span>Created: <strong className="text-slate-200">{new Date(ticket.createdAt).toLocaleString()}</strong></span>
            </div>
          </div>
        </Card>

        {/* Threaded Discussion Comments */}
        <Card>
          <CardHeader title="Threaded Discussion Comments" subtitle={`${ticket.comments?.length || 0} comments`} />

          <div className="space-y-4 mb-6">
            {ticket.comments?.map((c: any) => (
              <div key={c.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-400">{c.author?.fullName} ({c.authorOrg?.name})</span>
                  <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-200">{c.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="space-x-1">
              <Send className="w-4 h-4" />
              <span>Post</span>
            </Button>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
