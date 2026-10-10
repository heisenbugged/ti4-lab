import { useState, useEffect, useRef } from "react";
import { cx } from "~/ui";
import classes from "./AnimatedText.module.css";

interface Props {
  text: string;
  className?: string;
}

interface TextItem {
  text: string;
  key: number;
  state: "entering" | "active" | "exiting";
}

/** One line of text that slides the old value out and the new one in. Long text ends in an ellipsis. */
export function AnimatedText({ text, className }: Props) {
  const keyRef = useRef(0);
  const [items, setItems] = useState<TextItem[]>(() => [
    { text, key: keyRef.current, state: "active" },
  ]);

  useEffect(() => {
    if (text === items.find((i) => i.state !== "exiting")?.text) return;

    keyRef.current += 1;
    const newKey = keyRef.current;

    // Mark current items as exiting, add new item as entering
    setItems((prev) => [
      ...prev.map((item) =>
        item.state !== "exiting" ? { ...item, state: "exiting" as const } : item,
      ),
      { text, key: newKey, state: "entering" },
    ]);

    // Transition entering to active
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setItems((prev) =>
          prev.map((item) =>
            item.key === newKey ? { ...item, state: "active" } : item,
          ),
        );
      });
    });

    // Remove exited items after animation
    const timeout = setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.state !== "exiting"));
    }, 500);

    return () => clearTimeout(timeout);
  }, [text]);

  return (
    <span className={cx(classes.wrapper, className)} style={{ display: "block" }}>
      {items.map((item) => (
        <span
          key={item.key}
          className={cx(classes.item, classes[item.state])}
          style={{ display: "block" }}
          title={item.text}
          aria-hidden={item.state === "exiting" || undefined}
        >
          {item.text}
        </span>
      ))}
    </span>
  );
}
