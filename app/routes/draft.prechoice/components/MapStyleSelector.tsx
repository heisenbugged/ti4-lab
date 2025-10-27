import { Button, Divider, Grid, Stack } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { MAPS, ChoosableDraftType } from "../maps";

type Props = {
  playerCount: number;
  selectedMapType: ChoosableDraftType;
  onMapTypeHover: (mapType: ChoosableDraftType | undefined) => void;
  onMapTypeSelect: (mapType: ChoosableDraftType) => void;
  onOpenMiltySettings: () => void;
  onOpenMiltyEqSettings: () => void;
  onOpenMinorFactionsInfo: () => void;
};

export function MapStyleSelector({
  playerCount,
  selectedMapType,
  onMapTypeHover,
  onMapTypeSelect,
  onOpenMiltySettings,
  onOpenMiltyEqSettings,
  onOpenMinorFactionsInfo,
}: Props) {
  const settingsOpeners: Partial<Record<ChoosableDraftType, () => void>> = {
    milty: onOpenMiltySettings,
    miltyeq: onOpenMiltyEqSettings,
  };

  return (
    <Stack
      gap="xs"
      onMouseLeave={() => onMapTypeHover(undefined)}
      mt="sm"
    >
      {Object.entries(MAPS).map(([type, { title, playerCount: mapPlayerCount }]) => {
        if (mapPlayerCount !== playerCount) return null;

        const openSettings = settingsOpeners[type as ChoosableDraftType];

        return (
          <Grid key={type} gutter="xs" columns={12}>
            {openSettings ? (
              <>
                <Grid.Col span={9}>
                  <Button
                    w="100%"
                    color="blue"
                    size="md"
                    variant={selectedMapType === type ? "filled" : "outline"}
                    ff="heading"
                    onMouseOver={() =>
                      onMapTypeHover(type as ChoosableDraftType)
                    }
                    onMouseDown={() =>
                      onMapTypeSelect(type as ChoosableDraftType)
                    }
                  >
                    {title}
                  </Button>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Button
                    variant="outline"
                    color="blue"
                    size="md"
                    onClick={() => {
                      onMapTypeSelect(type as ChoosableDraftType);
                      openSettings();
                    }}
                  >
                    <IconSettings size={18} />
                  </Button>
                </Grid.Col>
              </>
            ) : (
              <Grid.Col span={12}>
                <Button
                  w="100%"
                  color="blue"
                  size="md"
                  variant={selectedMapType === type ? "filled" : "outline"}
                  ff="heading"
                  onMouseOver={() =>
                    onMapTypeHover(type as ChoosableDraftType)
                  }
                  onMouseDown={() =>
                    onMapTypeSelect(type as ChoosableDraftType)
                  }
                >
                  {title}
                </Button>
              </Grid.Col>
            )}
          </Grid>
        );
      })}
      <Divider />
      <Button
        color="orange"
        variant="outline"
        onMouseDown={onOpenMinorFactionsInfo}
      >
        Minor Factions
      </Button>
    </Stack>
  );
}
