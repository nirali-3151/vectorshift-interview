// Textarea.tsx

import { cn } from '@/lib/cn';
import { useAutosizeTextarea } from '@/hooks/useAutosizeTextarea';
import { controlClass } from '@/components/ui/controlStyles';

type TextareaProps = React.ComponentProps<'textarea'> & {
  autoSize?: boolean;
};

export const Textarea = ({
  className,
  autoSize = false,
  value,
  ...props
}: TextareaProps) => {
  const ref = useAutosizeTextarea(value, autoSize);

  return (
    <textarea
      ref={ref}
      value={value}
      className={cn(
        controlClass,
        'resize-y',
        // A manual resize handle fights the automatic height, and the scrollbar
        // would flash on every keystroke before the new height is applied.
        autoSize && 'resize-none overflow-hidden',
        className
      )}
      {...props}
    />
  );
};
