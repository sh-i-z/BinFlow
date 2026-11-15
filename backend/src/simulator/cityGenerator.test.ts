
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateCityBins } from "./cityGenerator";

test("generates 100 bins by default", () => {
    const bins = generateCityBins();

    assert.equal(bins.length, 100);
});

test("generates the requested number of bins", () => {
    const bins = generateCityBins(25);

    assert.equal(bins.length, 25);
});

test("every bin has a unique name", () => {
    const bins = generateCityBins();

    const names = bins.map((bin) => bin.name);

    assert.equal(new Set(names).size, bins.length);
});

test("fill levels stay between 0 and 100", () => {
    const bins = generateCityBins();

    bins.forEach((bin) => {
        assert.ok(bin.fill_level >= 0);
        assert.ok(bin.fill_level <= 100);
    });
});

test("every bin has valid coordinates", () => {
    const bins = generateCityBins();

    bins.forEach((bin) => {
        assert.ok(bin.latitude >= -90 && bin.latitude <= 90);
        assert.ok(bin.longitude >= -180 && bin.longitude <= 180);
    });
});
