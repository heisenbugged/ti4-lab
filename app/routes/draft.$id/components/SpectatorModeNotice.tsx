import { IconEye } from "@tabler/icons-react";
import { Notice } from "~/ui";

interface SpectatorModeNoticeProps {
  isSpectatorMode: boolean;
}

export function SpectatorModeNotice({
  isSpectatorMode,
}: SpectatorModeNoticeProps) {
  if (!isSpectatorMode) return null;

  return (
    <Notice tone="info" icon={<IconEye size={18} />} title="You're watching as a spectator">
      Hidden choices stay hidden unless Pick for any player is on.
    </Notice>
  );
}
