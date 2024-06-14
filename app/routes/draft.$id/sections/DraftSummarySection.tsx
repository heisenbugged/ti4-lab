import { Tabs } from "@mantine/core";
import { SectionTitle } from "~/components/Section";
import { MidDraftSummary } from "../components/MidDraftSummary";
import { useDraft } from "~/draftStore";
import { SlicesTable } from "~/routes/draft/SlicesTable";
import { useDraftedSlices } from "~/hooks/useDraftedSlices";

export function DraftSummarySection() {
  const slices = useDraft((state) => state.draft.slices);
  const draftedSlices = useDraftedSlices();

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
        <SlicesTable slices={slices} draftedSlices={draftedSlices} />
      </Tabs.Panel>
    </Tabs>
  );
}
