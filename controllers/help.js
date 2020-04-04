const mongoose = require("mongoose");
const Help = require("../models/Help");
const Helper = require("../models/Helper");

const { photo } = require("../middlwares/photoUpload");

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
    type_of_help: JSON.parse(req.body.helpType)
  };

  try {
    newHelp.area.coordinates[0].push([
      newHelp.area.coordinates[0][0][0],
      newHelp.area.coordinates[0][0][1]
    ]);

    const helpInstance = new Help(newHelp);
    const saveHelpInstance = await helpInstance.save();

    if (saveHelpInstance) {
      res.status(201).json({
        error: 0,
        message: "Thank you for reporting",
        helpId: helpInstance._id
      });
    }
  } catch (err) {
    next(err);
  }
};

// Get realtime reports on every connection
exports.getHelps = async (io, socket) => {
  console.log("New connection");
  socket.on("new_help", async data => {
    console.log(data);
    let query = {
      area: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [data.lat, data.lng].map(parseFloat)
          },
          $minDistance: 0,
          $maxDistance: 1000
        }
      }
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
    if (findHelp.status) {
      return res.status(200).json({
        error: 1,
        message: "Help is under delivery for this area."
      });
    } else {
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
    }
  } catch (err) {
    next(err);
  }
};

// Help delivered for an area
exports.helpDone = async (req, res, next) => {
  const { userId } = res.locals;
  const { helpId, lat, lng } = req.query;

  if (!userId) {
    return res
      .status(403)
      .json({ error: 1, message: "It seems you are not logged in" });
  }

  if (helpId) {
    const findHelp = await Help.findOne({
      area: {
        $geoIntersects: {
          $geometry: { type: "Point", coordinates: [lat, lng] }
        }
      }
    });

    let photoUrl = `${process.env.S3_CF}/${req.file.key}`;
    if (photoUrl) {
      let verifyHelp = findHelp._id.toString() === helpId;
      if (findHelp && verifyHelp) {
        const updateHelpAfterDelivery = await Help.findOneAndUpdate(
          { _id: helpId },
          {
            $set: { status: 0 },
            $push: { helped_by: mongoose.Types.ObjectId(userId) }
          },
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
      } else {
        return res.status(200).json({
          error: 1,
          message: "It seems you are not at the location"
        });
      }
    }
  } else {
    return res.status(200).json({ error: 1, message: "HelpId was not found" });
  }
};
