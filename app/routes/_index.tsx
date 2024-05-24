import { Box, Group, Text } from "@mantine/core";
import {
  redirect,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { Map } from "~/components/Map";
import { parseMapString } from "~/utils/map";

export const meta: MetaFunction = () => {
  return [
    { title: "TI4 Lab" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};

// Define the loader function to handle the redirect
export let loader: LoaderFunction = async () => {
  return redirect("/draft/new"); // Specify the path you want to redirect to
};

// Since this route only handles redirect, there's no need for a component
export default function Index() {
  return null;
}

// const mapString =
//   "30 43 37 61 62 68 64 42 75 49 65 25 44 66 36 28 47 19 0 24 39 0 79 33 0 32 46 0 74 23 0 35 26 0 38 73".split(
//     " ",
//   );
// const map = parseMapString(mapString);

// const PADDING = 25;
// export default function Index() {
//   return (
//     <Group style={{ height: "100vh", width: "100vw" }}>
//       <Box w="250" h="100%" bg="gray">
//         <Text>hi</Text>
//       </Box>
//       <Box
//         flex={1}
//         style={{
//           height: "100vh",
//           padding: PADDING,
//           position: "relative",
//         }}
//       >
//         <Map map={map} padding={PADDING} mode="create" id="map-explorer" />
//       </Box>
//     </Group>
//   );
// }
