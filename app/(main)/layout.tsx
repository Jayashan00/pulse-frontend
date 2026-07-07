'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, PlusSquare, Bell, User, MessageCircle, Settings } from 'lucide-react';
import { useAuth } from '@/lib/store';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/feed', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/feed?post=new', label: 'Post', icon: PlusSquare, gradient: true },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token) router.replace('/login');
  }, [token, router]);
  if (!token) return null;

  const profileHref = user ? `/profile/${user.username}` : '/login';

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      {/* Persistent side navigation (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--border)] px-4 py-6 md:flex xl:w-72">
        <Link href="/feed" className="mb-8 px-3 font-display text-3xl font-bold bg-pulse bg-clip-text text-transparent">
          Pulse
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map(({ href, label, icon: Icon, gradient }) => {
            const active = pathname === href.split('?')[0] && !gradient;
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all',
                  gradient
                    ? 'mt-1 mb-1 bg-pulse text-white shadow-glow hover:opacity-90'
                    : active
                      ? 'bg-primary/10 text-primary dark:text-primary-soft'
                      : 'text-[var(--muted)] hover:bg-black/5 hover:text-[var(--text)] dark:hover:bg-white/5',
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
          <Link
            href={profileHref}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all',
              pathname.startsWith('/profile')
                ? 'bg-primary/10 text-primary dark:text-primary-soft'
                : 'text-[var(--muted)] hover:bg-black/5 hover:text-[var(--text)] dark:hover:bg-white/5',
            )}
          >
            <User className="h-5 w-5" />
            Profile
          </Link>
        </nav>
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <Link href={profileHref} className="flex items-center gap-3 overflow-hidden">
            <Avatar src={user?.avatarUrl} name={user?.displayName || user?.username} ring size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.displayName}</p>
              <p className="truncate text-xs text-[var(--muted)]">@{user?.username}</p>
            </div>
          </Link>
          <div className="flex items-center">
            <ThemeToggle />
            <Link href="/settings" aria-label="Settings" className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/10">
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/85 px-4 backdrop-blur md:hidden">
        <Link href="/feed" className="font-display text-2xl font-bold bg-pulse bg-clip-text text-transparent">Pulse</Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/settings" aria-label="Settings" className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--muted)]">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <main className="min-w-0 flex-1 px-4 pb-24 pt-20 md:px-8 md:pb-10 md:pt-8">{children}</main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur md:hidden">
        {nav.map(({ href, label, icon: Icon, gradient }) => {
          const active = pathname === href.split('?')[0] && !gradient;
          return (
            <Link key={label} href={href} aria-label={label} className="flex flex-col items-center gap-0.5 p-2">
              <Icon
                className={cn(
                  'h-6 w-6 transition-colors',
                  gradient ? 'rounded-lg bg-pulse p-0.5 text-white h-7 w-7' : active ? 'text-primary dark:text-primary-soft' : 'text-[var(--muted)]',
                )}
              />
            </Link>
          );
        })}
        <Link href={profileHref} aria-label="Profile" className="p-2">
          <User className={cn('h-6 w-6', pathname.startsWith('/profile') ? 'text-primary dark:text-primary-soft' : 'text-[var(--muted)]')} />
        </Link>
      </nav>
    </div>
  );
}
