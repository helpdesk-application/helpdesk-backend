const axios = require('axios');

async function setupAndTest() {
    const DB_API_USERS = "http://localhost:5000/api/users";
    const BACKEND_API = "http://localhost:3001";

    console.log('--- Setting up Test Agents ---');
    try {
        const agents = [
            { email: 'agent1_it@example.com', name: 'IT Agent 1', role: 'Agent', department: 'IT Support', password: 'password123' },
            { email: 'agent2_it@example.com', name: 'IT Agent 2', role: 'Agent', department: 'IT Support', password: 'password123' },
            { email: 'agent1_finance@example.com', name: 'Finance Agent 1', role: 'Agent', department: 'Finance', password: 'password123' }
        ];

        for (const agent of agents) {
            try {
                const checkRes = await axios.get(`${DB_API_USERS}/email/${agent.email}`);
                const existingAgent = checkRes.data;
                await axios.patch(`${DB_API_USERS}/${existingAgent._id}`, { department: agent.department, role: 'Agent' });
                console.log(`Updated agent department: ${agent.email} -> ${agent.department}`);
            } catch (e) {
                if (e.response && e.response.status === 404) {
                    await axios.post(DB_API_USERS, agent);
                    console.log(`Created agent: ${agent.email}`);
                } else {
                    throw e;
                }
            }
        }


        console.log('\n--- Testing Auto-Assignment ---');
        // Register a customer and get token
        const customerEmail = `customer_${Date.now()}@example.com`;
        const regRes = await axios.post(`${BACKEND_API}/auth/register`, {
            email: customerEmail,
            password: 'password123'
        });
        const token = regRes.data.token;
        console.log(`Registered customer: ${customerEmail}`);

        // Create a Technical ticket (should route to IT Support)
        console.log('\nCreating Technical Ticket...');
        const ticket1Res = await axios.post(`${BACKEND_API}/tickets`, {
            subject: 'System is very slow',
            description: 'The server performance is terrible today. Please help ASAP.',
            priority: 'HIGH'
        }, { headers: { Authorization: `Bearer ${token}` } });

        const ticket1 = ticket1Res.data.ticket;
        console.log(`Ticket 1: ${ticket1.subject}`);
        console.log(`Suggested Category (AI): ${ticket1.category}`);
        console.log(`Routed Department: ${ticket1.department}`);
        console.log(`Assigned Agent ID: ${ticket1.assigned_agent_id}`);

        if (ticket1.department === 'IT Support' && ticket1.assigned_agent_id) {
            console.log('✅ PASS: Technical ticket correctly routed and assigned.');
        } else {
            console.log('❌ FAIL: Technical ticket routing/assignment failed.');
        }

        // Create a Billing ticket (should route to Finance)
        console.log('\nCreating Billing Ticket...');
        const ticket2Res = await axios.post(`${BACKEND_API}/tickets`, {
            subject: 'Incorrect invoice amount',
            description: 'My invoice shows 500 dollars but it should be 400. Please refund.',
        }, { headers: { Authorization: `Bearer ${token}` } });

        const ticket2 = ticket2Res.data.ticket;
        console.log(`Ticket 2: ${ticket2.subject}`);
        console.log(`Suggested Category (AI): ${ticket2.category}`);
        console.log(`Routed Department: ${ticket2.department}`);
        console.log(`Assigned Agent ID: ${ticket2.assigned_agent_id}`);

        if (ticket2.department === 'Finance' && ticket2.assigned_agent_id) {
            console.log('✅ PASS: Billing ticket correctly routed and assigned.');
        } else {
            console.log('❌ FAIL: Billing ticket routing/assignment failed.');
        }


    } catch (error) {
        if (error.response) {
            console.error('❌ ERROR Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❌ ERROR Message:', error.message);
        }
    }

}

setupAndTest();
