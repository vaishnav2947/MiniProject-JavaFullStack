# IssueTracker Java Full Stack

IssueTracker is a comprehensive full-stack bug tracking and project management tool designed to help developers and teams streamline issue reporting, track progress, and manage project workflows.

## Technology Stack

### Backend
* **Java 17 & Spring Boot 3.2**
* **Spring Security & JWT** for robust authentication & authorization
* **Spring Data JPA & Hibernate** for database ORM
* **MySQL 9+** for persistent data storage

### Frontend
* **React 18** built with Vite
* **React Router DOM** for client-side routing
* **Axios** for API requests
* **Lucide React** for modern iconography

---

## 🚀 Features Available

### 🔐 Authentication & Security
* **JWT-based Authentication:** Secure, stateless login architecture.
* **Role-Based Access Control (RBAC):** Strict permissions ensuring that only specific roles (e.g., ADMIN) can access sensitive administrative features.
* **Encrypted Passwords:** Users' passwords are encrypted securely using BCrypt hashing algorithm (`$2a$12$` complexity).

### 👥 User Roles & Access Control
* **Dedicated Administrator:** The system strictly locks down admin privileges to designated administrators (e.g., `vaishnavb9999@gmail.com`). 
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

## 🛠️ Setup Instructions

### Prerequisites
* Java 17 (Temurin / Adoptium)
* Maven 3.9+ 
* Node.js v24+
* MySQL Server 8.0/9.0+

### Database Configuration
1. Start MySQL Server.
2. Create the target database:
   ```sql
   CREATE DATABASE issue_tracker;
   ```
3. In `backend/src/main/resources/application.properties`, configure your credentials:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_database_password
   ```

### Running Backend
```bash
cd backend
mvn spring-boot:run
```
*Runs by default on port `8080`*

### Running Frontend
```bash
cd frontend
npm install
npm run dev
```
*Runs by default on port `3000`*

## Default Administrator
On first boot, the system initializes default entities, allowing specified email identifiers to assume standard access paths. Contact system administrators for `vaishnavb9999@gmail.com` access logic controls.
