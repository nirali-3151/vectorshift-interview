// useAutosizeTextarea.ts
// Grows a textarea to fit its content. Height is reset to 'auto' first so the
// element can shrink again; reading scrollHeight straight away would otherwise
// return the previous, larger height.
// --------------------------------------------------

import { useLayoutEffect, useRef, type RefObject } from 'react';

export const useAutosizeTextarea = (
  value: string | number | readonly string[] | undefined,
  enabled = true
): RefObject<HTMLTextAreaElement | null> => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value, enabled]);

  return ref;
};
