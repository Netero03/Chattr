const MAX_INPUT_LENGTH = 4000;

export const validateAIInput = (value, name = "input") => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required.`);
  }
  if (value.length > MAX_INPUT_LENGTH) {
    throw new Error(`${name} is too long.`);
  }
  return value.trim();
};

export const redactSensitiveData = (value) =>
  value
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[redacted-email]")
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[redacted-number]");

export const parseJSON = (value, fallback) => {
  try {
    const fenced = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    return JSON.parse(fenced ? fenced[1] : value);
  } catch {
    return fallback;
  }
};