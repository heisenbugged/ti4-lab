import { Spinner } from "~/ui";
import classes from "./LoadingOverlay.module.css";

/** Full-page loading state. */
export function LoadingOverlay({ label }: { label?: string }) {
  return (
    <div className={classes.page}>
      <Spinner size={32} />
      {label && <span>{label}</span>}
    </div>
  );
}
