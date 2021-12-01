const jwt = require("jsonwebtoken");
const redis_client = require("../redis_connection");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1];
  if (!token) {
    //No token received
    return res
      .status(401)
      .json({ success: false, message: "Not valid session" });
  }
  try {
    const decodedData = jwt.verify(token, JWT_ACCESS_SECRET);
    req.userData = decodedData;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not valid session" });
  }
};

const verifyRefreshToken = (req, res, next) => {
  const refresh_token = req.body.token;
  if (!refresh_token)
    return res
      .status(401)
      .json({ success: false, message: "Not valid session" });
  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    redis_client.get(decoded.id.toSting(), (err, data) => {
      if (err) throw err;

      //referesh token not in redis store
      if (!data)
        return res
          .status(401)
          .json({ success: false, message: "Not valid session" });
      //incorrect token
      if (data != refresh_token)
        return res
          .status(401)
          .json({ success: false, message: "Not valid session" });

      req.userData = decoded;
      next();
    });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not valid session" });
  }
};

module.exports = {
  verifyToken,
  verifyRefreshToken,
};
