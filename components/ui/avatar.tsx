'use client';
import { cn } from '@/lib/utils';

interface Props {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean; // signature pulse gradient ring
  className?: string;
}

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-24 w-24 text-3xl' };

export function Avatar({ src, name = '?', size = 'md', ring, className }: Props) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const img = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-pulse font-display font-semibold text-white">
      {initials}
    </div>
  );

  if (ring) {
    return (
      <div className={cn('pulse-ring inline-block', className)}>
        <div className={cn('rounded-full bg-[var(--bg)] p-[2px]', sizes[size])}>{img}</div>
      </div>
    );
  }
  return <div className={cn('shrink-0 rounded-full', sizes[size], className)}>{img}</div>;
}
