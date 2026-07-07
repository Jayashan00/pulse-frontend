'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const setSession = useAuth((s) => s.setSession);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { data } = await api.post('/auth/login', form);
      setSession(data.user, data.idToken);
      toast(`Welcome back, ${data.user.displayName || data.user.username}!`, 'success');
      router.replace('/feed');
    } catch (e) {
      setErrors({ general: apiError(e, 'Invalid email or password') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <span className="font-display text-3xl font-bold bg-pulse bg-clip-text text-transparent">Pulse</span>
      </div>
      <h1 className="font-display text-3xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Pick up where you left off.</p>

      {errors.general && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {errors.general}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            autoComplete="email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="you@example.com"
            className="input"
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <input
            type="password"
            value={form.password}
            autoComplete="current-password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="••••••••"
            className="input"
          />
        </Field>
        <Button variant="gradient" size="lg" className="w-full" loading={loading} onClick={submit}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        New to Pulse?{' '}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
