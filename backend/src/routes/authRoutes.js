const router = require("express").Router();
const controller = require("../controllers/authController");
const { requireAuth } = require("../middlewares/authMiddleware");

router.post("/login", controller.login);
router.get("/session", controller.session);
router.post("/logout", controller.logout);
router.post("/change-password", requireAuth, controller.changePassword);

module.exports = router;
