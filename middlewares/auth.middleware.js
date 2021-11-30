const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1];
  if (!token) {
    //No token received
    return res.json({ success: false, message: "Not valid session" });
  }
  try {
    const decodedData = jwt.verify(token, JWT_ACCESS_SECRET);
    req.userData = decodedData;
    next();
  } catch (error) {
    return res.json({ success: false, message: "Not valid session" });
  }
};

module.exports = {
  verifyToken,
};
