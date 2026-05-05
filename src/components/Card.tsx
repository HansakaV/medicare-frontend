import React from 'react';
import { cn } from './Button';

export const Card = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden', className)}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => {
  return (
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardContent = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return <div className={cn('p-6', className)}>{children}</div>;
};
