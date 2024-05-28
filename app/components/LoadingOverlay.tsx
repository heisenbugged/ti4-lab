import { Flex } from "@mantine/core";
import { Commet } from "react-loading-indicators";

export function LoadingOverlay() {
  return (
    <Flex w="100%" h="calc(100vh - 60px)" align="center" justify="center">
      <Commet color="#5a73ae" textColor="#5a73ae" size="large" />
    </Flex>
  );
}
