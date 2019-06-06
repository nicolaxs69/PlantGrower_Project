const mongoose = require("mongoose");

const plantStatusSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    moisture: { type: Number, required: true },
    humidity: { type: Number, required: true },
    temperature: { type: Number, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PlantStatus", plantStatusSchema);
