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

module.exports = {
  register,
};
