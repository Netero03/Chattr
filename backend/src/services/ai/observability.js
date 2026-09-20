const counters = new Map();

const increment = (name) => {
  counters.set(name, (counters.get(name) || 0) + 1);
};

export const recordAIMetric = ({ event, feature, durationMs, error, usage }) => {
  increment(`ai.${event}`);
  if (feature) increment(`ai.${feature}.${event}`);

  const payload = {
    event: `ai.${event}`,
    feature,
    durationMs,
    error: error?.message,
    usage,
    at: new Date().toISOString(),
  };
  console.info(JSON.stringify(payload));
};

export const getAIMetrics = () => Object.fromEntries(counters);