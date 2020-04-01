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
  socket.on("new_report", async data => {
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
      let reportsFound = await Help.find(query);
      if (reportsFound) {
        io.emit("reports", reportsFound);
      }
    } catch (err) {
      console.log(err);
    }
  });
};
