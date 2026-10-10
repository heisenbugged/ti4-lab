import { HydratedRouter } from "react-router/dom";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import posthog from "posthog-js";

// Initialize PostHog outside the React tree. Rendering an extra component next to
// <HydratedRouter /> made the client tree differ from the server's, which shifted
// every useId and caused hydration mismatches (broken label/control ids).
posthog.init("phc_OOxDW31RdcnDDSAj4xhjY7RVTtR053K4gVeJrMVML2H", {
  api_host: "https://us.i.posthog.com",
  person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
