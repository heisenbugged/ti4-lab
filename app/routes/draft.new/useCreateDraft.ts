import { useFetcher } from "@remix-run/react";
import { DraftType } from "~/draft";
import { FactionId, Player, Slice } from "~/types";

export type CreateDraftInput = {
  mapType: DraftType;
  players: Player[];
  availableFactions: FactionId[];
  mapString: string;
  slices: Slice[];
  numFactionsToDraft: number | null;
  draftSpeaker: boolean;
};

export function useCreateDraft() {
  const fetcher = useFetcher();
  return (input: CreateDraftInput) => {
    fetcher.submit(input, {
      method: "POST",
      encType: "application/json",
    });
  };
}
