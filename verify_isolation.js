const axios = require('axios');
const jwt = require('jsonwebtoken');
const SECRET = "dev-secret";
const BACKEND_URL = "http://localhost:3001";
const DB_URL = "http://localhost:5000/api";

async function verifyHierarchyAndIsolation() {
    console.log('--- Verifying Role Hierarchy and Department Isolation ---');

    try {
        // 1. Setup Data
        console.log('Setting up Super Admin, Admin, and Managers...');

        // Super Admin
        const superAdmin = { name: 'Super Admin', email: 'super@test.com', role: 'Super Admin', password: 'password', department: 'General' };
        let superAdminId;
        try {
            const res = await axios.post(`${DB_URL}/users`, superAdmin);
            superAdminId = res.data.user.id;
        } catch (e) {
            const res = await axios.get(`${DB_URL}/users/email/${superAdmin.email}`);
            superAdminId = res.data._id;
        }

        // Admin
        const adminToken = jwt.sign({ id: 'admin_id', role: 'Admin', name: 'Admin User', department: 'General' }, SECRET);

        // IT Manager
        const itManagerToken = jwt.sign({ id: 'it_manager_id', role: 'Manager', name: 'IT Manager', department: 'IT Support' }, SECRET);

        // Finance Manager
        const financeManagerToken = jwt.sign({ id: 'fin_manager_id', role: 'Manager', name: 'Finance Manager', department: 'Finance' }, SECRET);

        // 2. Verify Role Hierarchy: Admin cannot delete Super Admin
        console.log('\nTesting Role Hierarchy: Admin deleting Super Admin...');
        try {
            await axios.delete(`${BACKEND_URL}/users/${superAdminId}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('❌ FAIL: Admin was able to delete Super Admin!');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ PASS: Admin blocked from deleting Super Admin (403).');
            } else {
                console.log('❌ FAIL: Unexpected error:', error.response ? error.response.status : error.message);
            }
        }

        // 3. Verify Department Isolation (Users)
        console.log('\nTesting Department Isolation (Users): IT Manager fetching users...');
        // Create an IT agent and a Finance agent in DB
        await axios.post(`${DB_URL}/users`, { name: 'IT Agent', email: 'it_ag@test.com', role: 'Agent', department: 'IT Support', password: 'p' }).catch(e => { });
        await axios.post(`${DB_URL}/users`, { name: 'Fin Agent', email: 'fin_ag@test.com', role: 'Agent', department: 'Finance', password: 'p' }).catch(e => { });

        const itUsersRes = await axios.get(`${BACKEND_URL}/users`, {
            headers: { Authorization: `Bearer ${itManagerToken}` }
        });
        const itUsers = itUsersRes.data;
        const otherDeptUsers = itUsers.filter(u => u.department !== 'IT Support' && u.role !== 'Admin' && u.role !== 'Super Admin');

        if (otherDeptUsers.length === 0) {
            console.log('✅ PASS: IT Manager only sees IT department users.');
        } else {
            console.log('❌ FAIL: IT Manager sees users from other departments:', otherDeptUsers.map(u => u.email));
        }

        // 4. Verify Department Isolation (Tickets)
        console.log('\nTesting Department Isolation (Tickets): Creating tickets via Backend...');
        // Create a customer token
        const customerToken = jwt.sign({ id: superAdminId, role: 'Customer', name: 'Test Customer', department: 'General' }, SECRET);

        // Create an IT issue (should route to IT Support)
        await axios.post(`${BACKEND_URL}/tickets`, {
            subject: 'IT Issue Test',
            description: 'My computer is broken'
        }, { headers: { Authorization: `Bearer ${customerToken}` } }).catch(e => { });

        // Create a Finance issue (should route to Finance)
        await axios.post(`${BACKEND_URL}/tickets`, {
            subject: 'Fin Issue Test',
            description: 'invoice error'
        }, { headers: { Authorization: `Bearer ${customerToken}` } }).catch(e => { });

        console.log('IT Manager fetching tickets...');
        const itTicketsRes = await axios.get(`${BACKEND_URL}/tickets`, {
            headers: { Authorization: `Bearer ${itManagerToken}` }
        });
        const itTickets = itTicketsRes.data;
        const otherDeptTickets = itTickets.filter(t => t.department !== 'IT Support');

        console.log(`IT Manager found ${itTickets.length} tickets.`);
        if (otherDeptTickets.length === 0 && itTickets.length > 0) {
            console.log('✅ PASS: IT Manager only sees IT department tickets.');
        } else {
            console.log('❌ FAIL: IT Manager sees tickets from other departments or no matching tickets found.');
            if (itTickets.length > 0) console.log('Found subjects:', itTickets.map(t => t.subject));
        }

        // 5. Verify Global Access: Admin fetching all tickets
        console.log('\nTesting Global Access: Admin fetching all tickets...');
        const allTicketsRes = await axios.get(`${BACKEND_URL}/tickets`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const allTickets = allTicketsRes.data;
        const itTicketFound = allTickets.some(t => t.department === 'IT Support');
        const finTicketFound = allTickets.some(t => t.department === 'Finance');

        console.log(`Admin found ${allTickets.length} total tickets.`);
        if (itTicketFound && finTicketFound) {
            console.log('✅ PASS: Admin can see tickets from all departments.');
        } else {
            console.log('❌ FAIL: Admin cannot see all tickets.');
            console.log('Available Departments:', [...new Set(allTickets.map(t => t.department))]);
        }




    } catch (err) {
        console.error('❌ ERROR:', err.response ? JSON.stringify(err.response.data) : err.message);
    }
}

verifyHierarchyAndIsolation();
