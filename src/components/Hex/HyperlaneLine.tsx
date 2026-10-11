type Props = {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  color?: string;
  width?: string;
};

export function HyperlaneLine({ p1, p2, color = "white", width = "2" }: Props) {
  const pathString = `M${p1.x},${p1.y} C0,0 0,0 ${p2.x},${p2.y}`;
  return <path d={pathString} stroke={color} strokeWidth={width} fill="none" />;
}
