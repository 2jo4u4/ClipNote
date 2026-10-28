import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../utils';

export interface DropdownOption {
  id: string;
  label: string;
  value?: string;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (id: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onChange,
  icon,
  placeholder = '請選擇',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all duration-200 ease-raycast active:scale-95 outline-none',
          'bg-black/5 hover:bg-black/8 border border-raycast-light-border text-raycast-light-text',
          'dark:bg-white/5 dark:hover:bg-white/8 dark:border-white/8 dark:text-raycast-dark-text',
          isOpen && 'ring-2 ring-raycast-coral/20 border-raycast-coral/40 dark:border-raycast-coral/40'
        )}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="truncate max-w-[130px]">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={cn(
            'w-3 h-3 text-raycast-light-subtle dark:text-raycast-dark-subtle transition-transform duration-200 ease-raycast',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute left-0 top-full mt-1.5 z-40 min-w-[160px] p-1 rounded-xl shadow-2xl border backdrop-blur-md outline-none',
            'transition-all duration-200 ease-raycast animate-in fade-in zoom-in-95',
            'bg-raycast-light-surface/95 border-raycast-light-border text-raycast-light-text',
            'dark:bg-raycast-dark-surface/95 dark:border-white/10 dark:text-raycast-dark-text'
          )}
        >
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors duration-150',
                  isSelected
                    ? 'bg-raycast-coral/10 text-raycast-coral dark:bg-raycast-coral/15 dark:text-raycast-coral'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-raycast-light-text dark:text-raycast-dark-text'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
