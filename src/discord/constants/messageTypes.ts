export const MESSAGE_TYPE = {
  SUMMARY: 0,
  LAST_PICK: 1,
  NEXT_PLAYER: 2,
} as const;

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
