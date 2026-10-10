import { IconPhoto, IconPhotoOff } from "@tabler/icons-react";
import { Button } from "~/ui";

type Props = {
  originalArt: boolean;
  onToggle: () => void;
};

export function LabArtToggleButton({ originalArt, onToggle }: Props) {
  return (
    <Button
      size="sm"
      icon={originalArt ? <IconPhoto /> : <IconPhotoOff />}
      onClick={onToggle}
      aria-pressed={originalArt}
      title={
        originalArt ? "Switch to abstract tiles" : "Switch to original art"
      }
    >
      {originalArt ? "Original art" : "Lab art"}
    </Button>
  );
}
