const mongoose = require("mongoose");

const plantImageSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    image: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("plantImage", plantImageSchema);
