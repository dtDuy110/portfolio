import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { VisitorShip } from "../src/systems/VisitorShip.js";

test("changing destinations during flight continues from the current location and returns home", () => {
  const ship = new VisitorShip(new THREE.Scene(), { reduced: false });
  const planet = { position: new THREE.Vector3(15, 0, 0), radius: 2, focusRadius: 5 };
  ship.visit(planet, 1.2);
  ship.update(0.4);
  const current = ship.group.position.clone();
  ship.visit({ ...planet, position: new THREE.Vector3(-12, 0, 0) }, 1.2);
  assert.ok(ship.flight.curve.getPointAt(0).distanceTo(current) < 1e-8);
  ship.update(1.2);
  assert.equal(ship.flight, null);
  ship.back();
  ship.update(1.2);
  assert.ok(ship.group.position.distanceTo(ship.home) < 1e-8);
});

test("reduced motion reaches a destination immediately without hover animation", () => {
  const ship = new VisitorShip(new THREE.Scene(), { reduced: true });
  const planet = { position: new THREE.Vector3(12, 0, 0), radius: 2, focusRadius: 5 };
  ship.visit(planet, 1.2);
  assert.equal(ship.flight, null);
  assert.ok(ship.group.position.distanceTo(planet.position) > planet.focusRadius);
  ship.update(1);
  assert.equal(ship.model.position.y, 0);
  ship.back();
  assert.deepEqual(ship.group.position, ship.home);
});
