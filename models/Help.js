const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const helpSchema = new Schema(
  {
    area: {
      coordinates: {
        type: [Array],
        required: true
      },
      type: {
        type: String,
        enum: ["Polygon"],
        required: true
      }
    }
  },
  {
    timestamps: {
      createdAt: "created_at"
    }
  }
);

module.exports = mongoose.model("Help", helpSchema, "helps");
