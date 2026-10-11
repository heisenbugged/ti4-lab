/**
 * Small runtime checks for server function input. Server functions are public
 * endpoints, so input is untrusted even though the client is typed.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function expectRecord(value: unknown, what = "input") {
  if (!isRecord(value)) throw new Error(`Expected ${what} to be an object`);
  return value;
}

export function expectString(value: unknown, what: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${what} is required`);
  }
  return value;
}

export function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export function expectNumber(value: unknown, what: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${what} must be a number`);
  }
  return value;
}

export function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
