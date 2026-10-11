import { IconMap } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import { decodeSeededMapData } from "~/mapgen/utils/mapToDraft";
import { Notice } from "~/ui";
import { useDraftSetup } from "../-store";

const prechoiceRoute = getRouteApi("/draft/prechoice");

export function SeededMapBanner() {
  const navigate = prechoiceRoute.useNavigate();
  const mapSlicesString = prechoiceRoute.useSearch({ select: (s) => s.mapSlices });
  const map = useDraftSetup((state) => state.map);

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
    navigate({
      search: (prev) => ({ ...prev, mapSlices: undefined, draftType: undefined }),
      replace: true,
    });
  };

  return (
    <Notice
      tone="success"
      title="Slices pre-seeded from Map Generator"
      icon={<IconMap size={18} />}
      onClose={handleClose}
    >
      {sliceCount} slices with {systemCount} total systems have been imported
      from your generated map. You can customize faction settings, player
      names, and other options below. Changing to an incompatible map type
      will ignore these pre-seeded slices.
    </Notice>
  );
}
