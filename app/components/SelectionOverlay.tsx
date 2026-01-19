import { Badge, Box, Center } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

type SelectionOverlayProps = {
  visible: boolean;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  badgeLabel?: string;
};

const sizeConfig = {
  sm: { checkSize: 24, padding: "xs" },
  md: { checkSize: 32, padding: "sm" },
  lg: { checkSize: 48, padding: "md" },
} as const;

export function SelectionOverlay({
  visible,
  size = "md",
  showBadge = true,
  badgeLabel = "Selected",
}: SelectionOverlayProps) {
  if (!visible) return null;

  const { checkSize, padding } = sizeConfig[size];

  return (
    <>
      <Center
        pos="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(64, 192, 87, 0.15)"
        style={{ borderRadius: 8, pointerEvents: "none", zIndex: 5 }}
      >
        <Box
          bg="green.6"
          p={padding}
          style={{
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconCheck size={checkSize} color="white" />
        </Box>
      </Center>
      {showBadge && (
        <Box pos="absolute" top={-15} right={-10} style={{ zIndex: 10 }}>
          <Badge size="lg" color="green" variant="filled">
            {badgeLabel}
          </Badge>
        </Box>
      )}
    </>
  );
}
