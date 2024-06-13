import { Tabs } from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { MidDraftSummary } from "../components/MidDraftSummary";

export function DraftSummarySection() {
  // const draftedSlices = draft.players
  // .filter((p) => p.sliceIdx !== undefined)
  // .map((p) => p.sliceIdx!);

  return (
    <Tabs defaultValue="draft" variant="pills">
      <SectionTitle title="Summary">
        <Tabs.List>
          <Tabs.Tab value="draft">Draft</Tabs.Tab>
          <Tabs.Tab value="slice">Slice</Tabs.Tab>
        </Tabs.List>
      </SectionTitle>
      <Tabs.Panel value="draft">
        <MidDraftSummary />
      </Tabs.Panel>
      <Tabs.Panel value="slice">
        {/* <SlicesTable
            slices={draftV2.draft.slices}
            draftedSlices={draftedSlices}
          /> */}
      </Tabs.Panel>
    </Tabs>
  );
}
