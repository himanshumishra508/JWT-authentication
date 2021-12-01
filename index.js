const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const auth_route = require("./routes/auth.route");
const user_route = require("./routes/user.route");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(morgan("dev"));

mongoose.connect(process.env.DB_CONNECTION_URI, () =>
  console.log("Connected to DB")
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", auth_route);
app.use("/api/user", user_route);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
