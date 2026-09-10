import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500 mb-4 ring-8 ring-neutral-50">
        <Icon className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="text-lg font-bold text-neutral-900 tracking-tight">{title}</h3>
      <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">{description}</p>

      {(action || secondaryAction || children) && (
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          {action && (
            <button
              onClick={action.onClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              <span>{action.label}</span>
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-sm font-semibold transition-colors cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
