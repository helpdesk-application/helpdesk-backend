const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const jwt = require('jsonwebtoken');

const SECRET = 'helpdesk-jwt-secret-change-in-production';
const token = jwt.sign({ id: '63f8e2f1b4e5a2b1c0d0e001', role: 'Admin', department: 'IT Support' }, SECRET);

const testFile = path.join(__dirname, 'test_boundary_fix.txt');
fs.writeFileSync(testFile, 'Testing boundary fix logic.');

async function testUploadVariant(name, manualHeaders) {
    console.log(`\n--- Testing: ${name} ---`);
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFile));
    formData.append('ticket_id', '63f8e2f1b4e5a2b1c0d0e010');

    // Portal port 2000
    const url = `http://localhost:2000/api/attachments`;

    try {
        const response = await axios.post(url, formData, {
            headers: {
                ...manualHeaders,
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(`✅ Success:`, response.status);
    } catch (err) {
        console.log(`❌ Failed:`, err.response ? `${err.response.status} ${err.response.data.message || ''}` : err.message);
    }
}

async function run() {
    // 1. Simulate the failure: Manual Content-Type without boundary
    await testUploadVariant("Manual Header (Failure Simulation)", { 'Content-Type': 'multipart/form-data' });

    // 2. Simulate the fix: No manual Content-Type (Axios uses formData.getHeaders internally or we let it fly)
    // Note: In Node, axios needs help with formData headers if we don't pass them, 
    // but we can pass formData.getHeaders() which has the boundary.
    // The key is that the FRONTEND (Browser) automatically does this IF Content-Type is NOT set.
    await testUploadVariant("Correct Header (Using getHeaders with boundary)", { ...new FormData().getHeaders() });

    fs.unlinkSync(testFile);
}

run();
