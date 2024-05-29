import {
  Button,
  Group,
  Modal,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useState } from "react";
import { Opulence, Variance } from "~/types";

const opulences = [
  {
    value: "poverty" as const,
    label: "Agricola",
    color: "red.8",
    description:
      "A true poverty simulator. You'll be lucky to afford a single tech. War suns are a pipe dream.",
  },
  {
    value: "low" as const,
    label: "Low",
    color: "yellow.9",
    description:
      "Low value planets will push you to explore and expand. You'll need to fight for every resource.",
  },
  {
    value: "medium" as const,
    label: "Medium",
    color: "green.8",
    description:
      "A balanced experience. You'll have enough resources to build a variety of units and tech.",
  },
  {
    value: "high" as const,
    label: "High",
    color: "blue.8",
    description:
      "You'll have a surplus of resources. You can afford to build big fleets and research advanced tech.",
  },
  {
    value: "wealthy" as const,
    label: "Jeff Bezos",
    color: "purple.8",
    description:
      "You'll have more resources than you know what to do with. The ultimate boat-float experience.",
  },
];

const variances = [
  {
    value: "low" as const,
    label: "Low",
    color: "blue.8",
    description:
      "All slice values are close to the chosen opulence, no one slice is significantly better or worse.",
  },
  {
    value: "medium" as const,
    label: "Medium",
    color: "green.8",
    description:
      "Some slices are better than others, but the difference is not extreme.",
  },
  {
    value: "high" as const,
    label: "High",
    color: "yellow.9",
    description:
      "There is a significant difference in value between the best and worst slices.",
  },
  {
    value: "extreme" as const,
    label: "yee-haw!",
    color: "red.8",
    description:
      "The difference in value between the best and worst slices is extreme.",
  },
];

type Props = {
  opened: boolean;
  defaultNumSlices: number;
  onClose: () => void;
  onGenerateSlices: (
    numSlices: number,
    variance: Variance,
    opulence: Opulence,
    excludeMapTiles: boolean,
  ) => void;
};

export function GenerateSlicesModal({
  opened,
  defaultNumSlices,
  onClose,
  onGenerateSlices,
}: Props) {
  const [excludeMapTiles, setExcludeMapTiles] = useState(true);
  const [opulenceValue, setOpulenceValue] = useState(50);
  const opulence = opulences[Math.floor(opulenceValue / 25)];

  const [varianceValue, setVarianceValue] = useState(33);
  const variance = variances[Math.floor(varianceValue / 33)];
  const [numSlices, setNumSlices] = useState(defaultNumSlices);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title="Customize slice generation"
      removeScrollProps={{ removeScrollBar: false }}
    >
      <SimpleGrid cols={2} w="100%">
        <Stack w="100%" gap={4}>
          <Text size="sm" fw="bold">
            Opulence
          </Text>
          <Text c={opulence.color} fw="bold">
            {opulence.label}
          </Text>
          <Text size="xs">{opulence.description}</Text>
          <Slider
            color={opulence.color}
            marks={[
              { value: 0 },
              { value: 25 },
              { value: 50 },
              { value: 75 },
              { value: 100 },
            ]}
            value={opulenceValue}
            step={25}
            styles={{
              label: { display: "none" },
            }}
            onChange={(value) => setOpulenceValue(value)}
          />
        </Stack>
        <Stack w="100%" gap={4}>
          <Text size="sm" fw="bold">
            Variance
          </Text>
          <Text c={variance.color} fw="bold">
            {variance.label}
          </Text>
          <Text size="xs">{variance.description}</Text>
          <Slider
            color={variance.color}
            marks={[{ value: 0 }, { value: 33 }, { value: 66 }, { value: 99 }]}
            value={varianceValue}
            step={33}
            styles={{
              label: { display: "none" },
            }}
            onChange={(value) => setVarianceValue(value)}
          />
        </Stack>
      </SimpleGrid>
      {(variance.value === "extreme" || variance.value === "high") && (
        <Text size="xs" mt="sm">
          NOTE: High and Yee-Haw variances will likely overpower whatever
          'opulence' value you have set
        </Text>
      )}

      <Group mt="lg">
        <Text size="sm">Number of slices: {numSlices}</Text>
        <Group gap={2}>
          <Button
            size="compact-md"
            color="red"
            variant="filled"
            disabled={numSlices <= 6}
            onMouseDown={() => setNumSlices(numSlices - 1)}
          >
            -
          </Button>
          <Button
            size="compact-md"
            color="green"
            variant="filled"
            onMouseDown={() => setNumSlices(numSlices + 1)}
          >
            +
          </Button>
        </Group>
      </Group>

      <Stack mt="lg" gap={2}>
        <Switch
          label="Exclude map tiles"
          checked={excludeMapTiles}
          onChange={(e) => setExcludeMapTiles(e.currentTarget.checked)}
        />
        <Text size="xs" mt="sm">
          If true, will not draft from tiles that are already on the map
        </Text>
      </Stack>
      <Button
        w="100%"
        mt="lg"
        onMouseDown={() => {
          onGenerateSlices(
            numSlices,
            variance.value,
            opulence.value,
            excludeMapTiles,
          );
          onClose();
        }}
      >
        Generate slices
      </Button>
    </Modal>
  );
}
