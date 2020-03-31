const bcrypt = require("bcryptjs");

const Helper = require("../models/Helper");

const { createAccessToken, sendAccessToken } = require("../middlwares/token");

// Registeration of a helper
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

// Login
exports.login = async (req, res, next) => {
  const { phone, password } = req.body;

  try {
    if (phone && password) {
      const user = await Helper.findOne({ contact: phone });
      if (user) {
        let isPasswordEqual = await bcrypt.compare(password, user.password);
        if (isPasswordEqual) {
          const accessToken = createAccessToken({
            userId: user._id
          });

          sendAccessToken(req, res, accessToken);
        } else {
          return res
            .status(200)
            .json({ error: 1, message: "Password is invalid" });
        }
      } else {
        res.status(200).json({ error: 0, message: "User not found" });
      }
    } else {
      res.status(200).json({ error: 1, message: "Phone/Password is missing" });
    }
  } catch (err) {
    next(err);
  }
};
