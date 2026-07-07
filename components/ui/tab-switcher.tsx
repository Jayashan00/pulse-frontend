'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}

export function TabSwitcher({ tabs, active, onChange }: Props) {
  return (
    <div className="flex rounded-xl border border-[var(--border)] bg-[var(--card)] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            active === tab.id ? 'text-white' : 'text-[var(--muted)] hover:text-[var(--text)]',
          )}
        >
          {active === tab.id && (
            <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-lg bg-pulse" transition={{ type: 'spring', damping: 28, stiffness: 350 }} />
          )}
          <span className="relative z-10 flex items-center gap-1.5">{tab.icon}{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
