const LOG_INTERVAL_MS = 2000;
const SAMPLE_WINDOW = 120;

const percentile = (sorted, p) => {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)
  );
  return sorted[index];
};

export const createUpdateProfiler = (enabled) => {
  if (!enabled) {
    return {
      begin: () => {},
      end: () => {},
    };
  }

  const samples = [];
  let lastLogMs = performance.now();

  const logStats = (installationName) => {
    if (samples.length === 0) {
      return;
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const median = percentile(sorted, 50);
    const p95 = percentile(sorted, 95);
    const label = installationName ? ` (${installationName})` : "";

    console.log(
      `[profile] updateRenderables${label}: median=${median.toFixed(3)}ms p95=${p95.toFixed(3)}ms n=${samples.length}`
    );

    samples.length = 0;
    lastLogMs = performance.now();
  };

  let pendingMs = 0;

  return {
    begin: () => {
      pendingMs = performance.now();
    },
    end: (installationName) => {
      const elapsed = performance.now() - pendingMs;
      samples.push(elapsed);
      if (samples.length > SAMPLE_WINDOW) {
        samples.shift();
      }

      if (performance.now() - lastLogMs >= LOG_INTERVAL_MS) {
        logStats(installationName);
      }
    },
  };
};
