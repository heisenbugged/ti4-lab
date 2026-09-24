import { Box, Group, Text } from "@mantine/core";
import type { ReactNode } from "react";
import type { TechSkipsData } from "~/drizzle/presetMap.server";
import { TechIcon } from "~/components/icons/TechIcon";
import { LegendaryIcon } from "~/components/icons/LegendaryIcon";
import { TechSpecialty } from "~/types";

type BadgeSize = "sm" | "md";

const BADGE_SIZES: Record<
  BadgeSize,
  { icon: number; fontSize: string; gap: number }
> = {
  sm: { icon: 18, fontSize: "0.6rem", gap: 3 },
  md: { icon: 22, fontSize: "0.65rem", gap: 4 },
};

function CountBadge({
  icon,
  count,
  fontSize,
}: {
  icon: ReactNode;
  count: number;
  fontSize: string;
}) {
  return (
    <Box
      pos="relative"
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      {icon}
      <Text
        size="xs"
        fw="bold"
        c="white"
        pos="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          WebkitTextStroke: "1.5px black",
          paintOrder: "stroke fill",
          fontSize,
        }}
      >
        {count}
      </Text>
    </Box>
  );
}

export function TechSkipIcon({
  techSpecialty,
  count,
  size = "sm",
}: {
  techSpecialty: TechSpecialty;
  count: number;
  size?: BadgeSize;
}) {
  if (count === 0) return null;
  const { icon, fontSize } = BADGE_SIZES[size];
  return (
    <CountBadge
      icon={<TechIcon techSpecialty={techSpecialty} size={icon} />}
      count={count}
      fontSize={fontSize}
    />
  );
}

export function TechSkipsDisplay({
  techSkips,
  size = "sm",
}: {
  techSkips: string | null;
  size?: BadgeSize;
}) {
  if (!techSkips) return null;

  try {
    const data = JSON.parse(techSkips) as TechSkipsData;
    const hasAny = data.G > 0 || data.R > 0 || data.B > 0 || data.Y > 0;
    if (!hasAny) return null;

    return (
      <Group gap={BADGE_SIZES[size].gap}>
        <TechSkipIcon techSpecialty="BIOTIC" count={data.G} size={size} />
        <TechSkipIcon techSpecialty="WARFARE" count={data.R} size={size} />
        <TechSkipIcon techSpecialty="PROPULSION" count={data.B} size={size} />
        <TechSkipIcon techSpecialty="CYBERNETIC" count={data.Y} size={size} />
      </Group>
    );
  } catch {
    return null;
  }
}

export function LegendaryDisplay({
  count,
  size = "sm",
}: {
  count: number | null;
  size?: BadgeSize;
}) {
  if (!count || count === 0) return null;
  const { icon, fontSize } = BADGE_SIZES[size];
  return (
    <CountBadge
      icon={<LegendaryIcon size={icon} />}
      count={count}
      fontSize={fontSize}
    />
  );
}
