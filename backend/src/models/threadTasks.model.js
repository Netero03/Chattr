import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    task: { type: String, required: true },
    owner: { type: String, default: null },
    dueDate: { type: String, default: null },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
  },
  { _id: false },
);

const threadTasksSchema = new mongoose.Schema(
  {
    threadId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    tasks: { type: [taskSchema], default: [] },
    sourceRange: {
      windowStart: { type: Date },
      windowEnd: { type: Date },
    },
    model: { type: String, required: true },
  },
  { timestamps: true },
);

const ThreadTasks = mongoose.model("ThreadTasks", threadTasksSchema);

export default ThreadTasks;