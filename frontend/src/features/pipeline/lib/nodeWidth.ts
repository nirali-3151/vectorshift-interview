// nodeWidth.ts
// Width for nodes that grow with their text. Height is handled by the
// autosizing textarea; only the horizontal axis needs a hint.
// --------------------------------------------------

const MIN = '220px';
const MAX = '420px';

// `ch` tracks the node's own font size, so the estimate holds if the type scale
// changes. The padding allowance covers the node border and field gutters.
const PADDING_CH = 6;

export const widthForText = (text: unknown): string => {
  const longestLine = String(text ?? '')
    .split('\n')
    .reduce((longest, line) => Math.max(longest, line.length), 0);

  return `clamp(${MIN}, ${longestLine + PADDING_CH}ch, ${MAX})`;
};
