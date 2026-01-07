## Jump To

- [Jump To](#jump-to)
  - [Architecture and System Design](#architecture-and-system-design)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Help Center](#help-center)
    - [Key System Design Decisions](#key-system-design-decisions)
    - [Security Considerations](#security-considerations)
- [API Design](#api-design)
- [Security and Authentication](#security-and-authentication)
- [Scalability \& Performance](#scalability--performance)
- [Deployment Strategy](#deployment-strategy)
- [Failure Handling \& Monitoring](#failure-handling--monitoring)
    - [🧱 Frontend \& Backend Error Handling](#-frontend--backend-error-handling)
    - [📡 Monitoring \& Observability](#-monitoring--observability)
- [OAuth2 Flow](#oauth2-flow)
- [Class UML Diagram](#class-uml-diagram)
    - [About This Diagram](#about-this-diagram)
- [Entity-Relationship Diagram](#entity-relationship-diagram)
- [Deployment and CI/CD Strategy](#deployment-and-cicd-strategy)
- [🚀 Deployment Strategy](#-deployment-strategy)
- [🛠️ CI/CD Workflows](#️-cicd-workflows)
  - [✅ Common Features](#-common-features)
- [🧪 Environments: Staging vs Production](#-environments-staging-vs-production)
- [📦 Backend Deployment (Node.js Server)](#-backend-deployment-nodejs-server)
  - [🔄 Flow:](#-flow)
  - [🐳 Docker Tags:](#-docker-tags)
  - [🔐 Required Secrets:](#-required-secrets)
- [🌐 Frontend Deployment (Next.js)](#-frontend-deployment-nextjs)
  - [🔄 Flow:](#-flow-1)
  - [🔐 Required Secrets:](#-required-secrets-1)
- [🆘 Help Center Deployment](#-help-center-deployment)
  - [🔄 Flow:](#-flow-2)
  - [🔐 Required Secrets:](#-required-secrets-2)
- [🔐 Secrets \& Environment Variable Management](#-secrets--environment-variable-management)
- [CI/CD Pipeline Flow](#cicd-pipeline-flow)
- [Postman Collection](../postman/)
- [Endpoints](#endpoints)

### Architecture and System Design

RSVP follows a **monorepo architecture** using **pnpm workspaces** to manage multiple applications in a single repository. This setup enables easier dependency management, code sharing, and streamlined development across the frontend, backend, and help center. The repository contains three main apps:

- **Web**: Frontend app built with React and Next.js.
- **Server**: Backend API built with Express and Node.js.
- **Help Center**: Static site built with Astro.

```bash
/
├── apps/
│ ├── web/ # Next.js frontend
│ ├── server/ # Express backend
│ └── help-center/ # Astro static site
├── docker/ # Docker configuration files
├── docs/ # Project documentation
├── package.json # Root workspace config
└── pnpm-workspace.yaml
```

#### Frontend

- **Framework:** Next.js (with `app/` directory for modern routing)
- **Validation:** Zod (schema validation), React Hook Form (form handling)
- **Data fetching:** React Query (server state and caching)
- **UI:** Shadcn + Radix UI components, styled with Tailwind CSS
- **Testing:** Vitest (with TypeScript support)
- **Why these?**  
  Next.js offers great SSR and static generation capabilities, enabling fast and SEO-friendly pages. Using TypeScript with strict type checking enhances code safety and maintainability. React Query efficiently handles API caching and synchronization with the backend.

#### Backend

- **Framework:** Express (Node.js)
- **Architecture pattern:** Separation into routes, controllers, repositories, and validation layers
- **Validation:** Zod for request body validation
- **Authentication:** Magic Links with JWT tokens for passwordless login
- **ORM & DB:** Prisma ORM with MySQL database
- **Logging:** Winston for centralized logging and error monitoring
- **Testing:** Supertest for API endpoint testing
- **Bundling:** Tsup for efficient TypeScript builds
- **Why these?**  
  Express is lightweight and flexible, allowing rapid API development in JavaScript, which aligns with the frontend language choice, enabling the team to work efficiently with a single language stack. Prisma offers type-safe database access, reducing runtime errors.

#### Help Center

- **Framework:** Astro for fast, static site generation
- **Why?** Astro allows building optimized, content-focused static sites, perfect for documentation or help resources with minimal runtime overhead.

#### Key System Design Decisions

- **Authentication:** Passwordless login via magic links improves user experience and security by avoiding passwords.
- **API Design:** RESTful APIs with versioning and proper HTTP methods for scalability and maintainability.
- **Error Handling:** Centralized error structure with consistent responses, logged via Winston.
- **Logging:** Winston manages logs for easier debugging and monitoring.
- **Type Safety:** Strict TypeScript usage reduces runtime bugs and improves developer productivity.
- **Testing:** Automated tests (Vitest on frontend, Supertest on backend) ensure reliability.

#### Security Considerations

- Passwordless authentication via magic links reduces risks related to password leaks.
- JWT tokens are securely signed and validated.
- All input is validated with Zod to prevent injection attacks.
- Sensitive environment variables are managed securely and not stored in code.
- Centralized logging helps identify suspicious activity.

## API Design

## Security and Authentication

## Scalability & Performance

## Deployment Strategy

  - Frontend deployed on **Vercel** for seamless Next.js support and fast global delivery.
  - Backend deployed on **Railway**, a developer-friendly cloud platform.
  - CI/CD pipeline via **GitHub Actions** automates testing, linting, and deployment.

## Failure Handling & Monitoring

Failures are inevitable in production systems, but our setup ensures minimal user impact and fast recovery through structured error handling and real-time monitoring.

#### 🧱 Frontend & Backend Error Handling

- **React**: Error boundaries are implemented to prevent complete UI crashes, and retry logic is used for transient failures such as API issues. **(TODO)**
- **Express**: The backend uses **centralized error handling**, which standardizes error responses and improves log clarity across the app.

#### 📡 Monitoring & Observability

We use **Railway**’s native observability stack to track logs, metrics, and system health:

- Centralized **[Logs](https://docs.railway.com/guides/logs)** for debugging and traceability
- Live **[Metrics](https://docs.railway.com/guides/metrics)** dashboards for performance monitoring
- System-wide **[Observability](https://docs.railway.com/guides/observability)** for proactive issue detection
- Real-time alerts for downtime, high error rates, and slow endpoints **(TODO)**

Together, these tools allow us to monitor the system effectively and respond to issues quickly, even during peak usage.

## OAuth2 Flow

## Class UML Diagram

```mermaid
classDiagram
    class UserRepository {
        +static findById(id: string)
        +static findByUserName(userName: string)
        +static findbyEmail(primaryEmail: string, isDeleted?: boolean|null)
        +static findAllByIds(ids: string[])
        +static create(primaryEmail: string)
        +static createToken(userId: string)
        +static verifyToken(tokenId: string)
        +static updateProfile(id: string, data: any)
        +static updateRefreshToken(userId: string, refreshToken: string|null)
        +static delete(userId: string)
    }

    class EventRepository {
        +static findEvents(filters: EventFilter)
        +static findbySlug(slug: string)
        +static findAllPlannedEvents(params: object)
        +static findById(eventId: string)
        +static findAllPopularEvents(take: number)
        +static create(eventDetails: ICreateEvent)
        +static update(eventId: string, data: Partial~Event~)
        +static updateSlug(eventId: string, creatorId: string, slug: string)
        +static cancel(eventId: string, creatorId: string)
        +static delete(eventId: string, creatorId: string)
    }

    class AttendeeRepository {
        +static attendeePaginator: Paginator
        +static findById(id: string)
        +static findByQrToken(qrToken: string, eventId?: string)
        +static findByUserIdAndEventId(userId: string, eventId: string, isDeleted?: boolean)
        +static findAllByEventId(eventId: string)
        +static findRegisteredEventsByUser(params: IRegisteredEvent)
        +static findAttendeesByEventId(params: IAttendeesByEvent)
        +static findAllAttendees(eventId: string)
        +static create(data: Prisma.AttendeeCreateInput)
        +static update(id: string, data: Prisma.AttendeeUpdateInput)
        +static countAttendees(eventId: string)
        +static updateAttendeeStatus(id: string, allowedStatus: boolean)
        +static cancel(id: string)
        +static restore(id: string, status: Status)
    }

    class CohostRepository {
        +static findById(id: string)
        +static findByUserIdAndEventId(userId: string, eventId: string)
        +static findAllByEventId(eventId: string)
        +static create(data: Prisma.CohostCreateManyInput)
        +static update(id: string, data: Prisma.CohostUpdateInput)
        +static removeCoHost(cohostId: string, eventId: string)
        +static delete(id: string)
        +static FindhostOrCohost(userId: string, eventId: string, roles?: Role[], returnType?: boolean)
    }

    class UpdateRepository {
        +static findAllById(eventId: string)
        +static create(notificationDetails: IUpdate)
    }

    UserRepository --> EventRepository: cascade deletes
    UserRepository --> AttendeeRepository: cascade deletes
    UserRepository --> CohostRepository: cascade deletes
    UserRepository --> UpdateRepository: cascade deletes
    EventRepository --> AttendeeRepository: references
    EventRepository --> CohostRepository: references
    EventRepository --> UserRepository: references creator
    AttendeeRepository --> UserRepository: references user
    AttendeeRepository --> EventRepository: references event
    CohostRepository --> UserRepository: references user
    CohostRepository --> EventRepository: references event
    UpdateRepository --> UserRepository: references user
    UpdateRepository --> EventRepository: references event
```

#### About This Diagram
- **Repository Classes**: Each box represents a repository class that provides methods for interacting with a specific data type.
- **Static Methods**: All repository methods are static, following our implementation pattern.
- **Relationships**:
  - Solid arrows from UserRepository show cascade delete operations (when a user is deleted, related records are also marked as deleted)
  - Other arrows show reference relationships between repositories


## Entity-Relationship Diagram

An Entity-Relationship diagram (ERD) is a conceptual, logical or physcial representation that shows Entities (objects or concepts), Relationships between entities, Attributes of entities, and Cardinality of relationships. ER diagrams are typically created early in the design process and focus on business concepts rather than implementation details. Diagram provided in the `Physical Data Model` section can be considered as the ER diagram.

```mermaid

erDiagram
  USERS {
    id(PK) VARCHAR(36) "NOT NULL"
    primaryEmail VARCHAR(100) "UNIQUE NOT NULL"
    secondaryEmail VARCHAR(100)
    contact VARCHAR(15)
    fullName VARCHAR(100)
    userName VARCHAR(50) "UNIQUE"
    isCompleted BOOLEAN "DEFAULT FALSE"
    location VARCHAR(100)
    stateId(FK) VARCHAR(36)
    countryId(FK) VARCHAR(36)
    bio VARCHAR(500)
    profileIcon INT "DEFAULT 1"
    isDeleted BOOLEAN "DEFAULT FALSE"
    has_unlimited_access BOOLEAN "DEFAULT FALSE"
    createdAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
    updatedAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
  }
  EVENTS {
    id(PK) VARCHAR(36) "NOT NULL"
    creatorId(FK) VARCHAR(36) "NOT NULL"
    name VARCHAR(100) "NOT NULL"
    slug VARCHAR(100) "UNIQUE"
    categoryId(FK) VARCHAR(36)
    startTime TIMESTAMP "NOT NULL"
    endTime TIMESTAMP "NOT NULL"
    description VARCHAR(1000)
    eventImageUrl VARCHAR(256)
    venueType ENUM "NOT NULL"
    venueAddress VARCHAR(256)
    venueStateId(FK) VARCHAR(36)
    venueCountryId(FK) VARCHAR(36)
    venueUrl VARCHAR(256)
    hostPermissionRequired BOOLEAN "DEFAULT FALSE"
    capacity INT "DEFAULT -1"
    isActive BOOLEAN "DEFAULT TRUE"
    isDeleted BOOLEAN "DEFAULT FALSE"
    sendReminderEmail BOOLEAN "DEFAULT FALSE"
    discoverable BOOLEAN "DEFAULT TRUE"
    createdAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
    updatedAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
  }
  CHATS {
    id(PK) VARCHAR(36) "NOT NULL"
    userId(FK) VARCHAR(36) "NOT NULL"
    eventId(FK) VARCHAR(36) "NOT NULL"
    content VARCHAR(1000) "NOT NULL"
    isNotification BOOLEAN "DEFAULT FALSE"
    isDeleted BOOLEAN "DEFAULT FALSE"
    createdAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
    updatedAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
  }
  ATTENDEES {
    id(PK) VARCHAR(36) "NOT NULL"
    userId(FK) VARCHAR(36) "NOT NULL"
    eventId(FK) VARCHAR(36) "NOT NULL"
    registrationTime TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
    hasAttended BOOLEAN "DEFAULT FALSE"
    checkInTime TIMESTAMP
    feedback VARCHAR(100)
    qrToken VARCHAR(100) "UNIQUE"
    status ENUM "DEFAULT WAITING"
    allowedStatus BOOLEAN "DEFAULT TRUE"
    isDeleted BOOLEAN "DEFAULT FALSE"
    createdAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
    updatedAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
  }
  HOSTS {
    id(PK) VARCHAR(36) "NOT NULL"
    userId(FK) VARCHAR(36) "NOT NULL"
    eventId(FK) VARCHAR(36) "NOT NULL"
    role ENUM "DEFAULT READ_ONLY"
    isDeleted BOOLEAN "DEFAULT FALSE"
    createdAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
    updatedAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
  }
  SOCIAL_LINKS {
    id(PK) VARCHAR(36) "NOT NULL"
    userId(FK) VARCHAR(36) "NOT NULL"
    type ENUM "NOT NULL"
    handle VARCHAR(100) "NOT NULL"
  }
  STATES {
    id(PK) VARCHAR(36) "NOT NULL"
    name VARCHAR(36) "NOT NULL"
    countryId(FK) VARCHAR(36) "NOT NULL"
  }
  COUNTRIES {
    id(PK) VARCHAR(36) "NOT NULL"
    name VARCHAR(36) "UNIQUE NOT NULL"
  }
  CATEGORIES {
    id(PK) VARCHAR(36) "NOT NULL"
    name VARCHAR(36) "UNIQUE NOT NULL"
  }
  AUTH {
    id(PK) VARCHAR(36) "NOT NULL"
    userId(FK) VARCHAR(36) "NOT NULL"
    provider ENUM "NOT NULL"
    providerUserId VARCHAR(255)
    magicToken VARCHAR(100) "UNIQUE"
    tokenExpiry TIMESTAMP
    refreshToken VARCHAR(512) "UNIQUE"
    isActive BOOLEAN "DEFAULT TRUE"
    lastUsedAt TIMESTAMP
    createdAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
    updatedAt TIMESTAMP "DEFAULT CURRENT_TIMESTAMP()"
  }
  USERS ||--o{ EVENTS : creatorId
  USERS ||--o{ ATTENDEES : userId
  USERS ||--o{ HOSTS : userId
  USERS ||--o{ CHATS : userId
  USERS ||--o{ SOCIAL_LINKS : userId
  USERS ||--o{ AUTH : userId
  EVENTS ||--o{ CHATS : eventId
  EVENTS ||--o{ ATTENDEES : eventId
  EVENTS ||--o{ HOSTS : eventId
  STATES ||--o{ USERS : stateId
  STATES ||--o{ EVENTS : venueStateId
  COUNTRIES ||--o{ STATES : countryId
  COUNTRIES ||--o{ USERS : countryId
  COUNTRIES ||--o{ EVENTS : venueCountryId
  CATEGORIES ||--o{ EVENTS : categoryId
```

## Deployment and CI/CD Strategy

## 🚀 Deployment Strategy

This project uses a streamlined CI/CD pipeline for automatic deployments using **GitHub Actions**, with hosting on **Docker Hub** (for backend) and **Vercel** (for frontend and help center). Environment variables are managed securely via **GitHub Secrets**.

---

## 🛠️ CI/CD Workflows

We use **GitHub Actions** to automate builds and deployments triggered by pushes to the `main` branch or via manual dispatch (`workflow_dispatch`). Each application has a dedicated workflow file in `.github/workflows/`.

### ✅ Common Features

- Triggered on `main` branch push or manual trigger
- Uses `pnpm` for fast and deterministic installs
- Built with timeouts to prevent hanging jobs
- Secrets securely injected via GitHub Secrets

---

## 🧪 Environments: Staging vs Production

Currently, deployments target the **production** environment only.

To enable staging:
- Use separate branches (e.g., `staging`)
- Configure Vercel with `--environment=preview`
- Tag Docker images appropriately (e.g., `staging-<tag>`)

---

## 📦 Backend Deployment (Node.js Server)

- **Target**: Docker Hub
- **Workflow File**: `.github/workflows/deploy-backend.yml`

### 🔄 Flow:
1. Login to Docker using credentials from secrets
2. Check for Docker repo and create it if missing
3. Fetch latest image tag and increment
4. Build and push Docker images

### 🐳 Docker Tags:
- username/repository:latest
- username/repository:<auto-incremented-tag>


### 🔐 Required Secrets:
- `DATABASE_URL`
- `DOCKER_USERNAME`
- `DOCKER_TOKEN`
- `DOCKER_REPOSITORY_NAME`

---

## 🌐 Frontend Deployment (Next.js)

- **Target**: Vercel
- **Workflow File**: `.github/workflows/deploy-frontend.yml`

### 🔄 Flow:
1. Install Vercel CLI
2. Pull Vercel project environment
3. Build project artifacts
4. Deploy using `vercel deploy --prod`

### 🔐 Required Secrets:
- `VERCEL_PROJECT_ID`
- `VERCEL_ORG_ID`
- `VERCEL_TOKEN`

---

## 🆘 Help Center Deployment

- **Target**: Vercel (Different project ID from frontend)
- **Workflow File**: `.github/workflows/deploy-help-center.yml`

### 🔄 Flow:
Same steps as frontend deployment.

### 🔐 Required Secrets:
- `VERCEL_HELP_PROJECT_ID`
- `VERCEL_ORG_ID`
- `VERCEL_TOKEN`

---

## 🔐 Secrets & Environment Variable Management

We manage all sensitive credentials and configs using **GitHub Secrets**. These are injected into the workflows using `${{ secrets.SECRET_NAME }}` and **never committed to the codebase**.

**Examples:**
```yml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## CI/CD Pipeline Flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'textColor': 'inherit', 'fontSize': '16px'}}}%%
graph TD
    A[Pull Request Created] --> B[PR Review Process]
    B --> C[PR Merged to main branch]
    
    C --> D{Changed Files Location?}
    
    D -->|apps/server/** changes| E[Backend Workflow]
    D -->|apps/web/** changes| F[Frontend Workflow]
    D -->|apps/help-center/** changes| G[Help Center Workflow]
    
    E --> E1[Build Docker Image]
    E1 --> E2[Push to Docker Hub]
    E2 --> E3[Deploy to Railway]
    
    F --> F1[Install Dependencies]
    F1 --> F2[Build Next.js App]
    F2 --> F3[Deploy to Vercel Production]
    
    G --> G1[Install Dependencies]
    G1 --> G2[Build Astro Site]
    G2 --> G3[Deploy to Vercel Production]
    
    subgraph "Backend Pipeline"
        E1
        E2
        E3
    end
    
    subgraph "Frontend Pipeline"
        F1
        F2
        F3
    end
    
    subgraph "Help Center Pipeline"
        G1
        G2
        G3
    end

    %% Backend Pipeline with adaptive text color
    classDef backendClass fill:#ff9999,stroke:#333,stroke-width:2px,color:inherit
    class E1,E2,E3 backendClass

    %% Frontend Pipeline with adaptive text color
    classDef frontendClass fill:#99ccff,stroke:#333,stroke-width:2px,color:inherit
    class F1,F2,F3 frontendClass

    %% Help Center Pipeline with adaptive text color
    classDef helpcenterClass fill:#90EE90,stroke:#333,stroke-width:2px,color:inherit
    class G1,G2,G3 helpcenterClass

    %% Flow nodes with adaptive text color
    classDef flowClass fill:#e6e6e6,stroke:#333,stroke-width:3px,color:inherit
    class A,B,C flowClass

    %% Decision node with adaptive text color
    classDef decisionClass fill:#ffeb99,stroke:#333,stroke-width:3px,color:inherit
    class D decisionClass
```

<details>
  <summary><strong>USERS</strong> – Details about users</summary>
  <table>
    <thead>
      <tr>
        <th>Field</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>id</td>
        <td>uuid</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>primary_email</td>
        <td>string</td>
        <td>User's primary email</td>
      </tr>
      <tr>
        <td>secondary_email</td>
        <td>string</td>
        <td>Optional secondary email</td>
      </tr>
      <tr>
        <td>contact</td>
        <td>string</td>
        <td>Phone number, optional</td>
      </tr>
      <tr>
        <td>full_name</td>
        <td>string</td>
        <td>Full name of the user</td>
      </tr>
      <tr>
        <td>user_name</td>
        <td>string</td>
        <td>Unique username</td>
      </tr>
      <tr>
        <td>is_completed</td>
        <td>boolean</td>
        <td>Onboarding completed or not</td>
      </tr>
      <tr>
        <td>location</td>
        <td>string</td>
        <td>User's location</td>
      </tr>
      <tr>
        <td>stateId</td>
        <td>string</td>
        <td>User's state</td>
      </tr>
      <tr>
        <td>countryId</td>
        <td>string</td>
        <td>User's country</td>
      </tr>
      <tr>
        <td>bio</td>
        <td>string</td>
        <td>Profile bio</td>
      </tr>
      <tr>
        <td>profile_icon</td>
        <td>int</td>
        <td>Profile icon identifier</td>
      </tr>
      <tr>
        <td>is_deleted</td>
        <td>boolean</td>
        <td>Soft delete flag</td>
      </tr>
      <tr>
        <td>has_unlimited_access</td>
        <td>boolean</td>
        <td>Toggle to bypass all feature restrictions</td>
      </tr>
      <tr>
        <td>created_at</td>
        <td>datetime</td>
        <td>Timestamp of creation</td>
      </tr>
      <tr>
        <td>updated_at</td>
        <td>datetime</td>
        <td>Timestamp of last update</td>
      </tr>
    </tbody>
  </table>
</details>
<details>
<summary><strong>Chat </strong> – Event Update</summary>
  <table>
    <thread>
      <tr>
        <th>Field</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thread>
    <tbody>
      <tr>
        <td>id</td>
        <td>uuid</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>userId</td>
        <td>string</td>
        <td>Link user's table</td>
      </tr>
      <tr>
        <td>eventId</td>
        <td>string</td>
        <td>Link event table</td>
      </tr>
      <tr>
        <td>content</td>
        <td>string</td>
        <td>Text message</td>
      </tr>
      <tr>
        <td>isNotification</td>
        <td>boolean</td>
        <td>Message notification</td>
      </tr>
      <tr>
        <td>isDeleted</td>
        <td>boolean</td>
        <td>Message deleted check</td>
      </tr>
      <tr>
        <td>created_at</td>
        <td>datetime</td>
        <td>Timestamp of creation</td>
      </tr>
      <tr>
        <td>updated_at</td>
        <td>datetime</td>
        <td>Timestamp of last update</td>
      </tr>
    </tbody>
  </table>
</details>
<details>
  <summary><strong>EVENT</strong> – Event metadata</summary>
  <table>
    <thead>
      <tr>
        <th>Field</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>id</td>
        <td>uuid</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>creator_id</td>
        <td>uuid</td>
        <td>Foreign key to USERS</td>
      </tr>
      <tr>
        <td>name</td>
        <td>string</td>
        <td>Event name</td>
      </tr>
      <tr>
        <td>slug</td>
        <td>string</td>
        <td>Unique event identifier</td>
      </tr>
      <tr>
        <td>category</td>
        <td>string</td>
        <td>Optional category</td>
      </tr>
      <tr>
        <td>start_time</td>
        <td>datetime</td>
        <td>Start datetime</td>
      </tr>
      <tr>
        <td>end_time</td>
        <td>datetime</td>
        <td>End datetime</td>
      </tr>
      <tr>
        <td>description</td>
        <td>string</td>
        <td>Detailed description</td>
      </tr>
      <tr>
        <td>event_image_url</td>
        <td>string</td>
        <td>Event image URL</td>
      </tr>
      <tr>
        <td>venue_type</td>
        <td>enum</td>
        <td>PHYSICAL | VIRTUAL | LATER</td>
      </tr>
      <tr>
        <td>venue_address</td>
        <td>string</td>
        <td>Address of venue</td>
      </tr>
      <tr>
        <td>venue_state_id</td>
        <td>string</td>
        <td>State of venue</td>
      </tr>
      <tr>
        <td>venue_country_id</td>
        <td>string</td>
        <td>Country of venue</td>
      </tr>
      <tr>
        <td>venue_url</td>
        <td>string</td>
        <td>URL for online venue</td>
      </tr>
      <tr>
        <td>host_permission_required</td>
        <td>boolean</td>
        <td>Do co-hosts need approval</td>
      </tr>
      <tr>
        <td>capacity</td>
        <td>int</td>
        <td>Max attendees</td>
      </tr>
      <tr>
        <td>is_active</td>
        <td>boolean</td>
        <td>Event status</td>
      </tr>
      <tr>
        <td>is_deleted</td>
        <td>boolean</td>
        <td>Soft delete flag</td>
      </tr>
      <tr>
        <td>send_reminder_email</td>
        <td>boolean</td>
        <td>Email Reminder</td>
      </tr>
      <tr>
        <td>discoverable</td>
        <td>boolean</td>
        <td>Public events</td>
      </tr>
      <tr>
        <td>created_at</td>
        <td>datetime</td>
        <td>Timestamp of creation</td>
      </tr>
      <tr>
        <td>updated_at</td>
        <td>datetime</td>
        <td>Timestamp of last update</td>
      </tr>
    </tbody>
  </table>
</details>
<details>
  <summary><strong>ATTENDEE</strong> – Track attendees of events</summary>
  <table>
    <thead>
      <tr>
        <th>Field</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>id</td>
        <td>uuid</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>user_id</td>
        <td>uuid</td>
        <td>Foreign key to USERS</td>
      </tr>
      <tr>
        <td>event_id</td>
        <td>uuid</td>
        <td>Foreign key to EVENT</td>
      </tr>
      <tr>
        <td>registration_time</td>
        <td>datetime</td>
        <td>When the user registered</td>
      </tr>
      <tr>
        <td>has_attended</td>
        <td>boolean</td>
        <td>Attendance status</td>
      </tr>
      <tr>
        <td>check_in_time</td>
        <td>datetime</td>
        <td>Check-in timestamp</td>
      </tr>
      <tr>
        <td>feedback</td>
        <td>string</td>
        <td>Optional feedback</td>
      </tr>
      <tr>
        <td>qr_token</td>
        <td>string</td>
        <td>Unique QR token</td>
      </tr>
      <tr>
        <td>status</td>
        <td>enum</td>
        <td>GOING | NOT_GOING | WAITING | PENDING | INVITED | CANCELLED</td>
      </tr>
      <tr>
        <td>allowed_status</td>
        <td>boolean</td>
        <td>Allowed into event</td>
      </tr>
      <tr>
        <td>is_deleted</td>
        <td>boolean</td>
        <td>Soft delete flag</td>
      </tr>
      <tr>
        <td>created_at</td>
        <td>datetime</td>
        <td>Timestamp of creation</td>
      </tr>
      <tr>
        <td>updated_at</td>
        <td>datetime</td>
        <td>Timestamp of last update</td>
      </tr>
    </tbody>
  </table>
</details>
<details>
  <summary><strong>HOST</strong> – Event hosts</summary>
  <table>
    <thead>
      <tr>
        <th>Field</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>id</td>
        <td>uuid</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>user_id</td>
        <td>uuid</td>
        <td>Foreign key to USERS</td>
      </tr>
      <tr>
        <td>event_id</td>
        <td>uuid</td>
        <td>Foreign key to EVENT</td>
      </tr>
      <tr>
        <td>role</td>
        <td>enum</td>
        <td>CREATOR | MANAGER | READ_ONLY | CELEBRITY</td>
      </tr>
      <tr>
        <td>is_deleted</td>
        <td>boolean</td>
        <td>Soft delete flag</td>
      </tr>
      <tr>
        <td>created_at</td>
        <td>datetime</td>
        <td>Timestamp of creation</td>
      </tr>
      <tr>
        <td>updated_at</td>
        <td>datetime</td>
        <td>Timestamp of last update</td>
      </tr>
    </tbody>
  </table>
</details>
<details>
<summary><strong>Social Links</strong> – Social link metadata</summary>
  <table>
    <thread>
      <tr>
        <th>Field</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thread>
    <tbody>
      <tr>
        <td>id</td>
        <td>uuid</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>userId</td>
        <td>string</td>
        <td>Store user id</td>
      </tr>
      <tr>
        <td>type</td>
        <td>Platform</td>
        <td>Social Media handle</td>
      </tr>
      <tr>
        <td>handel</td>
        <td>string</td>
        <td>Social Media handel</td>
      </tr>
    </tbody>
  </table>
</details>
<details>
  <summary><strong>State </strong>- State data</summary>
  <table>
    <thread>
      <tr>
        <th>Field</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thread>
    <tbody>
      <tr>
        <td>id</td>
        <td>uuid</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>name</td>
        <td>string</td>
        <td>State name</td>
      </tr>
      <tr>
        <td>country_id</td>
        <td>string</td>
        <td>Country Id</td>
      </tr>
    </tbody>
  </table>
</details>
<details>
  <summary><strong>Country </strong>- Country data</summary>
  <table>
    <thread>
      <tr>
        <th>Field</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thread>
    <tbody>
      <tr>
        <td>id</td>
        <td>uuid</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>name</td>
        <td>string</td>
        <td>Country name</td>
      </tr>
    </tbody>
  </table>
</details>
<details>
  <summary><strong>Category </strong>- Country data</summary>
  <table>
    <thread>
      <tr>
        <th>Field</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thread>
    <tbody>
      <tr>
        <td>id</td>
        <td>uuid</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>name</td>
        <td>string</td>
        <td>Category name</td>
      </tr>
    </tbody>
  </table>
</details>
<details>
  <summary><strong>Auth </strong>- User Credentials</summary>
  <table>
    <thread>
      <tr>
        <th>Field</th>
        <th>Type</th>
        <th>Description</th>
      </tr>
    </thread>
    <tbody>
      <tr>
        <td>id</td>
        <td>uuid</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>user_id</td>
        <td>string</td>
        <td>Primary key</td>
      </tr>
      <tr>
        <td>provider</td>
        <td>Auth_Provider</td>
        <td>Enum authentication provider</td>
      </tr>
      <tr>
        <td>providerUserId</td>
        <td>string</td>
        <td>user's identifier</td>
      </tr>
      <tr>
        <td>magic_token</td>
        <td>string</td>
        <td>Unique token</td>
      </tr>
      <tr>
        <td>token_expiry</td>
        <td>datetime</td>
        <td>Expiry timestamp, optional</td>
      </tr>
      <tr>
        <td>refreshToken</td>
        <td>datetime</td>
        <td>Unique and optional.</td>
      </tr>
      <tr>
        <td>created_at</td>
        <td>datetime</td>
        <td>Timestamp of creation</td>
      </tr>
      <tr>
        <td>updated_at</td>
        <td>datetime</td>
        <td>Timestamp of last update</td>
      </tr>
    </tbody>
  </table>
</details>
<details>
  <summary><strong>ENUMS</strong></summary>
  <table>
    <thread>
      <tr>
        <th>Enum Name</th>
        <th>Values</th>
      </tr>
    </thread>
    <tbody>
      <tr>
        <td>STATUS</td>
        <td>GOING, NOT_GOING, WAITING, PENDING, INVITED, CANCELLED</td>
      </tr>
      <tr>
        <td>HOST_ROLE</td>
        <td>CREATOR, MANAGER, READ_ONLY, CELEBRITY</td>
      </tr>
      <tr>
        <td>VENUE_TYPE</td>
        <td>PHYSICAL, VIRTUAL, LATER</td>
      </tr>
      <tr>
        <td>PLATFORM</td>
        <td>PERSONAL_WEBSITE, INSTAGRAM, TWITTER</td>
      </tr>
      <tr>
        <td>AUTH_PROVIDER</td>
        <td>MAGIC_LINK, GOOGLE</td>
      </tr>
    </tbody>
  </table>
</details>

## Endpoints

<details> 
<summary>Users</summary>

| URL              | Method | Auth Required | Description          |
|------------------|--------|---------------|----------------------|
| `/users/profile` | POST   | True           | Update user profile  |

> <details> 
> <summary>Request body</summary>
> 
> ```json
> {
>   "fullName": "Arjun Sharma",
>   "location": "Mumbai, India",
>   "bio": "Full-stack developer and tech community builder",
>   "twitter": "https://twitter.com/arjunsharma",
>   "instagram": "https://instagram.com/arjun.codes",
>   "website": "https://arjunsharma.dev",
>   "profileIcon": 5
> }
> ```
> </details>
>
> <details> 
> <summary>Response body</summary>
> 
> ```json
> {
>   "message": "success",
>   "data": {
>     "id": "d7e393b4-19dc-43ab-9a31-6ab9256123cb",
>     "primaryEmail": "arjun.sharma@gmail.com",
>     "secondaryEmail": null,
>     "contact": "+91-9876543210",
>     "fullName": "Arjun Sharma",
>     "userName": "arjun.dev",
>     "magicToken": null,
>     "refreshToken": "eyJhbGciOiJIUzI1N********",
>     "isCompleted": true,
>     "location": "Mumbai, India",
>     "bio": "Full-stack developer and tech community builder",
>     "twitter": "https://twitter.com/arjunsharma",
>     "instagram": "https://instagram.com/arjun.codes",
>     "website": "https://arjunsharma.dev",
>     "profileIcon": 5,
>     "eventParticipationEnabled": true,
>     "hasUnlimitedAccess": false,
>     "isDeleted": false,
>     "createdAt": "2025-04-20T09:45:12.303Z",
>     "updatedAt": "2025-04-24T06:30:00.000Z"
>   }
> }
> ```
> </details>

---
| URL                | Method | Auth Required | Description         |
|--------------------|--------|---------------|---------------------|
| `/users/:username` | GET    | True           | Get public profile  |

> <details> 
> <summary>Response body</summary>
> 
> ```json
> {
>   "message": "success",
>   "data": {
>     "id": "d7e393b4-19dc-43ab-9a31-6ab9256123cb",
>     "primaryEmail": "arjun.sharma@gmail.com",
>     "secondaryEmail": null,
>     "contact": null,
>     "fullName": "Arjun Sharma",
>     "userName": "arjun.dev",
>     "isCompleted": true,
>     "location": "Mumbai, India",
>     "bio": "Full-stack developer and tech community builder",
>     "twitter": "https://twitter.com/arjunsharma",
>     "instagram": "https://instagram.com/arjun.codes",
>     "website": "https://arjunsharma.dev",
>     "profileIcon": 5,
>     "eventParticipationEnabled": true,
>     "hasUnlimitedAccess": false,
>     "isDeleted": false,
>     "createdAt": "2025-04-20T09:45:12.303Z",
>     "updatedAt": "2025-04-24T06:30:00.000Z"
>   }
> }
> ```
> </details>

---
| URL              | Method | Auth Required | Description           |
|------------------|--------|---------------|-----------------------|
| `/users` | DELETE | True           | Delete user account   |

> <details> 
> <summary>Response body</summary>
> 
> ```json
> {
>   "data": {
>     "id": "d7e393b4-19dc-43ab-9a31-6ab9256123cb",
>     "primaryEmail": "arjun.sharma@gmail.com",
>     "secondaryEmail": "arjun.work@gmail.com",
>     "contact": "+91-9876543210",
>     "fullName": "Arjun Sharma",
>     "userName": "arjun.dev",
>     "isCompleted": true,
>     "location": "Mumbai, India",
>     "bio": "Full-stack developer and tech community builder",
>     "twitter": "https://twitter.com/arjunsharma",
>     "instagram": "https://instagram.com/arjun.codes",
>     "website": "https://arjunsharma.dev",
>     "profileIcon": 5,
>     "eventParticipationEnabled": true,
>     "hasUnlimitedAccess": false,
>     "isDeleted": true,
>     "createdAt": "2023-01-01T12:00:00Z",
>     "updatedAt": "2025-04-24T07:00:00.000Z"
>   },
>   "message": "User deleted successfully",
>   "success": true
> }
> ```
> </details>

</details>

<details>
<summary>Authentication</summary>

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/auth/signin` | POST | False | Initiates sign-in process by sending a magic link |

> <details>
> <summary>Request body</summary>
> 
> ```json
> {
>   "email": "arjun.sharma@gmail.com"
> }
> ```
> </details>
>
> <details>
> <summary>Response body</summary>
> 
> ```json
> {
>   "message": "success"
> }
> ```
>
> **Response:** `200 OK`
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/auth/google-signin` | POST | False | Authenticates a user via Google OAuth by exchanging the authorization code for tokens, verifying the user, and issuing JWT-based session cookies. |

> <details>
> <summary>Request body</summary>
> 
> ```json
> {
>   "code": "4/0AVMBsJjtmEI..."
> }
> ```
> </details>
>
> <details>
> <summary>Response body</summary>
> 
> ```json
> {
>   "data": {
>     "user": {
>       "isCompleted": true
>     }
>   }
> }
> ```
>
> **Response:** `200 OK`
>
> **Note:**  
> This endpoint also sets two cookies:
> - `accessToken` – HTTP-only cookie that expires in 15 minutes
> - `refreshToken` – HTTP-only cookie that expires in 7 days
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/auth/oauth/google` | GET | False | Generates the Google OAuth URL for frontend login redirection. |

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/auth/verify-signin` | POST | False | Verifies magic link token and generates access tokens |

> <details>
> <summary>Request body</summary>
> 
> ```json
> {
>   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
> }
> ```
> </details>
>
> <details>
> <summary>Response body</summary>
> 
> ```json
> {
>   "data": {
>     "user": {
>       "isCompleted": true
>     }
>   }
> }
> ```
>
> **Response:** `200 OK`
>
> **Note:**  
> This endpoint also sets two cookies:
> - `accessToken` – HTTP-only cookie that expires in 15 minutes
> - `refreshToken` – HTTP-only cookie that expires in 7 days
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/auth/logout` | POST | True | Logs out user by clearing tokens |

> <details>
> <summary>Request body</summary>
> 
> ```json
> {
>   "userId": "d7e393b4-19dc-43ab-9a31-6ab9256123cb"
> }
> ```
> </details>
>
> <details>
> <summary>Response body</summary>
> 
> _Empty response body_
>
> **Response:** `204 No Content`
>
> **Note:**  
> This endpoint clears the `accessToken` and `refreshToken` cookies.
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/auth/me` | GET | True | Retrieves authenticated user profile |

> <details>
> <summary>Response body</summary>
> 
> ```json
> {
>   "message": "success",
>   "data": {
>     "id": "d7e393b4-19dc-43ab-9a31-6ab9256123cb",
>     "primaryEmail": "arjun.sharma@gmail.com",
>     "secondaryEmail": "arjun.work@gmail.com",
>     "contact": "+91-9876543210",
>     "fullName": "Arjun Sharma",
>     "userName": "arjun.dev",
>     "isCompleted": true,
>     "location": "Mumbai, India",
>     "bio": "Full-stack developer and tech community builder",
>     "twitter": "https://twitter.com/arjunsharma",
>     "instagram": "https://instagram.com/arjun.codes",
>     "website": "https://arjunsharma.dev",
>     "profileIcon": 5,
>     "eventParticipationEnabled": true,
>     "hasUnlimitedAccess": false,
>     "isDeleted": false,
>     "createdAt": "2023-01-01T12:00:00Z",
>     "updatedAt": "2025-04-24T07:00:00.000Z"
>   }
> }
> ```
>
> **Response:** `200 OK`
> </details>

</details>

<details>
<summary>Cohosts</summary>

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/cohost/events/:eventId` | GET | True | Get all cohosts for an event |

> <details>
> <summary>Response body</summary>
> 
> ```json
> [
>   {
>     "role": "MANAGER",
>     "user": {
>       "secondaryEmail": "arjun.work@gmail.com",
>       "contact": "+91-9876543210",
>       "fullName": "Arjun Sharma",
>       "userName": "arjun.dev",
>       "isCompleted": true,
>       "location": "Mumbai, India",
>       "bio": "Full-stack developer and tech community builder",
>       "twitter": "https://twitter.com/arjunsharma",
>       "instagram": "https://instagram.com/arjun.codes",
>       "website": "https://arjunsharma.dev",
>       "profileIcon": 5,
>       "eventParticipationEnabled": true,
>       "hasUnlimitedAccess": false,
>       "isDeleted": false,
>       "createdAt": "2023-01-01T12:00:00Z",
>       "updatedAt": "2025-04-24T07:00:00.000Z"
>     }
>   }
> ]
> ```
>
> **Response:** `200 OK`
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/cohost/` | POST | True | Add a new cohost to an event |

> <details>
> <summary>Request body</summary>
> 
> ```json
> {
>   "email": "priya.patel@gmail.com",
>   "eventId": "e8f493b4-19dc-43ab-9a31-6ab92569986ted",
>   "role": "MANAGER"
> }
> ```
> </details>
>
> <details>
> <summary>Response body</summary>
> 
> ```json
> {
>   "message": "success",
>   "data": {
>     "id": "cohost-uuid-002",
>     "userId": "user-uuid-002",
>     "eventId": "e8f493b4-19dc-43ab-9a31-6ab92569986ted",
>     "role": "MANAGER",
>     "isDeleted": false,
>     "createdAt": "2025-04-24T09:10:00.000Z",
>     "updatedAt": "2025-04-24T09:10:00.000Z"
>   }
> }
> ```
>
> **Response:** `201 Created`
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/cohost/events/:eventId/:cohostUserId` | DELETE | True | Remove a cohost from an event |

> <details>
> <summary>Response body</summary>
> 
> ```json
> {
>   "message": "Cohost removed successfully"
> }
> ```
>
> **Response:** `200 OK`
> </details>


</details>

<details>
<summary>Events</summary>

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/upload-image` | GET | False | Generates a presigned URL for uploading an event image to S3 |

> <details>
> <summary>Query parameters</summary>
> 
> - `filename`: Name of the file to be uploaded (required)
> </details>
>
> <details>
> <summary>Response body</summary>
> 
> ```json
> {
>   "signedUrl": "https://s3.amazonaws.com/bucket-name/uuid-bangalore-tech-meetup.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
>   "key": "123e4567-e89b-12d3-a456-426614174000-bangalore-tech-meetup.jpg"
> }
> ```
>
> **Response:** `200 OK`
>
> **Note:**  
> The presigned URL is valid for one hour (3600 seconds) and allows for a single PUT operation to upload the file to S3.
> The generated `key` should be saved to reference the file later.
> </details>

---

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event` | GET | False | List/filter all events |

> <details>
> <summary>Query parameters</summary>
>
> - `category`: Filter by event category (optional)
> - `startDate`: Filter events starting after this date (format: YYYY-MM-DD) (optional)
> - `endDate`: Filter events ending before this date (format: YYYY-MM-DD) (optional)
> - `page`: Page number for pagination
> - `limit`: Number of results per page
> - `location`: Filter by event location (optional)
> - `sortOrder`: Sort order (asc or desc) (optional)
> - `search`: Search by event name or description (optional)
> - `sortBy`: Sort by field (e.g., "startTime") (optional)
> </details>
>
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>     "message": "Filtered Events Data",
>     "data": {
>         "events": [
>             {
>                 "id": "62bb89e0-3314-4acd-8475-3e5b349edaf3",
>                 "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>                 "name": "Bangalore DevOps Meetup 2025",
>                 "slug": "bangalore-devops-meetup-2025-m9r17su1",
>                 "category": "Technology",
>                 "startTime": "2025-06-15T09:00:00.000Z",
>                 "endTime": "2025-06-15T18:00:00.000Z",
>                 "eventDate": "2025-06-15T00:00:00.000Z",
>                 "description": "Annual DevOps community meetup in Bangalore featuring workshops and discussions",
>                 "eventImageUrl": "blr-devops-2025",
>                 "venueType": "PHYSICAL",
>                 "venueAddress": "WeWork Galaxy, Residency Road, Bangalore",
>                 "venueUrl": null,
>                 "hostPermissionRequired": true,
>                 "capacity": 150,
>                 "isActive": true,
>                 "isDeleted": false,
>                 "createdAt": "2025-04-21T12:08:01.468Z",
>                 "updatedAt": "2025-04-21T12:08:01.468Z",
>                 "creator": {
>                     "profileIcon": 2,
>                     "fullName": "Priya Desai",
>                     "userName": "priyad"
>                 }
>             }
>         ],
>         "metadata": {
>             "total": 2,
>             "page": 1,
>             "limit": 10,
>             "hasMore": false
>         }
>     }
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/slug/:slug` | GET | True | Get event details by slug |

> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "event": {
>     "id": "62bb89e0-3314-4acd-8475-3e5b349edaf3",
>     "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>     "name": "Bangalore DevOps Meetup 2025",
>     "slug": "bangalore-devops-meetup-2025-m9r17su1",
>     "category": "Technology",
>     "startTime": "2025-06-15T09:00:00.000Z",
>     "endTime": "2025-06-15T18:00:00.000Z",
>     "eventDate": "2025-06-15T00:00:00.000Z",
>     "description": "Annual DevOps community meetup in Bangalore featuring workshops and discussions",
>     "eventImageUrl": "blr-devops-2025",
>     "venueType": "PHYSICAL",
>     "venueAddress": "WeWork Galaxy, Residency Road, Bangalore",
>     "venueUrl": null,
>     "hostPermissionRequired": true,
>     "capacity": 150,
>     "isActive": true,
>     "isDeleted": false,
>     "createdAt": "2025-04-21T12:08:01.468Z",
>     "updatedAt": "2025-04-21T12:08:01.468Z",
>     "creator": {
>       "profileIcon": 2,
>       "fullName": "Priya Desai",
>       "userName": "priyad"
>     },
>     "cohosts": [
>       {
>         "role": "CREATOR",
>         "user": {
>           "profileIcon": 2,
>           "fullName": "Priya Desai",
>           "userName": "priyad"
>         }
>       },
>       {
>         "role": "MANAGER",
>         "user": {
>           "profileIcon": 5,
>           "fullName": "Arjun Sharma",
>           "userName": "arjun.dev"
>         }
>       }
>     ]
>   },
>   "totalAttendees": 45
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event` | POST | True | Create a new event |

> <details>
> <summary>Request body</summary>
>
> ```json
> {
>   "name": "Pune React JS Developers Meetup",
>   "category": "Technology",
>   "description": "Monthly gathering of React developers in Pune to share knowledge and network",
>   "eventImageUrl": "pune-react-meetup",
>   "venueType": "PHYSICAL",
>   "venueAddress": "Koregaon Park, Pune, Maharashtra",
>   "hostPermissionRequired": true,
>   "capacity": 80,
>   "startTime": "2025-05-25T16:00:00Z",
>   "endTime": "2025-05-25T19:00:00Z",
>   "eventDate": "2025-05-25T00:00:00Z"
> }
> ```
> </details>
>
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "message": "success",
>   "event": {
>     "id": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>     "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>     "name": "Pune React JS Developers Meetup",
>     "slug": "pune-react-js-developers-meetup-m9wfymcz",
>     "category": "Technology",
>     "startTime": "2025-05-25T16:00:00.000Z",
>     "endTime": "2025-05-25T19:00:00.000Z",
>     "eventDate": "2025-05-25T00:00:00.000Z",
>     "description": "Monthly gathering of React developers in Pune to share knowledge and network",
>     "eventImageUrl": "pune-react-meetup",
>     "venueType": "PHYSICAL",
>     "venueAddress": "Koregaon Park, Pune, Maharashtra",
>     "venueUrl": null,
>     "hostPermissionRequired": true,
>     "capacity": 80,
>     "isActive": true,
>     "isDeleted": false,
>     "createdAt": "2025-04-25T06:59:38.293Z",
>     "updatedAt": "2025-04-25T06:59:38.293Z"
>   }
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/upcoming` | GET | True | Get upcoming events for authenticated user |

> <details>
> <summary>Query parameters</summary>
>
> - `startDate`: Filter events starting after this date (format: YYYY-MM-DD) (optional)
> - `endDate`: Filter events ending before this date (format: YYYY-MM-DD) (optional)
> - `page`: Page number for pagination
> - `limit`: Number of results per page
> </details>
>
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "message": "Registered events retrieved successfully",
>   "data": [
>     {
>       "id": "62bb89e0-3314-4acd-8475-3e5b349edaf3",
>       "name": "Bangalore DevOps Meetup 2025",
>       "startTime": "2025-06-15T09:00:00.000Z",
>       "endTime": "2025-06-15T18:00:00.000Z",
>       "venueType": "PHYSICAL",
>       "venueAddress": "WeWork Galaxy, Residency Road, Bangalore",
>       "venueUrl": null
>     },
>     {
>       "id": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>       "name": "Pune React JS Developers Meetup",
>       "startTime": "2025-05-25T16:00:00.000Z",
>       "endTime": "2025-05-25T19:00:00.000Z",
>       "venueType": "PHYSICAL",
>       "venueAddress": "Koregaon Park, Pune, Maharashtra",
>       "venueUrl": null
>     }
>   ],
>   "metadata": {
>     "totalItems": 2,
>     "totalPages": 1,
>     "currentPage": 1
>   }
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/popular` | GET | False | Get popular events (by attendee count) |

> <details>
> <summary>Query parameters</summary>
>
> - `limit`: Number of results per page
> </details>
>
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "data": [
>     {
>       "id": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>       "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>       "name": "Pune React JS Developers Meetup",
>       "slug": "pune-react-js-developers-meetup-m9wfymcz",
>       "category": "Technology",
>       "startTime": "2025-05-25T16:00:00.000Z",
>       "endTime": "2025-05-25T19:00:00.000Z",
>       "eventDate": "2025-05-25T00:00:00.000Z",
>       "description": "Monthly gathering of React developers in Pune to share knowledge and network",
>       "eventImageUrl": "pune-react-meetup",
>       "venueType": "PHYSICAL",
>       "venueAddress": "Koregaon Park, Pune, Maharashtra",
>       "venueUrl": null,
>       "hostPermissionRequired": true,
>       "capacity": 80,
>       "isActive": true,
>       "isDeleted": false,
>       "createdAt": "2025-04-25T06:59:38.293Z",
>       "updatedAt": "2025-04-25T06:59:38.293Z",
>       "creator": {
>         "fullName": "Arjun Sharma",
>         "profileIcon": 5,
>         "userName": "arjun.dev"
>       },
>       "attendees": [
>         {
>           "id": "d4557290-b110-4502-867f-b5d5bc50a06d",
>           "userId": "1c1df2a1-6f3f-4908-8d17-2d2ca55839af",
>           "eventId": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>           "registrationTime": "2025-04-25T07:23:06.828Z",
>           "hasAttended": false,
>           "checkInTime": null,
>           "feedback": null,
>           "qrToken": "5lfXAg",
>           "status": "GOING",
>           "allowedStatus": true,
>           "isDeleted": false,
>           "createdAt": "2025-04-25T07:23:06.828Z",
>           "updatedAt": "2025-04-25T07:23:06.828Z"
>         }
>       ]
>     }
>   ],
>   "message": "Popular events retrieved successfully"
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/user` | GET | True | Get events created by authenticated user |

> <details>
> <summary>Query parameters</summary>
> 
> - `limit`: Number of results per page (optional)
> - `page`: Page number for pagination (optional)
> - `sortBy`: Field to sort by (e.g., "startTime") (optional)
> - `sortOrder`: Order of sorting ("asc" or "desc") (optional)
> - `search`: Search by event name or description (optional)
> - `category`: Filter by event category (optional)
> - `fromDate`: Filter events starting after this date (format: YYYY-MM-DD) 
> - `toDate`: Filter events ending before this date (format: YYYY-MM-DD)
> - `venueType`: Filter by venue type (PHYSICAL or VIRTUAL) (optional)
> </details>
>
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "message": "success",
>   "data": {
>     "events": [
>       {
>         "id": "62bb89e0-3314-4acd-8475-3e5b349edaf3",
>         "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>         "name": "Bangalore DevOps Meetup 2025",
>         "slug": "bangalore-devops-meetup-2025-m9r17su1",
>         "category": "Technology",
>         "startTime": "2025-06-15T09:00:00.000Z",
>         "endTime": "2025-06-15T18:00:00.000Z",
>         "eventDate": "2025-06-15T00:00:00.000Z",
>         "description": "Annual DevOps community meetup in Bangalore featuring workshops and discussions",
>         "eventImageUrl": "blr-devops-2025",
>         "venueType": "PHYSICAL",
>         "venueAddress": "WeWork Galaxy, Residency Road, Bangalore",
>         "venueUrl": null,
>         "hostPermissionRequired": true,
>         "capacity": 150,
>         "isActive": true,
>         "isDeleted": false,
>         "createdAt": "2025-04-21T12:08:01.468Z",
>         "updatedAt": "2025-04-21T12:08:01.468Z"
>       },
>       {
>         "id": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>         "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>         "name": "Delhi Tech Startups Networking",
>         "slug": "delhi-tech-startups-networking-m9wfymcz",
>         "category": "Networking",
>         "startTime": "2025-05-15T17:00:00.000Z",
>         "endTime": "2025-05-15T20:00:00.000Z",
>         "eventDate": "2025-05-15T00:00:00.000Z",
>         "description": "Network with Delhi's tech startup founders and investors",
>         "eventImageUrl": "delhi-startup-network",
>         "venueType": "PHYSICAL",
>         "venueAddress": "91springboard, Nehru Place, Delhi",
>         "venueUrl": null,
>         "hostPermissionRequired": true,
>         "capacity": 100,
>         "isActive": true,
>         "isDeleted": false,
>         "createdAt": "2025-04-25T06:59:38.293Z",
>         "updatedAt": "2025-04-25T08:05:32.308Z"
>       }
>     ],
>     "metadata": {
>       "total": 2,
>       "page": 1,
>       "limit": 10,
>       "hasMore": false
>     }
>   }
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId` | GET | True | Get event details by ID |

> <details>
> <summary>Response body</summary>
>
> ```json
> {
>     "event": {
>         "id": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>         "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>         "name": "Pune React JS Developers Meetup",
>         "slug": "pune-react-js-developers-meetup-m9wfymcz",
>         "category": "Technology",
>         "startTime": "2025-05-25T16:00:00.000Z",
>         "endTime": "2025-05-25T19:00:00.000Z",
>         "eventDate": "2025-05-25T00:00:00.000Z",
>         "description": "Monthly gathering of React developers in Pune to share knowledge and network",
>         "eventImageUrl": "pune-react-meetup",
>         "venueType": "PHYSICAL",
>         "venueAddress": "Koregaon Park, Pune, Maharashtra",
>         "venueUrl": null,
>         "hostPermissionRequired": true,
>         "capacity": 80,
>         "isActive": true,
>         "isDeleted": false,
>         "createdAt": "2025-04-25T06:59:38.293Z",
>         "updatedAt": "2025-04-25T06:59:38.293Z",
>         "creator": {
>             "profileIcon": 5,
>             "fullName": "Arjun Sharma",
>             "userName": "arjun.dev"
>         },
>         "cohosts": [
>             {
>                 "role": "CREATOR",
>                 "user": {
>                     "profileIcon": 5,
>                     "fullName": "Arjun Sharma",
>                     "userName": "arjun.dev"
>                 }
>             }
>         ]
>     },
>     "totalAttendees": 65
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId` | PATCH | True | Update event details (CREATOR only) |

> <details>
> <summary>Request body</summary>
>
> ```json
> {
>   "name": "Updated Event Name",
>   "description": "Updated description",
>   "category": "Technology",
>   "eventImageUrl": "img123456",
>   "venueType": "PHYSICAL",
>   "venueAddress": "New Address",
>   "hostPermissionRequired": true,
>   "capacity": 100,
>   "startTime": "2025-05-15T09:00:00.000Z",
>   "endTime": "2025-05-15T17:00:00.000Z",
>   "eventDate": "2025-05-15T00:00:00.000Z"
> }
> ```
> </details>
>
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "message": "success",
>   "event": {
>     "id": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>     "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>     "name": "Updated Event Name",
>     "slug": "tech-conference-2025-4-m9wfymcz",
>     "category": "Technology",
>     "startTime": "2025-05-15T09:00:00.000Z",
>     "endTime": "2025-05-15T17:00:00.000Z",
>     "eventDate": "2025-05-15T00:00:00.000Z",
>     "description": "Updated description",
>     "eventImageUrl": "img123456",
>     "venueType": "PHYSICAL",
>     "venueAddress": "New Address",
>     "venueUrl": null,
>     "hostPermissionRequired": true,
>     "capacity": 100,
>     "isActive": true,
>     "isDeleted": false,
>     "createdAt": "2025-04-25T06:59:38.293Z",
>     "updatedAt": "2025-04-25T08:05:32.308Z"
>   }
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/cancel` | PATCH | True | Cancel an event (CREATOR only) |

> <details>
> <summary>Response body</summary>
>
> ```json
> {
>     "data": {
>         "id": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>         "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>         "name": "Delhi Tech Startups Networking",
>         "slug": "delhi-tech-startups-networking-m9wfymcz",
>         "category": "Networking",
>         "startTime": "2025-05-15T17:00:00.000Z",
>         "endTime": "2025-05-15T20:00:00.000Z",
>         "eventDate": "2025-05-15T00:00:00.000Z",
>         "description": "Network with Delhi's tech startup founders and investors",
>         "eventImageUrl": "delhi-startup-network",
>         "venueType": "PHYSICAL",
>         "venueAddress": "91springboard, Nehru Place, Delhi",
>         "venueUrl": null,
>         "hostPermissionRequired": true,
>         "capacity": 100,
>         "isActive": false,
>         "isDeleted": false,
>         "createdAt": "2025-04-25T06:59:38.293Z",
>         "updatedAt": "2025-04-25T10:17:07.298Z"
>     },
>     "success": true
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId` | DELETE | True | Soft delete an event (CREATOR only) |

> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "data": {
>     "id": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>     "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>     "name": "Delhi Tech Startups Networking",
>     "slug": "delhi-tech-startups-networking-m9wfymcz",
>     "category": "Networking",
>     "startTime": "2025-05-15T17:00:00.000Z",
>     "endTime": "2025-05-15T20:00:00.000Z",
>     "eventDate": "2025-05-15T00:00:00.000Z",
>     "description": "Network with Delhi's tech startup founders and investors",
>     "eventImageUrl": "delhi-startup-network",
>     "venueType": "PHYSICAL",
>     "venueAddress": "91springboard, Nehru Place, Delhi",
>     "venueUrl": null,
>     "hostPermissionRequired": true,
>     "capacity": 100,
>     "isActive": false,
>     "isDeleted": true,
>     "createdAt": "2025-04-25T06:59:38.293Z",
>     "updatedAt": "2025-04-25T10:37:39.243Z"
>   },
>   "message": "Event deleted successfully",
>   "success": true
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/slug` | PATCH | True | Update event slug (CREATOR only) |

> <details>
> <summary>Request body</summary>
>
> ```json
> {
>   "slug": "bengaluru-tech-founders-meetup"
> }
> ```
> </details>
>
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>     "data": {
>         "id": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>         "creatorId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>         "name": "Delhi Tech Startups Networking",
>         "slug": "bengaluru-tech-founders-meetup",
>         "category": "Networking",
>         "startTime": "2025-05-15T17:00:00.000Z",
>         "endTime": "2025-05-15T20:00:00.000Z",
>         "eventDate": "2025-05-15T00:00:00.000Z",
>         "description": "Network with Delhi's tech startup founders and investors",
>         "eventImageUrl": "delhi-startup-network",
>         "venueType": "PHYSICAL",
>         "venueAddress": "91springboard, Nehru Place, Delhi",
>         "venueUrl": null,
>         "hostPermissionRequired": true,
>         "capacity": 100,
>         "isActive": true,
>         "isDeleted": false,
>         "createdAt": "2025-04-25T06:59:38.293Z",
>         "updatedAt": "2025-04-25T11:09:16.762Z"
>     },
>     "success": true
> }
> ```
> </details>

---
| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/attendees` | POST | True | Register as an attendee for an event |

> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "id": "d4557290-b110-4502-867f-b5d5bc50a06d",
>   "userId": "1c1df2a1-6f3f-4908-8d17-2d2ca55839af",
>   "eventId": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>   "registrationTime": "2025-04-25T07:23:06.828Z",
>   "hasAttended": false,
>   "checkInTime": null,
>   "feedback": null,
>   "qrToken": "5lfXAg",
>   "status": "GOING",
>   "allowedStatus": true,
>   "isDeleted": false,
>   "createdAt": "2025-04-25T07:23:06.828Z",
>   "updatedAt": "2025-04-25T07:23:06.828Z"
> }
> ```
> </details>

---

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/attendees` | GET | True | Get paginated list of attendees (CREATOR/MANAGER only) |

> <details>
> <summary>Query parameters</summary>
>
> - `limit`: Number of results per page (optional)
> - `page`: Page number for pagination (optional)
> - `sortBy`: Field to sort by (e.g., "startTime") (optional)
> - `sortOrder`: Order of sorting ("asc" or "desc") (optional)
> - `status`: Filter by attendee status (e.g., "GOING", "WAITLIST") (optional)
> - `search`: Search by user name or email (primary, secondary) (optional)
> - `hasAttended`: Filter by attendance status (true/false) (optional)
> </details>
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>     "data": [
>         {
>             "id": "d4557290-b110-4502-867f-b5d5bc50a06d",
>             "userId": "1c1df2a1-6f3f-4908-8d17-2d2ca55839af",
>             "eventId": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>             "registrationTime": "2025-04-25T07:23:06.828Z",
>             "hasAttended": false,
>             "checkInTime": null,
>             "feedback": null,
>             "qrToken": "5lfXAg",
>             "status": "GOING",
>             "allowedStatus": true,
>             "isDeleted": false,
>             "createdAt": "2025-04-25T07:23:06.828Z",
>             "updatedAt": "2025-04-25T07:23:06.828Z",
>             "user": {
>                 "id": "1c1df2a1-6f3f-4908-8d17-2d2ca55839af",
>                 "primaryEmail": "rohitsharma@gmail.com",
>                 "secondaryEmail": null,
>                 "contact": "+91 9876543210",
>                 "fullName": "Rohit Sharma",
>                 "userName": "rohit_sharma45",
>                 "magicToken": null,
>                 "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYzFkZjJhMS02ZjNmLTQ5MDgtOGQxNy0yZDJjYTU1ODM5YWYiLCJpYXQiOjE3NDU1NjUyODUsImV4cCI6MTc0NjE3MDA4NX0.gVLr948ZxCyXY__Shzw4DpG9RhCVs-ypzNiDtVcS3fw",
>                 "isCompleted": true,
>                 "location": "Mumbai, Maharashtra",
>                 "bio": "Tech enthusiast and startup mentor",
>                 "twitter": "@hitman45",
>                 "instagram": "rohit_sharma45",
>                 "website": "https://rohitsharma.dev",
>                 "profileIcon": 4,
>                 "eventParticipationEnabled": true,
>                 "hasUnlimitedAccess": false,
>                 "isDeleted": false,
>                 "createdAt": "2025-04-21T12:08:25.043Z",
>                 "updatedAt": "2025-04-25T07:14:45.804Z"
>             }
>         }
>     ],
>     "metadata": {
>         "total": 1,
>         "page": 1,
>         "limit": 10,
>         "hasMore": false
>     }
> }
> ```
> </details>

---

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/attendees/excel` | GET | True | Download attendee list as Excel (CREATOR/MANAGER only) |
> <details>
> <summary>Response body</summary>
>
> ```
> Returns an Excel file with attendee details
> ```
> </details>

---

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/communications` | POST | True | Send notification to event attendees (CREATOR/MANAGER only) |
> <details>
> <summary>Request body</summary>
>
> ```json
> {
>   "content": "Important venue update: We have moved to a larger venue at WeWork Koramangala. Please check your email for details."
> }
> ```
> </details>
>
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "id": "25170615-38c2-4b4d-881a-4ea63df2dc9d",
>   "userId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>   "eventId": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>   "content": "Important venue update: We have moved to a larger venue at WeWork Koramangala. Please check your email for details.",
>   "isNotification": true,
>   "scheduledNotificationTime": "2025-04-25T12:29:13.249Z",
>   "isDeleted": false,
>   "createdAt": "2025-04-25T12:29:13.254Z",
>   "updatedAt": "2025-04-25T12:29:13.254Z",
>   "user": {
>     "id": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>     "name": "Priya Desai",
>     "email": "priya.desai@gmail.com"
>   }
> }
> ```
> </details>

---

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/communications` | GET | True | Get all communications for an event |
> <details>
> <summary>Response body</summary>
>
> ```json
> [
>   {
>     "id": "25170615-38c2-4b4d-881a-4ea63df2dc9d",
>     "userId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>     "eventId": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>     "content": "Important venue update: We have moved to a larger venue at WeWork Koramangala. Please check your email for details.",
>     "isNotification": true,
>     "scheduledNotificationTime": "2025-04-25T12:29:13.249Z",
>     "isDeleted": false,
>     "createdAt": "2025-04-25T12:29:13.254Z",
>     "updatedAt": "2025-04-25T12:29:13.254Z",
>     "user": {
>       "id": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>       "fullName": "Priya Desai",
>       "primaryEmail": "priya.desai@gmail.com",
>       "profileIcon": 2
>     }
>   },
>   {
>     "id": "a23f4d67-890e-45f2-82ab-cd1234ef5678",
>     "userId": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>     "eventId": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>     "content": "Reminder: Our event is happening tomorrow! Don't forget to bring your laptop and business cards.",
>     "isNotification": true,
>     "scheduledNotificationTime": "2025-05-14T09:00:00.000Z",
>     "isDeleted": false,
>     "createdAt": "2025-05-13T10:15:22.123Z",
>     "updatedAt": "2025-05-13T10:15:22.123Z",
>     "user": {
>       "id": "99393b4d-5bec-4cdf-b32a-6ab975627ea1",
>       "fullName": "Priya Desai",
>       "primaryEmail": "priya.desai@gmail.com",
>       "profileIcon": 2
>     }
>   }
> ]
> ```
> </details>

---

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/attendee/ticket` | GET | True | Get authenticated user's attendee ticket |
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>     "attendee": {
>         "id": "d4557290-b110-4502-867f-b5d5bc50a06d",
>         "userId": "1c1df2a1-6f3f-4908-8d17-2d2ca55839af",
>         "eventId": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>         "registrationTime": "2025-04-25T07:23:06.828Z",
>         "hasAttended": true,
>         "checkInTime": "2025-04-25T11:45:47.176Z",
>         "feedback": null,
>         "qrToken": "5lfXAg",
>         "status": "GOING",
>         "allowedStatus": true,
>         "isDeleted": false,
>         "createdAt": "2025-04-25T07:23:06.828Z",
>         "updatedAt": "2025-04-25T11:45:47.179Z"
>     },
>     "message": "Fetch ticket successfully"
> }
> ```
> </details>

---

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/attendee/:attendeeId/verify` | PATCH | True | Verify attendee's QR code (CREATOR/MANAGER only) |
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "message": "Ticket is valid"
> }
> ```
> </details>

---

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/attendee/qr/:qrToken` | GET | True | Get attendee details by QR token (CREATOR/MANAGER only) |
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>     "id": "d4557290-b110-4502-867f-b5d5bc50a06d",
>     "userId": "1c1df2a1-6f3f-4908-8d17-2d2ca55839af",
>     "eventId": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>     "registrationTime": "2025-04-25T07:23:06.828Z",
>     "hasAttended": false,
>     "checkInTime": null,
>     "feedback": null,
>     "qrToken": "5lfXAg",
>     "status": "GOING",
>     "allowedStatus": true,
>     "isDeleted": false,
>     "createdAt": "2025-04-25T07:23:06.828Z",
>     "updatedAt": "2025-04-25T07:23:06.828Z",
>     "user": {
>         "fullName": "Rohit Sharma",
>         "primaryEmail": "rohitsharma@gmail.com",
>         "contact": "+91 9876543210"
>     }
> }
> ```
> </details>

---

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/attendee/:attendeeId/status` | PATCH | True | Update attendee's allowed status and status (CREATOR/MANAGER only) |
> <details>
> <summary>Request body</summary>
>
> ```json
> {
>   "allowedStatus": true
> }
> ```
> </details>
>
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "message": "Attendee status updated successfully",
>   "data": {
>     "id": "d4557290-b110-4502-867f-b5d5bc50a06d",
>     "userId": "1c1df2a1-6f3f-4908-8d17-2d2ca55839af",
>     "eventId": "87ad550c-da53-4fef-aaf0-9e62f6810205",
>     "registrationTime": "2025-04-25T07:23:06.828Z",
>     "hasAttended": false,
>     "checkInTime": null,
>     "feedback": null,
>     "qrToken": "5lfXAg",
>     "status": "GOING",
>     "allowedStatus": true,
>     "isDeleted": false,
>     "createdAt": "2025-04-25T07:23:06.828Z",
>     "updatedAt": "2025-04-25T14:18:32.451Z"
>   }
> }
> ```
> </details>

---

| URL | Method | Auth Required | Description |
|-----|--------|---------------|-------------|
| `/event/:eventId/attendee` | DELETE | True | Remove authenticated user from attendee list |
> <details>
> <summary>Response body</summary>
>
> ```json
> {
>   "message": "Attendee removed successfully"
> }
> ```
> </details>
>
> 
