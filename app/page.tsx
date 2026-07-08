'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useHydrated } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const token = useAuth((s) => s.token);
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated) router.replace(token ? '/feed' : '/login');
  }, [hydrated, token, router]);

  return null;
}