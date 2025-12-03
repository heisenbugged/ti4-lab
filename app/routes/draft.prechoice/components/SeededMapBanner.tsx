import { Alert, Text } from "@mantine/core";
import { IconMap } from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { decodeSeededMapData } from "~/mapgen/utils/mapToDraft";
import { useDraftSetup } from "../store";

export function SeededMapBanner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const map = useDraftSetup((state) => state.map);

  const mapSlicesString = searchParams.get("mapSlices");
  if (!mapSlicesString) return null;

  const seededMapData = decodeSeededMapData(mapSlicesString);
  if (!seededMapData) return null;

  // Check if current map type is compatible with seeded data
  const isCompatible = seededMapData.compatibleDraftTypes.includes(
    map.selectedMapType,
  );
  if (!isCompatible) return null;

  const sliceCount = seededMapData.slices.length;
  const systemCount = seededMapData.slices.reduce(
    (sum, slice) => sum + slice.length,
    0,
  );

  const handleClose = () => {
    // Remove mapSlices and draftType from URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("mapSlices");
    newParams.delete("draftType");
    navigate(`/draft/prechoice?${newParams.toString()}`, { replace: true });
  };

  return (
    <Alert
      variant="light"
      color="teal"
      title="Slices Pre-seeded from Map Generator"
      icon={<IconMap />}
      withCloseButton
      onClose={handleClose}
    >
      <Text size="sm">
        {sliceCount} slices with {systemCount} total systems have been imported
        from your generated map. You can customize faction settings, player
        names, and other options below. Changing to an incompatible map type
        will ignore these pre-seeded slices.
      </Text>
    </Alert>
  );
}
