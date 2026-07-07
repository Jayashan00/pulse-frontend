'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import type { Conversation, Message, User } from '@/lib/types';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { SearchInput } from '@/components/ui/search-input';
import { useToast } from '@/components/ui/toast';
import { cn, timeAgo } from '@/lib/utils';

export default function MessagesPage() {
  const me = useAuth((s) => s.user);
  const toast = useToast();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [searching, setSearching] = useState('');
  const [people, setPeople] = useState<User[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConvos = useCallback(() => {
    api.get('/messages/conversations')
      .then(({ data }) => setConvos(data))
      .catch((e) => toast(apiError(e, 'Could not load conversations'), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { loadConvos(); }, [loadConvos]);

  // Start a new chat by searching people
  useEffect(() => {
    if (!searching.trim()) { setPeople([]); return; }
    const t = setTimeout(async () => {
      const { data } = await api.get('/users/search', { params: { q: searching } });
      setPeople(data.filter((u: User) => u.id !== me?.id));
    }, 350);
    return () => clearTimeout(t);
  }, [searching, me?.id]);

  const openConvo = async (c: Conversation) => {
    setActive(c);
    setLoadingMsgs(true);
    try {
      const { data } = await api.get(`/messages/conversations/${c.id}`);
      setMessages(data);
      setConvos((xs) => xs.map((x) => (x.id === c.id ? { ...x, unreadCount: 0 } : x)));
    } finally {
      setLoadingMsgs(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const startChat = (u: User) => {
    const existing = convos.find((c) => c.otherUser.id === u.id);
    if (existing) return openConvo(existing);
    setActive({ id: '', otherUser: u, updatedAt: new Date().toISOString(), unreadCount: 0, lastMessage: null });
    setMessages([]);
    setSearching('');
  };

  const send = async () => {
    if (!text.trim() || !active) return;
    setSending(true);
    try {
      const { data } = await api.post('/messages', { recipientId: active.otherUser.id, text: text.trim() });
      setMessages((m) => [...m, data]);
      setText('');
      loadConvos();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) {
      toast(apiError(e, 'Message not sent'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-4xl gap-5 md:h-[calc(100vh-5rem)]">
      {/* Conversation list */}
      <div className={cn('w-full flex-col md:flex md:w-80', active ? 'hidden' : 'flex')}>
        <h1 className="mb-4 font-display text-2xl font-bold">Messages</h1>
        <SearchInput placeholder="Start a new chat…" value={searching} onChange={(e) => setSearching(e.target.value)} containerClassName="mb-4" />
        {people.length > 0 && (
          <Card className="mb-4 divide-y divide-[var(--border)] overflow-hidden">
            {people.map((u) => (
              <button key={u.id} onClick={() => startChat(u)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-black/5 dark:hover:bg-white/5">
                <Avatar src={u.avatarUrl} name={u.displayName || u.username} size="sm" />
                <span className="text-sm font-medium">@{u.username}</span>
              </button>
            ))}
          </Card>
        )}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-3 w-40" /></div>
              </Card>
            ))
          ) : convos.length === 0 ? (
            <EmptyState icon={<MessageCircle className="h-8 w-8" />} title="No conversations" description="Search for someone above to say hi." />
          ) : (
            convos.map((c) => (
              <button key={c.id} onClick={() => openConvo(c)} className="w-full text-left">
                <Card className={cn('flex items-center gap-3 p-3 transition-colors hover:border-primary/40', active?.id === c.id && 'border-primary/60')}>
                  <Avatar src={c.otherUser.avatarUrl} name={c.otherUser.displayName || c.otherUser.username} ring={c.unreadCount > 0} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-semibold">{c.otherUser.displayName || c.otherUser.username}</p>
                      {c.lastMessage && <span className="shrink-0 text-[11px] text-[var(--muted)]">{timeAgo(c.lastMessage.createdAt)}</span>}
                    </div>
                    <p className={cn('truncate text-xs', c.unreadCount > 0 ? 'font-semibold text-[var(--text)]' : 'text-[var(--muted)]')}>
                      {c.lastMessage?.text || 'Say hi 👋'}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-pulse px-1.5 text-[11px] font-bold text-white">{c.unreadCount}</span>
                  )}
                </Card>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <Card className={cn('flex-1 flex-col overflow-hidden md:flex', active ? 'flex' : 'hidden')}>
        {active ? (
          <>
            <div className="flex items-center gap-3 border-b border-[var(--border)] p-3">
              <button onClick={() => setActive(null)} aria-label="Back" className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10 md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar src={active.otherUser.avatarUrl} name={active.otherUser.displayName || active.otherUser.username} size="sm" ring />
              <div>
                <p className="text-sm font-semibold">{active.otherUser.displayName || active.otherUser.username}</p>
                <p className="text-xs text-[var(--muted)]">@{active.otherUser.username}</p>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {loadingMsgs ? (
                <p className="text-center text-sm text-[var(--muted)]">Loading messages…</p>
              ) : messages.length === 0 ? (
                <p className="pt-10 text-center text-sm text-[var(--muted)]">No messages yet — break the ice!</p>
              ) : (
                messages.map((m) => {
                  const mine = m.sender.id === me?.id;
                  return (
                    <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                        mine ? 'rounded-br-sm bg-pulse text-white' : 'rounded-bl-sm bg-black/5 dark:bg-white/10',
                      )}>
                        {m.text}
                        <p className={cn('mt-0.5 text-[10px]', mine ? 'text-white/70' : 'text-[var(--muted)]')}>{timeAgo(m.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2 border-t border-[var(--border)] p-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={`Message @${active.otherUser.username}…`}
                className="input !h-11"
              />
              <Button size="icon" variant="gradient" className="!h-11 !w-11 shrink-0" loading={sending} onClick={send} aria-label="Send message">
                {!sending && <Send className="h-4 w-4" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="hidden flex-1 items-center justify-center md:flex">
            <EmptyState icon={<MessageCircle className="h-8 w-8" />} title="Pick a conversation" description="Choose a chat from the list or start a new one." />
          </div>
        )}
      </Card>
    </div>
  );
}
