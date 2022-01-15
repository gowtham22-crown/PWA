const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TranscribedSchema = new Schema(
  {
    tid: { type: String, unique: true },
    convertedFrom: {
      type: String,
    },
    convertedText: {
      type: String,
    },
    gid: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Transcribed = mongoose.model("Transcribed", TranscribedSchema);

module.exports = Transcribed;
