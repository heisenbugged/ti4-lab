type Props = {
  size?: number;
};

export function LegendaryIcon({ size = 20 }: Props) {
  return <img src="/legendary.webp" style={{ width: size }} alt="Legendary" />;
}
