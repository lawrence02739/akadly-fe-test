import React from 'react';

interface SettingsGroupCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsGroupCard: React.FC<SettingsGroupCardProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-2 ${className}`}
    >
      <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase mb-4">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
};
