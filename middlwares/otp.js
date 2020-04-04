const dotenv = require("dotenv").config();
const AWS = require("aws-sdk");
const OTP = require("automatic-otp");

const snsConfig = new AWS.SNS({
  accessKeyId: process.env.S3_ACCESSKEY,
  secretAccessKey: process.env.S3_SECRETKEY,
  region: process.env.S3_REGION,
  apiVersion: "2010-03-31"
});

const sendOTP = async data => {
  const otp = new OTP();

  let generatedOTP = otp.generate(6, {
    digits: true,
    specialCharacters: false,
    alphabetToUpperCase: false,
    alphabet: false
  });

  let params = {
    Message: `Your One-Time Password for COVID app is ${generatedOTP.token}`,
    PhoneNumber: data.phone
  };

  // Send sms
  try {
    const publishSMS = await snsConfig.publish(params).promise();
    if (publishSMS) {
      if (publishSMS.MessageId) {
        return { success: true, otp: generatedOTP.token };
      } else return { success: false, otp: null };
    }
  } catch (err) {
    console.log(err);
  }
};

const otpConfirmed = async data => {
  let params = {
    Message: data.message,
    PhoneNumber: data.phone
  };

  // Send sms
  try {
    const publishSMS = await snsConfig.publish(params).promise();
    if (publishSMS) {
      if (publishSMS.MessageId) {
        return { success: true };
      } else return { success: false };
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendOTP, otpConfirmed };
