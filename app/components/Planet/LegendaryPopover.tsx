import { Popover, Text, Title } from "@mantine/core";
import { ReactNode, useState } from "react";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function LegendaryPopover({ children, title, description }: Props) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="top"
      withArrow
      width={300}
    >
      <Popover.Target>
        <div
          onMouseEnter={() => setOpened(true)}
          onMouseLeave={() => setOpened(false)}
          style={{ display: "inline-block" }}
        >
          {children}
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        {title && (
          <Title order={6} mb={4}>
            {title}
          </Title>
        )}
        {description && <Text size="sm">{description}</Text>}
      </Popover.Dropdown>
    </Popover>
  );
}
