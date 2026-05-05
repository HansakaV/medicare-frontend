import React from 'react';
import { cn } from './Button';

export const Card = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return (
    <div className={cn('bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300', className)}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => {
  return (
    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors duration-300">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardContent = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return <div className={cn('p-6', className)}>{children}</div>;
};
