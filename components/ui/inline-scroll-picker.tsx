"use client";

interface InlineScrollPickerProps {
  value: number | string;
  options: Array<{ value: number | string; label: string }>;
  onChange: (value: number | string) => void;
  className?: string;
  width?: string;
}

export function InlineScrollPicker({
  value,
  options,
  onChange,
  className = "",
  width = "auto",
}: InlineScrollPickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    // Try to convert to number if it was originally a number
    const option = options.find(opt => String(opt.value) === selectedValue);
    if (option) {
      onChange(option.value);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} style={{ width }}>
      <select
        value={String(value)}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm font-medium text-center cursor-pointer hover:border-zinc-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors appearance-none custom-select"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a1aa' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
          paddingRight: '2rem',
        }}
      >
        {options.map((option) => (
          <option
            key={String(option.value)}
            value={String(option.value)}
            className="bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
          >
            {option.label}
          </option>
        ))}
      </select>

      <style jsx>{`
        .custom-select option {
          background-color: #18181b;
          color: #f4f4f5;
          padding: 8px 12px;
        }
        .custom-select option:hover {
          background-color: #27272a;
        }
        .custom-select option:checked {
          background-color: #16a34a;
          color: white;
        }
      `}</style>
    </div>
  );
}
