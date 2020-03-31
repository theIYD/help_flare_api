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
      res
        .status(201)
        .json({
          error: 0,
          message: "Thank you for reporting",
          helpId: helpInstance._id
        });
    }
  } catch (err) {
    next(err);
  }
};
