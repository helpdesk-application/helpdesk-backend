## 📡 API Endpoints

### 🔐 Auth
| Method | Endpoint               | Description         |
|--------|------------------------|---------------------|
| POST   | /auth/register         | Register new user   |
| POST   | /auth/login            | Login and get token |

### 👤 Users (Admin only)
| Method | Endpoint                      | Description                  |
|--------|-------------------------------|------------------------------|
| POST   | /users                        | Create new user              |
| GET    | /users                        | Get all users                |
| PUT    | /users/:id                    | Update user info             |
| PATCH  | /users/:id/status             | Toggle user status           |
| POST   | /users/:id/reset-password     | Reset user password          |

### 🎫 Tickets
| Method | Endpoint                      | Description                  |
|--------|-------------------------------|------------------------------|
| POST   | /tickets                      | Create new ticket            |
| GET    | /tickets                      | Get all tickets              |
| PUT    | /tickets/:id                  | Update ticket                |
| PATCH  | /tickets/:id/status           | Change ticket status         |
| PATCH  | /tickets/:id/assign           | Assign ticket to agent       |

### ⏱️ SLA
| Method | Endpoint        | Description              |
|--------|------------------|--------------------------|
| POST   | /sla/check       | Check SLA & escalate     |

### 🔔 Notifications
| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| GET    | /notifications   | Get notifications        |
| POST   | /notifications   | Create notification       |

### 📚 Knowledge Base
| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| POST   | /kb              | Create article           |
| GET    | /kb              | Get all articles         |
| GET    | /kb/search       | Search articles          |
| PUT    | /kb/:id          | Update article           |
| DELETE | /kb/:id          | Delete article           |

### 📊 Reports (Admin only)
| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| GET    | /reports/summary | Get ticket analytics     |

### 🛠️ Admin Controls
| Method | Endpoint                  | Description                  |
|--------|---------------------------|------------------------------|
| GET    | /admin/dashboard          | View system overview         |
| PATCH  | /admin/user/:id/role      | Change user role             |
| PATCH  | /admin/user/:id/toggle    | Activate/deactivate user     |
