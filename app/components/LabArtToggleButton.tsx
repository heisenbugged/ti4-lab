import { Button } from "@mantine/core";
import { IconPhoto, IconPhotoOff } from "@tabler/icons-react";

type Props = {
  originalArt: boolean;
  onToggle: () => void;
};

export function LabArtToggleButton({ originalArt, onToggle }: Props) {
  return (
    <Button
      size="compact-xs"
      variant="filled"
      color={originalArt ? "orange" : "violet"}
      leftSection={
        originalArt ? <IconPhoto size={14} /> : <IconPhotoOff size={14} />
      }
      onClick={onToggle}
      title={
        originalArt ? "Switch to abstract tiles" : "Switch to original art"
      }
    >
      {originalArt ? "Original" : "Lab Art"}
    </Button>
  );
}
