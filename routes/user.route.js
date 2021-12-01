const router = require("express").Router();
const { dashboard } = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/dashboard", verifyToken, dashboard);

module.exports = router;
