'use client';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, RefreshCw } from 'lucide-react';
import type { Post } from '@/lib/types';
import { api, apiError } from '@/lib/api';
import { PostCard } from '@/components/post-card';
import { CreatePostModal } from '@/components/create-post-modal';
import { PostSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

function FeedInner() {
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  // Opening the composer from the nav "Post" link (?post=new)
  useEffect(() => {
    if (params.get('post') === 'new') {
      setComposeOpen(true);
      router.replace('/feed');
    }
  }, [params, router]);

  const fetchFeed = useCallback(async (reset = false) => {
    try {
      const { data } = await api.get('/posts/feed', { params: { limit: 10, cursor: reset ? undefined : cursor || undefined } });
      setPosts((prev) => (reset ? data.items : [...prev, ...data.items]));
      setCursor(data.nextCursor);
    } catch (e) {
      toast(apiError(e, 'Could not load the feed'), 'error');
    }
  }, [cursor, toast]);

  useEffect(() => {
    fetchFeed(true).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scrolling via IntersectionObserver
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting && cursor && !loadingMore && !loading) {
        setLoadingMore(true);
        await fetchFeed();
        setLoadingMore(false);
      }
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [cursor, loadingMore, loading, fetchFeed]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchFeed(true);
    setRefreshing(false);
    toast('Feed refreshed', 'success');
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Home</h1>
        <Button variant="ghost" size="icon" onClick={refresh} aria-label="Refresh feed">
          <RefreshCw className={refreshing ? 'h-5 w-5 animate-spin' : 'h-5 w-5'} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-5">
          <PostSkeleton /><PostSkeleton /><PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-8 w-8" />}
          title="Your feed is quiet"
          description="Be the first to share something — your post will show up here for everyone."
          actionLabel="Create your first post"
          onAction={() => setComposeOpen(true)}
        />
      ) : (
        <div className="space-y-5">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onDeleted={(id) => setPosts((ps) => ps.filter((x) => x.id !== id))} />
          ))}
          <div ref={sentinel} />
          {loadingMore && <PostSkeleton />}
          {!cursor && posts.length > 0 && (
            <p className="py-6 text-center text-sm text-[var(--muted)]">You're all caught up ✨</p>
          )}
        </div>
      )}

      <CreatePostModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onCreated={(post) => setPosts((ps) => [post, ...ps])}
      />
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl space-y-5"><PostSkeleton /><PostSkeleton /></div>}>
      <FeedInner />
    </Suspense>
  );
}
