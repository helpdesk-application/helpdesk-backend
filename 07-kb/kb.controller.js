const axios = require("axios");

const KB_API = process.env.DB_API + "knowledge";
const CAT_API = process.env.DB_API + "knowledge/categories";

exports.createArticle = async (req, res) => {
  const { title, content, tags, category_id, visibility } = req.body;

  try {
    const response = await axios.post(KB_API, {
      title,
      content,
      tags: tags || [],
      category_id,
      visibility: visibility || "PUBLIC"
    });
    res.json({ message: "Article created", article: response.data.article });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getArticles = async (req, res) => {
  try {
    const response = await axios.get(KB_API);
    let articles = response.data;

    // Role-based filtering: Customers only see PUBLIC
    if (req.user.role === 'Customer') {
      articles = articles.filter(a => a.visibility !== 'INTERNAL');
    }

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchArticles = async (req, res) => {
  const { q } = req.query;
  try {
    const response = await axios.get(`${KB_API}/search?q=${encodeURIComponent(q)}`);
    let articles = response.data;

    // Role-based filtering: Customers only see PUBLIC
    if (req.user.role === 'Customer') {
      articles = articles.filter(a => a.visibility !== 'INTERNAL');
    }

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, visibility } = req.body;

  try {
    const response = await axios.patch(`${KB_API}/${id}`, { title, content, tags, visibility });
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
    await axios.delete(`${KB_API}/${id}`);
    res.json({ message: "Article deleted" });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const response = await axios.get(CAT_API);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name, description, icon } = req.body;
  try {
    const response = await axios.post(CAT_API, { name, description, icon });
    res.status(201).json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
