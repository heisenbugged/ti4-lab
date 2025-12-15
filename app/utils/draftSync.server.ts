import { json } from "@remix-run/node";
import { DraftSelection } from "~/types";

type SyncValidationResult =
  | { valid: true }
  | { valid: false; response: ReturnType<typeof json> };

export function validateDraftSync(
  serverSelections: DraftSelection[],
  clientSelections: DraftSelection[],
): SyncValidationResult {
  const pickDiff = clientSelections.length - serverSelections.length;

  // Client must have equal picks (no new pick) or exactly one more (new pick)
  if (pickDiff < 0 || pickDiff > 1) {
    return {
      valid: false,
      response: json(
        {
          success: false,
          error: "out_of_sync",
          message:
            "Your draft state is out of sync. Please refresh to get the latest state.",
          serverSelectionCount: serverSelections.length,
          clientSelectionCount: clientSelections.length,
        },
        { status: 409 },
      ),
    };
  }

  // Verify existing selections match
  for (let i = 0; i < serverSelections.length; i++) {
    if (
      JSON.stringify(serverSelections[i]) !== JSON.stringify(clientSelections[i])
    ) {
      return {
        valid: false,
        response: json(
          {
            success: false,
            error: "out_of_sync",
            message:
              "Your draft state is out of sync. Another pick was made. Please refresh.",
            serverSelectionCount: serverSelections.length,
            clientSelectionCount: clientSelections.length,
          },
          { status: 409 },
        ),
      };
    }
  }

  return { valid: true };
}
