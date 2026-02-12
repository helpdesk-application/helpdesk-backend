const axios = require('axios');

async function testLimit() {
    console.log("--- Testing DB Service JSON Limit ---");
    const largeContent = 'a'.repeat(200 * 1024); // 200KB
    const payload = {
        ticket_id: '63f8e2f1b4e5a2b1c0d0e010',
        uploader_id: '63f8e2f1b4e5a2b1c0d0e001',
        filename: 'test.txt',
        original_name: 'test.txt',
        mime_type: 'text/plain',
        size: largeContent.length,
        content: Buffer.from(largeContent).toString('base64')
    };

    try {
        const response = await axios.post('http://localhost:4000/attachments', payload);
        console.log("✅ Success:", response.status);
    } catch (err) {
        console.log("❌ Failed:", err.response ? `${err.response.status} ${err.response.statusText}` : err.message);
        if (err.response && err.response.status === 413) {
            console.log("🎯 Confirmed: 413 Payload Too Large (Default 100kb exceeded)");
        }
    }
}

testLimit();
