
type Props = {
  percentage: number; // 0.5 for 50%, 0.33 for 33%, etc.
};

export function ContributionBadge({ percentage }: Props) {
  // Format percentage as whole number
  const percentText = `${Math.round(percentage * 100)}%`;

  return (
    <span
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        pointerEvents: "none",
        display: "inline-flex",
        alignItems: "center",
        height: 18,
        padding: "0 7px",
        borderRadius: 999,
        background: "var(--pal-orange-8)",
        color: "white",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {percentText}
    </span>
  );
}
