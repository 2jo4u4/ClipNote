import React from 'react';
import { cn } from '../utils';

export interface DropSlotProps {
  type: 'cell' | 'section';
  label: string;
  onDrop: (e: React.DragEvent) => void;
  className?: string;
}

export const DropSlot: React.FC<DropSlotProps> = ({
  type,
  label,
  onDrop,
  className,
}) => {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={onDrop}
      className={cn(
        'border-2 border-dashed border-raycast-amber/60 bg-raycast-amber/5 dark:bg-raycast-amber/10 flex items-center justify-center text-xs text-raycast-amber font-medium transition-all duration-200 ease-out animate-in fade-in zoom-in-95 select-none',
        type === 'section' ? 'h-16 rounded-2xl my-1' : 'h-14 rounded-xl',
        className
      )}
    >
      <span>{label}</span>
    </div>
  );
};
