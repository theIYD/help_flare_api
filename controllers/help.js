const mongoose = require("mongoose");
const Help = require("../models/Help");
const Helper = require("../models/Helper");

const { sendOTP, otpConfirmed } = require("../middlwares/otp");

// Report a help
exports.reportHelp = async (req, res, next) => {
  let coords = JSON.parse(req.body.area_coordinates);
  console.log(coords);
  let newHelp = {
    area: {
      coordinates: [coords],
      type: "Polygon"
    },
    reported_by: req.body.reported_by,
    phone: req.body.phone,
    type_of_help: JSON.parse(req.body.helpType),
    place: req.body.place,
    message: req.body.message
  };

  try {
    newHelp.area.coordinates[0].push([
      newHelp.area.coordinates[0][0][0],
      newHelp.area.coordinates[0][0][1]
    ]);
    let response = await sendOTP({ phone: req.body.phone });
    if (response.success) {
      newHelp.otp = response.otp;
      const helpInstance = new Help(newHelp);
      const saveHelpInstance = await helpInstance.save();

      if (saveHelpInstance) {
        res.status(201).json({
          error: 0,
          message: "Thank you for reporting",
          helpId: helpInstance._id
        });
      }
    } else {
      return res.status(500).json({
        error: 1,
        message: "OTP could not be generated. Try again"
      });
    }
  } catch (err) {
    next(err);
  }
};

// Get realtime reports on every connection
exports.getHelps = async (io, socket) => {
  console.log("New connection");
  socket.on("new_help", async (data) => {
    console.log(data);
    let query = {
      area: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [data.lat, data.lng].map(parseFloat)
          },
          $minDistance: 0,
          $maxDistance: 10000
        }
      },
      $not: { status: 2 },
      otp: { $exists: false }
    };

    try {
      let helpsFound = await Help.find(query).populate(
        "helped_by",
        "group_name representative contact"
      );
      if (helpsFound) {
        io.emit("helps", helpsFound);
      }
    } catch (err) {
      console.log(err);
    }
  });
};

// Help an area
exports.help = async (req, res, next) => {
  const { userId } = res.locals;
  const helpId = req.query.helpId;

  try {
    const findHelp = await Help.findOne({ _id: helpId });
    const findHelper = await Helper.findOne({ _id: userId });
    if (findHelp.status) {
      return res.status(200).json({
        error: 1,
        message: "Help is under delivery for this area."
      });
    } else if (findHelper.claims.length < 1) {
      const updateHelp = await Help.findOneAndUpdate(
        { _id: helpId },
        {
          $set: { status: 1 }
        },
        { new: true }
      );

      const updateHelper = await Helper.findOneAndUpdate(
        { _id: userId },
        {
          $push: { claims: mongoose.Types.ObjectId(helpId) }
        },
        { new: true }
      );

      if (updateHelp && updateHelper) {
        res.status(200).json({
          error: 0,
          message: `Helper was assigned the help.`,
          help: updateHelp
        });
      }
    } else {
      return res.status(200).json({
        error: 1,
        message: "Maximum one help can be claimed at a time"
      });
    }
  } catch (err) {
    next(err);
  }
};

// Help delivered for an area
exports.helpDone = async (req, res, next) => {
  const { userId } = res.locals;
  const { helpId } = req.query;

  if (!userId) {
    return res
      .status(403)
      .json({ error: 1, message: "It seems you are not logged in" });
  }

  if (helpId) {
    let photoUrl = `${process.env.S3_CF}/${req.file.key}`;
    if (photoUrl) {
      const updateHelpAfterDelivery = await Help.findOneAndUpdate(
        { _id: helpId },
        { $set: { status: 2 } },
        { new: true }
      );

      const updateHelper = await Helper.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            helps: {
              photo: photoUrl,
              helpId: mongoose.Types.ObjectId(helpId)
            }
          },
          $pull: { claims: mongoose.Types.ObjectId(helpId) }
        },
        { new: true }
      );

      if (updateHelpAfterDelivery && updateHelper) {
        return res
          .status(200)
          .json({ error: 0, message: "Help was delivered successfully!" });
      }
    }
  } else {
    return res.status(200).json({ error: 1, message: "HelpId was not found" });
  }
};
