import { MetaFunction } from "react-router";
import { Outlet } from "react-router";
import { useState } from "react";
import { MainAppShell } from "~/components/MainAppShell";
import { HeaderControls } from "~/components/HeaderControls";

export type DraftOrderContext = {
  adminMode: boolean;
  pickForAnyone: boolean;
  originalArt: boolean;
  accessibleColors: boolean;
  setAdminMode: (value: boolean) => void;
  setPickForAnyone: (value: boolean) => void;
  setOriginalArt: (value: boolean) => void;
  setAccessibleColors: (value: boolean) => void;
};

export default function LSGC4Index() {
  const [originalArt, setOriginalArt] = useState(false);
  const [accessibleColors, setAccessibleColors] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [pickForAnyone, setPickForAnyone] = useState(false);

  return (
    <MainAppShell
      headerRightSection={
        <HeaderControls
          accessibleColors={accessibleColors}
          onAccessibleColorsChange={setAccessibleColors}
        />
      }
    >
      <Outlet
        context={{
          adminMode,
          pickForAnyone,
          originalArt,
          accessibleColors,
          setAdminMode,
          setPickForAnyone,
          setOriginalArt,
          setAccessibleColors,
        }}
      />
    </MainAppShell>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "Lone Star Galactic Council Tournament" },
    {
      name: "description",
      content:
        "Draft tool for Lone Star Galactic Council Tournament. Create and manage tournament drafts and maps.",
    },
  ];
};
