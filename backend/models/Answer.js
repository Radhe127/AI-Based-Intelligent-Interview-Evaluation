const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    answer: { type: String, required: true },
    transcribedVoice: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Answer", AnswerSchema);
