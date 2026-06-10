"use client";

interface Props {
  label: string;
  icon: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (v: string) => void;
  rightSlot?: React.ReactNode;
}

export default function AirportInput({
  label,
  icon,
  value,
  placeholder,
  error,
  onChange,
  rightSlot,
}: Props) {
  return (
    <div className="space-y-sm">
      <label className="block text-label-sm text-on-surface-variant px-1">{label}</label>
      <div
        className={`flex items-center gap-md border rounded-xl p-md bg-surface-bright focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all ${
          error ? "border-error" : "border-outline-variant"
        }`}
      >
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <input
          className="bg-transparent border-none p-0 w-full focus:ring-0 text-body-md placeholder:text-outline uppercase"
          placeholder={placeholder}
          type="text"
          value={value}
          maxLength={3}
          onChange={(e) => onChange(e.target.value)}
        />
        {rightSlot}
      </div>
      {error && <p className="text-label-sm text-error px-1">{error}</p>}
    </div>
  );
}
