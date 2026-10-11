import { IconBrandDiscordFilled } from "@tabler/icons-react";
import { Notice } from "~/ui";

export function DiscordBanner() {
  return (
    <Notice tone="discord" icon={<IconBrandDiscordFilled size={18} />}>
      You are running this draft with Discord. Once the draft starts, the
      Discord bot will ping people when it&apos;s their turn to draft.
    </Notice>
  );
}
