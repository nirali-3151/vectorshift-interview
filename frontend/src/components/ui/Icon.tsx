// Icon.tsx
// Renders a predefined icon from the global registry.
// --------------------------------------------------

import { icons, type IconName } from '@/constants/icons';
import { cn } from '@/lib/cn';

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export const Icon = ({
  name,
  size = 16,
  strokeWidth = 2,
  className,
}: IconProps) => {
  const Glyph = icons[name];

  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth}
      className={cn('shrink-0', className)}
      aria-hidden
    />
  );
};
