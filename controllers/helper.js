const bcrypt = require("bcryptjs");

const Helper = require("../models/Helper");

exports.registerHelper = async (req, res, next) => {
  const {
    group_name,
    representative,
    phone,
    locality,
    password,
    social_service
  } = req.body;

  try {
    let helper = {
      group_name,
      representative,
      contact: phone,
      locality: {}
    };

    if (social_service) {
      helper["social_service"] = social_service;
    }

    if (locality.lat && locality.lng) {
      helper.locality.lat = locality.lat;
      helper.locality.lng = locality.lng;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);
      if (hashedPassword) {
        helper.password = hashedPassword;
        const helperInstance = new Helper(helper);
        const saveHelperInstance = await helperInstance.save();
        if (saveHelperInstance) {
          res.status(201).json({ error: 0, message: "Helper was registered" });
        }
      }
    } else {
      res
        .status(200)
        .json({ error: 1, message: "Missing locality lat and lng" });
    }
  } catch (err) {
    next(err);
  }
};
