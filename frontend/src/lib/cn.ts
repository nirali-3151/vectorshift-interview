// cn.ts
// Merges Tailwind class strings, resolving conflicts (e.g. a caller's px-2
// overriding a component's default px-4) instead of leaving both classes in
// the DOM at the mercy of stylesheet order.
// --------------------------------------------------

import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
