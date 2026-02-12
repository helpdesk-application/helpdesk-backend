const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const jwt = require('jsonwebtoken');

const SECRET = 'helpdesk-jwt-secret-change-in-production';
const token = jwt.sign({ id: '63f8e2f1b4e5a2b1c0d0e001', role: 'Admin', department: 'IT Support' }, SECRET);

const testFile = path.join(__dirname, 'test_upload.txt');
fs.writeFileSync(testFile, 'Hello, this is a test upload content.');

async function testUpload(port) {
    console.log(`\n--- Testing Upload on port ${port} ---`);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFile));
    formData.append('ticket_id', '63f8e2f1b4e5a2b1c0d0e010'); // dummy ticket ID

    const url = `http://localhost:${port}${port === 2000 ? '/api' : ''}/attachments`;

    try {
        const response = await axios.post(url, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(`✅ Success (Port ${port}):`, response.status, response.data);
    } catch (err) {
        console.error(`❌ Failed (Port ${port}):`, err.response ? err.response.status : err.message);
        if (err.response) {
            console.error('Error Data:', err.response.data);
        }
    }
}

async function run() {
    await testUpload(3000); // Direct Backend
    await testUpload(2000); // Via Gateway
    fs.unlinkSync(testFile);
}

run();
