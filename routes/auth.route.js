const router = require("express").Router();
const { register, login, getAccessToken, logout} = require("../controllers/auth.controller");
const { verifyToken, verifyRefreshToken } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/token",verifyRefreshToken,getAccessToken);
router.get("/logout",verifyToken,logout);

module.exports = router;
