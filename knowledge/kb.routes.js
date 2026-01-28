const express = require("express");
const router = express.Router();
const kbController = require("./kb.controller");
const { authorize } = require("../auth/auth.middleware");

// Admins and Agents can manage articles
router.post("/", authorize(["Admin", "Agent"]), kbController.createArticle);
router.get("/", kbController.getArticles);
router.get("/search", kbController.searchArticles);
router.put("/:id", authorize(["Admin", "Agent"]), kbController.updateArticle);
router.delete("/:id", authorize(["Admin"]), kbController.deleteArticle);

module.exports = router;
