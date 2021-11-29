const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
