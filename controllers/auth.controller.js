const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redis_client = require("../redis_connection");

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
    return res.json({ success: true, message: "User created", data: user });
  } catch (error) {
    return res.status(400).json({ success: false });
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

module.exports = {
  register,
  login,
};
