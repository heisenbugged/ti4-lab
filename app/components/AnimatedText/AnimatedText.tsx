import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Text } from "@mantine/core";
import "./AnimatedText.css";

interface Props {
  text: string;
}

interface TextItem {
  text: string;
  key: number;
  state: "entering" | "active" | "exiting";
}

export function AnimatedText({ text }: Props) {
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
        item.state !== "exiting" ? { ...item, state: "exiting" as const } : item
      ),
      { text, key: newKey, state: "entering" },
    ]);

    // Transition entering to active
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setItems((prev) =>
          prev.map((item) =>
            item.key === newKey ? { ...item, state: "active" } : item
          )
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
    <div className="fading-text-wrapper">
      {items.map((item) => (
        <div
          key={item.key}
          className={`fade-item fade-${item.state}`}
        >
          <Text
            className="fading-text"
            fw={600}
            size="xl"
            ff="heading"
            tt="uppercase"
          >
            {item.text}
          </Text>
        </div>
      ))}
    </div>
  );
}
