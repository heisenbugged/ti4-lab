import {
  IconHexagons,
  IconArrowsShuffle,
  IconScale,
  IconTopologyComplex,
  IconCircleDot,
  IconLayoutGrid,
} from "@tabler/icons-react";
import { ChoosableDraftType } from "../maps";
import styles from "./DraftFormatDescription.module.css";
import clsx from "clsx";

type Feature = {
  icon: "slices" | "equidistant" | "balanced" | "wormholes" | "nucleus" | "compact";
  label: string;
};

export type DraftFormatDescriptionData = {
  tagline: string;
  description: string;
  features: Feature[];
};

type Props = {
  mapType: ChoosableDraftType;
  data: DraftFormatDescriptionData;
  title: string;
};

const ICONS = {
  slices: IconHexagons,
  equidistant: IconArrowsShuffle,
  balanced: IconScale,
  wormholes: IconTopologyComplex,
  nucleus: IconCircleDot,
  compact: IconLayoutGrid,
};

function getVariantClass(mapType: ChoosableDraftType): string {
  if (mapType.startsWith("miltyeq")) return styles.miltyeq;
  if (mapType.startsWith("milty")) return styles.milty;
  if (mapType.startsWith("heisen")) return styles.nucleus;
  if (mapType === "std4p") return styles.small;
  return "";
}

export function DraftFormatDescription({ mapType, data, title }: Props) {
  const variantClass = getVariantClass(mapType);

  return (
    <div className={clsx(styles.container, variantClass)}>
      <div className={styles.header}>
        <span className={styles.formatTitle}>{title}</span>
      </div>
      <div className={styles.content}>
        <p className={styles.description}>{data.description}</p>
        <div className={styles.featuresGrid}>
          {data.features.map((feature, idx) => {
            const Icon = ICONS[feature.icon];
            return (
              <div key={idx} className={styles.featureItem}>
                <Icon size={12} className={styles.featureIcon} />
                <span>{feature.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
