// Slider.tsx
// Range input synced with a numeric text box.
// --------------------------------------------------

import { cn } from '@/lib/cn';
import { controlClass } from '@/components/ui/controlStyles';

type SliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  inputClassName?: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const Slider = ({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  className,
  inputClassName,
}: SliderProps) => {
  const safeValue = clamp(Number.isFinite(value) ? value : min, min, max);

  const handleInput = (raw: string) => {
    if (raw === '') return;
    const next = Number(raw);
    if (!Number.isNaN(next)) onChange(clamp(next, min, max));
  };

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(e) => handleInput(e.target.value)}
        className={cn(controlClass, 'w-12 shrink-0 flex-none px-1 text-center', inputClassName)}
      />

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 min-w-0 flex-1 cursor-pointer accent-accent"
      />
    </div>
  );
};
