
# TechCare: Cloud-Based Integrated Information System for Reyna G. Diagnostic Medical Clinic

TechCare is a full-stack clinic management system designed to streamline patient registration, consultation and laboratory queueing, laboratory requests, billing, and administrative operations for Reyna G. Diagnostic Medical Clinic.

**Live Application:** [https://techcare-1.onrender.com/](https://techcare-1.onrender.com/)

## Group Members

- Dela Cruz, Marc Jodel
- De Guzman, Mike Cleo
- Geronga, Laurence Anthony
- Juan, Randy Jr.
- Matangob, Jiano Freo


## System Architecture

The following diagram illustrates the frontend, backend, middleware, database, external services, and SSE-based queue monitoring.



```mermaid
flowchart TD
    %% Frontend
    A[React Frontend<br/>Vite · TypeScript · Tailwind CSS]
    B[Role-Based Dashboards<br/>Admin · Front Desk · Doctor<br/>Laboratory Staff · Patient]
    C[Axios API Client<br/>JWT Bearer Token]
    D[Admin QueueingMonitor<br/>Queue State and UI]
    E[fetch-event-source<br/>Authenticated SSE Client]

    %% Backend
    F[Express Server<br/>server.ts]
    G[API Routers<br/>Auth · Admin · Front Desk<br/>Doctor · Laboratory · Patient]
    H[JWT Authentication Middleware]
    I[Role Authorization Middleware]
    J[Route Controllers<br/>Request Validation and Business Logic]
    K[Shared Utilities<br/>generateId.ts · calculateAge.ts]

    %% Queue SSE
    L[SSE Endpoint<br/>GET /api/admin/queue/stream]
    M[queueStream.controller.ts<br/>Handle Stream Connection]
    N[queueStream.ts<br/>Register Clients · Heartbeat<br/>publishQueueChange]
    O[getQueueMonitorEntries.ts<br/>Fetch Queue Snapshot]

    %% Data and services
    P[(Neon PostgreSQL<br/>Users · Patients · Services<br/>Queue · Consultations · Lab<br/>Prescriptions · Bills · Activity Logs)]
    Q[Cloudinary<br/>Image and File Storage]

    %% Normal API flow
    A --> B
    B --> C
    C -->|HTTP Request + JWT| F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    J -->|Read and Write Records| P
    J -->|Upload Files| Q

    %% SSE connection flow
    B --> D
    D --> E
    E -->|Authenticated Stream Request| F
    F --> L
    L --> H
    H --> I
    I --> M
    M --> N
    N --> O
    O -->|Query Queue Data| P
    O -->|Return Snapshot| N
    N -->|Initial Queue Snapshot| E

    %% Live queue update flow
    J -->|After Successful Queue Mutation| N
    N -->|Broadcast queue-updated Event| E
    E -->|Parse Event and Update State| D

    %% Frontend hosting
    F -.->|SPA Fallback| A
```

## Documentation

For detailed setup and deployment instructions, see:

**[TechCare Setup and Deployment Notes](docs/SETUP.md)**

