import classes from "./Slice.module.css";

type Props = {
  selected?: boolean;
  children: React.ReactNode;
  right?: React.ReactNode;
};

export function SliceHeader({ children, right }: Props) {
  return (
    <div className={classes.header}>
      <div className={classes.headerMain}>{children}</div>
      {right && <div className={classes.headerRight}>{right}</div>}
    </div>
  );
}
