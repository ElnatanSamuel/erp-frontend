import { clsx } from 'clsx';
import { ReactNode } from 'react';

export default function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={clsx('bg-white rounded-2xl shadow-[0_1px_0_#EFF2F7] border border-gray-100', className)}>
      {children}
    </div>
  );
}
