import { IconEye } from "@tabler/icons-react";
import { Notice } from "~/ui";

export function SpectatorModeNotice() {
  return (
    <Notice tone="info" icon={<IconEye size={18} />} title="You're watching as a spectator">
      Hidden choices stay hidden unless Pick for any player is on.
    </Notice>
  );
}
