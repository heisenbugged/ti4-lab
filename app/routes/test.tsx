import { Box } from "@mantine/core";

export default function Test() {
  return (
    <Box
      mt="lg"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "var(--mantine-spacing-md)",
      }}
    >
      <div>asd</div>
      <div>asd</div>
    </Box>
  );
}
