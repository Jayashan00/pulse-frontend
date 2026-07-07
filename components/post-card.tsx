'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Bookmark, Share2, Send, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Post, Comment } from '@/lib/types';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useToast } from './ui/toast';
import { Avatar } from './ui/avatar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { cn, timeAgo } from '@/lib/utils';

export function PostCard({ post, onDeleted }: { post: Post; onDeleted?: (id: string) => void }) {
  const toast = useToast();
  const me = useAuth((s) => s.user);
  const [liked, setLiked] = useState(post.likedByMe);
  const [saved, setSaved] = useState(post.savedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);

  const toggleLike = async () => {
    setLiked(!liked); // optimistic
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      await api.post(`/posts/${post.id}/like`);
    } catch (e) {
      setLiked(liked);
      setLikeCount((c) => c + (liked ? 1 : -1));
      toast(apiError(e), 'error');
    }
  };

  const toggleSave = async () => {
    setSaved(!saved);
    try {
      const { data } = await api.post(`/posts/${post.id}/save`);
      toast(data.saved ? 'Saved to your collection' : 'Removed from saved', 'success');
    } catch (e) {
      setSaved(saved);
      toast(apiError(e), 'error');
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/feed?post=${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Pulse', text: post.caption, url });
      else {
        await navigator.clipboard.writeText(url);
        toast('Link copied to clipboard', 'success');
      }
      api.post(`/posts/${post.id}/share`).catch(() => {});
    } catch { /* user cancelled */ }
  };

  const loadComments = async () => {
    setShowComments((v) => !v);
    if (comments.length || showComments) return;
    setLoadingComments(true);
    try {
      const { data } = await api.get(`/posts/${post.id}/comments`);
      setComments(data);
    } finally {
      setLoadingComments(false);
    }
  };

  const sendComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, { text: commentText.trim() });
      setComments((c) => [...c, data]);
      setCommentCount((c) => c + 1);
      setCommentText('');
    } catch (e) {
      toast(apiError(e), 'error');
    } finally {
      setSending(false);
    }
  };

  const deletePost = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      toast('Post deleted', 'success');
      onDeleted?.(post.id);
    } catch (e) {
      toast(apiError(e), 'error');
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <Link href={`/profile/${post.author.username}`} className="group flex items-center gap-3">
          <Avatar src={post.author.avatarUrl} name={post.author.displayName || post.author.username} ring />
          <div>
            <p className="text-sm font-semibold group-hover:text-primary dark:group-hover:text-primary-soft">
              {post.author.displayName || post.author.username}
            </p>
            <p className="text-xs text-[var(--muted)]">@{post.author.username} · {timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {me?.id === post.author.id && (
          <button onClick={deletePost} aria-label="Delete post" className="rounded-lg p-2 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="px-4 pb-3 text-[15px] leading-relaxed">{post.caption}</p>

      {post.mediaUrl && (
        <div className="bg-black/5 dark:bg-black/40">
          {post.mediaType === 'video' ? (
            <video src={post.mediaUrl} controls playsInline className="max-h-[560px] w-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.mediaUrl} alt={post.caption} loading="lazy" className="max-h-[560px] w-full object-contain" />
          )}
        </div>
      )}

      <div className="flex items-center gap-1 px-2 py-2">
        <ActionButton onClick={toggleLike} active={liked} activeClass="text-accent" label={`${likeCount}`}>
          <motion.span whileTap={{ scale: 1.4 }} className="inline-flex">
            <Heart className={cn('h-5 w-5', liked && 'fill-accent')} />
          </motion.span>
        </ActionButton>
        <ActionButton onClick={loadComments} label={`${commentCount}`}>
          <MessageCircle className="h-5 w-5" />
        </ActionButton>
        <ActionButton onClick={share} label="Share">
          <Share2 className="h-5 w-5" />
        </ActionButton>
        <div className="flex-1" />
        <ActionButton onClick={toggleSave} active={saved} activeClass="text-primary dark:text-primary-soft" label="">
          <Bookmark className={cn('h-5 w-5', saved && 'fill-primary dark:fill-primary-soft')} />
        </ActionButton>
      </div>

      {showComments && (
        <div className="border-t border-[var(--border)] p-4">
          {loadingComments ? (
            <p className="text-sm text-[var(--muted)]">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No comments yet. Start the conversation.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <Avatar src={c.user.avatarUrl} name={c.user.displayName || c.user.username} size="sm" />
                  <div className="rounded-2xl rounded-tl-sm bg-black/5 px-3 py-2 dark:bg-white/5">
                    <p className="text-xs font-semibold">@{c.user.username}</p>
                    <p className="text-sm">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendComment()}
              placeholder="Add a comment…"
              className="input !h-10"
            />
            <Button size="icon" variant="gradient" loading={sending} onClick={sendComment} aria-label="Send comment">
              {!sending && <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function ActionButton({
  children, label, onClick, active, activeClass,
}: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean; activeClass?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-black/5 dark:hover:bg-white/10',
        active ? activeClass : 'text-[var(--muted)]',
      )}
    >
      {children}
      {label && <span>{label}</span>}
    </button>
  );
}
