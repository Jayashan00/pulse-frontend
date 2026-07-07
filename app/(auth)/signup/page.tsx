'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const setSession = useAuth((s) => s.setSession);
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.displayName.trim()) e.displayName = 'Display name is required';
    if (!/^[a-z0-9_.]{3,30}$/.test(form.username))
      e.username = '3–30 chars: lowercase letters, numbers, dots, underscores';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const { data } = await api.post('/auth/signup', form);
      setSession(data.user, data.idToken);
      toast('Account created — welcome to Pulse! 🎉', 'success');
      router.replace('/feed');
    } catch (e) {
      setErrors({ general: apiError(e, 'Could not create your account') });
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <div className="mb-8 lg:hidden">
        <span className="font-display text-3xl font-bold bg-pulse bg-clip-text text-transparent">Pulse</span>
      </div>
      <h1 className="font-display text-3xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Join Pulse in under a minute.</p>

      {errors.general && (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {errors.general}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <Field label="Display name" error={errors.displayName}>
          <input value={form.displayName} onChange={set('displayName')} placeholder="Ada Lovelace" className="input" />
        </Field>
        <Field label="Username" error={errors.username}>
          <input value={form.username} onChange={set('username')} placeholder="ada.codes" className="input" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className="input" />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" className="input" />
        </Field>
        <Button variant="gradient" size="lg" className="w-full" loading={loading} onClick={submit}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Log in
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
