const axios = require("axios");
const path = require("path");
const fs = require("fs");

const DB_API = process.env.DB_API + "attachments";

// Should be 'files' in backend root
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

exports.uploadFile = async (req, res) => {
    console.log('[AttachmentController] Processing upload. Body:', req.body);
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const { ticket_id } = req.body;
    if (!ticket_id) {
        return res.status(400).json({ message: "Ticket ID required" });
    }

    try {
        const fileData = {
            ticket_id,
            uploader_id: req.user.id, // from auth middleware
            filename: req.file.filename,
            original_name: req.file.originalname,
            mime_type: req.file.mimetype,
            size: req.file.size,
            path: req.file.path // Local path
        };

        // Save metadata to DB Service
        const response = await axios.post(DB_API, fileData);

        res.status(201).json(response.data);

    } catch (err) {
        console.error("Upload error:", err.message);
        // Cleanup file if DB save fails
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Failed to save attachment metadata" });
    }
};

exports.getAttachments = async (req, res) => {
    const { ticketId } = req.params;
    try {
        const response = await axios.get(`${DB_API}/ticket/${ticketId}`);
        res.json(response.data);
    } catch (err) {
        if (err.response) return res.status(err.response.status).json(err.response.data);
        res.status(500).json({ message: "Failed to fetch attachments" });
    }
};

exports.downloadFile = async (req, res) => {
    // This would typically verify access rights first
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ message: "File not found" });
    }
};
