import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapOptionalForeignKey } from "./clone-workspace-maps.ts";

describe("mapOptionalForeignKey", () => {
  it("returns null when oldId is null", () => {
    const idMap = new Map<string, string>([["a", "b"]]);
    assert.equal(mapOptionalForeignKey(null, idMap), null);
  });

  it("returns null when oldId is undefined", () => {
    const idMap = new Map<string, string>([["a", "b"]]);
    assert.equal(mapOptionalForeignKey(undefined, idMap), null);
  });

  it("returns null when oldId is missing from the map", () => {
    const idMap = new Map<string, string>([["a", "b"]]);
    assert.equal(mapOptionalForeignKey("unknown", idMap), null);
  });

  it("returns the mapped id when present", () => {
    const idMap = new Map<string, string>([
      ["old-cat", "new-cat"],
      ["old-tmpl", "new-tmpl"],
    ]);
    assert.equal(mapOptionalForeignKey("old-cat", idMap), "new-cat");
    assert.equal(mapOptionalForeignKey("old-tmpl", idMap), "new-tmpl");
  });
});
