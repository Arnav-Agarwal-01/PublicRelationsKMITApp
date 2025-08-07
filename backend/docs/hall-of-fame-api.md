# Hall of Fame API Documentation

## Overview

The Hall of Fame API manages achievements and accomplishments for students, clubs, and faculty members. This API implements the requirements 12.1, 12.2, 12.4, and 12.5 from the project specification.

## Authentication & Authorization

- **Authentication**: All endpoints require a valid JWT token in the Authorization header
- **Authorization**: Only PR council members can create, update, or delete achievements
- **Viewing**: All authenticated users can view public achievements

## Endpoints

### GET /api/hall-of-fame/categories

Returns all available achievement categories.

**Authentication**: Required (any authenticated user)

**Response**:
```json
{
  "success": true,
  "categories": [
    { "value": "academic", "label": "Academic" },
    { "value": "sports", "label": "Sports" },
    { "value": "cultural", "label": "Cultural" },
    { "value": "technical", "label": "Technical" },
    { "value": "leadership", "label": "Leadership" }
  ]
}
```

### GET /api/hall-of-fame

Retrieves all public achievements with optional filtering and pagination.

**Authentication**: Required (any authenticated user)

**Query Parameters**:
- `category` (optional): Filter by achievement category
- `limit` (optional): Number of achievements to return (default: 50)
- `page` (optional): Page number for pagination (default: 1)

**Response**:
```json
{
  "success": true,
  "achievements": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Academic Excellence Award",
      "description": "Outstanding performance in Computer Science",
      "category": "academic",
      "achiever": {
        "name": "John Doe",
        "rollNumber": "CS001",
        "type": "student"
      },
      "date": "2024-01-15T00:00:00.000Z",
      "imageUrl": null,
      "isPublic": true,
      "addedBy": {
        "name": "PR Council Member",
        "role": "pr_council"
      },
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### POST /api/hall-of-fame

Creates a new achievement.

**Authentication**: Required (PR council only)

**Request Body**:
```json
{
  "title": "Sports Championship",
  "description": "Won inter-college cricket tournament",
  "category": "sports",
  "achiever": {
    "name": "Jane Smith",
    "rollNumber": "CS002",
    "type": "student"
  },
  "date": "2024-02-20",
  "imageUrl": "https://example.com/image.jpg",
  "isPublic": true
}
```

**Required Fields**:
- `title`: Achievement title
- `description`: Achievement description
- `category`: Must be one of: academic, sports, cultural, technical, leadership
- `achiever`: Object containing:
  - `name`: Achiever's name (required)
  - `type`: Must be one of: student, club, faculty (required)
  - `rollNumber`: Student roll number (optional, for students)
  - `clubName`: Club name (optional, for club achievements)
- `date`: Achievement date

**Optional Fields**:
- `imageUrl`: URL to achievement image
- `isPublic`: Whether achievement is public (default: true)

**Response**:
```json
{
  "success": true,
  "message": "Achievement created successfully",
  "achievement": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Sports Championship",
    "description": "Won inter-college cricket tournament",
    "category": "sports",
    "achiever": {
      "name": "Jane Smith",
      "rollNumber": "CS002",
      "type": "student"
    },
    "date": "2024-02-20T00:00:00.000Z",
    "imageUrl": "https://example.com/image.jpg",
    "isPublic": true,
    "addedBy": {
      "name": "PR Council Member",
      "role": "pr_council"
    },
    "createdAt": "2024-02-21T09:15:00.000Z",
    "updatedAt": "2024-02-21T09:15:00.000Z"
  }
}
```

### PUT /api/hall-of-fame/:id

Updates an existing achievement.

**Authentication**: Required (PR council only)

**Parameters**:
- `id`: Achievement ID

**Request Body**: Same as POST, but all fields are optional

**Response**:
```json
{
  "success": true,
  "message": "Achievement updated successfully",
  "achievement": {
    // Updated achievement object
  }
}
```

### DELETE /api/hall-of-fame/:id

Deletes an achievement.

**Authentication**: Required (PR council only)

**Parameters**:
- `id`: Achievement ID

**Response**:
```json
{
  "success": true,
  "message": "Achievement deleted successfully"
}
```

## Error Responses

### Authentication Errors

**401 Unauthorized**:
```json
{
  "success": false,
  "error": {
    "code": "NO_TOKEN",
    "message": "Access token is required"
  }
}
```

### Authorization Errors

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You do not have permission to access this resource"
  }
}
```

### Validation Errors

**400 Bad Request**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title, description, category, achiever, and date are required"
  }
}
```

### Not Found Errors

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Achievement not found"
  }
}
```

### Server Errors

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Error retrieving achievements"
  }
}
```

## Data Model

The Hall of Fame model includes the following fields:

- `_id`: MongoDB ObjectId (auto-generated)
- `title`: String (required) - Achievement title
- `description`: String (required) - Achievement description
- `category`: String (required) - One of: academic, sports, cultural, technical, leadership
- `achiever`: Object (required) containing:
  - `name`: String (required) - Achiever's name
  - `rollNumber`: String (optional) - For students
  - `clubName`: String (optional) - For club achievements
  - `type`: String (required) - One of: student, club, faculty
- `date`: Date (required) - When the achievement occurred
- `imageUrl`: String (optional) - URL to achievement image
- `isPublic`: Boolean (default: true) - Whether achievement is publicly visible
- `addedBy`: ObjectId (required) - Reference to User who added the achievement
- `createdAt`: Date (auto-generated) - When record was created
- `updatedAt`: Date (auto-generated) - When record was last updated

## Database Indexes

The following indexes are created for optimal performance:

- `category`: Index on category field for category-based queries
- `date`: Descending index on date field for chronological sorting

## Role-Based Access Control

### Students
- Can view all public achievements
- Can view achievement categories
- Cannot create, update, or delete achievements

### Club Heads
- Can view all public achievements
- Can view achievement categories
- Cannot create, update, or delete achievements

### PR Council
- Can view all achievements (public and private)
- Can view achievement categories
- Can create new achievements
- Can update existing achievements
- Can delete achievements

## Implementation Status

✅ **Completed Features**:
- GET /api/hall-of-fame/categories endpoint
- GET /api/hall-of-fame endpoint with filtering and pagination
- POST /api/hall-of-fame endpoint with validation
- PUT /api/hall-of-fame/:id endpoint
- DELETE /api/hall-of-fame/:id endpoint
- Role-based permissions (PR council can manage, others view only)
- Comprehensive input validation
- Error handling with appropriate HTTP status codes
- Database model with proper indexing

✅ **Requirements Satisfied**:
- **12.1**: Achievement listing functionality implemented
- **12.2**: Achievement management for PR council implemented
- **12.4**: Category-based achievement organization implemented
- **12.5**: Role-based permissions implemented

## Testing

The API has been tested with:
- Unit tests for core functionality
- Integration tests for endpoint behavior
- Validation tests for input data
- Permission tests for role-based access control

All tests pass successfully, confirming the implementation meets the specified requirements.