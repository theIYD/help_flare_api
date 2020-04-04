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
      },
      place: {
        type: String,
        required: false
      }
    },
    password: {
      type: String,
      required: true
    },
    social_service: {
      type: Array,
      required: false
    },
    helps: [
      {
        helpId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Help"
        },
        photo: String
      }
    ],
    claims: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Help",
        default: []
      }
    ],
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: String
    }
  },
  {
    timestamps: {
      createdAt: "created_at"
    }
  }
);

module.exports = mongoose.model("Helper", helperSchema, "helpers");
