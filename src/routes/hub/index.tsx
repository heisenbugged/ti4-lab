import { createFileRoute, redirect } from "@tanstack/react-router";
import { IconBrandDiscordFilled, IconCards, IconFileImport, IconShare } from "@tabler/icons-react";
import type { CSSProperties } from "react";
import { getViewer } from "~/server/hub.functions";
import { ButtonAnchor, Notice, cx } from "~/ui";
import classes from "./hub.module.css";

export const Route = createFileRoute("/hub/")({
  validateSearch: (search): { signin?: "failed" } => ({
    signin: search.signin === "failed" ? "failed" : undefined,
  }),
  beforeLoad: async ({ search }) => {
    const viewer = await getViewer();
    if (viewer?.hubSlug && !search.signin) {
      throw redirect({ to: "/hub/$slug", params: { slug: viewer.hubSlug } });
    }
  },
  head: () => ({
    meta: [
      { title: "Hub - TI4 Lab" },
      { name: "description", content: "Keep your group's TI4 drafts and slice sets on one shareable page." },
    ],
  }),
  component: HubLanding,
});

// A made-up season for the illustration: finished games, then one in progress.
const SAMPLE = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.45, 0];

function HubLanding() {
  const { signin } = Route.useSearch();

  return (
    <div className={classes.page}>
      {signin === "failed" && (
        <Notice tone="danger" title="Discord sign-in didn't finish">
          You may have cancelled on Discord, or the link expired. Try signing in again.
        </Notice>
      )}
      <div className={classes.landing}>
        <div className={classes.landingText}>
          <h1 className={classes.landingTitle}>Your group’s games, in one place</h1>
          <p className={classes.landingLead}>
            Sign in with Discord to get a hub: every draft you run, how far along it is, and the slice sets you like to play again.
          </p>
          <ul className={classes.landingList}>
            <li>
              <IconCards />
              <span>Save slices from the draft builder under a name, find them by searching, and start a new draft from one in a click.</span>
            </li>
            <li>
              <IconFileImport />
              <span>Paste links to drafts you played before, and they join the record.</span>
            </li>
            <li>
              <IconShare />
              <span>Share the page with your table. Anyone can follow along; only you can change it.</span>
            </li>
          </ul>
          <ButtonAnchor href="/auth/discord" variant="discord" size="lg" icon={<IconBrandDiscordFilled />}>
            Sign in with Discord
          </ButtonAnchor>
        </div>
        <div className={classes.landingArt} aria-hidden>
          <div className={classes.hexes}>
            {SAMPLE.map((progress, idx) => (
              <span
                key={idx}
                className={cx(classes.hex, progress === 1 ? classes.hexDone : progress > 0 ? classes.hexLive : classes.hexIdle)}
                style={{ "--pct": `${progress * 100}%`, "--delay": `${idx * 45}ms` } as CSSProperties}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
