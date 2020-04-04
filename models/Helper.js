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
      type: Array,
      required: false
    },
    helps: [
      {
        helpId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Help"
        },
        photo: String,
        default: []
      }
    ],
    claims: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Help",
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

module.exports = mongoose.model("Helper", helperSchema, "helpers");
