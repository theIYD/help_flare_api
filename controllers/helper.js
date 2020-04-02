const bcrypt = require("bcryptjs");

const Helper = require("../models/Helper");

const { createAccessToken, sendAccessToken } = require("../middlwares/token");

// Registeration of a helper
exports.registerHelper = async (req, res, next) => {
  const {
    group_name,
    representative,
    phone,
    password,
    social_service
  } = req.body;

  let { locality } = req.body;

  try {
    const findHelper = await Helper.findOne({ contact: phone });
    if (findHelper) {
      return res
        .status(200)
        .json({ error: 1, message: "Phone number is already registered" });
    } else {
      locality = JSON.parse(locality);
      let helper = {
        group_name,
        representative,
        contact: phone,
        locality: {}
      };

      if (social_service) {
        helper["social_service"] = JSON.parse(social_service);
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
            res
              .status(201)
              .json({ error: 0, message: "Helper was registered" });
          }
        }
      } else {
        res
          .status(200)
          .json({ error: 1, message: "Missing locality lat and lng" });
      }
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
        res.status(200).json({ error: 1, message: "User not found" });
      }
    } else {
      res.status(200).json({ error: 1, message: "Phone/Password is missing" });
    }
  } catch (err) {
    next(err);
  }
};

// Profile route
exports.profile = async (req, res, next) => {
  const { userId } = res.locals;

  try {
    const helper = await Helper.findOne({ _id: userId }).populate({
      path: "helps.helpId",
      select: "-helped_by"
    });
    if (helper) {
      let {
        group_name,
        representative,
        contact,
        locality,
        social_service,
        helps
      } = helper;

      if (social_service) {
        return res.status(200).json({
          error: 0,
          helper: {
            group_name,
            representative,
            contact,
            locality,
            social_service,
            helps
          }
        });
      } else {
        return res.status(200).json({
          error: 0,
          helper: {
            group_name,
            representative,
            contact,
            locality,
            helps
          }
        });
      }
    }
  } catch (err) {
    next(err);
  }
};
