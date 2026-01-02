'use client';

import { InlineScrollPicker } from './inline-scroll-picker';

interface Option {
  value: string;
  label: string;
}

interface OptionSelectorProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

export function OptionSelector({ value, options, onChange, className = '' }: OptionSelectorProps) {
  return (
    <InlineScrollPicker
      value={value}
      options={options}
      onChange={(val) => onChange(String(val))}
      width="100%"
      className={className}
    />
  );
}
