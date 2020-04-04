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
    place: {
      type: String,
      required: false
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
      type: Array,
      required: true
    },
    status: {
      type: Number,
      default: 0
    },
    helped_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Helper",
        default: []
      }
    ]
  },
  {
    timestamps: {
      createdAt: "created_at"
    }
  }
);

helpSchema.index({
  area: "2dsphere"
});

module.exports = mongoose.model("Help", helpSchema, "helps");
