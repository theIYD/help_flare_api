const Help = require("../models/Help");

// Report a help
exports.reportHelp = async (req, res, next) => {
  let newHelp = {
    area: {
      coordinates: [req.body.area_coordinates],
      type: "Polygon"
    },
    reported_by: req.body.reported_by,
    phone: req.body.phone,
    type_of_help: req.body.help_type
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
exports.getReports = async (io, socket) => {
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
      let helpsFound = await Help.find(query);
      if (reportsFound) {
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
        { $push: { helped_by: userId } },
        { new: true }
      );

      if (updateHelp) {
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
