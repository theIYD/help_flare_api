const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const helperSchema = new Schema(
  {
    group_name: {
      type: String,
      required: true
    },
    representative: {
      type: String,
      required: true
    },
    contact: {
      type: String,
      required: true
    },
    locality: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    password: {
      type: String,
      required: true
    },
    social_service: {
      type: String,
      required: false
    }
  },
  {
    timestamps: {
      createdAt: "created_at"
    }
  }
);

module.exports = mongoose.model("Helper", helperSchema, "helpers");
