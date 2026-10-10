import {
  IconHexagons,
  IconArrowsShuffle,
  IconScale,
  IconTopologyComplex,
  IconCircleDot,
  IconLayoutGrid,
} from "@tabler/icons-react";
import styles from "./DraftFormatDescription.module.css";

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
  /** Fade in when mounted (format switch only, not page load). */
  fadeIn?: boolean;
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

/** What the hovered or chosen style plays like, with four feature chips. */
export function DraftFormatDescription({ data, title, fadeIn = false }: Props) {
  return (
    <div className={fadeIn ? `${styles.desc} ui-fade-in` : styles.desc}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{data.description}</p>
      <ul className={styles.chips}>
        {data.features.map((feature, idx) => {
          const Icon = ICONS[feature.icon];
          return (
            <li key={idx}>
              <Icon size={15} />
              <span>{feature.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
