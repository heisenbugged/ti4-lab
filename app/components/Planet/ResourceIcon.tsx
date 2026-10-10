type Props = {
  value: number;
  size?: number; // total square size in px
};

export function ResourceIcon({ value, size = 20 }: Props) {
  return (
    <span style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <img src="/pa_resources.png" width={size} height={size} alt="Resources" style={{ display: "block" }} />
      <span
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -55%)",
          lineHeight: 1,
          fontSize: 14,
          fontWeight: 700,
          color: "white",
        }}
      >
        {value}
      </span>
    </span>
  );
}
