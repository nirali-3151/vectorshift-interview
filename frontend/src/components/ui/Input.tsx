// Input.tsx

import { cn } from '@/lib/cn';
import { controlClass } from '@/components/ui/controlStyles';

export const Input = ({ className, ...props }: React.ComponentProps<'input'>) => (
  <input className={cn(controlClass, className)} {...props} />
);
