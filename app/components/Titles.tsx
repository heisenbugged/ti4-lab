import type { HTMLAttributes } from "react";
import { cx } from "~/ui";
import classes from "./Titles.module.css";

type Props = { children: string } & HTMLAttributes<HTMLHeadingElement>;

const Slice = ({ children, className, ...rest }: Props) => (
  <h4 className={cx(classes.slice, className)} {...rest}>
    {children}
  </h4>
);

const Player = ({ children, className, ...rest }: Props) => (
  <h4 className={cx(classes.player, className)} {...rest}>
    {children}
  </h4>
);

export const Titles = {
  Slice,
  Player,
};
