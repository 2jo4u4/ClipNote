import React from 'react';
import { cn } from '../utils';
import type { SearchResultType } from '../core/types';

export interface CellTypeBadgeProps {
  type: SearchResultType;
  className?: string;
}

/**
 * Standardized type indicator badge for Cells:
 * - Field: Amber tone with [欄位] label
 * - Jot: Coral tone with [隨筆] label
 */
export const CellTypeBadge: React.FC<CellTypeBadgeProps> = ({ type, className }) => {
  const isField = type === 'field';

  return (
    <span
      className={cn(
        'text-[10px] px-1.5 py-0.2 rounded font-mono font-medium flex-shrink-0',
        isField
          ? 'bg-raycast-amber/10 text-raycast-amber border border-raycast-amber/30'
          : 'bg-raycast-coral/10 text-raycast-coral border border-raycast-coral/30',
        className
      )}
    >
      {isField ? '[欄位]' : '[隨筆]'}
    </span>
  );
};
