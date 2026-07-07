'use client';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchInput({ containerClassName, className, ...props }: Props) {
  return (
    <div className={cn('relative', containerClassName)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
      <input
        type="search"
        className={cn(
          'h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 text-sm outline-none transition-shadow',
          'placeholder:text-[var(--muted)] focus:border-primary focus:ring-2 focus:ring-primary/30',
          className,
        )}
        {...props}
      />
    </div>
  );
}
