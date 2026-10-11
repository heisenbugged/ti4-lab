import { Bracket, PickButton, cx } from "~/ui";
import { FactionId } from "~/types";
import { ReferenceCardGrid } from "~/components/ReferenceCardGrid";
import { NewDraftReferenceCard } from "~/routes/draft/new/-components/NewDraftReferenceCard";
import classes from "./ReferenceCardSelectionGrid.module.css";

interface ReferenceCardSelectionGridProps {
  title: string;
  pack: FactionId[];
  selectedCard: string | undefined;
  canSelect: boolean;
  onSelectCard: (factionId: FactionId) => void;
  disabledCards?: FactionId[];
  /** Shown under a disabled card, e.g. why it can't be picked. */
  disabledNote?: string;
  pickForAnyone?: boolean;
  spectatorMode?: boolean;
}

export function ReferenceCardSelectionGrid({
  title,
  pack,
  selectedCard,
  canSelect,
  onSelectCard,
  disabledCards = [],
  disabledNote,
  pickForAnyone = false,
  spectatorMode = false,
}: ReferenceCardSelectionGridProps) {
  const canShowSelectedOverlay = !spectatorMode || pickForAnyone;

  return (
    <div className={classes.root}>
      {title && <h2 className={classes.title}>{title}</h2>}

      <ReferenceCardGrid
        pack={pack}
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing="lg"
        renderCard={(factionId, faction) => {
          const isSelected =
            selectedCard === factionId && canShowSelectedOverlay;
          const isDisabled = disabledCards.includes(factionId);
          const isClickable = canSelect && !isSelected && !isDisabled;

          return (
            <div
              className={cx(
                classes.item,
                isClickable && classes.clickable,
                isDisabled && classes.disabled,
                !isDisabled && !isSelected && !canSelect && classes.waiting,
              )}
              onClick={isClickable ? () => onSelectCard(factionId) : undefined}
            >
              <Bracket active={isSelected}>
                <NewDraftReferenceCard faction={faction} />
              </Bracket>
              <div className={classes.footer}>
                {isSelected ? (
                  <PickButton selected />
                ) : isClickable ? (
                  <PickButton
                    aria-label={`Select ${faction.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCard(factionId);
                    }}
                  >
                    Select
                  </PickButton>
                ) : isDisabled && disabledNote ? (
                  <span className={classes.note}>{disabledNote}</span>
                ) : null}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
