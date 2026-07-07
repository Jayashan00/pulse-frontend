'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserSearch } from 'lucide-react';
import type { User } from '@/lib/types';
import { api } from '@/lib/api';
import { SearchInput } from '@/components/ui/search-input';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setResults([]); setTouched(false); return; }
    setLoading(true);
    setTouched(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get('/users/search', { params: { q } });
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 350); // debounce
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 font-display text-2xl font-bold">Search</h1>
      <SearchInput
        autoFocus
        placeholder="Search people by name or username…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mt-6 space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </Card>
          ))
        ) : touched && results.length === 0 ? (
          <EmptyState
            icon={<UserSearch className="h-8 w-8" />}
            title={`No one matches "${q}"`}
            description="Check the spelling or try a different name."
          />
        ) : !touched ? (
          <EmptyState
            icon={<UserSearch className="h-8 w-8" />}
            title="Find people on Pulse"
            description="Search by username or display name to visit profiles."
          />
        ) : (
          results.map((u) => (
            <Link key={u.id} href={`/profile/${u.username}`}>
              <Card className="mb-3 flex items-center gap-3 p-4 transition-all hover:border-primary/50 hover:shadow-glow">
                <Avatar src={u.avatarUrl} name={u.displayName || u.username} ring size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{u.displayName || u.username}</p>
                  <p className="truncate text-sm text-[var(--muted)]">@{u.username}</p>
                </div>
                <span className="shrink-0 text-xs text-[var(--muted)]">{u._count?.posts ?? 0} posts</span>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
