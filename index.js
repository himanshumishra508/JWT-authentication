const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

mongoose.connect(process.env.DB_CONNECTION_URI, () =>
  console.log("Connected to DB")
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
