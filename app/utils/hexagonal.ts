export const rotate60 = (q: number, r: number): [number, number] => {
  const s = -q - r;
  return [-r, -s];
};

export const rotate = (
  q: number,
  r: number,
  revolutions: number,
): [number, number] =>
  revolutions <= 0 ? [q, r] : rotate(...rotate60(q, r), revolutions - 1);

export const rotateSlice = (
  slice: [number, number][],
  revolutions: number,
): [number, number][] => slice.map(([q, r]) => rotate(q, r, revolutions));
