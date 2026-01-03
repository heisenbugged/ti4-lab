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

export default function Draft() {
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
    { title: "TI4 Lab Draft" },
    { name: "description", content: "TI4 Lab, for drafting and map creation." },
  ];
};
