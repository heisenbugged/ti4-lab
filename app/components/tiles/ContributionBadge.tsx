import { Badge } from "@mantine/core";

type Props = {
  percentage: number; // 0.5 for 50%, 0.33 for 33%, etc.
};

export function ContributionBadge({ percentage }: Props) {
  // Format percentage as whole number
  const percentText = `${Math.round(percentage * 100)}%`;

  return (
    <Badge
      size="sm"
      variant="filled"
      color="orange"
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        pointerEvents: "none",
        textTransform: "none",
        fontWeight: 700,
      }}
    >
      {percentText}
    </Badge>
  );
}
