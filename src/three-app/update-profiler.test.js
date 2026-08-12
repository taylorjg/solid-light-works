import { describe, expect, it } from "vitest";
import { createUpdateProfiler } from "./update-profiler";

describe("createUpdateProfiler", () => {
  it("is a no-op when disabled", () => {
    const profiler = createUpdateProfiler(false);
    expect(() => {
      profiler.begin();
      profiler.end("Leaving");
    }).not.toThrow();
  });

  it("accepts samples when enabled", () => {
    const profiler = createUpdateProfiler(true);
    expect(() => {
      profiler.begin();
      profiler.end("Leaving");
    }).not.toThrow();
  });
});
