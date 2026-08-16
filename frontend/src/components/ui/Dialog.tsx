// Dialog.tsx
// Built on the native <dialog> element, which supplies the top layer, focus
// trapping, and Esc-to-close that a div-based modal has to reimplement.
// --------------------------------------------------

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

type DialogProps = {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export const Dialog = ({
  open,
  onClose,
  title,
  footer,
  className,
  children,
}: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  // showModal/close are imperative, so mirror the `open` prop onto the element
  // rather than rendering the `open` attribute, which yields a non-modal dialog.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  // Esc fires `cancel` and would close the element behind React's back, leaving
  // the `open` prop stale; preventing the default keeps state authoritative.
  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose?.();
  };

  // A click on the backdrop reports the dialog itself as the target.
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === ref.current) onClose?.();
  };

  return (
    <dialog
      ref={ref}
      onCancel={handleCancel}
      onClick={handleClick}
      className={cn(
        'm-auto w-[min(26rem,calc(100vw-2rem))] rounded-node border border-line bg-surface p-0 text-ink shadow-raised backdrop:bg-ink/40',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button
          variant="ghost"
          onClick={onClose}
          aria-label="Close"
          className="px-2 py-0 text-lg leading-none"
        >
          &times;
        </Button>
      </div>

      <div className="px-4 py-3 text-[13px]">{children}</div>

      {footer && (
        <div className="flex justify-end gap-2 border-t border-line px-4 py-3">
          {footer}
        </div>
      )}
    </dialog>
  );
};
