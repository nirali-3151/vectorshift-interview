// Popover.tsx
// Generic anchored panel with outside-click and Escape dismiss. Content is
// portaled to document.body so it paints above React Flow handles and node UI.
// --------------------------------------------------

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  cloneElement,
  isValidElement,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

type PopoverSide = 'right' | 'left' | 'bottom' | 'top';

type PopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  side?: PopoverSide;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

const GAP = 8;

const positionForSide = (
  triggerRect: DOMRect,
  panelRect: DOMRect,
  side: PopoverSide
) => {
  switch (side) {
    case 'right':
      return { top: triggerRect.top, left: triggerRect.right + GAP };
    case 'left':
      return {
        top: triggerRect.top,
        left: triggerRect.left - panelRect.width - GAP,
      };
    case 'bottom':
      return { top: triggerRect.bottom + GAP, left: triggerRect.left };
    case 'top':
      return {
        top: triggerRect.top - panelRect.height - GAP,
        left: triggerRect.left,
      };
  }
};

const clampToViewport = (top: number, left: number, panelRect: DOMRect) => {
  const maxLeft = window.innerWidth - panelRect.width - GAP;
  const maxTop = window.innerHeight - panelRect.height - GAP;

  return {
    top: Math.min(Math.max(GAP, top), Math.max(GAP, maxTop)),
    left: Math.min(Math.max(GAP, left), Math.max(GAP, maxLeft)),
  };
};

export const Popover = ({
  open,
  onOpenChange,
  trigger,
  side = 'right',
  className,
  contentClassName,
  children,
}: PopoverProps) => {
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  const updatePosition = () => {
    const triggerEl = triggerRef.current;
    const panelEl = panelRef.current;
    if (!triggerEl || !panelEl) return;

    const next = positionForSide(
      triggerEl.getBoundingClientRect(),
      panelEl.getBoundingClientRect(),
      side
    );
    setPosition(clampToViewport(next.top, next.left, panelEl.getBoundingClientRect()));
  };

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    updatePosition();

    let frame = 0;
    const tick = () => {
      updatePosition();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [open, side]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onOpenChange(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  const triggerNode = isValidElement<
    { onClick?: (event: React.MouseEvent) => void; ref?: React.Ref<HTMLElement> }
  >(trigger)
    ? cloneElement(trigger, {
        ref: triggerRef,
        onClick: (event: React.MouseEvent) => {
          trigger.props.onClick?.(event);
          if (!event.defaultPrevented) onOpenChange(!open);
        },
      })
    : trigger;

  const panel =
    open &&
    createPortal(
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        style={
          position
            ? { top: position.top, left: position.left }
            : { top: -9999, left: -9999, visibility: 'hidden' as const }
        }
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        className={cn(
          'nodrag nokey fixed z-[1000] overflow-hidden rounded-node border border-line bg-surface shadow-raised',
          contentClassName
        )}
      >
        {children}
      </div>,
      document.body
    );

  return (
    <div className={cn('relative', className)}>
      {triggerNode}
      {panel}
    </div>
  );
};
