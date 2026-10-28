import React from 'react';
import { cn } from '../utils';
import type { SearchResultType } from '../core/types';
import { Language, getTranslations } from '../i18n';

export interface CellTypeBadgeProps {
  type: SearchResultType;
  language?: Language;
  className?: string;
}

/**
 * Standardized type indicator badge for Cells:
 * - Field: Amber tone with [欄位] / [Field] label
 * - Jot: Coral tone with [隨筆] / [Jot] label
 */
export const CellTypeBadge: React.FC<CellTypeBadgeProps> = ({
  type,
  language = 'zh-TW',
  className,
}) => {
  const isField = type === 'field';
  const t = getTranslations(language);

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
      {isField ? t.common.fieldBadge : t.common.jotBadge}
    </span>
  );
};
