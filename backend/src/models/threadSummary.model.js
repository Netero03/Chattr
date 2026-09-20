import mongoose from "mongoose";

const threadSummarySchema = new mongoose.Schema(
  {
    threadId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    summary: { type: String, required: true },
    keyPoints: { type: [String], default: [] },
    decisions: { type: [String], default: [] },
    openQuestions: { type: [String], default: [] },
    windowStart: { type: Date },
    windowEnd: { type: Date },
    model: { type: String, required: true },
  },
  { timestamps: true },
);

const ThreadSummary = mongoose.model("ThreadSummary", threadSummarySchema);

export default ThreadSummary;