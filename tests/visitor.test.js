import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { VisitorShip } from "../src/systems/VisitorShip.js";
import { createFlightPath } from "../src/systems/FlightPath.js";

test("flight route clears a central obstacle and retains exact endpoints", () => {
  const start = new THREE.Vector3(-12, 0, 0);
  const end = new THREE.Vector3(12, 0, 0);
  const curve = createFlightPath(start, end, [
    { position: new THREE.Vector3(), radius: 7 },
  ]);
  assert.ok(curve.getPointAt(0).distanceTo(start) < 1e-8);
  assert.ok(curve.getPointAt(1).distanceTo(end) < 1e-8);
  assert.ok(curve.getPoints(400).every((p) => p.length() >= 7));
});

test("managed flight only advances from camera progress, and clears effects on arrival", () => {
  const ship = new VisitorShip(new THREE.Scene(), { reduced: false });
  ship.managed = true;
  ship.visit(
    { position: new THREE.Vector3(15, 0, 0), radius: 2, focusRadius: 5 },
    2.6,
  );
  const start = ship.group.position.clone();
  ship.update(0.5);
  assert.deepEqual(ship.group.position, start);
  ship.seek(0.5);
  assert.ok(ship.group.position.distanceTo(start) > 1);
  assert.equal(ship.trail.visible, true);
  ship.seek(1);
  assert.equal(ship.flight, null);
  assert.equal(ship.trail.visible, false);
  assert.equal(ship.route.visible, false);
});

test("changing destinations during flight continues from the current location and returns home", () => {
  const ship = new VisitorShip(new THREE.Scene(), { reduced: false });
  const planet = {
    position: new THREE.Vector3(15, 0, 0),
    radius: 2,
    focusRadius: 5,
  };
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
  const planet = {
    position: new THREE.Vector3(12, 0, 0),
    radius: 2,
    focusRadius: 5,
  };
  ship.visit(planet, 1.2);
  assert.equal(ship.flight, null);
  assert.ok(
    ship.group.position.distanceTo(planet.position) > planet.focusRadius,
  );
  ship.update(1);
  assert.equal(ship.model.position.y, 0);
  ship.back();
  assert.deepEqual(ship.group.position, ship.home);
});
