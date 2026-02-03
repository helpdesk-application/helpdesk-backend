const axios = require("axios");
const DB_API = "http://localhost:5000/api/tickets";

exports.createTicket = (req, res) => {
  const { subject, description, priority } = req.body;
  const customer_id = req.user?.id;

  axios.post(DB_API, { subject, description, priority, customer_id })
    .then(response => res.status(201).json(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
};

exports.getTickets = (req, res) => {
  axios.get(DB_API)
    .then(response => res.json(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
};

exports.updateTicket = (req, res) => {
  const { id } = req.params;
  const { subject, description, priority, status } = req.body;

  axios.patch(`${DB_API}/${id}`, { subject, description, priority, status })
    .then(response => res.json(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
};

exports.changeStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  axios.patch(`${DB_API}/${id}`, { status })
    .then(response => res.json(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
};

exports.assignTicket = (req, res) => {
  const { id } = req.params;
  const { assigned_agent_id } = req.body;

  axios.patch(`${DB_API}/${id}`, { assigned_agent_id })
    .then(response => res.json(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
};

exports.getTicketById = (req, res) => {
  const { id } = req.params;

  axios.get(`${DB_API}/${id}`)
    .then(response => res.json(response.data))
    .catch(err => res.status(500).json({ error: err.message }));
};
