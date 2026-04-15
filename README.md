# 🚀 IssueFlow — Java Spring Boot + MySQL Edition

**K. Mokshith (B23IT111) · B. Vaishnav (B23CN017) · G. Vijaya Sindhu (B23DS006)**  
Kakatiya Institute of Technology and Science, Warangal

---

## 📋 Tech Stack

| Layer     | Technology                                               |
|-----------|----------------------------------------------------------|
| Frontend  | React 18, React Router v6, Recharts, Vite, Tailwind CSS  |
| Backend   | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database  | MySQL 8.x                                                |
| Auth      | JWT (jjwt 0.12), BCrypt password hashing                 |
| Security  | Role-Based Access Control (RBAC), Stateless sessions     |

### 🔐 Authentication & Security
* **JWT-based Authentication:** Secure, stateless login architecture.
* **Role-Based Access Control (RBAC):** Strict permissions ensuring that only specific roles (e.g., ADMIN) can access sensitive administrative features.
* **Encrypted Passwords:** Users' passwords are encrypted securely using BCrypt hashing algorithm (`$2a$12$` complexity).

### 👥 User Roles & Access Control
* **Dedicated Administrator:** The system strictly locks down admin privileges to designated administrators. 
* **Safe Registration:** New users signing up are strictly designated the default `REPORTER` access role, preventing privilege escalation.
* **Restricted Admin Views:** Administrative actions on the Dashboard and User listings are locked behind Spring Security's `@PreAuthorize("hasRole('ADMIN')")` directives.

### 📝 Issue Tracking & Management
* **Create & Edit Issues:** Quickly report bugs and create tasks with descriptions, strict statuses, and prioritization logic.
* **Rich Filtering:** See exactly what you need on the dashboard by filtering down issues to specific criteria.
* **Issue History & Audit Trails:** Every modification to an issue keeps a transparent trail.
* **Commenting System:** Team members can drop comments collaboratively inside issue threads.
* **Tags System:** Tag issues for easier grouping and searching.

### 💼 Department & Organization Features
* Complete view of all active registered users.
* Track users' departments directly within the app (e.g., Engineering, HR, QA).

---

## 🗂 Project Structure

```
issue-tracker-java/
├── backend/                          ← Spring Boot Maven project
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/issuetracker/
│       │   ├── IssueTrackerApplication.java
│       │   ├── config/
│       │   │   └── SecurityConfig.java       # CORS, JWT filter chain, BCrypt
│       │   ├── controller/
│       │   │   ├── AuthController.java       # /api/auth/**
│       │   │   ├── UserController.java       # /api/users/**
│       │   │   ├── IssueController.java      # /api/issues/**
│       │   │   ├── DashboardController.java  # /api/dashboard/**
│       │   │   └── HealthController.java     # /api/health
│       │   ├── dto/                          # Request/Response POJOs
│       │   ├── entity/
│       │   │   ├── User.java                 # JPA entity with enums
│       │   │   ├── Issue.java                # Issue with history & comments
│       │   │   ├── Comment.java
│       │   │   └── IssueHistory.java
│       │   ├── repository/                   # Spring Data JPA repositories
│       │   ├── security/
│       │   │   ├── JwtUtil.java              # Token generation & validation
│       │   │   ├── JwtAuthFilter.java        # Request filter
│       │   │   └── CustomUserDetailsService.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       ├── UserService.java
│       │       ├── IssueService.java         # Full business logic
│       │       ├── DashboardService.java     # Analytics aggregation
│       │       ├── MapperService.java        # Entity → DTO conversion
│       │       └── IssueSpecification.java   # Dynamic JPA filter queries
│       └── resources/
│           └── application.properties        # DB + JWT config
│
└── frontend/                         ← React + Vite app
    ├── src/
    │   ├── pages/                    # All page components
    │   ├── components/Layout.jsx     # Sidebar navigation
    │   ├── context/AuthContext.jsx   # JWT auth state
    │   └── utils/
    │       ├── api.js                # Axios (→ port 8080)
    │       └── helpers.jsx           # Badges, Avatar, formatters
    └── vite.config.js                # Proxy /api → :8080
```

---

## ⚙️ Prerequisites

- **Java 17+** — [Download](https://adoptium.net/)
- **Maven 3.8+** — [Download](https://maven.apache.org/download.cgi)  
  *(or use the Maven Wrapper if added)*
- **MySQL 8.x** — [Download](https://dev.mysql.com/downloads/mysql/)
- **Node.js 18+** — [Download](https://nodejs.org/)

---

## 🚀 Setup & Run

### Step 1 — Configure MySQL

Open MySQL Workbench or CLI and run:
```sql
CREATE DATABASE issue_tracker;
```

### Step 2 — Configure Backend

Open `backend/src/main/resources/application.properties` and update:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/issue_tracker?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

> Spring Boot will **auto-create all tables** on first run (`ddl-auto=update`).

### Step 3 — Run Backend

```powershell
cd backend
mvn spring-boot:run
```

You should see:
```
Started IssueTrackerApplication in X.XXX seconds
```

Backend runs on: **http://localhost:8080**

### Step 4 — Run Frontend

Open a **new terminal**:
```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 👥 Roles & Permissions

| Feature              | Reporter | Developer | Admin |
|----------------------|:--------:|:---------:|:-----:|
| Register/Login       | ✅       | ✅        | ✅    |
| Create Issues        | ✅       | ✅        | ✅    |
| View own issues      | ✅       | ✅        | ✅    |
| View all issues      | ❌       | ✅*       | ✅    |
| Edit issues          | own      | assigned  | ✅    |
| Update status        | ❌       | assigned  | ✅    |
| Assign issues        | ❌       | ❌        | ✅    |
| Manage users         | ❌       | ❌        | ✅    |
| Full dashboard       | ❌       | ❌        | ✅    |

*Developers see issues they reported OR are assigned to.

---

## 🔌 API Endpoints

```
POST  /api/auth/register          Register new user
POST  /api/auth/login             Login → returns JWT
GET   /api/auth/me                Get current user (Bearer token)
PUT   /api/auth/profile           Update name/department
PUT   /api/auth/change-password   Change password

GET   /api/users                  List all users       [ADMIN]
GET   /api/users/developers       List devs for assign [AUTH]
PUT   /api/users/{id}             Update user          [ADMIN]
DELETE /api/users/{id}            Delete user          [ADMIN]

GET   /api/issues                 Paginated list with filters
POST  /api/issues                 Create issue
GET   /api/issues/{id}            Get issue detail
PUT   /api/issues/{id}            Update issue
PUT   /api/issues/{id}/status     Change workflow status
PUT   /api/issues/{id}/assign     Assign developer     [ADMIN]
POST  /api/issues/{id}/comments   Add comment
DELETE /api/issues/{id}/comments/{cid}  Delete comment
DELETE /api/issues/{id}           Delete issue

GET   /api/dashboard/stats        Analytics summary
GET   /api/health                 Health check
```

---

## 🗄 MySQL Tables (auto-created by Hibernate)

| Table          | Description                         |
|----------------|-------------------------------------|
| `users`        | User accounts with roles            |
| `issues`       | Issue records with enums            |
| `issue_tags`   | Tags per issue (element collection) |
| `comments`     | Issue comments                      |
| `issue_history`| Field-level change audit log        |

---

## 🔑 First Time Use

1. Go to `http://localhost:3000/register`
2. Create your first account — choose role **ADMIN**
3. Login and explore the full dashboard
4. Create more accounts as **DEVELOPER** and **REPORTER** to test role restrictions

---

## 🛠 Troubleshooting

**MySQL connection error:**
- Make sure MySQL service is running
- Check username/password in `application.properties`
- Ensure `issue_tracker` database exists or `createDatabaseIfNotExist=true` is set

**Port conflict:**
- Backend port: change `server.port` in `application.properties`
- Frontend port: change `port` in `vite.config.js`, update `cors.allowed-origins` in `application.properties`

**Java version:**
```powershell
java -version   # must be 17 or higher
```

**Maven not found:**
```powershell
mvn -version    # install Maven or use ./mvnw on Linux/Mac
```
