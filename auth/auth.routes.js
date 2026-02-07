const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { authorize } = require("./auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/change-password", authorize(), authController.changePassword);

module.exports = router;
