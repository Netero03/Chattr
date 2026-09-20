import mongoose from "mongoose";

const aiSuggestionCacheSchema = new mongoose.Schema(
  {
    threadId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    messageContextHash: { type: String, required: true },
    replies: { type: [String], default: [] },
    completion: { type: String, default: "" },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

aiSuggestionCacheSchema.index({ threadId: 1, messageContextHash: 1 }, { unique: true });

const AISuggestionCache = mongoose.model("AISuggestionCache", aiSuggestionCacheSchema);

export default AISuggestionCache;