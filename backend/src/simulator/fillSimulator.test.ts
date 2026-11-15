
import { test } from "node:test";
import assert from "node:assert/strict";
import { simulateFillLevel } from "./fillSimulator";

test("increases fill level correctly", () => {
    assert.equal(simulateFillLevel(20, 5), 25);
});

test("does not exceed 100 percent", () => {
    assert.equal(simulateFillLevel(90, 15), 100);
});

test("keeps full bins at 100 percent", () => {
    assert.equal(simulateFillLevel(100, 5), 100);
});

test("handles zero waste generation", () => {
    assert.equal(simulateFillLevel(40, 0), 40);
});
