import { CustomDropdown } from './custom-dropdown';

interface InlineScrollPickerProps {
  value: number | string;
  options: Array<{ value: number | string; label: string }>;
  onChange: (value: number | string) => void;
  className?: string;
  width?: string;
}

export function InlineScrollPicker(props: InlineScrollPickerProps) {
  return <CustomDropdown {...props} />;
}
