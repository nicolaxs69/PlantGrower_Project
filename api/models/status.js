const mongoose = require("mongoose");

const plantStatusSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    soil: { type: Number, required: true },
    light: { type: Number, required: true },
    temp: { type: Number, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PlantStatus", plantStatusSchema);
