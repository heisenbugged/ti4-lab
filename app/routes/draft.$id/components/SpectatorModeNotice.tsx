import { Text } from "@mantine/core";

interface SpectatorModeNoticeProps {
  isSpectatorMode: boolean;
}

export function SpectatorModeNotice({
  isSpectatorMode,
}: SpectatorModeNoticeProps) {
  if (!isSpectatorMode) return null;

  return (
    <Text size="sm" c="dimmed" ta="center">
      Spectator mode: Choices are hidden unless &quot;Pick for anyone&quot; is
      enabled
    </Text>
  );
}
