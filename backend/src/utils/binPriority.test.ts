import { test } from "node:test";
import assert from "node:assert/strict";
import { getBinPriority } from "./binPriority";

test("classifies low priority bins", () => {
    assert.equal(getBinPriority(0), "low");
    assert.equal(getBinPriority(30), "low");
});

test("classifies medium priority bins", () => {
    assert.equal(getBinPriority(31), "medium");
    assert.equal(getBinPriority(60), "medium");
});

test("classifies high priority bins", () => {
    assert.equal(getBinPriority(61), "high");
    assert.equal(getBinPriority(80), "high");
});

test("classifies critical priority bins", () => {
    assert.equal(getBinPriority(81), "critical");
    assert.equal(getBinPriority(100), "critical");
});