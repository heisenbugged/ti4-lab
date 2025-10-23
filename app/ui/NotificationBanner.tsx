import { ReactNode } from "react";
import { Stack, Text } from "@mantine/core";
import { PlayerColor } from "./types";
import classes from "./NotificationBanner.module.css";

export interface NotificationBannerProps {
  color: PlayerColor;
  title: string;
  subtitle?: string;
  position?: "fixed" | "relative";
  children?: ReactNode;
}

export function NotificationBanner({
  color,
  title,
  subtitle,
  position = "fixed",
  children,
}: NotificationBannerProps) {
  const colorClass = classes[color];
  const positionClass = position === "fixed" ? classes.fixed : classes.relative;

  return (
    <Stack
      gap={8}
      h="60px"
      align="center"
      justify="center"
      className={`${classes.banner} ${colorClass} ${positionClass}`}
    >
      {subtitle && (
        <Text
          className={`${classes.subtext} ${colorClass}`}
          px="lg"
          size="sm"
        >
          {subtitle}
        </Text>
      )}
      <Text fw="bold" size="lg">
        {title}
      </Text>
      {children}
    </Stack>
  );
}
