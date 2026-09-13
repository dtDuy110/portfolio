import test from "node:test";
import assert from "node:assert/strict";
import { parseRoute } from "../src/ui/ExplorerTools.js";
const data = { projects: [{ id: "spacetracker" }] };
test("share routes validate destinations and project IDs", () => {
  assert.deepEqual(parseRoute("#/neptune/spacetracker", data), { planet: "neptune", item: "spacetracker" });
  assert.deepEqual(parseRoute("#/neptune/unknown", data), { planet: "neptune", item: null });
  assert.equal(parseRoute("#/unknown", data), null);
  assert.equal(parseRoute("#/%ZZ", data), null);
});
