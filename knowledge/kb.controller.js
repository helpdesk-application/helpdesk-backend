const { readJSON, writeJSON } = require("../utils/fileHandler");

const KB_FILE = "./knowledge/articles.json";

exports.createArticle = (req, res) => {
  const { title, content, tags } = req.body;
  const articles = readJSON(KB_FILE);

  const newArticle = {
    id: articles.length + 1,
    title,
    content,
    tags: tags || [],
    createdAt: new Date().toISOString()
  };

  articles.push(newArticle);
  writeJSON(KB_FILE, articles);
  res.json({ message: "Article created", article: newArticle });
};

exports.getArticles = (req, res) => {
  const articles = readJSON(KB_FILE);
  res.json(articles);
};

exports.searchArticles = (req, res) => {
  const { keyword } = req.query;
  const articles = readJSON(KB_FILE);

  const results = articles.filter(a =>
    a.title.toLowerCase().includes(keyword.toLowerCase()) ||
    a.content.toLowerCase().includes(keyword.toLowerCase()) ||
    a.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
  );

  res.json(results);
};

exports.updateArticle = (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;
  const articles = readJSON(KB_FILE);
  const article = articles.find(a => a.id == id);

  if (!article) return res.status(404).json({ message: "Article not found" });

  article.title = title || article.title;
  article.content = content || article.content;
  article.tags = tags || article.tags;

  writeJSON(KB_FILE, articles);
  res.json({ message: "Article updated", article });
};

exports.deleteArticle = (req, res) => {
  const { id } = req.params;
  let articles = readJSON(KB_FILE);
  const exists = articles.find(a => a.id == id);

  if (!exists) return res.status(404).json({ message: "Article not found" });

  articles = articles.filter(a => a.id != id);
  writeJSON(KB_FILE, articles);
  res.json({ message: "Article deleted" });
};
