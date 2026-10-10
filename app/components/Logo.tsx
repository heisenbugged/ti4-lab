import classes from "./Logo.module.css";

export function Logo() {
  return (
    <span className={classes.logo}>
      <img src="/logo.webp" width={26} height={26} alt="" />
      <span>TI4 Lab</span>
    </span>
  );
}
