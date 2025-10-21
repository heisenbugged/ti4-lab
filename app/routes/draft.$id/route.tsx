import { Outlet, useOutletContext } from "@remix-run/react";
import type { DraftOrderContext } from "../draft/route";

export default function DraftLayout() {
  const context = useOutletContext<DraftOrderContext>();
  return <Outlet context={context} />;
}
