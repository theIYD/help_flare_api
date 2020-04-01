const mongoose = require("mongoose");
const Help = require("../models/Help");
const Helper = require("../models/Helper");

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
    type_of_help: req.body.helpType
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
      let helpsFound = await Help.find(query)
        .populate("helped_by")
        .select("group_name representative contact");
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

  if (userId) {
    try {
      const updateHelp = await Help.findOneAndUpdate(
        { _id: helpId },
        { $push: { helped_by: mongoose.Types.ObjectId(userId) } },
        { new: true }
      );

      const updateHelper = await Helper.findOneAndUpdate(
        { _id: userId },
        {
          $push: { helps: mongoose.Types.ObjectId(helpId) }
        },
        { new: true }
      );

      if (updateHelp && updateHelper) {
        res.status(200).json({
          error: 0,
          message: `Helper ${userId} was added for help ${helpId}`,
          help: updateHelp
        });
      }
    } catch (err) {
      next(err);
    }
  } else {
    res
      .status(403)
      .json({ error: 1, message: "It seems you are not logged in" });
  }
};
