import { eq } from "drizzle-orm";
import { mapStringOrder } from "~/data/mapStringOrder";
import { draftConfig } from "~/draft";
import { db } from "~/drizzle/config.server";
import { findDrafts } from "~/drizzle/draft.server";
import { drafts } from "~/drizzle/schema.server";
import {
  DiscordData,
  Draft,
  DraftSelection,
  DraftSlice,
  TileRef,
} from "~/types";

async function migrateState() {
  const records = await findDrafts();
  records.forEach(async (draft) => {
    const rawData = JSON.parse(draft.data as string);
    if (rawData["mapString"] === undefined) {
      console.log("new draft, so skipping");
      return;
    }

    const config = draftConfig[rawData.mapType];
    let mapString = rawData.mapString.split(" ");
    // normalize to add mecatol
    if (mapString[0] !== "18") {
      mapString = ["18", ...mapString];
    }
    const presetMap: TileRef[] = mapString.map((id, idx) => {
      if (id === "18") {
        return {
          idx,
          type: "SYSTEM",
          position: mapStringOrder[idx],
          systemId: "18",
        };
      }

      const seatIdx = config.homeIdxInMapString.indexOf(idx);
      if (seatIdx > -1) {
        return {
          idx,
          type: "HOME",
          position: mapStringOrder[idx],
          seat: seatIdx,
        };
      }

      if (id === "0") {
        return {
          idx,
          type: "OPEN",
          position: mapStringOrder[idx],
        };
      }

      return {
        idx,
        type: "SYSTEM",
        position: mapStringOrder[idx],
        systemId: id,
      };
    });

    const slices = rawData.slices.map((slice, idx) => {
      const sliceData = slice.map((id, idx) => {
        if (id === -1) {
          return {
            idx,
            type: "HOME" as const,
            position: config.seatTilePositions[idx],
          };
        }

        return {
          idx,
          type: "SYSTEM" as const,
          systemId: id.toString(),
          position: config.seatTilePositions[idx],
        };
      });

      const objSlice: DraftSlice = {
        name: `Slice ${idx + 1}`,
        tiles: sliceData,
      };
      return objSlice;
    });

    const selections: DraftSelection[] = [];
    const playersCopy = rawData.players.map((p) => ({ ...p }));
    for (let i = 0; i < rawData.currentPick; i++) {
      const player = playersCopy.find((p) => p.id === rawData.pickOrder[i]);
      // TODO: Check if drafting speaker order
      if (rawData.draftSpeaker && player?.speakerOrder !== undefined) {
        selections.push({
          type: "SELECT_SPEAKER_ORDER",
          playerId: player.id,
          speakerOrder: player.speakerOrder,
        });
        player.speakerOrder = undefined;
        continue;
      }

      if (player?.faction) {
        selections.push({
          type: "SELECT_FACTION",
          playerId: player.id,
          factionId: player.faction,
        });
        player.faction = undefined;
        continue;
      }

      if (player?.sliceIdx !== undefined) {
        selections.push({
          type: "SELECT_SLICE",
          playerId: player.id,
          sliceIdx: player.sliceIdx,
        });
        player.sliceIdx = undefined;
        continue;
      }

      if (player?.seatIdx !== undefined) {
        selections.push({
          type: "SELECT_SEAT",
          playerId: player.id,
          seatIdx: player.seatIdx,
        });
        player.seatIdx = undefined;
        continue;
      }
    }

    let discordIntegration: DiscordData | undefined;
    const rawDiscordData = rawData.discordData;
    if (rawDiscordData) {
      discordIntegration = {
        channelId: rawDiscordData.channelId,
        guildId: rawDiscordData.guildId,
        players: rawDiscordData.players.map((rawPlayer, idx) => {
          if (rawPlayer.memberId !== undefined) {
            return {
              type: "identified",
              playerId: idx,
              memberId: rawPlayer.memberId,
              nickname: rawPlayer.name,
              username: rawPlayer.name,
            };
          }
          return {
            type: "unidentified",
            playerId: idx,
            name: rawPlayer.name,
          };
        }),
      };
    }

    const data: Draft = {
      settings: {
        gameSets: ["base", "pok"],
        allowEmptyTiles: false,
        allowHomePlanetSearch: true,
        draftSpeaker: rawData.draftSpeaker,
        numFactions: rawData.factions.length,
        numSlices: rawData.slices.length,
        type: rawData.mapType,
        randomizeMap: true,
        randomizeSlices: true,
      },
      availableFactions: rawData.factions,
      integrations: {
        discord: discordIntegration,
      },
      pickOrder: rawData.pickOrder,
      players: rawData.players.map((p) => ({ id: p.id, name: p.name })),
      presetMap,
      slices,
      selections,
    };

    console.log("updating draft", draft.id);
    console.log("new data");
    const newData = JSON.stringify(data);
    console.log(newData);
    await db
      .update(drafts)
      .set({ data: newData })
      .where(eq(drafts.id, draft.id))
      .run();

    console.log("draft updated");
  });
}

(async () => {
  await migrateState();
  console.log("done");
})();
