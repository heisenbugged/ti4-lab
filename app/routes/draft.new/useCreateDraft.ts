import { useFetcher } from "@remix-run/react";
import { FactionId, Player } from "~/types";

export type CreateDraftInput = {
  players: Player[];
  availableFactions: FactionId[];
  mapString: string;
  slices: string[][];
  numFactionsToDraft: number | null;
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
