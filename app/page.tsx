'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const token = useAuth((s) => s.token);
  useEffect(() => {
    router.replace(token ? '/feed' : '/login');
  }, [token, router]);
  return null;
}
