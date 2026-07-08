'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const token = useAuth((s) => s.token);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted) router.replace(token ? '/feed' : '/login');
  }, [mounted, token, router]);

  return null;
}