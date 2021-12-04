const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redis_client = require("../redis_connection");
const sendMail = require("../helpers/mail");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email: email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "User with email already exist" });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });

    await user.save();
    const authToken = jwt.sign(
      { id: user._id, email: email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "20m" }
    );
    sendMail(email, authToken);

    return res.json({
      success: true,
      message: "Verification link send to email",
    });
  } catch (error) {
    return res.status(400).json({ success: false });
  }
};

const verify = async (req, res) => {
  const token = req.params.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const { email } = decoded;
    const user = await User.findOne({ email: email });

    if (!user) 
      throw "Incorrect verification link";

    if(user.user_verified)
    return res.json({success:true,message:"Account already verified"});

    user.user_verified=true;
    await user.save();
    return res.json({success:true,message:"Account Verified"});

  } catch (error) {
    return res.json({ success: false, message: "Verification link expired" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "email or password is incorrect",
      });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.json({ success: false, message: "Wrong password" });
    }

    if(!user.user_verified)
    throw "Account not verified";
    //signing access token
    const access_token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TIME }
    );

    const refresh_token = generateRefreshToken(user._id, user.email);
    return res.json({
      success: true,
      message: "Login success",
      data: { access_token, refresh_token },
    });
  } catch (error) {
    console.error(error);
    return res.json({success:false,error:error});
  }
};

const generateRefreshToken = (user_id, email) => {
  const refresh_token = jwt.sign(
    { id: user_id, email: email },
    process.env.JWT_REFRESH_SECRET
  );

  redis_client.set(user_id.toString(), refresh_token);

  return refresh_token;
};

const getAccessToken = (req, res) => {
  const user_id = req.userData.id;
  const email = req.userData.email;
  const access_token = jwt.sign(
    { id: user_id, email: email },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_TIME,
    }
  );
  const refresh_token = generateRefreshToken(user_id, email);
  return res.json({
    success: true,
    message: "Generated access token",
    data: { access_token, refresh_token },
  });
};

const logout = async (req, res) => {
  const user_id = req.userData.id;
  const access_token = req.header("Authorization").split(" ")[1];

  await redis_client.del(user_id.toString());
  await redis_client.setex("BL_" + access_token, process.env.JWT_BLOCK_TIME, 1);
  return res.json({ success: true, message: "Logged out successfully" });
};

module.exports = {
  register,
  verify,
  login,
  getAccessToken,
  logout,
};
