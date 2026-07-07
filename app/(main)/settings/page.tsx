'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Bell, Globe, LogOut, Moon, Sun } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'සිංහල (Sinhala)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const clear = useAuth((s) => s.clear);
  const { resolvedTheme, setTheme } = useTheme();
  const [notifOn, setNotifOn] = useState(true);
  const [lang, setLang] = useState('en');
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    try { await api.post('/auth/logout'); } catch { /* clear locally regardless */ }
    clear();
    toast('Logged out — see you soon!', 'success');
    router.replace('/login');
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 font-display text-2xl font-bold">Settings</h1>

      <Card className="divide-y divide-[var(--border)]">
        {/* Theme */}
        <Row
          icon={resolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          title="Appearance"
          subtitle="Switch between light and dark mode"
        >
          <div className="flex rounded-xl border border-[var(--border)] p-1">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  'rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                  resolvedTheme === t ? 'bg-pulse text-white' : 'text-[var(--muted)] hover:text-[var(--text)]',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Row>

        {/* Notifications */}
        <Row icon={<Bell className="h-5 w-5" />} title="Notifications" subtitle="Likes, comments and messages">
          <Toggle on={notifOn} onChange={(v) => { setNotifOn(v); toast(v ? 'Notifications on' : 'Notifications off', 'success'); }} />
        </Row>

        {/* Language */}
        <Row icon={<Globe className="h-5 w-5" />} title="Language" subtitle="Interface language">
          <select
            value={lang}
            onChange={(e) => { setLang(e.target.value); toast(`Language set to ${languages.find((l) => l.code === e.target.value)?.label}`, 'success'); }}
            className="h-10 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none focus:border-primary"
          >
            {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </Row>
      </Card>

      <Button variant="danger" size="lg" className="mt-6 w-full" loading={loggingOut} onClick={logout}>
        <LogOut className="h-5 w-5" /> Log out
      </Button>

      <p className="mt-8 text-center text-xs text-[var(--muted)]">Pulse v1.0 · Built with Next.js & NestJS</p>
    </div>
  );
}

function Row({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary-soft">{icon}</span>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-[var(--muted)]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn('relative h-7 w-12 rounded-full transition-colors', on ? 'bg-pulse' : 'bg-black/15 dark:bg-white/15')}
    >
      <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-6' : 'left-1')} />
    </button>
  );
}
