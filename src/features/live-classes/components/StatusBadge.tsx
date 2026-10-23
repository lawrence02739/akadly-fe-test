import React from 'react';
import { LiveClassDisplayStatus } from '../types';
import { getStatusStyle } from '../utils/calendar.utils';

interface StatusBadgeProps {
  status: LiveClassDisplayStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const style = getStatusStyle(status);
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.badgeBg} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dotBg}`} />
      <span>{status}</span>
    </span>
  );
};
