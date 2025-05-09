# RSVP API Documentation

## Run the Project locally

```bash
git clone https://github.com/TeamShiksha/rsvp.git
cd rsvp
pnpm install
# Configure Environment Variables
pnpm  -F server migrate
pnpm -r dev
```

## Configure Environment Variables:

- Use the `.env_example` file as a reference to set up your environment variables.
- Rename it to `.env` and populate the required values.

## AWS setup

Developers should use the provided [CloudFormation template](../apps/server/aws/cft_dev_rsvp.yml) to create the necessary AWS resources. This template simplifies the setup process by provisioning and configuring the required infrastructure automatically. You will get the following environment from the setup:

- `AWS_ACCESS_KEY`
- `AWS_SECRET_KEY`
- `AWS_BUCKET_NAME`
- `AWS_REGION`

> [!CAUTION]
> Do not share these env with anyone.

## ER Diagram

The Physical Data Model/Entity-Relationship (ER) Diagram below provides a visual representation of the database schema. It illustrates the relationships between various entities, such as `users`, `events`, and more, along with their attributes and connections.

This diagram is a valuable tool for developers as it helps in understanding the structure of the database, the relationships between different entities, and the constraints applied. By referring to the ER Diagram, developers can design, query, and maintain the database more effectively, ensuring consistency and clarity in the application development process.

![ERDiagram](./images/ERDiagram.png)

- `users`- Table contains user information.
- `events` - Table contains event information.
- `attendees` - Table contains event attendee information and ticket detail.
- `cohosts` - Table maps user to event to add cohost.
- `updates` - Table contains communication information for an event.

## UML Diagrams

### Repository UML diagram
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
