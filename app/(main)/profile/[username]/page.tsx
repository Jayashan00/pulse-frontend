'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Grid3X3, Bookmark, ImageOff, PlusSquare, Pencil } from 'lucide-react';
import type { Post, User } from '@/lib/types';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TabSwitcher } from '@/components/ui/tab-switcher';
import { PostCard } from '@/components/post-card';
import { PostSkeleton, Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { CreatePostModal } from '@/components/create-post-modal';
import { EditProfileModal } from '@/components/edit-profile-modal';
import { useToast } from '@/components/ui/toast';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const me = useAuth((s) => s.user);
  const toast = useToast();
  const isMe = me?.username === username;

  const [profile, setProfile] = useState<User | null>(null);
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [saved, setSaved] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [{ data: prof }, { data: userPosts }] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/posts`),
      ]);
      setProfile(prof);
      setPosts(userPosts);
      if (me?.username === username) {
        const { data: savedPosts } = await api.get('/users/me/saved');
        setSaved(savedPosts);
      }
    } catch (e) {
      toast(apiError(e, 'Could not load this profile'), 'error');
    } finally {
      setLoading(false);
      setLoadingPosts(false);
    }
  }, [username, me?.username, toast]);

  useEffect(() => { load(); }, [load]);

  const shown = tab === 'posts' ? posts : saved;

  return (
    <div className="mx-auto max-w-xl">
      {loading ? (
        <div className="flex items-center gap-5">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>
      ) : profile && (
        <>
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
            <Avatar src={profile.avatarUrl} name={profile.displayName || profile.username} size="xl" ring />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold">{profile.displayName || profile.username}</h1>
              <p className="text-sm text-[var(--muted)]">@{profile.username}</p>
              {profile.bio && <p className="mt-2 text-sm leading-relaxed">{profile.bio}</p>}
              <div className="mt-3 flex justify-center gap-6 text-sm sm:justify-start">
                <span><b className="font-display">{profile._count?.posts ?? 0}</b> <span className="text-[var(--muted)]">posts</span></span>
                <span><b className="font-display">{profile._count?.likes ?? 0}</b> <span className="text-[var(--muted)]">likes given</span></span>
              </div>
            </div>
            {isMe && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button variant="gradient" size="sm" onClick={() => setComposeOpen(true)}>
                  <PlusSquare className="h-4 w-4" /> New post
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8">
            <TabSwitcher
              tabs={[
                { id: 'posts', label: 'Posts', icon: <Grid3X3 className="h-4 w-4" /> },
                ...(isMe ? [{ id: 'saved', label: 'Saved', icon: <Bookmark className="h-4 w-4" /> }] : []),
              ]}
              active={tab}
              onChange={setTab}
            />
          </div>

          <div className="mt-5 space-y-5">
            {loadingPosts ? (
              <><PostSkeleton /><PostSkeleton /></>
            ) : shown.length === 0 ? (
              <EmptyState
                icon={<ImageOff className="h-8 w-8" />}
                title={tab === 'posts' ? 'No posts yet' : 'Nothing saved yet'}
                description={
                  tab === 'posts'
                    ? isMe ? 'Share your first moment with the world.' : `@${profile.username} hasn't posted anything yet.`
                    : 'Tap the bookmark on any post to keep it here.'
                }
                actionLabel={tab === 'posts' && isMe ? 'Create a post' : undefined}
                onAction={tab === 'posts' && isMe ? () => setComposeOpen(true) : undefined}
              />
            ) : (
              shown.map((p) => (
                <PostCard key={p.id} post={p} onDeleted={(id) => {
                  setPosts((ps) => ps.filter((x) => x.id !== id));
                  setSaved((ps) => ps.filter((x) => x.id !== id));
                }} />
              ))
            )}
          </div>

          <CreatePostModal open={composeOpen} onClose={() => setComposeOpen(false)} onCreated={(p) => setPosts((ps) => [p, ...ps])} />
          <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} profile={profile} onSaved={(u) => setProfile((p) => ({ ...p!, ...u }))} />
        </>
      )}
    </div>
  );
}
