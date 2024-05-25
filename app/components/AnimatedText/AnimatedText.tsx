import { useState, useEffect } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { DefaultMantineColor, StyleProp, Text } from "@mantine/core";
import "./AnimatedText.css";

interface Props {
  text: string;
  color: StyleProp<DefaultMantineColor> | undefined;
}

export function AnimatedText({ text, color }: Props) {
  const [currentText, setCurrentText] = useState(text);

  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  return (
    <TransitionGroup className="fading-text-wrapper">
      <CSSTransition
        key={text}
        timeout={{ enter: 1000, exit: 500 }}
        classNames="fade"
      >
        <Text
          className="fading-text"
          c={color}
          fw={600}
          size="22px"
          ff="heading"
          tt="uppercase"
        >
          {currentText}
        </Text>
      </CSSTransition>
    </TransitionGroup>
  );
}
