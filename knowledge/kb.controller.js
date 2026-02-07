const axios = require("axios");

const DB_API = "http://localhost:5000/api/knowledge";

exports.createArticle = async (req, res) => {
  const { title, content, tags, category_id, visibility } = req.body;

  try {
    const response = await axios.post(DB_API, {
      title,
      content,
      tags: tags || [],
      category_id,
      visibility: visibility || "PUBLIC"
    });
    res.json({ message: "Article created", article: response.data }); // Response.data is the article object
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const response = await axios.get(DB_API);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchArticles = async (req, res) => {
  const { keyword } = req.query;
  try {
    const response = await axios.get(DB_API);
    const articles = response.data;

    // Search logic still relevant if DB service doesn't have search endpoint
    const results = articles.filter(a =>
      (a.title && a.title.toLowerCase().includes(keyword.toLowerCase())) ||
      (a.content && a.content.toLowerCase().includes(keyword.toLowerCase())) ||
      (a.tags && a.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())))
    );

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, visibility } = req.body;

  try {
    const response = await axios.patch(`${DB_API}/${id}`, { title, content, tags, visibility });
    res.json({ message: "Article updated", article: response.data.article });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteArticle = async (req, res) => {
  const { id } = req.params;

  try {
    await axios.delete(`${DB_API}/${id}`);
    res.json({ message: "Article deleted" });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(500).json({ error: err.message });
  }
};
