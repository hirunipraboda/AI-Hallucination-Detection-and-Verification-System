const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    vote: {
      type: String,
      enum: ["helpful", "incorrect"],
      required: [true, "Vote is required"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
      required: [true, "Rating is required"],
    },
    category: {
      type: String,
      enum: ["accuracy", "relevance", "tone", "performance", "other"],
      default: "accuracy",
    },
    observation: {
      type: String,
      default: "",
      trim: true,
    },
    correction: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "applied", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);