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
    },
    reported_by: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    type_of_help: {
      type: String,
      required: true
    }
  },
  {
    timestamps: {
      createdAt: "created_at"
    }
  }
);

module.exports = mongoose.model("Help", helpSchema, "helps");
