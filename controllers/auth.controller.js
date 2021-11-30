const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
  console.log("entered");
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
    //signing refresh token
    const refresh_token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET
    );
    return res.json({
      success: true,
      message: "Login success",
      data: { access_token, refresh_token },
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  register,
  login,
};
