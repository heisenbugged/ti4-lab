type Props = {
  size?: number;
};

export function TradeStationIcon({ size = 20 }: Props) {
  return <img src="/trade_station.webp" style={{ width: size }} alt="Trade Station" />;
}
