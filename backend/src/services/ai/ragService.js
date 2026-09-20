const normalize = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const stem = (word = "") =>
  word.replace(/(ing|ed|es|s)$/i, "");

export const rankChunks = (chunks = [], query = "") => {
  const terms = [...new Set(normalize(query))];

  return chunks
    .map((chunk) => {
      const text = chunk.text || "";
      const words = normalize(text);
      const score = terms.reduce((sum, term) => {
        const termStem = stem(term);
        const matched = words.some((word) => {
          const wordStem = stem(word);
          return (
            word === term ||
            word.startsWith(term) ||
            term.startsWith(word) ||
            wordStem === termStem ||
            word.includes(term) ||
            term.includes(word)
          );
        });
        return sum + (matched ? 5 : 0);
      }, 0);
      return { ...chunk, score };
    })
    .sort((a, b) => b.score - a.score);
};

export const buildRetrievalContext = (messages = [], query = "", limit = 3) => {
  const chunks = messages
    .filter((message) => message.text && message.text.trim())
    .map((message) => ({
      id: message._id || `${message.senderId}-${message.createdAt || Date.now()}`,
      text: message.text.trim(),
      senderId: message.senderId,
    }));

  const ranked = rankChunks(chunks, query).slice(0, limit);

  return ranked.map(({ text, senderId }) => `[${senderId}] ${text}`);
};
