const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { authorize } = require("../auth/auth.middleware");

// Admin-only routes
router.post("/", authorize(["Admin"]), userController.createUser);
router.get("/", authorize(["Admin"]), userController.getUsers);
router.put("/:id", authorize(["Admin"]), userController.updateUser);
router.patch("/:id/status", authorize(["Admin"]), userController.changeStatus);
router.post("/:id/reset-password", authorize(["Admin"]), userController.resetPassword);

router.delete("/:id", authorize(["Admin"]), userController.deleteUser);

module.exports = router;
