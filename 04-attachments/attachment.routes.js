const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const attachmentController = require("./attachment.controller");
const { authorize } = require("../01-auth/auth.middleware");

const fs = require('fs');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload attachment (Protected)
router.post("/",
    (req, res, next) => {

        next();
    },
    authorize(),
    (req, res, next) => {

        upload.single("file")(req, res, (err) => {
            if (err) {
                console.error('[Attachment] Multer Error:', err);
                return res.status(400).json({ message: "File upload error", error: err.message });
            }

            next();
        });
    },
    attachmentController.uploadFile
);

// Get attachments for a ticket
router.get("/ticket/:ticketId", authorize(), attachmentController.getAttachments);

// Download file (Public for now, or token protected via query param if strictest)
// But for simplicity, let's keep it under authorize() but logic is tricky for browser download
// Often downloads are GET requests with cookies. 
// For now, let's allow download by unique filename if known.
router.get("/download/:filename", attachmentController.downloadFile);

module.exports = router;
