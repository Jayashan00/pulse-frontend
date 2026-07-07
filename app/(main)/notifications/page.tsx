'use client';
import { useEffect, useState } from 'react';
import { Bell, Heart, MessageCircle, Sparkles, CheckCheck } from 'lucide-react';
import type { Notification } from '@/lib/types';
import { api, apiError } from '@/lib/api';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { useToast } from '@/components/ui/toast';
import { cn, timeAgo } from '@/lib/utils';

const typeIcon = {
  like: <Heart className="h-4 w-4 text-accent" />,
  comment: <MessageCircle className="h-4 w-4 text-primary-soft" />,
  follow: <Sparkles className="h-4 w-4 text-primary-soft" />,
  system: <Sparkles className="h-4 w-4 text-accent" />,
};

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    api.get('/notifications')
      .then(({ data }) => setItems(data))
      .catch((e) => toast(apiError(e, 'Could not load notifications'), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const markOne = async (id: string) => {
    setItems((xs) => xs.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await api.patch(`/notifications/${id}/read`); } catch { /* keep optimistic */ }
  };

  const markAll = async () => {
    setMarking(true);
    try {
      await api.patch('/notifications/read-all');
      setItems((xs) => xs.map((n) => ({ ...n, read: true })));
      toast('All notifications marked as read', 'success');
    } catch (e) {
      toast(apiError(e), 'error');
    } finally {
      setMarking(false);
    }
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">
          Notifications {unread > 0 && <span className="ml-1 rounded-full bg-pulse px-2 py-0.5 text-xs font-semibold text-white align-middle">{unread}</span>}
        </h1>
        {unread > 0 && (
          <Button variant="ghost" size="sm" loading={marking} onClick={markAll}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2"><Skeleton className="h-3 w-56" /><Skeleton className="h-3 w-20" /></div>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="No notifications yet"
          description="Likes and comments on your posts will show up here."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id}>
              <button onClick={() => !n.read && markOne(n.id)} className="w-full text-left">
                <Card className={cn('flex items-center gap-3 p-4 transition-colors', !n.read && 'border-primary/40 bg-primary/5')}>
                  <div className="relative">
                    <Avatar src={n.actor?.avatarUrl} name={n.actor?.displayName || n.actor?.username || 'Pulse'} />
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-[var(--card)] p-1">{typeIcon[n.type]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{n.message}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-pulse" aria-label="Unread" />}
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
