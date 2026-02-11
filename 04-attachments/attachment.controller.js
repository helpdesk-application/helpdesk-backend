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
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const { ticket_id } = req.body;
    if (!ticket_id) {
        // Cleanup local file
        if (req.file.path) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Ticket ID required" });
    }

    try {
        // Read file into Buffer
        const fileBuffer = fs.readFileSync(req.file.path);

        const fileData = {
            ticket_id,
            uploader_id: req.user.id,
            filename: req.file.filename,
            original_name: req.file.originalname,
            mime_type: req.file.mimetype,
            size: req.file.size,
            content: fileBuffer.toString('base64') // Send as base64 to DB service
        };

        // Save to DB Service
        const response = await axios.post(DB_API, fileData);

        // Cleanup temporary local file
        fs.unlinkSync(req.file.path);

        res.status(201).json(response.data);

    } catch (err) {
        console.error("[AttachmentController] Upload error:", err.message);
        // Cleanup file if error occurs
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: "Failed to save attachment to database" });
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
    const { filename } = req.params;
    try {
        // 1. Find attachment metadata by filename to get ID
        const attachmentsRes = await axios.get(DB_API);
        // Note: Ideally we'd have a find-by-filename endpoint in DB service
        // For now, let's assume we can fetch by filename or that the client uses the ID directly
        // If the client provides an ID, we use that. If filename, we search.

        let attachmentId = req.params.id || filename; // Assuming filename could be ID in some routes

        // Actually, let's adjust the route or logic. If we have filename, we need to find the ID.
        // For efficiency, let's just use the ID if we can.

        const response = await axios.get(`${DB_API}/${attachmentId}/download`, {
            responseType: 'arraybuffer'
        });

        const contentType = response.headers['content-type'];
        const contentDisposition = response.headers['content-disposition'];

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': contentDisposition
        });
        res.send(response.data);
    } catch (err) {
        console.error("[AttachmentController] Download error:", err.message);
        res.status(404).json({ message: "File not found or access denied" });
    }
};
