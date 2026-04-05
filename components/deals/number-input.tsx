"use client";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}

export function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min,
  max,
}: NumberInputProps) {
  return (
    <div>
      <label className="block text-xxs font-medium uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          max={max}
          className={`w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-mono tabular-nums text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
            prefix ? "pl-6" : ""
          } ${suffix ? "pr-6" : ""}`}
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
