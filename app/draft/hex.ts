export function neighbors(hex: string) {
  const [q, r, s] = hexFromString(hex);
  return [
    hexToString(q + 1, r + 0, s - 1),
    hexToString(q + 1, r - 1, s + 0),
    hexToString(q + 0, r - 1, s + 1),
    hexToString(q - 1, r + 0, s + 1),
    hexToString(q - 1, r + 1, s + 0),
    hexToString(q + 0, r + 1, s - 1),
  ];
}

function hexFromString(hex: string) {
  const m = hex.match(/^<(-?\d+),(-?\d+),(-?\d+)>$/);
  const q = parseFloat(m!![1]);
  const r = parseFloat(m!![2]);
  const s = parseFloat(m!![3]);
  if (Math.round(q + r + s) !== 0) {
    throw new Error(`q + r + s must be 0 ("${hex}")`);
  }
  return [q, r, s];
}

function hexToString(q: number, r: number, s: number) {
  return `<${q},${r},${s}>`;
}
