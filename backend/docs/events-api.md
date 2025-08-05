# Event Management API Documentation

## Overview

The Event Management API provides endpoints for creating, reading, updating, and deleting events, as well as student registration functionality. All endpoints require authentication via JWT token.

## Base URL
```
http://localhost:3000/api/events
```

## Authentication

All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Events

**GET** `/api/events`

Retrieve all events with optional filtering.

**Query Parameters:**
- `clubId` (optional): Filter by specific club ID
- `startDate` (optional): Filter events from this date onwards (YYYY-MM-DD)
- `endDate` (optional): Filter events up to this date (YYYY-MM-DD)

**Access:** All authenticated users

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3000/api/events?startDate=2024-01-01&endDate=2024-12-31"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "_id": "event_id",
        "title": "Tech Workshop",
        "description": "Learn about latest technologies",
        "date": "2024-02-15T00:00:00.000Z",
        "startTime": "14:00",
        "endTime": "16:00",
        "venue": "Computer Lab",
        "clubId": {
          "_id": "club_id",
          "name": "Tech Club",
          "description": "Technology enthusiasts"
        },
        "createdBy": {
          "_id": "user_id",
          "name": "John Doe",
          "role": "club_head"
        },
        "registeredUsers": [],
        "maxCapacity": 50
      }
    ],
    "count": 1
  }
}
```

### 2. Get Events by Date

**GET** `/api/events/:date`

Retrieve all events for a specific date.

**Parameters:**
- `date`: Date in YYYY-MM-DD format

**Access:** All authenticated users

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3000/api/events/2024-02-15"
```

### 3. Create Event

**POST** `/api/events`

Create a new event.

**Access:** Club heads (own club only) and PR council (any club)

**Request Body:**
```json
{
  "title": "Tech Workshop",
  "description": "Learn about latest technologies",
  "date": "2024-02-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "venue": "Computer Lab",
  "clubId": "club_id_here",
  "maxCapacity": 50
}
```

**Validation Rules:**
- All fields except `maxCapacity` are required
- `date` must be in YYYY-MM-DD format and not in the past
- `startTime` and `endTime` must be in HH:MM format (24-hour)
- `startTime` must be before `endTime`
- `clubId` must be a valid MongoDB ObjectId
- Club heads can only create events for their own club

**Example Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": {
      "_id": "new_event_id",
      "title": "Tech Workshop",
      "description": "Learn about latest technologies",
      "date": "2024-02-15T00:00:00.000Z",
      "startTime": "14:00",
      "endTime": "16:00",
      "venue": "Computer Lab",
      "clubId": {
        "_id": "club_id",
        "name": "Tech Club"
      },
      "createdBy": {
        "_id": "user_id",
        "name": "John Doe",
        "role": "club_head"
      },
      "registeredUsers": [],
      "maxCapacity": 50
    }
  }
}
```

### 4. Update Event

**PUT** `/api/events/:id`

Update an existing event.

**Parameters:**
- `id`: Event ID

**Access:** Club heads (own club events only) and PR council (any event)

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Tech Workshop",
  "description": "Updated description",
  "date": "2024-02-16",
  "startTime": "15:00",
  "endTime": "17:00",
  "venue": "Updated Venue",
  "maxCapacity": 60
}
```

**Validation Rules:**
- Same validation rules as create event
- Cannot set `maxCapacity` below current registration count
- Club heads can only update events for their own club

### 5. Delete Event

**DELETE** `/api/events/:id`

Delete an event.

**Parameters:**
- `id`: Event ID

**Access:** Club heads (own club events only) and PR council (any event)

**Example Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully",
  "data": {
    "deletedEvent": {
      "id": "event_id",
      "title": "Tech Workshop",
      "date": "2024-02-15T00:00:00.000Z",
      "clubName": "Tech Club",
      "registeredCount": 5
    }
  }
}
```

### 6. Register for Event

**POST** `/api/events/:id/register`

Register a student for an event.

**Parameters:**
- `id`: Event ID

**Access:** Students only

**Request Body:** None required

**Validation Rules:**
- Event must exist and not be in the past
- Student cannot register twice for the same event
- Event must not be at maximum capacity

**Example Response:**
```json
{
  "success": true,
  "message": "Successfully registered for the event",
  "data": {
    "event": {
      "_id": "event_id",
      "title": "Tech Workshop",
      "registeredUsers": [
        {
          "_id": "student_id",
          "name": "Jane Smith",
          "rollNumber": "21CS001"
        }
      ]
    },
    "registrationCount": 1,
    "remainingSpots": 49
  }
}
```

### 7. Unregister from Event

**DELETE** `/api/events/:id/register`

Unregister a student from an event.

**Parameters:**
- `id`: Event ID

**Access:** Students only

**Validation Rules:**
- Event must exist and not be in the past
- Student must be registered for the event

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

- `MISSING_FIELDS`: Required fields are missing
- `INVALID_EVENT_ID`: Invalid event ID format
- `INVALID_CLUB_ID`: Invalid club ID format
- `INVALID_DATE`: Invalid date format
- `INVALID_TIME_FORMAT`: Invalid time format
- `INVALID_TIME_RANGE`: Start time must be before end time
- `PAST_DATE`: Cannot create/register for past events
- `EVENT_NOT_FOUND`: Event does not exist
- `CLUB_NOT_FOUND`: Club does not exist
- `UNAUTHORIZED_CLUB`: Club heads can only manage their own club
- `UNAUTHORIZED_EVENT`: Insufficient permissions for this event
- `ALREADY_REGISTERED`: Student already registered for this event
- `NOT_REGISTERED`: Student not registered for this event
- `EVENT_FULL`: Event is at maximum capacity
- `CAPACITY_TOO_LOW`: Cannot set capacity below current registrations
- `SERVER_ERROR`: Internal server error

## Role-Based Access Control

### Students
- Can view all events (GET endpoints)
- Can register/unregister for events
- Cannot create, update, or delete events

### Club Heads
- Can view all events
- Can create events for their own club only
- Can update/delete events for their own club only
- Cannot register for events (management role)

### PR Council
- Can view all events
- Can create events for any club
- Can update/delete any event
- Full administrative access

## Testing with cURL

### Get Events
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/events
```

### Create Event (Club Head/PR Council)
```bash
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Event",
       "description": "Test Description",
       "date": "2024-12-25",
       "startTime": "14:00",
       "endTime": "16:00",
       "venue": "Test Venue",
       "clubId": "club_id_here"
     }' \
     http://localhost:3000/api/events
```

### Register for Event (Student)
```bash
curl -X POST \
     -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/events/event_id_here/register
```

## Requirements Coverage

This API implementation covers the following requirements:

- **4.1**: Students can view event details when clicking on calendar date
- **4.2**: Events show club name, event name, timings, and venue
- **4.4**: Students can register for events
- **5.1**: Club heads can schedule events on calendar
- **5.2**: Club heads can update event details
- **6.1**: PR council can manage all events across clubs
- **6.2**: PR council can edit/remove any event, club heads only their own