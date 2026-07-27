import { expect, test } from "vitest";
import { getSystemPool } from "./system";

test("getSystemPool includes LSCOI system IDs", () => {
    const systemPool = getSystemPool(["lscoi"]);

    expect(systemPool).toContain("6701");
    expect(systemPool).toContain("6714");
    expect(systemPool).not.toContain("6715");
    expect(systemPool.every((id) => /^67\d{2}$/.test(id))).toBe(true);
});
