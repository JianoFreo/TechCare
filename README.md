# TechCare Architecture Documentation

# Live site : https://techcare-1.onrender.com/


## Overview
TechCare is a full-stack clinic information system.

## Repository Structure
```
TechCare-main/
├── backend/     # API server, business logic, database access
├── frontend/    # React frontend
├── tools/       # Utilities/scripts
```

## High-Level Architecture

```text
Browser
   │
React Frontend
   │ HTTP/JSON
Backend API
   │
Business Logic
   │
Database
```

## Frontend
- React application.
- Responsible for UI, routing, forms, dashboards.
- Sends API requests to the backend.
- Receives JSON responses and renders them.

Typical flow:
1. User clicks a page.
2. React calls an API.
3. Backend validates request.
4. Database queried.
5. JSON returned.
6. UI updates.

## Backend
Responsible for:
- Authentication
- Validation
- Controllers
- Database access
- Business rules

Typical request lifecycle:

```text
Request
 ↓
Routes
 ↓
Middleware
 ↓
Controller
 ↓
Database
 ↓
Response
```

## Database
Stores clinic information such as:
- Users
- Patients
- Laboratory data
- Services
- Billing
- Queue

## Overall Data Flow

```text
Patient
    ↓
Reception
    ↓
React
    ↓
REST API
    ↓
Controller
    ↓
SQL Database
    ↓
JSON Response
    ↓
Frontend Updates
```

## Folder Responsibilities

### frontend
Contains:
- Pages
- Components
- Hooks
- Styling
- API calls

### backend
Contains:
- Routes
- Controllers
- Models/queries
- Middleware
- Server initialization

## Design Pattern

MVC-inspired architecture:

```text
View
 ↓
Controller
 ↓
Database
```

## Request Example

```text
GET /patients

React
 ↓
Express Route
 ↓
Patient Controller
 ↓
SQL Query
 ↓
Database
 ↓
Controller formats JSON
 ↓
Frontend renders table
```

## Future Improvements
- API documentation
- Sequence diagrams
- ER diagrams
- Deployment architecture
- Authentication flow diagrams
- Complete endpoint reference
- WebSocket flow diagrams
- SSE

---
backend variables
```js
DATABASE_URL=neondb
NODE_ENV=development
PORT=5000
JWT_REFRESH_TOKEN=refresh_token
JWT_SECRET=secret_token 
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=secret_refresh_token
CLOUDINARY_CLOUD_NAME=yourcloudname
CLOUDINARY_API_KEY=123445678
CLOUDINARY_API_SECRET=APISECRET
```

to test ---> write to terminal
```bash
npm run build
```
then
```bash
npm run dev
```

then open postman and test the endpoint
```
get http://localhost:3000/
```
and 
```
get http://localhost:3000/api/admin
```
---

you can test it on the provided endpoints

