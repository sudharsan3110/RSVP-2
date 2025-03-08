# Database Schema Documentation

This document provides a comprehensive explanation of the database schema used in the RSVP application, including all tables, fields, relationships, and their usage within the application.

## Users

The `Users` model represents registered users in the system.

| Field                         | Type                      | Description                            | Usage                                                    |
| ----------------------------- | ------------------------- | -------------------------------------- | -------------------------------------------------------- |
| `id`                          | String (UUID)             | Primary identifier for the user        | Used as a reference in relationships with other tables   |
| `primary_email`               | String                    | Main email address (unique)            | Used for authentication via magic link and communication |
| `secondary_email`             | String (optional)         | Alternative email address              | Additional contact information                           |
| `contact`                     | String (optional)         | Phone number                           | Used for contact information in user profile             |
| `full_name`                   | String (optional)         | User's full name                       | Displayed in profile and event attendee lists            |
| `username`                    | String (optional, unique) | Username for profile                   | Used for unique identification in URLs                   |
| `magicToken`                  | String (optional, unique) | Temporary token for passwordless login | Used in the authentication process and deleted on login  |
| `refreshToken`                | String (optional, unique) | JWT refresh token                      | Used for authentication persistence                      |
| `is_completed`                | Boolean                   | Indicates if profile setup is complete | Used to determine if user has completed profile          |
| `location`                    | String (optional)         | User's geographical location           | Used for profile information                             |
| `bio`                         | String (optional)         | User's biography                       | Used for profile information                             |
| `twitter`                     | String (optional)         | Twitter social handle                  | Used for profile information                             |
| `instagram`                   | String (optional)         | Instagram social handle                | Used for profile information                             |
| `website`                     | String (optional)         | User's personal website                | Used for profile information                             |
| `profile_icon`                | String (optional)         | Profile picture identifier             | References an image stored in AWS S3                     |
| `event_participation_enabled` | Boolean                   | Allows user to participate in events   | Not used yet in any of the apis                          |
| `created_at`                  | DateTime                  | Timestamp of user creation             | Auditing and sorting                                     |
| `updated_at`                  | DateTime                  | Last update timestamp                  | Auditing and sorting                                     |

## Event

The `Event` model represents events created by users.

| Field                    | Type               | Description                            | Usage                                                            |
| ------------------------ | ------------------ | -------------------------------------- | ---------------------------------------------------------------- |
| `id`                     | String (UUID)      | Primary identifier for the event       | Used as reference in relationships                               |
| `creatorId`              | String             | User ID of event creator               | Links to the creator of the event                                |
| `name`                   | String             | Title of the event                     | Displayed in event listings and details                          |
| `slug`                   | String (unique)    | URL-friendly identifier                | Used in URLs for event pages                                     |
| `category`               | String (optional)  | Event category                         | Used for filtering and categorization                            |
| `startTime`              | DateTime           | Event start time                       | Used to display when event starts                                |
| `endTime`                | DateTime           | Event end time                         | Used to determine event duration and expiration                  |
| `eventDate`              | DateTime           | Date of the event                      | Used for calendar displays and filtering                         |
| `description`            | String (optional)  | Event description                      | Provides details about the event                                 |
| `eventImageId`           | String (optional)  | Image identifier for event             | References an image stored in AWS S3                             |
| `venueType`              | VenueType enum     | Type of venue (physical/virtual/later) | Determines location handling and display                         |
| `venueAddress`           | String (optional)  | Physical address for the event         | Used for physical events                                         |
| `venueUrl`               | String (optional)  | URL for virtual events                 | Used for virtual events                                          |
| `hostPermissionRequired` | Boolean            | Whether host approval is needed        | Used when the event is created                                   |
| `capacity`               | Integer (optional) | Maximum number of attendees            | Limits the number of people who can attend                       |
| `isActive`               | Boolean            | Whether event is active                | Used in create attendee controller and getPopularEvents function |
| `isCancelled`            | Boolean            | Whether event is cancelled             | Used in delete function in events.ts in models folder            |
| `isDeleted`              | Boolean            | Soft delete flag                       | Used in delete function in events.ts in models folder            |
| `createdAt`              | DateTime           | Timestamp of event creation            | Auditing and sorting                                             |
| `updatedAt`              | DateTime           | Last update timestamp                  | Auditing and sorting                                             |

## Attendee

The `Attendee` model represents users who have registered for events.

| Field              | Type                | Description                | Usage                                      |
| ------------------ | ------------------- | -------------------------- | ------------------------------------------ |
| `id`               | String (UUID)       | Primary identifier         | Used as unique reference                   |
| `userId`           | String              | User ID of attendee        | Links to the user attending                |
| `eventId`          | String              | ID of event being attended | Links to the associated event              |
| `registrationTime` | DateTime            | Time of registration       | Tracks when user registered                |
| `hasAttended`      | Boolean             | Whether user attended      | Tracks actual attendance                   |
| `checkInTime`      | DateTime (optional) | Time of check-in           | Records when user checked in               |
| `feedback`         | String (optional)   | Attendee feedback          | Stores comments from attendee              |
| `qrToken`          | String (unique)     | QR code token              | Used for check-in verification             |
| `status`           | Status enum         | Attendance status          | Tracks RSVP status (Going, NotGoing, etc.) |
| `allowedStatus`    | Boolean             | Whether user is allowed    | Used for approval/rejection of attendance  |
| `deleted`          | Boolean             | Soft delete flag           | Enables soft deletion of attendees         |
| `updatedAt`        | DateTime            | Last update timestamp      | Auditing and sorting                       |

## Cohost

The `Cohost` model represents users with management permissions for events.

| Field     | Type          | Description                | Usage                                                           |
| --------- | ------------- | -------------------------- | --------------------------------------------------------------- |
| `id`      | String (UUID) | Primary identifier         | Used as unique reference                                        |
| `userId`  | String        | User ID of cohost          | Links to the user who is cohosting                              |
| `eventId` | String        | ID of event being cohosted | Links to the associated event                                   |
| `role`    | Role enum     | Permission level           | Determines access level (Creator, Manager, ReadOnly, Celebrity) |

## Update

The `Update` model represents communications and notifications for events.

| Field                       | Type                | Description                 | Usage                                           |
| --------------------------- | ------------------- | --------------------------- | ----------------------------------------------- |
| `id`                        | String (UUID)       | Primary identifier          | Used as unique reference                        |
| `userId`                    | String              | User ID of sender           | Links to the user who created the update        |
| `eventId`                   | String              | ID of event                 | Links to the associated event                   |
| `content`                   | String              | Message content             | The actual message content                      |
| `createdAt`                 | DateTime (optional) | Creation timestamp          | Tracks when update was created                  |
| `updatedAt`                 | DateTime (optional) | Update timestamp            | Tracks when update was modified                 |
| `isNotification`            | Boolean             | Whether it's a notification | Determines if it should be sent as notification |
| `scheduledNotificationTime` | DateTime (optional) | Scheduled time              | When notification should be sent                |

## Enums

### VenueType

- `physical`: In-person events with a physical address
- `virtual`: Online events with a URL
- `later`: Events where location details will be provided later

### Status

- `Going`: Attendee has confirmed attendance
- `NotGoing`: Attendee has declined attendance
- `Waiting`: Attendee is waiting for approval
- `Pending`: Attendee has not yet responded
- `Invited`: Attendee has been invited but hasn't responded

### Role

- `Creator`: Original creator of the event with full permissions
- `Manager`: Can manage most aspects of the event
- `ReadOnly`: Can view event details but not make changes
- `Celebrity`: Special role for featured guests

## Key Relationships

1. **Users to Events**: One-to-many relationship - a user can create many events
2. **Users to Attendees**: One-to-many relationship - a user can attend many events
3. **Users to Cohosts**: One-to-many relationship - a user can cohost many events
4. **Users to Updates**: One-to-many relationship - a user can create many updates
5. **Events to Attendees**: One-to-many relationship - an event can have many attendees
6. **Events to Cohosts**: One-to-many relationship - an event can have many cohosts
7. **Events to Updates**: One-to-many relationship - an event can have many updates

All relationships use cascade delete, meaning that when a parent record is deleted, all related child records are automatically deleted as well.
