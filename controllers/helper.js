const bcrypt = require("bcryptjs");
const OTP = require("automatic-otp");

const Helper = require("../models/Helper");

const { createAccessToken, sendAccessToken } = require("../middlwares/token");
const { sendOTP, otpConfirmed } = require("../middlwares/otp");

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
        helper.locality.place = locality.place;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);
        if (hashedPassword) {
          helper.password = hashedPassword;
          let response = await sendOTP({ phone: helper.contact });
          if (response.success) {
            helper.otp = response.otp;
            const helperInstance = new Helper(helper);
            const saveHelperInstance = await helperInstance.save();
            if (saveHelperInstance) {
              res
                .status(201)
                .json({ error: 0, message: "Helper was registered" });
            }
          } else {
            return res.status(500).json({
              error: 1,
              message: "OTP could not be generated. Try again"
            });
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

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  const { otp } = req.body;
  if (otp) {
    try {
      const findHelper = await Helper.findOne({ otp });
      if (!findHelper.isVerified) {
        findHelper.isVerified = true;
        findHelper.otp = undefined;
        const upgradeHelper = await findHelper.save();
        if (upgradeHelper) {
          const sendConfirmationMessage = await otpConfirmed({
            phone: findHelper.contact
          });
          res.status(200).json({ error: 0, message: "OTP verified" });
        }
      } else {
        res.status(200).json({ error: 0, message: "OTP already verified" });
      }
    } catch (err) {
      console.log(err);
    }
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
    const helper = await Helper.findOne({ _id: userId })
      .populate({
        path: "helps.helpId",
        select: "-helped_by"
      })
      .populate({ path: "claims", select: "-helped_by" });
    if (helper) {
      let {
        group_name,
        representative,
        contact,
        locality,
        social_service,
        helps,
        claims
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
            helps,
            claims
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
            helps,
            claims
          }
        });
      }
    }
  } catch (err) {
    next(err);
  }
};
