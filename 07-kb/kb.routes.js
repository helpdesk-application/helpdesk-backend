const express = require("express");
const router = express.Router();
const kbController = require("./kb.controller");
const { authorize } = require("../01-auth/auth.middleware");

// Admins, Agents and Managers can manage articles
router.post("/", authorize(["Admin", "Super Admin", "Agent", "Manager"]), kbController.createArticle);
router.get("/", kbController.getArticles);
router.get("/categories", kbController.getCategories);
router.post("/categories", authorize(["Admin", "Super Admin", "Manager"]), kbController.createCategory);
router.get("/search", kbController.searchArticles);
router.patch("/:id", authorize(["Admin", "Super Admin", "Agent", "Manager"]), kbController.updateArticle);
router.delete("/:id", authorize(["Admin", "Super Admin"]), kbController.deleteArticle);

module.exports = router;
