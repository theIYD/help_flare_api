const { verify, sign } = require("jsonwebtoken");

// Verify Token
const verifyToken = async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1] || bearer[0];

    try {
      const decoded = await verify(bearerToken, process.env.JWT_SECRET);
      if (decoded) {
        for (let key in decoded.user) {
          res.locals[key] = decoded.user[key];
        }

        next();
      }
    } catch (err) {
      return res.status(401).json({ error: 1, message: "Token expired" });
    }
  } else {
    // Forbidden
    res
      .status(403)
      .json({ error: 1, message: "Token not found in the header" });
  }
};

const createAccessToken = user => {
  return sign({ user }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const sendAccessToken = (req, res, accessToken) => {
  res.status(200).json({ error: 0, accessToken });
};

module.exports = {
  verifyToken,
  createAccessToken,
  sendAccessToken
};
