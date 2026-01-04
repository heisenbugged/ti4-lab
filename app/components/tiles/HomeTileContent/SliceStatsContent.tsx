import { Group, Stack, Text } from "@mantine/core";
import type { CoreSliceData } from "~/hooks/useCoreSliceValues";
import { SliceValuePopover } from "../../Slice/SliceValuePopover";
import type { SliceStats } from "~/mapgen/utils/sliceScoring";

const seatLabel = ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

type Props = {
  seat?: number;
  sliceValue?: number;
  sliceStats: SliceStats;
  coreSliceData?: CoreSliceData;
  fontSize: string;
};

/**
 * Content for home tiles showing slice statistics.
 * Used in map generator to display seat label, slice value, and resource/influence stats.
 */
export function SliceStatsContent({
  seat,
  sliceValue,
  sliceStats,
  coreSliceData,
  fontSize,
}: Props) {
  return (
    <Stack align="center" gap={1} style={{ fontSize }}>
      {seat !== undefined && (
        <Text fz={{ base: "xs", xs: "md" }} c="white">
          {seatLabel[seat]}
        </Text>
      )}
      {sliceValue !== undefined && (
        <Group gap={4} align="center">
          <Text fz={{ base: "sm", xs: "lg" }} fw="bold" c="yellow.5">
            {sliceValue.toFixed(1)}
          </Text>
          {coreSliceData && (
            <SliceValuePopover
              breakdown={coreSliceData.breakdown}
              title="Seat Value"
              variant="dark"
            />
          )}
        </Group>
      )}
      <Stack align="center" gap={0}>
        <Text
          fz={{ base: 10, xs: "sm" }}
          fw="bolder"
          c="white"
          ta="center"
          lh={1.2}
        >
          {Math.round(sliceStats.optimalResources * 10) / 10}/
          {Math.round(sliceStats.optimalInfluence * 10) / 10}
        </Text>
        {sliceStats.techs && (
          <Text
            fz={{ base: 10, xs: "sm" }}
            fw="bolder"
            c="white"
            ta="center"
            lh={1.2}
          >
            {sliceStats.techs}
          </Text>
        )}
      </Stack>
    </Stack>
  );
}
