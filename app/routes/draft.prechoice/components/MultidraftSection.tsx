import { Box, Group, Input, Switch } from "@mantine/core";
import { NumberStepper } from "~/components/NumberStepper";
import { useDraftSetup } from "../store";

export function MultidraftSection() {
  const multidraft = useDraftSetup((state) => state.multidraft);

  return (
    <Group>
      <Switch
        label="Multidraft"
        description="Will create multiple drafts with the same settings, with a link to view them all on one page."
        checked={multidraft.isMultidraft}
        onChange={(event) =>
          multidraft.setIsMultidraft(event.currentTarget.checked)
        }
      />
      {multidraft.isMultidraft && (
        <Input.Wrapper label="Number of drafts">
          <Box mt="xs">
            <NumberStepper
              value={multidraft.numDrafts}
              decrease={() =>
                multidraft.setNumDrafts(Math.max(1, multidraft.numDrafts - 1))
              }
              increase={() => multidraft.setNumDrafts(multidraft.numDrafts + 1)}
              increaseDisabled={multidraft.numDrafts >= 9}
              decreaseDisabled={multidraft.numDrafts <= 2}
            />
          </Box>
        </Input.Wrapper>
      )}
    </Group>
  );
}
